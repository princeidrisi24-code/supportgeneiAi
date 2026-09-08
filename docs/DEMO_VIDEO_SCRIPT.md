# SupportGenie AI — 5-Minute Product Demo Video Script

**Target Duration**: 4 to 5 minutes  
**Format**: Screen recording with voiceover (Loom / OBS / QuickTime)  
**Tone**: Clear, practical, conversational (Product Owner perspective)

---

## ⏱️ Video Schedule Overview

```
┌──────────────────┬─────────────────────────────┬────────────────────────────────────┐
│ Time             │ Screen View                 │ What to Say (Script Outline)       │
├──────────────────┼─────────────────────────────┼────────────────────────────────────┤
│ 0:00 - 0:45      │ Homepage                    │ Problem & Pain Point (Sarah's Story)│
│ 0:45 - 1:30      │ Login & Dashboard           │ Supabase Auth & Live Metrics       │
│ 1:30 - 2:45      │ New Ticket Analyzer Studio  │ Real-time classification & draft   │
│ 2:45 - 3:45      │ Edge Case & Low Confidence  │ Safety guardrails & human approval │
│ 3:45 - 5:00      │ Test Results & Business ROI │ Economics & 60-day roadmap         │
└──────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

---

## 🎙️ Word-for-Word Script

### 1. Intro & The Problem (0:00 – 0:45)
*(Start on the homepage: https://supportgenieai.netlify.app)*

> *"Hi everyone! I'm the Product Owner for **SupportGenie AI**, an AI-native customer support assistant built specifically for small e-commerce store owners.*
> 
> *When we spoke to independent merchants running stores doing around $200k to $500k a year, we found one huge pain point: founders and small support teams spend 2 to 3 hours every single evening manually answering repetitive emails about shipping, returns, and duplicate charges.*
> 
> *Each ticket takes 12 to 15 minutes because agents have to manually classify the email, copy order numbers, and type out repetitive replies. SupportGenie changes that by doing the heavy lifting in under 2 minutes per ticket."*

---

### 2. Login & Main Dashboard (0:45 – 1:30)
*(Click **Login**, sign in, and show the Dashboard screen)*

> *"Here is our main dashboard, connected live to our Supabase database.*
> 
> *As soon as an agent logs in, they see real-time metrics: total tickets handled, estimated hours saved, average confidence ratings, and category distribution graphs.*
> 
> *Now let me show you how fast the core ticket workflow actually works."*

---

### 3. Live Ticket Analyzer Studio (1:30 – 2:45)
*(Navigate to **New Ticket**, click the **😤 Angry Shipping** sample button, and click **Analyze Ticket**)*

> *"Let's take a common scenario: a customer named Michael sent an angry email because his order #4521 hasn't arrived after 3 weeks.*
> 
> *When I hit Analyze Ticket, our AI engine runs in less than a second:*
> - *It categorizes the email as **Shipping**.*
> - *It detects **Angry Sentiment** and flags the priority as **High**.*
> - *It automatically extracts Michael's name and his Order ID `#4521`.*
> 
> *Below the analysis, SupportGenie immediately drafts a polite, personalized response addressing Michael by name and referencing his exact order number. An agent can switch the tone between Professional, Friendly, or Empathetic with one click, tweak the message, and hit **Save & Complete** to log it directly into Supabase."*

---

### 4. Edge Cases & Safety Guardrails (2:45 – 3:45)
*(Go back to **New Ticket**, paste a vague message like: "where is my stuff 12345")*

> *"As product managers, we know AI shouldn't act like a black box sending emails without human oversight.*
> 
> *If a customer email is vague or ambiguous, SupportGenie calculates a confidence score below 70% and automatically triggers a yellow warning banner: `⚠️ Low AI Confidence - Manual Review Recommended`. This requires the human agent to inspect the ticket before sending.*
> 
> *Similarly, if an email mentions legal threats like 'lawsuit' or 'attorney', our system immediately escalates the ticket to **CRITICAL** priority."*

---

### 5. Evaluation Results & 60-Day Plan (3:45 – 5:00)
*(Show the **History** page or open `TEST_RESULTS.md`)*

> *"We evaluated SupportGenie across 15 standardized test cases — covering normal happy path tickets, informal slang, and failure scenarios. It achieved a 100% pass rate in either correctly categorizing the email or correctly flagging low-confidence cases for human review.*
> 
> *From a business perspective, SupportGenie drops labor cost per ticket from $3.80 down to $0.35 — saving small merchants over 85% on support operations.*
> 
> *Our 60-day launch plan starts with a 10-store pilot on Shopify, guided by a clear Proceed/Iterate/Stop matrix based on agent edit rates and CSAT scores.*
> 
> *Thanks for watching, and feel free to try out the live app at `supportgenieai.netlify.app`!"*
