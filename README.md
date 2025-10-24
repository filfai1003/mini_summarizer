# 🧠 Summarizer API

A minimal **FastAPI** service that summarizes text using an **LLM (OpenAI GPT models)**.  
Containerized with **Docker** for easy deployment.

---

## 🚀 Features
- `/summarize` endpoint → summarize any text (short / medium / long)  
- `/health` endpoint → check if the API is running  
- Language and model can be customized via request  
- Dockerized for simple setup and deployment  

---

## 📦 Installation (Local)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/mini_summarizer.git
cd mini_summarizer
```

### 2. Create your environment file
Copy the example and add your OpenAI key:
```bash
cp .env.example .env
```
Then edit `.env` and set:
```
OPENAI_API_KEY=sk-yourkeyhere
```

---

## 🐳 Run with Docker (recommended)

### Build & Run the container
```bash
docker compose up --build 
```

After startup, open:
👉 [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🔒 Environment variables
| Variable | Description |
|-----------|--------------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |

---

## 🪶 License
This project is distributed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.

This means you are free to use, share, and adapt the code for non-commercial purposes only. For full license terms see the `LICENSE` file or https://creativecommons.org/licenses/by-nc/4.0/
