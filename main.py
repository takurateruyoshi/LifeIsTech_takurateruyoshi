import os
import datetime
import json
from openai import OpenAI  # GroqはOpenAI SDKで動作します
from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
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
# .env に GROQ_API_KEY=gsk_xxx を追記してください
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# クライアント初期化
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Groqクライアントの初期化 (OpenAI互換)
client = None
if GROQ_API_KEY:
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=GROQ_API_KEY
    )

print(f"--- 起動診断 ---")
print(f"Supabase: {'✅OK' if SUPABASE_URL else '❌NG'}")
print(f"Groq:     {'✅OK' if GROQ_API_KEY else '❌NG'}")
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
        user = getattr(user_resp, 'user', user_resp)
        return user.id
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid session")

# --- APIエンドポイント ---

@app.post("/api/auth/signup")
async def signup_user(req: AuthRequest):
    try:
        res = supabase.auth.sign_up({
            "email": req.email, 
            "password": req.password,
            "options": {"data": {"username": req.username}}
        })
        if res.user:
            supabase.table("users").upsert({
                "id": res.user.id,
                "username": req.username,
                "email": req.email
            }).execute()
        return {"user_id": res.user.id, "session": res.session if hasattr(res, 'session') else None}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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

# 1. AI分析と結果の保存 (Groq版)
@app.post("/api/analyze")
async def analyze_episode(req: AnalysisRequest, user_id: str = Depends(get_current_user_id)):
    if not client:
        raise HTTPException(status_code=500, detail="Groq API key missing")
    
    prompt = f"""
    以下のエピソードを、経済産業省の「社会人基礎力」に基づき精密に分析し、JSON形式で回答してください。
    エピソード: {req.text}

    【分析対象：3つの能力と12の能力要素】
    1. 前に踏み出す力(アクション): 主体性、働きかけ力、実行力
    2. 考え抜く力(シンキング): 課題発見力、計画力、創造力
    3. チームで働く力(チームワーク): 発信力、傾聴力、柔軟性、情況把握力、規律性、ストレスコントロール力

    【回答ルール】
    - 各要素を0-100でスコアリングすること。
    - 必ず以下のJSONキーを使用し、日本語で返却すること。

    【回答JSON形式】
    {{
      "summary": "強みの要約(30文字以内)",
      "scores": {{
        "主体性": 0, "働きかけ力": 0, "実行力": 0,
        "課題発見力": 0, "計画力": 0, "創造力": 0,
        "発信力": 0, "傾聴力": 0, "柔軟性": 0,
        "情況把握力": 0, "規律性": 0, "ストレスコントロール力": 0
      }},
      "feedback": "成長のためのアドバイス(150文字程度)",
      "growth_diff": "今回最も強く発揮された能力要素の名前"
    }}
    """
    
    try:
        # Groqへのリクエスト送信
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "あなたは優秀なキャリアアドバイザーです。分析結果は必ず有効なJSON形式で出力してください。"},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
 
        ai_data = json.loads(response.choices[0].message.content)
        
        # データベースへ保存
        supabase.table("history").insert({
            "user_id": user_id,
            "date": str(datetime.date.today()),
            "title": req.text[:15],
            "summary": ai_data.get("summary"),
            "scores": ai_data.get("scores"),
            "feedback": ai_data.get("feedback"),
            "growth_diff": ai_data.get("growth_diff")
        }).execute()
        
        return ai_data
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="AI分析または保存に失敗しました")

# 2. 履歴の一括取得
@app.get("/api/history")
async def get_history(user_id: str = Depends(get_current_user_id)):
    try:
        res = supabase.table("history")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))