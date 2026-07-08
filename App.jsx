import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Utensils
} from "lucide-react";
import { restaurant } from "./data/restaurant";
import { createId, formatBookingText, nowTime } from "./utils/format";
import { handleBotTurn, initialState, quickReplies } from "./utils/chatbot";

function MessageBubble({ message }) {
  const isBot = message.role === "bot";

  return (
    <div className={`message-row ${isBot ? "bot-row" : "user-row"}`}>
      {isBot && (
        <div className="avatar bot-avatar">
          <Bot size={17} />
        </div>
      )}
      <div className={`bubble ${isBot ? "bot-bubble" : "user-bubble"}`}>
        <p>{message.text}</p>
        <span className="time">{message.time}</span>
      </div>
    </div>
  );
}

function QuickReplies({ replies, onSelect, disabled }) {
  if (!replies?.length) return null;

  return (
    <div className="quick-replies">
      {replies.map((reply) => (
        <button key={reply} type="button" onClick={() => onSelect(reply)} disabled={disabled}>
          {reply}
        </button>
      ))}
    </div>
  );
}

function BookingSummary({ booking, status }) {
  const rows = [
    ["Name", booking.name],
    ["Contact", booking.contact],
    ["Guests", booking.guests],
    ["Date", booking.date],
    ["Time", booking.time],
    ["Notes", booking.notes || "No special requests"]
  ];

  return (
    <div className="summary-card">
      <div className="summary-header">
        <CalendarCheck size={20} />
        <div>
          <h3>Reservation request</h3>
          <p>{status}</p>
        </div>
      </div>
      <div className="summary-grid">
        {rows.map(([label, value]) => (
          <div className="summary-row" key={label}>
            <span>{label}</span>
            <strong>{value || "Not set"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function MenuPreview() {
  return (
    <section className="menu-preview" id="menu">
      <div className="section-kicker">
        <Utensils size={16} />
        Menu highlights
      </div>
      <h2>Popular choices customers can ask about</h2>
      <div className="menu-grid">
        {restaurant.menuHighlights.map((section) => (
          <div className="menu-card" key={section.category}>
            <h3>{section.category}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactStrip() {
  return (
    <section className="contact-strip" id="contact">
      <div>
        <span className="section-kicker">
          <MapPin size={16} />
          Visit us
        </span>
        <h2>{restaurant.name}</h2>
        <p>{restaurant.address}</p>
      </div>
      <div className="contact-items">
        <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`}>
          <Phone size={18} />
          {restaurant.phone}
        </a>
        <a href={`mailto:${restaurant.ownerEmail}`}>
          <Mail size={18} />
          {restaurant.ownerEmail}
        </a>
      </div>
    </section>
  );
}

function ChatWidget() {
  const [chatState, setChatState] = useState(initialState());
  const [messages, setMessages] = useState(() => [
    {
      id: createId(),
      role: "bot",
      text: `Welcome to ${restaurant.name}! I can help with reservations, menu questions, opening hours, and customer enquiries.\n\nWhat would you like to do?`,
      time: nowTime(),
      replies: quickReplies.start
    }
  ]);
  const [input, setInput] = useState("");
  const [lastReplies, setLastReplies] = useState(quickReplies.start);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("Not sent yet");
  const bottomRef = useRef(null);

  const bookingText = useMemo(() => formatBookingText(chatState.booking), [chatState.booking]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function submitReservation(booking) {
    setSending(true);
    setSendStatus("Sending...");

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          booking,
          source: "Bosphorus Lounge website chatbot"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Reservation could not be sent.");
      }

      setSendStatus("Sent to restaurant email");

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "bot",
          text: "Done — the restaurant has received the reservation request. Staff should contact you to confirm availability.",
          time: nowTime(),
          replies: ["Restart"]
        }
      ]);
      setLastReplies(["Restart"]);
    } catch (error) {
      setSendStatus("Failed to send");
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "bot",
          text:
            "I saved the details, but the email could not be sent. Please try again or contact the restaurant directly.\n\nError: " +
            error.message,
          time: nowTime(),
          replies: ["Confirm booking", "Change contact", "Restart"]
        }
      ]);
      setLastReplies(["Confirm booking", "Change contact", "Restart"]);
    } finally {
      setSending(false);
    }
  }

  function addUserAndBotTurn(value) {
    const trimmed = value.trim();
    if (!trimmed || sending) return;

    const userMessage = {
      id: createId(),
      role: "user",
      text: trimmed,
      time: nowTime(),
      replies: []
    };

    const result = handleBotTurn(chatState, trimmed, restaurant);

    const botMessages = result.messages.map((message) => ({
      id: createId(),
      role: "bot",
      text: message.text,
      time: nowTime(),
      replies: message.replies || []
    }));

    setMessages((current) => [...current, userMessage, ...botMessages]);
    setChatState(result.state);
    setInput("");
    setLastReplies(botMessages.at(-1)?.replies || []);

    if (result.submit) {
      submitReservation(result.state.booking);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    addUserAndBotTurn(input);
  }

  function handleQuickReply(reply) {
    addUserAndBotTurn(reply);
  }

  function resetChat() {
    const next = initialState();
    setChatState(next);
    setSendStatus("Not sent yet");
    setSending(false);
    setInput("");
    setMessages([
      {
        id: createId(),
        role: "bot",
        text: `Welcome to ${restaurant.name}! I can help with reservations, menu questions, opening hours, and customer enquiries.\n\nWhat would you like to do?`,
        time: nowTime(),
        replies: quickReplies.start
      }
    ]);
    setLastReplies(quickReplies.start);
  }

  return (
    <div className="chat-shell" id="chat">
      <div className="chat-topbar">
        <div className="chat-identity">
          <div className="logo-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <h2>AI Receptionist</h2>
            <p>Online now · replies instantly</p>
          </div>
        </div>
        <button className="ghost-button" type="button" onClick={resetChat} title="Restart chat">
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="chat-body">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {sending && (
          <div className="message-row bot-row">
            <div className="avatar bot-avatar">
              <Bot size={17} />
            </div>
            <div className="bubble bot-bubble typing">Sending reservation...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <QuickReplies replies={lastReplies} onSelect={handleQuickReply} disabled={sending} />

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your answer..."
          disabled={sending}
          aria-label="Chat message"
        />
        <button type="submit" disabled={sending || !input.trim()}>
          <ArrowRight size={18} />
        </button>
      </form>

      <BookingSummary booking={chatState.booking} status={sendStatus} />

      <details className="debug-details">
        <summary>Booking text preview</summary>
        <pre>{bookingText}</pre>
      </details>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="pill">
          <ShieldCheck size={16} />
          Production-ready restaurant chatbot
        </div>
        <h1>{restaurant.name} AI Receptionist</h1>
        <p>
          A smart website assistant that answers customer questions, collects reservations, validates details,
          lets guests change answers, and sends requests straight to the restaurant email.
        </p>
        <div className="hero-actions">
          <a className="primary-link" href="#chat">
            Test the chatbot
          </a>
          <a className="secondary-link" href="#menu">
            View menu preview
          </a>
        </div>
        <div className="trust-row">
          <span>
            <CheckCircle2 size={16} /> Email automation
          </span>
          <span>
            <CheckCircle2 size={16} /> Validation
          </span>
          <span>
            <CheckCircle2 size={16} /> Vercel-ready
          </span>
        </div>
      </div>

      <ChatWidget />
    </section>
  );
}

function InfoSections() {
  return (
    <section className="features">
      <FeatureCard
        icon={<MessageCircle size={22} />}
        title="Smart reservation flow"
        text="Customers can say go back, change date, change time, no, restart, or confirm. The bot adapts to the answer."
      />
      <FeatureCard
        icon={<CalendarCheck size={22} />}
        title="Validated booking details"
        text="The app checks name, contact, guest count, date, and time before allowing the customer to continue."
      />
      <FeatureCard
        icon={<Mail size={22} />}
        title="Automatic email"
        text="When the customer confirms, a secure Vercel API route sends the booking details to the restaurant."
      />
      <FeatureCard
        icon={<Clock size={22} />}
        title="Always available"
        text="The receptionist works after closing hours so the restaurant does not miss reservation enquiries."
      />
    </section>
  );
}

export default function App() {
  return (
    <main>
      <nav className="nav">
        <a href="#" className="brand">
          <span>B</span>
          {restaurant.name}
        </a>
        <div className="nav-links">
          <a href="#chat">Chatbot</a>
          <a href="#menu">Menu</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
      <Hero />
      <InfoSections />
      <MenuPreview />
      <ContactStrip />
      <footer>
        <p>© {new Date().getFullYear()} {restaurant.name}. AI receptionist demo project.</p>
      </footer>
    </main>
  );
}
