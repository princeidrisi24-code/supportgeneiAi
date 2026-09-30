interface ChatPayload {
  message: string;
  context?: {
    partner1?: string;
    partner2?: string;
    weddingDate?: string;
    venue?: string;
    city?: string;
    totalBudget?: number;
  };
}

const KNOWLEDGE_RESPONSES: Record<string, string> = {
  sangeet: `### 🎵 Sangeet Planning Masterclass

**1. Music & DJ Flow:**
- Bride & Groom Entry Track: *“Tum Hi Ho”* (acoustic mashup) or *“Kesariya”*
- Family Dance-off: Mix of 90s classics (*“Bole Chudiyan”*) and modern hits (*“Gallan Goodiyan”*, *“Kala Chashma”*)
- Keep each performance under **4 minutes** to maintain high energy!

**2. Practical Timelines:**
- Book your choreographer **2 months in advance** for 4-5 focused sessions.
- Final soundcheck with the DJ 2 hours before guests arrive.
- Pro Tip: Have a dedicated coordinator managing the music playlist pen drive!`,

  budget: `### 💰 Smart Budget Optimization

**Top 5 Savings Strategies for Indian Weddings:**
1. **Consolidate Venues:** Choosing a resort where Haldi, Mehendi, and Wedding happen in distinct corners saves up to 25% on logistics.
2. **Seasonal Florals:** Use local marigolds, tuberoses, and bougainvillea instead of imported orchids/hydrangeas.
3. **Live Counters over Huge Buffets:** Quality over quantity avoids massive plate wastage and lowers caterer quotes by 15-20%.
4. **Negotiate Off-Peak Times:** A Sunday daytime Mehendi or morning wedding has far lower vendor minimums than prime Saturday nights.
5. **Set aside a 10% Contingency Buffer:** Always budget 10% for last-minute guest additions and tips.`,

  photography: `### 📸 Choosing Your Dream Photographer

**Questions to Ask Before Booking:**
- Will the principal photographer shoot in person, or will an associate team handle it?
- What is the turnaround timeline for the teaser trailer (ideal: 2 weeks) and the full wedding film (ideal: 6-8 weeks)?
- Do they include candid photography + traditional stage photography?
- Always request to see **one full wedding gallery** (not just curated Instagram highlights)!`,

  catering: `### 🍽️ Wedding Catering & Menu Curation

**Recommended Menu Balance for 200–400 Guests:**
- **Appetizers:** 4 Veg + 3 Non-Veg (served hot during cocktail hours)
- **Live Counters:** Chaat station, Wood-fired pizza / Dosa counter, Dim sum bar
- **Mains:** 2 Paneer specialties, 1 Dal Makhani, 2 Seasonal Vegetables, 2 Regional Curries, Fragrant Biryani / Pulao
- **Desserts:** 1 Warm (Gulab Jamun / Jalebi with Rabdi) + 1 Cold (Kulfi / Gelato) + Contemporary pastry table`,

  timeline: `### ⏳ Wedding Week Ceremony Timeline

- **Day 1 Morning (10 AM):** Intimate Mehendi & Puja with close family
- **Day 1 Evening (7 PM):** Sangeet & Cocktail Celebration (performances & DJ)
- **Day 2 Morning (9 AM):** Haldi Ceremony & Chuda (bright sunshine themes)
- **Day 2 Afternoon (3 PM):** Safa tying & Baraat Procession
- **Day 2 Sunset (5 PM):** Sacred Phere & Varmala Exchange by the mandap
- **Day 2 Night (8:30 PM):** Grand Dinner & Reception Toast`,
};

function generateFallbackResponse(msg: string, ctx?: ChatPayload["context"]): string {
  const lower = msg.toLowerCase();
  const couple = ctx?.partner1 && ctx?.partner2 ? `${ctx.partner1} & ${ctx.partner2}` : "you and your partner";

  for (const [key, response] of Object.entries(KNOWLEDGE_RESPONSES)) {
    if (lower.includes(key)) {
      return response;
    }
  }

  if (lower.includes("checklist") || lower.includes("plan") || lower.includes("timeline") || lower.includes("todo")) {
    return KNOWLEDGE_RESPONSES.timeline;
  }
  if (lower.includes("food") || lower.includes("cater") || lower.includes("plate") || lower.includes("menu")) {
    return KNOWLEDGE_RESPONSES.catering;
  }
  if (lower.includes("photo") || lower.includes("camera") || lower.includes("video")) {
    return KNOWLEDGE_RESPONSES.photography;
  }
  if (lower.includes("money") || lower.includes("save") || lower.includes("cost") || lower.includes("expense")) {
    return KNOWLEDGE_RESPONSES.budget;
  }
  if (lower.includes("dance") || lower.includes("song") || lower.includes("dj") || lower.includes("music")) {
    return KNOWLEDGE_RESPONSES.sangeet;
  }

  return `Here are tailored tips for **${couple}'s** special day:\n\n- 🌸 **Key Focus:** Focus on vendor bookings early (venues & photographers fill 6-9 months out).\n- 💡 **Planning Tip:** Keep your guest list updated to lock down accurate catering portions.\n- 📱 **Digital Invites:** Use your custom WedCraft wedding website to gather meal preferences and RSVPs with ease!\n\nAsk me about sangeet songs, catering menus, budget breakdowns, or timeline coordination! ✨`;
}

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "ok" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body: ChatPayload = JSON.parse(event.body || "{}");
    const { message, context } = body;

    if (!message || !message.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Message is required" }),
      };
    }

    const systemPrompt = `You are WedCraft's AI Wedding Co-Pilot, an elite, warm, and sophisticated wedding planning advisor. You specialize in modern weddings, luxury celebrations, and multi-day Indian & global wedding traditions. Provide structured, actionable, and encouraging advice with markdown formatting, emoji accents, and clear checklists.

Wedding Context:
- Couple: ${context?.partner1 || "Partner 1"} & ${context?.partner2 || "Partner 2"}
- Wedding Date: ${context?.weddingDate || "Not set"}
- Venue: ${context?.venue || "Not decided"}, ${context?.city || ""}
- Budget: ₹${context?.totalBudget ? Number(context.totalBudget).toLocaleString("en-IN") : "Not set"}

Keep responses concise, practical, and warm. Use bullet points and bold headers.`;

    // 1. Try OpenAI if key is present
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ reply, provider: "openai" }),
            };
          }
        }
      } catch (err) {
        console.warn("OpenAI API call failed:", err);
      }
    }

    // 2. Try Gemini if key is present
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ reply, provider: "gemini" }),
            };
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed:", err);
      }
    }

    // 3. Fallback: built-in knowledge engine
    const reply = generateFallbackResponse(message, context);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, provider: "wedcraft-ai" }),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process chat";
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: msg }),
    };
  }
};
