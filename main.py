from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ユーザー情報の追加 ---
# ログイン中のユーザーをシミュレート
mock_user = {
    "name": "寺良 拓海",  # パスから推測したお名前の例です
    "email": "takumi.teraya@example.com",
    "avatar_url": "" 
}

@app.get("/api/user")
def get_user():
    return mock_user

# 12要素の初期データ構造定義
class SkillScores(BaseModel):
    initiative: int
    influence: int
    execution: int
    problem_solving: int
    planning: int
    creativity: int
    communication: int
    listening: int
    flexibility: int
    situation_awareness: int
    discipline: int
    stress_control: int

# 履歴データのモック（5回分の成長記録）
mock_db = [
    {
        "id": 1, "date": "2025-12-01", "title": "初期診断",
        "scores": {
            "initiative": 2, "influence": 1, "execution": 2, "problem_solving": 3, "planning": 2, "creativity": 3,
            "communication": 2, "listening": 3, "flexibility": 3, "situation_awareness": 2, "discipline": 4, "stress_control": 2
        }
    },
    {
        "id": 2, "date": "2025-12-09", "title": "ゼミの発表準備",
        "scores": {
            "initiative": 3, "influence": 2, "execution": 3, "problem_solving": 3, "planning": 3, "creativity": 3,
            "communication": 3, "listening": 4, "flexibility": 3, "situation_awareness": 3, "discipline": 4, "stress_control": 3
        }
    },
    {
        "id": 3, "date": "2025-12-15", "title": "バイトのリーダー代行",
        "scores": {
            "initiative": 4, "influence": 3, "execution": 4, "problem_solving": 4, "planning": 3, "creativity": 3,
            "communication": 3, "listening": 4, "flexibility": 4, "situation_awareness": 4, "discipline": 4, "stress_control": 3
        }
    },
    {
        "id": 4, "date": "2025-12-22", "title": "サークル合宿の企画",
        "scores": {
            "initiative": 4, "influence": 4, "execution": 4, "problem_solving": 4, "planning": 5, "creativity": 4,
            "communication": 4, "listening": 5, "flexibility": 4, "situation_awareness": 5, "discipline": 5, "stress_control": 4
        }
    },
    {
        "id": 5, "date": "2025-12-29", "title": "最終プレゼン完遂",
        "scores": {
            "initiative": 5, "influence": 4, "execution": 5, "problem_solving": 5, "planning": 5, "creativity": 4,
            "communication": 5, "listening": 5, "flexibility": 5, "situation_awareness": 5, "discipline": 5, "stress_control": 5
        }
    }
]

@app.get("/api/history")
def get_history():
    return mock_db

@app.post("/api/analyze")
def analyze_episode(payload: Dict):
    # フロントエンドの期待値に合わせてレスポンスを構成
    analysis_result = {
        "summary": "チームの課題を冷静に分析し、計画的に行動できています。",
        "scores": {
            "initiative": 4, "influence": 3, "execution": 5,
            "problem_solving": 4, "planning": 5, "creativity": 2,
            "communication": 3, "listening": 5, "flexibility": 4,
            "situation_awareness": 5, "discipline": 4, "stress_control": 3
        },
        "feedback": "傾聴力と状況把握力が非常に高いです。周囲の意見をまとめつつ計画を完遂する力は大きな武器になります。",
        "growth_diff": "+12%"
    }
    return analysis_result

@app.post("/api/generate-es")
def generate_es(payload: Dict):
    return {"content": "【自己PR】私の強みは、周囲の状況を的確に把握し、チームを調和させる『状況把握力』と『傾聴力』です。..."}