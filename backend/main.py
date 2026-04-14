from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from typing import List
import os
from chat_logic import ChatbotBrain

# Initialize Chatbot Brain
brain = ChatbotBrain()

# Database Setup
DATABASE_URL = "sqlite:///./chat_history.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ChatMessage(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String)  # 'user' or 'bot'
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# FastAPI App
app = FastAPI(title="Simple Talk Bot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserInput(BaseModel):
    message: str

class MessageResponse(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

@app.post("/chat", response_model=MessageResponse)
async def chat(input: UserInput):
    db = SessionLocal()
    try:
        # Save User Message
        user_msg = ChatMessage(sender="user", content=input.message)
        db.add(user_msg)
        db.commit()
        db.refresh(user_msg)

        # Get Bot Response
        bot_response_content = brain.chat(input.message)

        # Save Bot Message
        bot_msg = ChatMessage(sender="bot", content=bot_response_content)
        db.add(bot_msg)
        db.commit()
        db.refresh(bot_msg)

        return bot_msg
    finally:
        db.close()

@app.get("/history", response_model=List[MessageResponse])
async def get_history():
    db = SessionLocal()
    try:
        messages = db.query(ChatMessage).order_by(ChatMessage.timestamp.asc()).all()
        return messages
    finally:
        db.close()

@app.delete("/history")
async def clear_history():
    db = SessionLocal()
    try:
        db.query(ChatMessage).delete()
        db.commit()
        return {"message": "History cleared"}
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
