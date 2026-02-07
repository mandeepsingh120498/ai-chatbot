 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..d4af9ff28e751628d0a8e6c34f8de449939a44de
--- /dev/null
+++ b/README.md
@@ -0,0 +1,50 @@
+# Multi-tenant RAG Chatbot System Design
+
+This repository documents a multi-tenant Retrieval-Augmented Generation (RAG) chatbot architecture where one local LLM serves many businesses while keeping each business's knowledge isolated.
+
+## High-level request flow
+
+```text
+User
+  ↓
+Chat UI (React)
+  ↓
+Node Backend API
+  ↓
+Business Identifier (tenant_id)
+  ↓
+Retriever (Vector Search)
+  ↓
+Business-specific Knowledge Base
+  ↓
+Local LLM (Ollama)
+  ↓
+Response
+```
+
+## Architecture summary
+
+A single backend and local LLM runtime can support multiple businesses by enforcing tenant isolation at retrieval time:
+
+1. The frontend sends user messages to the backend.
+2. The backend authenticates the request and resolves the `tenant_id`.
+3. Retrieval queries are filtered/scoped by `tenant_id` so only the matching business index is searched.
+4. The retriever returns the most relevant chunks from that tenant's vector knowledge base.
+5. The backend builds a grounded prompt (user question + retrieved context).
+6. A shared Ollama-hosted model generates the answer.
+7. The backend returns the response to the UI.
+
+## Why this design works
+
+- **Tenant isolation:** Each business has a logically separate vector namespace/index.
+- **Cost efficiency:** One shared model runtime avoids per-tenant LLM duplication.
+- **Scalability:** Add tenants by provisioning new embeddings + vector partitions, not new model stacks.
+- **Operational simplicity:** Centralized backend and model serving with consistent monitoring.
+
+## Recommended guardrails
+
+- Enforce server-side tenant checks (never trust tenant info from UI alone).
+- Add retrieval filters and ACL assertions in every vector query.
+- Store audit logs with tenant, query ID, retrieved doc IDs, and model version.
+- Add per-tenant rate limits and token quotas.
+- Version embeddings/prompts to safely roll out quality improvements.
 
EOF
)
