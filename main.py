import os
import datetime
import json
from google import genai
from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Optional, List
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# --- 初期設定 ---
current_dir = Path(__file__).parent.absolute()
load_dotenv(current_dir / '.env')

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 設定読み込み ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# クライアント初期化
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client_ai = genai.Client(api_key=GOOGLE_API_KEY) if GOOGLE_API_KEY else None

print(f"--- 起動診断 ---")
print(f"Supabase: {'✅OK' if SUPABASE_URL else '❌NG'}")
print(f"Gemini:   {'✅OK' if GOOGLE_API_KEY else '❌NG'}")
print(f"----------------")

# --- モデル定義 ---
class AuthRequest(BaseModel):
    email: str
    password: str
    username: Optional[str] = None

class AnalysisRequest(BaseModel):
    text: str

# --- 認証共通処理 ---
async def get_current_user_id(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No authorization header")
    try:
        token = auth_header.split(' ')[1]
        user_resp = supabase.auth.get_user(token)
        # バージョンにより user_resp.user か user_resp なので getattr で安全に取得
        user = getattr(user_resp, 'user', user_resp)
        return user.id
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid session")

# --- APIエンドポイント ---

@app.post("/api/auth/signup")
async def signup_user(req: AuthRequest):
    print(f"\n--- SIGNUP PROCESS START ---")
    try:
        # 1. Auth登録 (個別に詳細ログを出す)
        print("DEBUG: Calling supabase.auth.sign_up...")
        try:
            res = supabase.auth.sign_up({
                "email": req.email, 
                "password": req.password,
                "options": {"data": {"username": req.username}}
            })
            print(f"DEBUG: Auth success, User ID: {res.user.id if res.user else 'None'}")
        except Exception as auth_err:
            print(f"!!! AUTH ERROR DETAIL !!!: {auth_err}")
            # エラーオブジェクトの中身を分解して表示
            if hasattr(auth_err, 'message'): print(f"Msg: {auth_err.message}")
            raise HTTPException(status_code=400, detail=f"認証エラー: {str(auth_err)}")

        # 2. DB保存
        if res.user:
            try:
                print("DEBUG: Inserting into public.users table...")
                supabase.table("users").upsert({
                    "id": res.user.id,
                    "username": req.username,
                    "email": req.email
                }).execute()
            except Exception as db_err:
                print(f"!!! DB ERROR DETAIL !!!: {db_err}")
                raise HTTPException(status_code=500, detail=f"DB保存エラー: {str(db_err)}")

        return {"user_id": res.user.id, "session": res.session if hasattr(res, 'session') else None}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"GENERAL ERROR: {str(e)}")
        # ここで「Database error saving new user」が出る場合、
        # supabase-pyの内部的なバリデーションエラーです
        raise HTTPException(status_code=400, detail=f"システムエラー: {str(e)}")
    
@app.post("/api/auth/signin")
async def signin_user(req: AuthRequest):
    try:
        res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        username = "User"
        if res.user:
            user_data = supabase.table('users').select('username').eq('id', res.user.id).execute()
            username = user_data.data[0].get('username') if user_data.data else "User"
        session_data = {"access_token": res.session.access_token} if res.session else None
        return {"session": session_data, "username": username, "email": res.user.email}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Login failed")

@app.get("/api/user")
async def get_user(user_id: str = Depends(get_current_user_id)):
    res = supabase.table("users").select("*").eq("id", user_id).execute()
    if not res.data: return {"id": user_id, "username": "User", "email": ""}
    return res.data[0]

@app.post("/api/analyze")
async def analyze_episode(req: AnalysisRequest, user_id: str = Depends(get_current_user_id)):
    if not client_ai: raise HTTPException(status_code=500, detail="Gemini key missing")
    prompt = f"以下のエピソードをキャリア分析しJSONで返せ: {req.text}"
    try:
        response = client_ai.models.generate_content(model="gemini-1.5-flash", contents=prompt, config={'response_mime_type': 'application/json'})
        ai_data = json.loads(response.text)
        supabase.table("history").insert({"user_id": user_id, "date": str(datetime.date.today()), "title": req.text[:15], "scores": ai_data.get("scores"), "summary": ai_data.get("summary"), "feedback": ai_data.get("feedback")}).execute()
        return ai_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history(user_id: str = Depends(get_current_user_id)):
    res = supabase.table("history").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return res.data