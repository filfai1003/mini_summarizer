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

## 🧩 Tech Stack
- **Python 3.11**
- **FastAPI + Uvicorn**
- **OpenAI API**
- **Docker**

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

### 1. Build the image
Run this inside the project root (where the `Dockerfile` is):
```bash
docker compose up -d --build
```

### 2. Run the container
```bash
docker compose up --build 
```

After startup, open:
👉 [http://localhost:3000/docs](http://localhost:3000/docs)

### 3. Stop the container
```bash
docker ps
docker stop <container_id>
```

---

## 🧠 Example request

### POST `/summarize`
```bash
curl -X POST "http://localhost:8000/summarize"      -H "Content-Type: application/json"      -d '{
           "text": "Sagacify builds AI products and services for businesses ...",
           "language": "English",
           "length": "short",
           "model": "gpt-4o-mini"
         }'
```

**Response:**
```json
{
  "summary": "Sagacify develops AI-driven automation and innovation solutions across multiple industries.",
  "model_used": "gpt-4o-mini"
}
```

---

## 🧰 Endpoints
| Method | Endpoint       | Description                |
|---------|----------------|----------------------------|
| GET     | `/health`      | Check API health           |
| POST    | `/summarize`   | Summarize input text       |

---

## 🧪 Example output in Swagger
Go to [http://localhost:8000/docs](http://localhost:8000/docs)  
You can test the API directly in the browser.

---

## 🔒 Environment variables
| Variable | Description |
|-----------|--------------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |

---

## 🧠 Notes
- Default model: `gpt-4o-mini`  
- Adjust summarization length with `"length": "short" | "medium" | "long"`  
- Language can be set to `"English"`, `"French"`, `"Italian"`, etc.

---

## 🪶 License
This project is distributed under the **MIT License**.  
See `LICENSE` file for details.
