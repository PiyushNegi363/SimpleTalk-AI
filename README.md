# 🤖 Premium AI Chatbot

A state-of-the-art, deep learning-powered chatbot built with a focus on premium aesthetics and intelligent conversation. This project features a **FastAPI** backend driven by a custom **Neural Network** and a sleek **Next.js** frontend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![Next.js](https://img.shields.io/badge/next.js-16%2B-black)

---

## ✨ Features

- **🧠 Deep Learning Brain**: Uses a Sequential Neural Network (TensorFlow/Keras) specifically trained on a rich `intents.json` dataset.
- **✨ Premium UI**: A glassmorphic, modern chat interface built with Next.js and high-end CSS.
- **💬 Automated UX**: Custom CSS pulsing typing indicators for natural conversational flow.
- **📚 Massive Knowledge Base**: Over 50+ intent categories covering everything from general philosophy to technical coding advice.
- **💾 Persistent History**: Integrated SQLite database using SQLAlchemy to store and retrieve your conversations.
- **⚡ Real-time Performance**: Optimized FastAPI backend for ultra-low latency responses with structured logging.
- **🎨 Personalized Identity**: Deeply integrated knowledge about its creator, **Piyush**.
- **⚙️ Production-Ready**: Decoupled environments (`.env.local`) and UTF-8 safe data pipelines.

---

## 🛠️ Tech Stack

### Backend
- **Core**: Python 3.10+
- **API Framework**: FastAPI & Uvicorn
- **AI/ML**: TensorFlow 2.15, NLTK, NumPy, Pickle
- **Database**: SQLAlchemy (SQLite)

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Premium Glassmorphism)

---

## 📂 Project Structure

```text
premium-ai-chatbot/
├── backend/                # API Server and Logic
│   ├── model/              # AI Training and Saved Weights
│   │   ├── train.py        # Model training script
│   │   ├── chatbot_model.h5# Saved Neural Network weights
│   │   ├── words.pkl       # Tokenized vocabulary
│   │   └── classes.pkl     # Intent tags
│   ├── main.py             # FastAPI entry point
│   ├── chat_logic.py       # Intent prediction and response logic
│   └── chat_history.db     # SQLite persistence
├── frontend/               # Next.js Application
│   ├── app/                # App router (Pages, Layouts)
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── intents.json            # The knowledge base (Data)
└── requirements.txt        # Backend dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisite
Ensure you have **Python 3.10+** and **Node.js** installed on your system.

### 2. Backend Setup
```bash
# Navigate to the backend directory
# (Optional) Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the model (MANDATORY for first use)
python backend/model/train.py

# Start the API server
python backend/main.py
```

### 3. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env.local file in the `frontend` directory:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the development server
npm run dev
```

---

## 🧠 Training Custom Intents

To add new knowledge to your bot:
1. Edit `intents.json` and add your new tags, patterns, and responses.
2. Run the training script:
   ```bash
   python backend/model/train.py
   ```
3. Restart the `main.py` server to load the new weights.

---

## 👤 Credits

Developed with ❤️ by **Piyush**.