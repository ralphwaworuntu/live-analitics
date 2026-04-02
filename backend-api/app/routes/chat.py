"""
SENTINEL API — AI Chat (Llama 3 + Milvus RAG)
"""

import httpx
from pydantic import BaseModel
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import ChatMessage, Personnel
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

class ChatRequest(BaseModel):
    user_id: int
    polres_id: int
    message: str

class ChatResponse(BaseModel):
    role: str
    content: str
    references: List[str]

    
async def fetch_milvus_context(query: str, polres_id: int) -> List[dict]:
    # Simulation of vector similarity search using Milvus
    # In a real app, you would embed the `query`, hit Milvus with an expression
    # constrained to `polres_id` to enforce RLS, and return top_k documents.
    
    # Mocking standard operational procedures docs
    if "pencurian" in query.lower() or "pasar" in query.lower():
        return [
            {"id": "doc_101", "content": "Patroli rutin daerah rawan pasar wajib melibatkan 3 personil berseragam dan 1 pakaian preman.", "reference": "[Sprin No. 123/III/2026]"}
        ]
    return [
        {"id": "doc_999", "content": "Setiap tindakan kepolisian harus berdasarkan hukum yang berlaku dan SOP operasi kewilayahan.", "reference": "[Perkap No. 1 Tahun 2021]"}
    ]

async def query_ollama(prompt: str) -> str:
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.2, # Low temp for tactical accuracy
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            # Fallback if local LLM is disconnected during rapid dev/testing
            return f"TURANGGA-AI OFFLINE. Model {settings.OLLAMA_MODEL} not reachable at {settings.OLLAMA_BASE_URL}."

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    RAG Pipeline Endpoint:
    1. Simpan pesan user
    2. Retrieve Context via Milvus
    3. Construct Prompt (Grounding)
    4. Call Ollama (Llama 3 8B)
    5. Return AI Response dengan referensi
    """
    
    # 1. Save User Message
    user_msg = ChatMessage(
        polres_id=req.polres_id,
        user_id=req.user_id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    
    # 2. Retrieve Context (Enforcing Data Sovereignty RLS implicitly by filtering Milvus)
    contexts = await fetch_milvus_context(req.message, req.polres_id)
    
    # Extract references
    references = [ctx["reference"] for ctx in contexts]
    
    # 3. Construct Augmented Prompt
    system_prompt = (
        "Anda adalah TURANGGA-AI, asisten strategis taktis untuk Biro Operasi Polda NTT. "
        "Gunakan hanya konteks referensi hukum yang diberikan untuk menjawab laporan kejadian. "
        "Selalu berikan jawaban yang singkat, tegas, dan operasional. "
        "Jawab dalam Bahasa Indonesia."
    )
    
    context_text = "\n".join([f"- {ctx['content']}" for ctx in contexts])
    
    full_prompt = f"{system_prompt}\n\nKONTEKS HUKUM/SOP:\n{context_text}\n\nLAPORAN: {req.message}\nRESPON TAKTIS:"
    
    # 4. Generate AI Response
    ai_content = await query_ollama(full_prompt)
    
    # Validation constraint from PRD: "Referensi hukum wajib muncul di setiap saran taktis."
    if references and not any(ref in ai_content for ref in references):
        # AI didn't implicitly append it, we enforce injection
        ai_content += f"\n\nSumber Hukum: {', '.join(references)}"
        
    # 5. Save AI Response
    ai_msg = ChatMessage(
        polres_id=req.polres_id,
        role="assistant",
        content=ai_content,
        references=str(references)
    )
    db.add(ai_msg)
    
    await db.commit()
    
    return ChatResponse(
        role="assistant",
        content=ai_content,
        references=references
    )
