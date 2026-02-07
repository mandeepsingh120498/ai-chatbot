# Multi-tenant RAG Chatbot (React + Node + Ollama)

A complete starter codebase for a **multi-tenant Retrieval-Augmented Generation (RAG) chatbot**.

- Single shared local LLM runtime (Ollama)
- Tenant-aware retrieval so each business only sees its own knowledge base
- React chat UI + Node backend API

## Architecture

```text
User
  ↓
Chat UI (React)
  ↓
Node Backend API
  ↓
Business Identifier (tenant_id)
  ↓
Retriever (Vector Search)
  ↓
Business-specific Knowledge Base
  ↓
Local LLM (Ollama)
  ↓
Response
```

## Project structure

```text
.
├── client/                # React app (Vite)
├── server/                # Node API + tenant-aware retriever + Ollama integration
│   └── data/tenants/      # Tenant knowledge bases (JSON docs)
└── package.json           # Workspace scripts
```

## Quick start

### 1) Install dependencies

```bash
npm install
```

### 2) Run Ollama locally (optional but recommended)

```bash
ollama serve
ollama pull llama3.1:8b
```

If Ollama is unavailable, the backend returns a deterministic fallback response using retrieved context.

### 3) Start backend + frontend

```bash
npm run dev
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

## Backend API

### `GET /api/health`
Health check.

### `GET /api/tenants`
Returns available tenants.

### `POST /api/chat`
Request body:

```json
{
  "tenantId": "alpha-bakery",
  "message": "What are your opening hours?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Also supports tenant via `x-tenant-id` header.

Response includes `answer`, `citations`, and a `context` array (retrieved chunks) for transparent grounding.

## Multi-tenant isolation model

- Each tenant has separate knowledge docs under `server/data/tenants/*.json`.
- The retriever loads and indexes per tenant at startup.
- Every chat request resolves `tenantId` first, then performs retrieval only in that tenant’s index.
- Retrieved chunks are passed as context to a shared LLM model.

## Environment variables

Set in shell or `.env` for the server:

- `PORT` (default: `3001`)
- `OLLAMA_URL` (default: `http://127.0.0.1:11434`)
- `OLLAMA_MODEL` (default: `llama3.1:8b`)

## Extending this starter

- Replace in-process TF-IDF retriever with pgvector, Qdrant, Weaviate, or Pinecone.
- Add auth middleware and enforce tenant mapping from identity claims.
- Persist chat history per tenant/user.
- Add embedding pipelines for larger document sets.
- Add rate limiting and tenant-level quotas.

## Tests

```bash
npm test
```

Includes retriever relevance and tenant-isolation tests in `server/test`.
