import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

export default function App() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/tenants`)
      .then((res) => res.json())
      .then((data) => {
        setTenants(data.tenants || []);
        if (data.tenants?.[0]) setTenantId(data.tenants[0].tenantId);
      })
      .catch(() => {
        setTenants([]);
      });
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!input.trim() || !tenantId || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenantId
        },
        body: JSON.stringify({
          tenantId,
          message: userMessage.content,
          history: messages.slice(-6)
        })
      });

      const data = await res.json();
      const assistantMessage = {
        role: "assistant",
        content: data.answer || data.error || "No response received.",
        context: data.context || []
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Backend unavailable. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="layout">
      <header>
        <h1>Multi-tenant RAG Chatbot</h1>
        <p>Shared Ollama model + tenant-isolated knowledge base retrieval.</p>
      </header>

      <section className="controls">
        <label htmlFor="tenant">Business tenant</label>
        <select
          id="tenant"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
        >
          {tenants.map((tenant) => (
            <option key={tenant.tenantId} value={tenant.tenantId}>
              {tenant.name}
            </option>
          ))}
        </select>
      </section>

      <section className="chatWindow">
        {messages.length === 0 && (
          <p className="emptyState">Ask about business hours, services, or policies.</p>
        )}
        {messages.map((msg, index) => (
          <article key={`${msg.role}-${index}`} className={`bubble ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "Assistant"}</strong>
            <p>{msg.content}</p>
            {msg.context?.length ? (
              <ul className="citations">
                {msg.context.map((item) => (
                  <li key={item.id}>
                    <code>{item.id}</code>: {item.content}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <form onSubmit={sendMessage} className="composer">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          disabled={!tenantId || loading}
        />
        <button type="submit" disabled={!tenantId || !input.trim() || loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </main>
  );
}
