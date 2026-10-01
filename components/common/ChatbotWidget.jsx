'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BsRobot,
  BsSend,
  BsX,
  BsTrash,
  BsChevronDown,
  BsArrowRightShort,
  BsGraphUp,
  BsBoxSeam,
  BsPeople,
  BsCart3,
  BsCashStack,
} from 'react-icons/bs';

const QUICK_PROMPTS = [
  { label: "Today's Summary", prompt: "Show today's business summary and sales total", icon: BsGraphUp },
  { label: "Grain Stock", prompt: "What is the current grain stock balance in godowns?", icon: BsBoxSeam },
  { label: "Top Receivables", prompt: "Show top pending party receivables and balances", icon: BsCashStack },
  { label: "Kirana POS", prompt: "How are Kirana store sales today and check low stock", icon: BsCart3 },
  { label: "Staff Advances", prompt: "Show pending staff and farmer advance requests", icon: BsPeople },
];

export default function ChatbotWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `### 👋 **Nawaz Traders Assistant**\n\nConnected live to your **PostgreSQL ERP Database**.\n\nQuick queries you can run:\n* **Today's Summary**: Procurement & sales totals\n* **Grain Stock**: Godown balances\n* **Party Dues**: Pending receivables & payables\n* **Kirana POS**: Daily retail store sales\n* **Advances**: Staff & farmer advance requests`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages,
        }),
      });

      const data = await response.json();

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "⚠️ Could not process request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to send message to chatbot:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: '⚠️ Network error: Could not reach the ERP service.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Chat history cleared. How can I assist you with Nawaz Traders ERP?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Click handler for links inside markdown responses
  const handleLinkClick = (e, href) => {
    e.preventDefault();
    if (href.startsWith('/')) {
      router.push(href);
      setIsOpen(false);
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  // Clean, Minimalist Markdown Renderer
  const renderFormattedMarkdown = (content) => {
    const lines = content.split('\n');
    let inTable = false;
    let tableHeader = [];
    let tableRows = [];

    const elements = [];

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Table parsing
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        if (trimmed.includes(':---') || trimmed.includes('---')) {
          return;
        }

        if (!inTable) {
          inTable = true;
          tableHeader = cells;
          tableRows = [];
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        inTable = false;
        elements.push(
          <div key={`table-${lineIdx}`} className="my-2.5 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800/60 text-emerald-400 font-semibold border-b border-slate-800">
                <tr>
                  {tableHeader.map((th, idx) => (
                    <th key={idx} className="p-2 border-r border-slate-800/60 last:border-0">{parseInlineFormatting(th)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 border-r border-slate-800/40 last:border-0 text-slate-300">{parseInlineFormatting(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      if (!trimmed) {
        elements.push(<div key={`br-${lineIdx}`} className="h-1.5" />);
        return;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${lineIdx}`} className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mt-2 mb-1">
            {parseInlineFormatting(trimmed.replace('### ', ''))}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${lineIdx}`} className="text-[11px] font-semibold text-amber-400 mt-1.5 mb-1">
            {parseInlineFormatting(trimmed.replace('#### ', ''))}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('---')) {
        elements.push(<hr key={`hr-${lineIdx}`} className="my-2 border-slate-800" />);
        return;
      }

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemText = trimmed.replace(/^[\*\-]\s+/, '');
        elements.push(
          <div key={`li-${lineIdx}`} className="flex items-start gap-1.5 my-1 text-xs text-slate-300">
            <span className="text-emerald-500 font-bold leading-4">•</span>
            <div className="flex-1 leading-relaxed">{parseInlineFormatting(itemText)}</div>
          </div>
        );
        return;
      }

      elements.push(
        <p key={`p-${lineIdx}`} className="text-xs text-slate-300 my-1 leading-relaxed">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    });

    if (inTable) {
      elements.push(
        <div key="table-end" className="my-2.5 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800/60 text-emerald-400 font-semibold border-b border-slate-800">
              <tr>
                {tableHeader.map((th, idx) => (
                  <th key={idx} className="p-2 border-r border-slate-800/60 last:border-0">{parseInlineFormatting(th)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2 border-r border-slate-800/40 last:border-0 text-slate-300">{parseInlineFormatting(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  // Helper for inline markdown (**bold**, [link](url))
  const parseInlineFormatting = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const label = match[1];
      const href = match[2];
      parts.push(
        <button
          key={`link-${match.index}`}
          onClick={(e) => handleLinkClick(e, href)}
          className="inline-flex items-center gap-0.5 text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 hover:bg-emerald-500/10 px-1 py-0.5 rounded transition-colors cursor-pointer text-xs"
        >
          {label}
          <BsArrowRightShort className="w-3.5 h-3.5" />
        </button>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.map((part, pIdx) => {
      if (typeof part !== 'string') return part;

      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`b-${pIdx}-${bIdx}`} className="font-semibold text-slate-100">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });
  };

  return (
    <>
      {/* Floating Action Launcher Button (Minimalist) */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle ERP Assistant"
          className={`relative flex items-center justify-center w-12 h-12 rounded-2xl shadow-xl border transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            isOpen
              ? 'bg-slate-900 border-slate-700 text-slate-400'
              : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-emerald-400 hover:border-emerald-500/40 shadow-emerald-950/20'
          }`}
        >
          {isOpen ? (
            <BsChevronDown className="w-5 h-5" />
          ) : (
            <div className="relative">
              <BsRobot className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Drawer / Minimalist Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-[390px] max-w-[400px] h-[520px] max-h-[calc(100vh-6rem)] flex flex-col bg-slate-950 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <BsRobot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  Nawaz ERP Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={handleClearHistory}
                title="Clear Chat"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
              >
                <BsTrash className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              >
                <BsX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] px-3.5 py-2.5 rounded-xl text-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div>{renderFormattedMarkdown(msg.text)}</div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-[11px] text-slate-400 font-medium">Querying ERP database...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Minimalist Quick Action Pills */}
          <div className="px-3 py-1.5 bg-slate-900/40 border-t border-slate-800/60 overflow-x-auto flex gap-1.5 scrollbar-none">
            {QUICK_PROMPTS.map((qp, idx) => {
              const IconComp = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={loading}
                  className="flex items-center gap-1 shrink-0 px-2 py-0.5 text-[10px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-slate-700 rounded-md transition-colors disabled:opacity-50"
                >
                  <IconComp className="w-2.5 h-2.5 text-emerald-400" />
                  {qp.label}
                </button>
              );
            })}
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-slate-900/80 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sales, paddy stock, parties..."
                disabled={loading}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500/50 text-slate-200 placeholder-slate-500 text-xs rounded-lg px-3 py-2 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <BsSend className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
