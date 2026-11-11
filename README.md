 <div align="center">

<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
<img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
<img src="https://img.shields.io/badge/Exa_AI-000000?style=for-the-badge&logoColor=white" />

<br /><br />

# Devora AI

**An End-to-End Full-Stack AI Platform for Document Intelligence, Agentic AI, Live Web Research & Career Intelligence.**

Hybrid RAG. LangGraph Agents. Human-in-the-Loop. GPU-Accelerated Embeddings.

<br />

[Live Website](https://devoraai.pro) • [Features](#features) • [Tech Stack](#tech-stack) • [Architecture](#architecture) • [AI Agents](#agentic-ai) • [Getting Started](#getting-started) • [Demo](#demo)

<br />

</div>

---

## Overview

Devora is a full-stack AI platform designed to bring document intelligence, real-time web research, agentic workflows, and career assistance into one unified application.

Rather than building a simple chatbot around an LLM API, Devora combines custom retrieval pipelines, GPU-accelerated embedding generation, intelligent tool calling, specialized LangGraph agents, and Human-in-the-Loop interactions.

The platform provides context-aware answers, retrieves up-to-date information, assists developers with career decisions, and simplifies technical interview and resume preparation.

**Live Application:** https://devoraai.pro

---

## Features

| Feature | Description |
|---------|-------------|
| **Hybrid RAG** | Combines dense semantic vector search with BM25 Okapi lexical retrieval |
| **Local GPU Embeddings** | Runs BAAI/bge-base-en-v1.5 locally using PyTorch, CUDA, and FP16 |
| **Gemini Embeddings API** | Supports Google's gemini-embedding-001 with 768-dimensional output |
| **Cross-Encoder Reranking** | Reorders retrieved chunks to improve contextual relevance |
| **Verifiable Citations** | Page-level PDF citations with direct navigation to the source page |
| **Live Web Search** | Exa AI integration with LLM function calling |
| **Career Mode Agent** | LangGraph-powered career assistance, interview preparation, and resume intelligence |
| **Job Intelligence Agent** | Job research, requirement analysis, and job matching |
| **Human-in-the-Loop** | Integrated into both Career Mode and Job Intelligence Mode |
| **AI Mock Interviews** | Technical and behavioral interviews with STAR-based evaluation |
| **ATS Resume Builder** | Generates structured, ATS-friendly resumes using LaTeX |
| **Multi-Factor Authentication** | Supabase Auth with TOTP-based MFA |
| **Redis Integration** | Redis-backed application infrastructure |
| **Real-Time Streaming** | Token-by-token response streaming with AbortController |
| **Asynchronous PDF Processing** | Background document ingestion using FastAPI |

---

## Tech Stack

### Frontend

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Streaming | Fetch Streaming API |
| Request Cancellation | AbortController |
| Icons | Lucide Icons |

### Backend

| Category | Technology |
|----------|------------|
| Framework | FastAPI |
| Language | Python 3.12 |
| Validation | Pydantic v2 |
| Server | Uvicorn |
| PDF Processing | PyPDF |
| Background Processing | FastAPI Background Workflows |

### AI & Machine Learning

| Category | Technology |
|----------|------------|
| LLM | Google Gemini 3.5 Flash |
| Local Embeddings | BAAI/bge-base-en-v1.5 |
| API Embeddings | Google gemini-embedding-001 |
| ML Framework | PyTorch |
| GPU Acceleration | NVIDIA CUDA |
| Precision | FP16 |
| Embedding Framework | SentenceTransformers |
| Agent Orchestration | LangGraph |
| Agent Tools | Custom LangGraph Tools |
| Human Oversight | Human-in-the-Loop (HITL) |

### Database & Infrastructure

| Category | Technology |
|----------|------------|
| Database | Supabase PostgreSQL |
| Vector Search | pgvector |
| Lexical Search | PostgreSQL Full-Text Search |
| Cache / Infrastructure | Redis |
| Authentication | Supabase Auth |
| Multi-Factor Authentication | TOTP-based MFA |

### External Integrations

| Service | Purpose |
|---------|---------|
| Google Gemini API | LLM inference and embedding generation |
| Exa AI | Real-time web search |
| LaTeX.cc API | ATS-friendly resume PDF generation |
| Supabase | Database, authentication, and application services |

---

## Architecture

Devora consists of a Next.js frontend and a Python-based FastAPI backend, supported by specialized AI pipelines and external services.

```text
┌──────────────────────────────────────────────────────────────┐
│                         DEVORA AI                             │
│                   Full-Stack AI Platform                      │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     NEXT.JS 15 FRONTEND                       │
│                                                              │
│  Document Intelligence │ Career Mode │ Job Intelligence      │
│  Mock Interviews       │ Resume Builder │ AI Chat             │
│                                                              │
│             TypeScript / Zustand / Tailwind CSS               │
└──────────────────────────────┬───────────────────────────────┘
                               │
                       REST API / Streaming
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       FASTAPI BACKEND                         │
│                                                              │
│  Authentication │ Request Handling │ PDF Processing          │
│  AI Orchestration │ Streaming │ Background Workflows         │
└───────────────┬───────────────────────┬──────────────────────┘
                │                       │
                ▼                       ▼
┌──────────────────────────┐  ┌────────────────────────────────┐
│   DOCUMENT INTELLIGENCE  │  │         AGENTIC AI              │
│                          │  │                                │
│  PDF Extraction          │  │  Career Mode Agent              │
│  Chunking                │  │  Job Intelligence Agent         │
│  Embeddings              │  │                                │
│  Hybrid Retrieval        │  │  LangGraph                      │
│  BM25                    │  │  Custom Tools                   │
│  Reranking               │  │  Human-in-the-Loop              │
│  Citations               │  │                                │
└──────────────┬───────────┘  └───────────────┬────────────────┘
               │                              │
               └──────────────┬───────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                         │
│                                                              │
│   Google Gemini API │ Exa AI │ LaTeX.cc API                   │
│                                                              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   APPLICATION INFRASTRUCTURE                  │
│                                                              │
│    Supabase / PostgreSQL / pgvector / Redis / Supabase Auth   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Document Intelligence – Hybrid RAG

One of Devora's core components is a custom Hybrid Retrieval-Augmented Generation pipeline designed to handle large technical documents while providing relevant, source-grounded answers.

### Retrieval Pipeline

```text
              PDF DOCUMENT UPLOAD
                      │
                      ▼
               PDF TEXT EXTRACTION
                      │
                      ▼
                TEXT CHUNKING
                      │
                      ▼
              EMBEDDING GENERATION
                      │
          ┌───────────┴────────────┐
          │                       │
          ▼                       ▼
    LOCAL GPU EMBEDDINGS     GEMINI EMBEDDING API
    BGE-base-en-v1.5         gemini-embedding-001
    CUDA / FP16              768 Dimensions
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
               VECTOR STORAGE
                 PostgreSQL
                  pgvector
                      │
                      ▼
                 USER QUERY
                      │
          ┌───────────┴────────────┐
          │                       │
          ▼                       ▼
     DENSE RETRIEVAL         SPARSE RETRIEVAL
     Vector Similarity      BM25 Okapi
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
                HYBRID RESULTS
                      │
                      ▼
             CROSS-ENCODER RERANKING
                      │
                      ▼
                CONTEXT ASSEMBLY
                      │
                      ▼
                GEMINI 3.5 FLASH
                      │
                      ▼
              ANSWER GENERATION
                      │
                      ▼
               PAGE CITATIONS
                      │
                      ▼
              BUILT-IN PDF READER
```

### Local GPU Embedding Pipeline

Devora supports local embedding generation using SentenceTransformers and BAAI/bge-base-en-v1.5.

- Local inference using NVIDIA CUDA.
- FP16 mixed-precision inference.
- GPU-accelerated batch embedding generation.
- Reduced dependency on external embedding APIs.
- Configurable embedding model selection.

### Gemini Embedding API

Devora also supports Google's gemini-embedding-001 model.

- API-based embedding generation.
- Configurable 768-dimensional output.
- Integration with the vector retrieval pipeline.
- Alternative to local embedding inference.

**Important:** Both embedding providers must use compatible dimensions when accessing the same pgvector column. Switching providers may require regenerating stored embeddings.

### Hybrid Retrieval

- **Dense Retrieval:** Captures semantic relationships using vector similarity.
- **Sparse Retrieval:** Uses BM25 Okapi to identify relevant keywords and technical terminology.
- **Cross-Encoder Reranking:** Reorders retrieved candidates based on query-document relevance.
- **Source-Grounded Answers:** Provides page-level citations linked to the original PDF.

---

## Agentic AI

Devora includes two specialized AI agents built using LangGraph. Each agent has dedicated custom tools and Human-in-the-Loop capabilities integrated directly into its workflow.

### 1. Career Mode Agent

Designed to help developers with career preparation and professional development.

- Career guidance and assistance.
- Technical interview preparation.
- Behavioral interview preparation.
- STAR-based response evaluation.
- Resume analysis.
- Career-related custom tool execution.
- Human-in-the-Loop interactions.

### 2. Job Intelligence Agent

Designed to help developers research and evaluate job opportunities.

- Job research and discovery.
- Job description analysis.
- Required skills identification.
- Candidate-to-role matching.
- Career opportunity analysis.
- Custom LangGraph tool execution.
- Human-in-the-Loop interactions.

### Human-in-the-Loop Architecture

HITL is integrated within both Career Mode and Job Intelligence Mode.

```text
          USER REQUEST
               │
               ▼
         LANGGRAPH AGENT
               │
               ▼
          TOOL SELECTION
               │
               ▼
          TOOL EXECUTION
               │
               ▼
       HUMAN INTERVENTION
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
      APPROVE       PROVIDE INPUT
        │             │
        └──────┬──────┘
               │
               ▼
        AGENT CONTINUES
               │
               ▼
          FINAL RESPONSE
```

Human intervention allows users to review and guide agent execution instead of relying entirely on autonomous decisions.

---

## Real-Time Web Search

Devora integrates Exa AI to provide live web search capabilities.

Using LLM function calling, the assistant can determine when external information is needed and retrieve relevant information.

```text
           USER QUERY
                │
                ▼
          GEMINI 3.5 FLASH
                │
                ▼
         FUNCTION CALLING
                │
                ▼
        SEARCH REQUIRED?
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
        YES            NO
         │             │
         ▼             │
       EXA AI           │
      WEB SEARCH        │
         │             │
         ▼             │
    SEARCH RESULTS     │
         │             │
         └──────┬──────┘
                │
                ▼
         CONTEXT ASSEMBLY
                │
                ▼
          FINAL RESPONSE
```

Use cases:

- Technical documentation research.
- Framework updates and release notes.
- Technology announcements.
- Developer research.
- Up-to-date technical information.

---

## AI Career & Resume Tools

### AI Mock Interviews

- Technical and behavioral interview preparation.
- AI-based candidate response evaluation.
- STAR methodology for behavioral responses.
- Structured feedback and improvement suggestions.

### ATS-Friendly LaTeX Resume Builder

An AI-assisted resume generation workflow using LaTeX.

- Structured resume content generation.
- ATS-friendly formatting.
- LaTeX document generation.
- PDF compilation through the LaTeX.cc API.

### Resume Intelligence

- AI-powered resume analysis.
- Skills and experience evaluation.
- Job-role matching.
- Resume improvement suggestions.

---

## Authentication & Security

Devora uses Supabase Auth for user authentication and account security.

### Multi-Factor Authentication (MFA)

Implemented TOTP-based Multi-Factor Authentication using Supabase Auth.

- Additional authentication verification.
- Authenticator-app-based TOTP codes.
- MFA enrollment and verification.
- Improved account security beyond password-based authentication.

---

## Redis Integration

Devora includes Redis as part of its backend infrastructure.

The Redis connection is configured through the `REDIS_URL` environment variable, supporting secure Redis connections using `rediss://` endpoints.

---

## Real-Time Streaming

Devora uses token-by-token response streaming to deliver AI-generated content progressively.

Implementation highlights:

- Streaming AI responses.
- Client-side AbortController support.
- Instant request cancellation.
- Responsive UI updates.
- Improved interaction during long-running generations.

---

## Getting Started

### Prerequisites

- Node.js compatible with Next.js 15.
- Python 3.12+.
- npm.
- Git.
- Active Supabase project.
- Google Gemini API key.
- Exa AI API key.
- Redis instance.
- NVIDIA GPU with compatible CUDA setup (optional, for local GPU embeddings).

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/devora.git

cd devora
```

### 2. Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Activate it on Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file inside your backend directory.

```env
# Supabase Configuration
SUPABASE_KEY=your_supabase_key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash

# Redis Configuration
REDIS_URL=rediss://default:your_password@your_redis_endpoint:6379

# Exa AI Configuration
EXA_API_KEY=your_exa_api_key

# Embedding Configuration
EMBED_BACKEND=local
LOCAL_EMBED_MODEL=BAAI/bge-base-en-v1.5
```

**Environment Variable Reference**

| Variable | Description |
|----------|-------------|
| `SUPABASE_KEY` | Supabase application API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged Supabase server-side key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | LLM model identifier |
| `REDIS_URL` | Redis connection URL |
| `EXA_API_KEY` | Exa AI search API key |
| `EMBED_BACKEND` | Selects the embedding backend |
| `LOCAL_EMBED_MODEL` | Local SentenceTransformers model identifier |

**Security Notes**

- Never commit `.env` files to GitHub.
- Keep `SUPABASE_SERVICE_ROLE_KEY` strictly server-side.
- Never expose privileged API keys through `NEXT_PUBLIC_` variables.
- Add `.env` and `.env.local` to `.gitignore`.
- Use your actual backend configuration when setting environment variables.

---

## Local Embedding Model Installation

Devora supports running BAAI/bge-base-en-v1.5 locally instead of depending entirely on an external embedding API.

### 1. Install PyTorch

First, install a PyTorch version compatible with your NVIDIA GPU and CUDA environment.

Official installation guide:

https://pytorch.org/get-started/locally/

Verify GPU availability:

```python
import torch

print("CUDA Available:", torch.cuda.is_available())

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))
```

### 2. Install SentenceTransformers

```bash
pip install sentence-transformers
```

### 3. Configure the Local Model

In your backend `.env`:

```env
EMBED_BACKEND=local
LOCAL_EMBED_MODEL=BAAI/bge-base-en-v1.5
```

### 4. Load the Model

```python
import torch
from sentence_transformers import SentenceTransformer

device = "cuda" if torch.cuda.is_available() else "cpu"

model = SentenceTransformer(
    "BAAI/bge-base-en-v1.5",
    device=device
)

if device == "cuda":
    model = model.half()

texts = [
    "What is Retrieval Augmented Generation?",
    "How does vector search work?"
]

embeddings = model.encode(
    texts,
    convert_to_tensor=True,
    normalize_embeddings=True
)

print("Device:", device)
print("Embedding Shape:", embeddings.shape)
```

The first model initialization automatically downloads the model weights from Hugging Face if they are not already cached locally.

For this model, the embedding dimension is 768.

### 5. Verify the Model

Expected output:

```text
Embedding Shape: torch.Size([2, 768])
```

**GPU Note:** Local embedding inference requires a compatible NVIDIA driver and CUDA-enabled PyTorch installation. CPU inference is also supported, but performance may be slower.

Model: https://huggingface.co/BAAI/bge-base-en-v1.5

---

## Running the Backend

After configuring the environment and installing dependencies:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

```text
http://localhost:8000
```

API documentation (if enabled):

```text
http://localhost:8000/docs
```

---

## Demo

### Live Application

<div align="center">

<a href="https://devoraai.pro">
  <img src="https://img.shields.io/badge/Visit_Devora-devoraai.pro-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</a>

<br /><br />

<a href="https://devoraai.pro">https://devoraai.pro</a>

</div>

### Full Project Walkthrough

<div align="center">

<a href="https://youtu.be/STAgp57DflY">
  <img src="https://img.youtube.com/vi/STAgp57DflY/maxresdefault.jpg" alt="Devora AI Full Project Demo" width="700"/>
</a>

<p><b>Click to watch the complete Devora demonstration.</b></p>

<p><i>Document Intelligence, Hybrid RAG, Live Web Search, LangGraph Agents, Career Mode, Job Intelligence, MFA, and AI Resume Generation.</i></p>

</div>

---

## Screenshots

<p align="center">
  <img src="public/images/img1.jpeg" width="100%" alt="Devora Dashboard"/>
</p>


<p align="center">
  <img src="public/images/img2.jpeg" width="100%" alt="Devora Document Intelligence"/>
</p>


<p align="center">
  <img src="public/images/img3.jpeg" width="100%" alt="Devora Career Mode"/>
</p>


---

## Author

**Sami Malik**

Full-Stack Developer | AI Engineering | LLM Applications | Agentic AI

---

## License

Specify the license applicable to this repository. If the project is not open-source, include the appropriate usage terms.

---

<div align="center">

**Devora — Bringing Document Intelligence, Agentic AI, and Career Intelligence Together.**

Built from scratch. Architected with intent. Shipped with care.

</div>
