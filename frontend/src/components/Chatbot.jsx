import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import robot from "../assets/robot.png";

const API_BASE = "/api/chat";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [messages, setMessages] = useState([]);//store all the chat
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const startConversation = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/start`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setSessionId(data.session_id);

      setMessages([
        {
          role: "bot",
          ...data,
          id: Date.now(),
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setError("Unable to connect to ZeNA.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();

    if (!trimmed || loading || !sessionId) return;

    setInput("");
    setLoading(true);
    setError(null);

    const userMsg = {
      role: "user",
      message: trimmed,
      id: Date.now(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          ...data,
          id: Date.now() + 1,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setError("Message could not be sent.");
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (formData) => {
    if (!sessionId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          form_data: formData,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          message: "Details submitted ✓",
          id: Date.now(),
          timestamp: Date.now(),
        },
        {
          role: "bot",
          ...data,
          id: Date.now() + 1,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setError("Form submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ---------- OPEN CHAT ----------
  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);

    if (!sessionId) {
      startConversation();
    }
  };

  // ---------- MINIMIZE ----------
  const handleMinimize = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  // ---------- CLOSE ----------
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);

    setMessages([]);
    setSessionId(null);
    setInput("");
    setError(null);
  };

  return (
    <>
      {/* Floating Button */}
      {(!isOpen || isMinimized) && (
        <div className="chatbot-toggle" onClick={openChat}>
          <img src={robot} alt="ZeNA" />
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={robot}
                alt="robot"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                }}
              />

              <div>
                <h2>ZeNA</h2>
                <p>🟢 Online • ZeAI Soft Assistant</p>
              </div>
            </div>

            {/* HEADER BUTTONS */}
            <div className="chatbot-header-actions">
              <button
                className="chatbot-header-icon-btn"
                onClick={handleMinimize}
                aria-label="Minimize"
              >
                −
              </button>

              <button
                className="chatbot-header-icon-btn"
                onClick={handleClose}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <Message
                key={msg.id}
                message={msg}
                onOptionClick={sendMessage}
                onFormSubmit={submitForm}
                disabled={loading}
              />
            ))}

            {loading && (
              <div className="message bot typing-message">
                <div className="message-row">
                  <img
                    src={robot}
                    alt="ZeNA"
                    className="message-avatar"
                  />

                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <form
            className="chatbot-input-area"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || !sessionId}
            />

            <button
              type="submit"
              disabled={
                loading ||
                !input.trim() ||
                !sessionId
              }
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}