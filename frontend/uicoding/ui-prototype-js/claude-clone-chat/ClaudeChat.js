import { useState, useRef, useEffect } from "react";
import {ClaudeIcon, UserIcon, SendIcon, StopIcon, NewChatIcon} from "./icon";

const SYSTEM_PROMPT = `You are Claude, an AI assistant made by Anthropic. You are helpful, harmless, and honest. You have a warm, thoughtful personality. You give clear, well-structured responses and are genuinely curious about the people you talk with.`;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#D4956A] opacity-70 animate-[bounce_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 items-start py-1 animate-[fadeSlideIn_0.25s_ease_forwards] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`shrink-0 w-[34px] h-[34px] flex items-center justify-center mt-0.5
        ${isUser
          ? "rounded-[10px] bg-[#2D2D2D] border border-[#3A3A3A] text-[#C8C8C8]"
          : "rounded-full bg-[#FDF0E6] border-[1.5px] border-[#D4956A33] text-[#D4956A]"
        }`}>
        {isUser ? <UserIcon /> : <ClaudeIcon />}
      </div>

      <div className={`max-w-[72%] py-3 px-4 text-sm leading-[1.65] font-serif tracking-[0.01em] whitespace-pre-wrap break-words
        ${isUser
          ? "bg-[#1C1C1E] border border-[#2D2D2D] rounded-[18px_4px_18px_18px] text-[#E8E8E8]"
          : "bg-[#141414] border border-[#1F1F1F] rounded-[4px_18px_18px_18px] text-[#D4D4D4] shadow-[0_1px_12px_rgba(0,0,0,0.3)]"
        }`}>
        {msg.content === "__typing__" ? <TypingIndicator /> : msg.content}
        {msg.error && (
          <div className="text-[#E05A5A] text-xs mt-1.5 font-mono">
            ⚠ {msg.error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [conversations, setConversations] = useState([
    { id: 1, title: "New conversation", messages: [] }
  ]);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const nextId = useRef(2);

  const activeConvo = conversations.find(c => c.id === activeId);
  const messages = activeConvo?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  function updateConvo(id, updater) {
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c));
  }

  function newChat() {
    const id = nextId.current++;
    setConversations(prev => [...prev, { id, title: "New conversation", messages: [] }]);
    setActiveId(id);
    setInput("");
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text };
    const typingMsg = { role: "assistant", content: "__typing__", id: "typing" };

    const isFirst = messages.length === 0;
    updateConvo(activeId, c => ({
      ...c,
      title: isFirst ? text.slice(0, 40) + (text.length > 40 ? "…" : "") : c.title,
      messages: [...c.messages, userMsg, typingMsg],
    }));

    setLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: text });

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await res.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "No response.";
      const assistantMsg = { role: "assistant", content: reply };

      updateConvo(activeId, c => ({
        ...c,
        messages: [...c.messages.filter(m => m.id !== "typing"), assistantMsg],
      }));
    } catch (err) {
      const error = err;
      if (error.name === "AbortError") {
        updateConvo(activeId, c => ({
          ...c,
          messages: c.messages.filter(m => m.id !== "typing"),
        }));
      } else {
        updateConvo(activeId, c => ({
          ...c,
          messages: [...c.messages.filter(m => m.id !== "typing"),
            { role: "assistant", content: "", error: error.message }],
        }));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const suggestions = [
    "Explain feature drift in ML systems",
    "How does ML observability differ from traditional monitoring?",
    "What's the difference between PSI and KS test?",
    "Help me prep for a Google Staff Engineer interview",
  ];

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex h-screen w-full font-serif bg-[#0A0A0A] text-[#D4D4D4] overflow-hidden">

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-60 shrink-0 bg-[#0F0F0F] border-r border-r-[#1A1A1A] flex flex-col overflow-hidden">
            {/* Sidebar header */}
            <div className="pt-5 px-4 pb-3 border-b border-b-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-4">
                <ClaudeIcon />
                <span className="text-[15px] font-medium text-[#E0E0E0] tracking-[-0.01em]">Claude</span>
              </div>
              <button
                className="new-chat-btn w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-[#999] text-[13px] transition-colors duration-150"
                onClick={newChat}
              >
                <NewChatIcon /> New conversation
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.slice().reverse().map(c => (
                <button
                  key={c.id}
                  className={`sidebar-item w-full text-left py-[9px] px-2.5 rounded-lg text-[13px] font-serif whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-150 border-l-2
                    ${c.id === activeId
                      ? "text-[#E0E0E0] bg-[#1A1A1A] border-l-[#D4956A]"
                      : "text-[#777] bg-transparent border-l-transparent"
                    }`}
                  onClick={() => setActiveId(c.id)}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {/* Model badge */}
            <div className="py-3 px-4 border-t border-t-[#1A1A1A]">
              <div className="text-[11px] text-[#444] font-mono bg-[#141414] py-1.5 px-2.5 rounded-md">
                claude-sonnet-4
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* Top bar */}
          <div className="h-[52px] shrink-0 border-b border-b-[#161616] flex items-center gap-2.5 px-4 bg-[#0A0A0A]">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="text-[#555] p-1.5 rounded-md text-lg leading-none transition-colors duration-150"
            >
              ☰
            </button>
            <span className="text-[13px] text-[#555] font-mono">
              {activeConvo?.title || "New conversation"}
            </span>
            {loading && (
              <div className="ml-auto text-[11px] text-[#D4956A] font-mono animate-[pulse_1.5s_ease-in-out_infinite]">
                ● thinking
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="max-w-[720px] mx-auto px-5">

              {messages.length === 0 ? (
                <div className="pt-[60px] animate-[fadeSlideIn_0.4s_ease]">
                  {/* Welcome */}
                  <div className="text-center mb-10">
                    <div className="w-[52px] h-[52px] rounded-full bg-[#FDF0E6] border-2 border-[#D4956A44] flex items-center justify-center mx-auto mb-4">
                      <ClaudeIcon />
                    </div>
                    <h1 className="text-[22px] font-normal text-[#D0D0D0] mb-1.5">
                      Good to see you
                    </h1>
                    <p className="text-sm text-[#555] italic">
                      What's on your mind today?
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        className="suggestion-btn text-left py-3 px-3.5 bg-[#111] border border-[#222] rounded-[10px] text-[#888] text-[13px] font-serif leading-normal transition-all duration-150"
                        onClick={() => setInput(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                </div>
              )}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>

          {/* Input area */}
          <div className="shrink-0 pt-4 px-5 pb-5 bg-[#0A0A0A]">
            <div className="max-w-[720px] mx-auto">
              <div className="flex items-end gap-2.5 bg-[#111] border border-[#222] rounded-[14px] py-3 px-3.5 transition-colors duration-200 shadow-[0_0_0_1px_#00000040,_0_4px_20px_rgba(0,0,0,0.4)]">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Message Claude…"
                  rows={1}
                  className="flex-1 text-sm text-[#D4D4D4] font-serif leading-[1.6] min-h-6 max-h-40 bg-transparent resize-none outline-none"
                />
                {loading ? (
                  <button
                    onClick={stop}
                    className="shrink-0 w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-[#888] transition-all duration-150"
                  >
                    <StopIcon />
                  </button>
                ) : (
                  <button
                    className={`send-btn shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
                      ${input.trim() ? "bg-[#D4956A] text-white" : "bg-[#1C1C1C] text-[#444]"}`}
                    onClick={send}
                    disabled={!input.trim()}
                  >
                    <SendIcon />
                  </button>
                )}
              </div>
              <p className="text-center text-[11px] text-[#333] mt-2.5 font-mono">
                Shift + Enter for new line · Enter to send
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
