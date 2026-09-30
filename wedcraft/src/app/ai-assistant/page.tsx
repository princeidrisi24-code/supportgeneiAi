"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTION_CHIPS = [
  "📋 What should I do 6 months before?",
  "💰 How to save on catering costs?",
  "📸 Tips for choosing a photographer",
  "👗 Bridal lehenga shopping guide",
  "🎵 Best sangeet songs playlist",
  "💌 Wedding invitation wording ideas",
  "🌸 Trending decor themes 2027",
  "🍽️ Menu ideas for 200 guests",
  "💍 How to write wedding vows",
  "🏨 Guest accommodation tips",
];

const AI_KNOWLEDGE: Record<string, string> = {
  "6 months": `Here's your **6-month wedding checklist**:

📋 **Immediate Tasks:**
- ✅ Finalize and book your venue (if not done)
- ✅ Book photographer & videographer
- ✅ Send save-the-dates
- ✅ Start wedding website

💰 **Budget:**
- Lock in your total budget and allocate categories
- Pay venue advance (typically 30-50%)
- Start researching caterers

👗 **Attire:**
- Begin bridal lehenga shopping (alterations take 2-3 months)
- Book groom's sherwani appointment

🎵 **Entertainment:**
- Book DJ/band for sangeet
- Start choreography planning

💌 **Invitations:**
- Finalize invitation design
- Order print invitations (if doing both physical + digital)

💡 **Pro Tip:** This is the sweet spot — you have enough time to get the best vendors, but you should be booking the popular ones NOW before they fill up.`,

  "catering": `Here are **smart ways to save on catering** without compromising quality:

💡 **Menu Strategy:**
- Go for a **buffet** instead of sit-down — saves 20-30%
- Limit to 5-6 main courses instead of 8-10
- Choose **seasonal local ingredients** — much cheaper than imported
- Skip the live counters (save ₹30,000-50,000 easily)

🍽️ **Negotiation Tips:**
- Book caterer early — prices go up during peak wedding season (Nov-Feb)
- Ask for a **per-plate rate** vs per-item — often cheaper
- Negotiate free tasting sessions
- Get the cake included in the catering package

📊 **Budget Allocation:**
- Typical: 25-30% of total budget goes to food
- For ₹10L budget → aim for ₹2.5-3L on catering
- Include welcome drinks, cocktails, and midnight snacks

🧊 **Hidden Costs to Watch:**
- Service staff charges
- Crockery/cutlery rental
- Generator backup for outdoor venues
- Leftover food packaging

💎 **Pro Tip:** Book a tasting for 2-3 caterers and compare. Some will match or beat a competitor's quote if you show them the other proposal.`,

  "photographer": `Here's your complete **photographer selection guide**:

📸 **What to Look For:**
- **Portfolio consistency** — not just 5 great shots, but consistent quality
- **Storytelling style** — candid vs posed vs journalistic
- Ask for a **full wedding album** (not just highlights)
- Check their **editing style** — moody, bright, filmic, etc.

💰 **Price Guide (India):**
- Budget: ₹40,000 - ₹80,000
- Mid-range: ₹80,000 - ₹1,50,000
- Premium: ₹1,50,000 - ₹3,00,000+
- Celebrity: ₹5,00,000+

📝 **Interview Questions:**
1. How many weddings have you shot?
2. What's your backup equipment plan?
3. Will you personally shoot or send an associate?
4. How many edited photos will we receive?
5. Delivery timeline? (ideal: 4-6 weeks)
6. Do you do a pre-wedding shoot? (included or extra?)

⚠️ **Red Flags:**
- Won't share a full album
- No contract or vague terms
- Much cheaper than market rate
- No second shooter for big weddings

💎 **Pro Tips:**
- Book 12-18 months in advance for top photographers
- Pre-wedding shoots help build comfort with the photographer
- Create a "must-have shots" list and share it beforehand`,

  "lehenga": `Here's your **bridal lehenga shopping guide**:

👗 **Timeline:**
- Start browsing **8-10 months** before wedding
- Finalize purchase **6 months** before (for alterations)
- 2-3 fittings needed, last one **2 weeks** before

💰 **Price Ranges:**
- Designer boutique: ₹50,000 - ₹1,50,000
- Premium designer: ₹1,50,000 - ₹5,00,000
- Luxury (Sabyasachi, Manish Malhotra): ₹5,00,000 - ₹25,00,000+
- Bridal rental: ₹15,000 - ₹50,000

🎨 **Trending Colors 2027:**
- Classic red & maroon
- Pastel pink & peach (for day weddings)
- Emerald green & teal
- Ivory & gold (fusion weddings)
- Lavender & lilac (unique & modern)

📍 **Top Shopping Destinations:**
- Delhi: Chandni Chowk, Shahpur Jat
- Mumbai: Linking Road, Colaba
- Jaipur: Johari Bazaar
- Online: Aza Fashion, Pernia's Pop-Up Shop

💎 **Pro Tips:**
- Wear nude/seamless undergarments when trying
- Bring your mom/bestie — but limit to 2 opinions max
- Try the lehenga with heels similar to what you'll wear
- Ask about dupatta draping options
- Don't forget matching jewelry budgeting`,

  "sangeet": `Here are **popular sangeet songs** for 2027:

🎵 **Bride's Entry:**
- "Mere Haathon Mein" (Chandni)
- "Nachdi Phira" (Secret Superstar)
- "London Thumakda" (Queen)

💃 **Group Dance Numbers:**
- "Gallan Goodiyan" (Dil Dhadakne Do)
- "Kala Chashma" (Baar Baar Dekho)
- "Kar Gayi Chull" (Kapoor & Sons)
- "Morni Banke" (Badhaai Ho)

❤️ **Couple Performance:**
- "Tum Hi Ho" (Aashiqui 2)
- "Raataan Lambiyan" (Shershaah)
- "Pehla Nasha" (Jo Jeeta Wohi Sikandar)

👨‍👩‍👧 **Family/Fun:**
- "Bole Chudiyan" (K3G)
- "Desi Girl" (Dostana)
- "Badtameez Dil" (Yeh Jawaani Hai Deewani)

🎤 **Trending 2027:**
- "Kesariya" (Brahmastra)
- "What Jhumka" (Rocky Aur Rani)
- Latest Arijit Singh releases

💡 **Planning Tips:**
- Start choreography practice 2 months before
- Hire a choreographer for 3-4 sessions
- Keep each performance under 5 minutes
- Mix old classics with new hits`,

  "invitation": `Here are **wedding invitation wording ideas**:

✨ **Traditional/Formal:**
> *With the blessings of the Almighty and the joyous consent of both families, we cordially invite you to the wedding celebration of Rahul & Sneha*

🌸 **Modern/Casual:**
> *Two hearts, one beautiful journey! Rahul & Sneha are getting married and we'd love for you to be a part of our celebration*

💕 **Fun/Quirky:**
> *After years of stealing each other's fries, Rahul & Sneha have decided to make it official! Save the date for the biggest party of the year*

🕉️ **Hindu Traditional:**
> *Shubh Vivah | With the grace of Lord Ganesha and the blessings of our parents, we invite you to the auspicious wedding ceremony of...*

📱 **Digital/WhatsApp:**
> *🎊 You're Invited! 🎊*
> *Rahul 💍 Sneha*
> *Date: March 15, 2027*
> *Venue: Royal Orchid Palace, Jaipur*
> *We can't wait to celebrate with you! 🎉*

💡 **Tips:**
- Include ALL event details (mehendi, sangeet, wedding, reception)
- Add dress code if applicable
- Include RSVP deadline
- For digital: add Google Calendar link + Google Maps location`,

  "decor": `Here are **trending wedding decor themes** for 2027:

🌿 **1. Enchanted Garden**
- Lush greenery with cascading florals
- Fairy lights and lanterns
- Natural wood elements
- Colors: sage green, blush pink, cream

🏛️ **2. Royal Rajasthani**
- Marigold and rose arrangements
- Brass urlis and diyas
- Rich fabrics — velvet, silk
- Colors: deep red, gold, emerald

✨ **3. Celestial Night**
- Starry ceiling installations
- Moon-shaped backdrops
- Navy and gold color scheme
- Candle-lit everything

🌸 **4. Pastel Dream**
- Soft color palette
- Baby's breath and peonies
- Crystal and acrylic elements
- Perfect for day weddings

🌊 **5. Coastal Chic (Destination)**
- Sandy tones and blue accents
- Driftwood and shells
- Flowing fabrics
- Minimalist floral arrangements

💰 **Budget Breakdown:**
- Mandap: ₹30,000 - ₹2,00,000
- Stage: ₹20,000 - ₹1,00,000
- Table centerpieces: ₹500 - ₹3,000 each
- Photo booth: ₹15,000 - ₹50,000
- Entrance: ₹10,000 - ₹75,000`,

  "menu": `Here's a **wedding menu guide for 200 guests**:

🍽️ **Buffet Menu Structure:**

**Welcome Drinks (2-3 options):**
- Rose sherbet / Aam Panna
- Fresh lime soda
- Mocktail station

**Starters (6-8 items):**
- Paneer tikka & hara bhara kebab (veg)
- Chicken tikka & fish amritsari (non-veg)
- Dahi ke kebab, corn chat
- Live chaat counter

**Main Course (5-6 items):**
- Dal makhani / Dal tadka
- Paneer butter masala
- Mix veg / Malai kofta
- Butter chicken / Mutton rogan josh
- Biryani station (veg + non-veg)
- Naan, roti, paratha varieties

**Rice & Breads:**
- Jeera rice, pulao
- Assorted naan & roti

**Desserts (4-5 items):**
- Gulab jamun & rasgulla
- Kulfi / ice cream station
- Jalebi (live counter)
- Wedding cake
- Phirni / Kheer

💰 **Cost Estimate (200 guests):**
- Budget: ₹800-1,200 per plate = ₹1.6-2.4L
- Mid-range: ₹1,200-2,000 per plate = ₹2.4-4L
- Premium: ₹2,000-3,500 per plate = ₹4-7L

💡 **Pro Tips:**
- Count for 15% extra plates (guests bring +1s)
- Separate kids menu saves 30-40% per child plate
- Live counters add wow factor but cost ₹5,000-15,000 each`,

  "vows": `Here's how to **write heartfelt wedding vows**:

💍 **Structure:**
1. **Opening** — Address your partner
2. **Story** — How you met / fell in love
3. **Qualities** — What you love about them
4. **Promises** — Your commitments
5. **Closing** — A meaningful ending

✍️ **Example 1 (Romantic):**
> *"From the moment I met you, I knew my life would never be the same. You are my best friend, my biggest supporter, and the love of my life. I promise to stand by you through every storm and celebrate every rainbow. I promise to be patient when you take forever to get ready, and to always save you the last piece of dessert. Today and forever, I choose you."*

✍️ **Example 2 (Funny + Sweet):**
> *"I promise to love you even when you steal all the blankets. I promise to let you control the Netflix queue (most of the time). I promise to be your partner in every adventure, your shoulder in every storm, and your biggest cheerleader in every dream. You make ordinary moments extraordinary, and I can't wait for a lifetime of them."*

✍️ **Example 3 (Short & Powerful):**
> *"You are my home. With you, I am complete. I promise to love you fiercely, support you endlessly, and choose you every single day for the rest of my life."*

💡 **Tips:**
- Keep it 1-2 minutes long
- Practice reading aloud 3-4 times
- Write it on nice paper (not your phone)
- Be specific — mention real moments
- It's OK to cry — have tissues ready!`,

  "accommodation": `Here are **guest accommodation tips**:

🏨 **Planning Checklist:**
- Book a room block 8-10 months before
- Negotiate group rate (usually 15-25% off)
- Reserve 30-40% of guest list capacity
- Offer 2-3 price range options

💰 **Budget Hotels Near Venue:**
- Look for hotels within 5-10 km radius
- OYO/FabHotels for budget-conscious guests: ₹1,500-3,000/night
- Mid-range: ₹3,000-6,000/night
- Premium: ₹6,000-15,000/night

📝 **What to Include on Wedding Website:**
- Hotel name, address, and phone
- Google Maps link
- Check-in/check-out times
- Group booking code (if applicable)
- Distance from venue
- Transport arrangements

🚗 **Transport:**
- Arrange shuttle buses between hotel and venue
- Share Uber/Ola contact numbers
- For destination weddings: airport pickup coordination

💡 **Pro Tips:**
- Send hotel details along with the invitation
- Book a hospitality suite for the bridal party
- Arrange welcome bags at hotel check-in
- Include local emergency numbers
- Create a WhatsApp group for travel coordination`,
};

function getAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  for (const [keyword, response] of Object.entries(AI_KNOWLEDGE)) {
    if (msg.includes(keyword.toLowerCase())) return response;
  }

  // Generic smart responses
  if (msg.includes("budget") || msg.includes("cost") || msg.includes("price") || msg.includes("expensive") || msg.includes("save") || msg.includes("money")) {
    return AI_KNOWLEDGE["catering"];
  }
  if (msg.includes("photo") || msg.includes("camera") || msg.includes("shoot")) {
    return AI_KNOWLEDGE["photographer"];
  }
  if (msg.includes("dress") || msg.includes("outfit") || msg.includes("wear") || msg.includes("lehenga") || msg.includes("bridal")) {
    return AI_KNOWLEDGE["lehenga"];
  }
  if (msg.includes("song") || msg.includes("music") || msg.includes("dance") || msg.includes("sangeet") || msg.includes("dj")) {
    return AI_KNOWLEDGE["sangeet"];
  }
  if (msg.includes("invite") || msg.includes("card") || msg.includes("rsvp") || msg.includes("wording")) {
    return AI_KNOWLEDGE["invitation"];
  }
  if (msg.includes("decor") || msg.includes("flower") || msg.includes("theme") || msg.includes("mandap")) {
    return AI_KNOWLEDGE["decor"];
  }
  if (msg.includes("food") || msg.includes("menu") || msg.includes("guest") || msg.includes("plate")) {
    return AI_KNOWLEDGE["menu"];
  }
  if (msg.includes("vow") || msg.includes("speech") || msg.includes("write")) {
    return AI_KNOWLEDGE["vows"];
  }
  if (msg.includes("hotel") || msg.includes("stay") || msg.includes("travel") || msg.includes("transport") || msg.includes("accommodation")) {
    return AI_KNOWLEDGE["accommodation"];
  }
  if (msg.includes("checklist") || msg.includes("plan") || msg.includes("todo") || msg.includes("timeline") || msg.includes("month")) {
    return AI_KNOWLEDGE["6 months"];
  }

  // Default response
  return `Great question! Here are some ways I can help with your wedding planning:

🎯 **I can help with:**
- 📋 **Planning timeline** — "What to do X months before?"
- 💰 **Budget tips** — "How to save on catering/decor?"
- 📸 **Vendor selection** — "Tips for choosing a photographer"
- 👗 **Bridal shopping** — "Lehenga shopping guide"
- 🎵 **Entertainment** — "Sangeet song suggestions"
- 💌 **Invitations** — "Wedding invitation wording"
- 🌸 **Decor themes** — "Trending decor ideas"
- 🍽️ **Catering** — "Menu ideas for 200 guests"
- 💍 **Vows** — "How to write wedding vows"
- 🏨 **Accommodation** — "Guest hotel arrangements"

Try asking me about any of these topics! 💕`;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Hi there! 💕 I'm your **WedCraft AI Wedding Assistant**.

I'm here to help make your wedding planning journey smoother and more enjoyable. Ask me anything about:

- 📋 Planning timelines & checklists
- 💰 Budget tips & cost-saving ideas
- 📸 Vendor selection guides
- 👗 Bridal & groom attire
- 🎵 Entertainment & music
- 💌 Invitation wording
- 🌸 Decor themes & trends
- 🍽️ Menu planning
- 💍 Vows & speeches

**Try one of the suggestions below, or ask anything!** ✨`,
  timestamp: new Date(),
};

export default function AIAssistantPage() {
  const { user, wedding, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const storageKey = `wedcraft_ai_chat_${wedding?.id || 'demo'}`;

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(
            parsed.map((m: { id: string; role: "user" | "assistant"; content: string; timestamp: string }) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages, storageKey]);

  const clearChat = () => {
    if (!confirm("Are you sure you want to clear your chat history?")) return;
    setMessages([
      {
        ...WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date(),
      },
    ]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          context: {
            partner1: wedding?.partner1_name,
            partner2: wedding?.partner2_name,
            weddingDate: wedding?.wedding_date,
            venue: wedding?.venue,
            city: wedding?.city,
            totalBudget: wedding?.total_budget,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API route failed, using built-in knowledge:", err);
    }

    // Fallback to built-in knowledge engine
    setTimeout(() => {
      const response = getAIResponse(text);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Remove emoji prefix for cleaner query
    const text = suggestion.replace(/^[^\s]+ /, "");
    sendMessage(text);
  };

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner size={48} message="Loading AI assistant..." />
      </div>
    );
  }

  const p1 = wedding?.partner1_name || "Partner 1";
  const p2 = wedding?.partner2_name || "Partner 2";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", maxHeight: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "16px", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p className="accent-text" style={{ fontSize: "18px", marginBottom: "4px" }}>
            🤖 Your wedding planning companion
          </p>
          <h1>AI Assistant</h1>
          <p>
            Ask anything about planning {p1} & {p2}&apos;s wedding
          </p>
        </div>
        {messages.length > 1 && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={clearChat}
            style={{ color: "var(--color-error)", fontSize: "13px" }}
            title="Clear Chat History"
          >
            🗑️ Clear Chat ({messages.length - 1})
          </button>
        )}
      </div>

      {/* Chat Messages Area */}
      <div
        className="card"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: 0,
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "14px 18px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)"
                      : "var(--color-surface-elevated, #f5f3f0)",
                  color: msg.role === "user" ? "#FFFFFF" : "var(--color-text)",
                  fontSize: "14px",
                  lineHeight: 1.65,
                  boxShadow: "var(--shadow-sm)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--color-primary-dark)",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🤖</span>
                    WedCraft AI
                  </div>
                )}
                {/* Render markdown-like bold text */}
                {msg.content.split("\n").map((line, i) => {
                  const formatted = line
                    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.+?)\*/g, "<em>$1</em>");
                  return (
                    <div
                      key={i}
                      dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }}
                      style={{ marginBottom: line === "" ? "8px" : "2px" }}
                    />
                  );
                })}
                <div
                  style={{
                    fontSize: "10px",
                    marginTop: "8px",
                    opacity: 0.6,
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start", animation: "fadeIn 0.3s ease-out" }}>
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "18px 18px 18px 4px",
                  background: "var(--color-surface-elevated, #f5f3f0)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }}>🤖</span>
                <div className="typing-indicator">
                  <span className="typing-dot" style={{ animationDelay: "0s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 1 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
            flexShrink: 0,
            animation: "fadeInUp 0.5s ease-out",
          }}
        >
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              className="filter-chip"
              onClick={() => handleSuggestionClick(chip)}
              style={{ fontSize: "13px", padding: "8px 14px" }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "12px",
          flexShrink: 0,
          paddingBottom: "8px",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <input
            ref={inputRef}
            className="form-input"
            placeholder="Ask me anything about your wedding..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            style={{
              borderRadius: "24px",
              padding: "14px 20px",
              fontSize: "15px",
              background: "var(--color-surface)",
              border: "2px solid var(--color-border)",
            }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!inputValue.trim() || isTyping}
          style={{
            borderRadius: "24px",
            width: "52px",
            height: "52px",
            padding: 0,
            fontSize: "1.3rem",
            flexShrink: 0,
          }}
        >
          ✨
        </button>
      </form>
    </div>
  );
}
