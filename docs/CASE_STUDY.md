# Product Case Study: SupportGenie AI
**Building an AI Support Assistant for Small E-Commerce Brands**

- **Live Demo**: [https://supportgenieai.netlify.app](https://supportgenieai.netlify.app)
- **Author**: Lead AI Product Owner
- **Sprint Target**: 5-Day AI-Native Product Sprint

---

## 1. Problem & Target User

### The Person We Are Building For
Meet Sarah. She runs an independent online apparel brand doing ~$300k/year in sales. She handles marketing, inventory, and fulfillment herself, but spends 2 to 3 hours every single evening answering customer emails. 

Most of these emails are predictable:
- *"Where is my order?"*
- *"I got the wrong size, how do I return this?"*
- *"Why was I charged twice?"*

She can't afford a full-time support agent yet, but she's constantly overwhelmed. Larger brands use expensive enterprise tools like Gorgias or Zendesk with AI add-ons costing $300+/month. Sarah just needs a fast, simple assistant that reads incoming emails, categorizes them, flags urgent complaints, and drafts clean, polite replies she can approve with one click.

### The Core Bottleneck
Manual support ticket triage takes **12 to 15 minutes per ticket**. Support agents spend most of that time copying order numbers, looking up shipping statuses, and typing out the exact same response templates. This causes response delays of 24–48 hours, frustrating customers and hurting repeat sales.

---

## 2. Evidence & Baseline Metrics

### Why This Problem Exists
When reviewing open customer support datasets and talking to small e-commerce founders, we found a clear pattern:
1. **80% of ticket volume falls into 7 predictable topics**: Shipping status, return/exchange requests, billing/duplicate charges, product questions, account logins, angry complaints, and positive feedback.
2. **First-response speed drives retention**: 68% of online shoppers say quick resolution is the single biggest factor in whether they order from a small store again.

### Operational Baseline vs Product Goal

| Metric | Current Manual Process | SupportGenie Target | Real Impact |
|---|---|---|---|
| **Avg. First Response Time** | 18 to 24 Hours | Under 5 Minutes | 95% faster response |
| **Agent Time per Ticket** | 12 to 15 Minutes | 1.5 to 2 Minutes | 88% labor reduction |
| **Daily Tickets per Person** | ~35 tickets | ~160 tickets | 4.5x productivity boost |
| **Cost per Handled Ticket** | ~$3.80 | ~$0.35 | $3.45 saved per ticket |

---

## 3. Product Experience & UX Design

We designed SupportGenie to feel like a smart co-pilot, not a black-box machine that sends emails without human oversight.

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│ Paste Customer  │ ──► │ Instant AI       │ ──► │ Review & Edit     │
│ Support Ticket  │     │ Classification   │     │ Drafted Reply     │
└─────────────────┘     └──────────────────┘     └───────────────────┘
                                                           │
                                                           ▼
                                                 ┌───────────────────┐
                                                 │ Save to Supabase  │
                                                 │ & Track Metrics   │
                                                 └───────────────────┘
```

### Key User Experience Steps
1. **Quick Input**: The agent pastes a customer email or clicks a sample ticket button.
2. **Instant Intent Extraction**: In under 1 second, SupportGenie:
   - Identifies the primary intent (e.g., *Shipping*, *Return*, *Billing*).
   - Detects customer sentiment (*Angry 😠*, *Frustrated 😤*, *Neutral 😐*, *Positive 😊*).
   - Assigns priority level (*Critical*, *High*, *Medium*, *Low*).
   - Extracts key details like **Order Numbers** (`#4521`) and **Customer Names** (`Michael`).
3. **Editable Draft Studio**: The agent gets a complete response draft. They can instantly toggle the tone (*Professional*, *Friendly*, *Empathetic*), tweak the wording, and hit **Save & Complete**.
4. **Real-Time Dashboard**: Tracks processed tickets, total hours saved, category breakdowns, and system confidence rates over time.

### Human-in-the-Loop & Safety Fallbacks
We built two safety guardrails directly into the workflow:
- **Low Confidence Alert (< 70%)**: If a ticket is vague or contains mixed messages, the system displays a clear warning banner: `⚠️ Low AI Confidence - Manual Review Recommended`. It prevents automatic response sending and requires agent inspection.
- **Critical Escalation**: Keywords like *"lawsuit"*, *"attorney"*, *"BBB"*, or *"chargeback"* trigger a **CRITICAL** priority alert with pulse highlights, urging immediate manager escalation.

---

## 4. How the AI Logic Works Under the Hood

Rather than sending every ticket to an expensive LLM API endpoint (which adds cost and latency), we designed a lightweight, deterministic hybrid classification engine.

### Classification Architecture
1. **Weighted Keyword Scoring**: Instead of simple keyword matching, we score compound phrases. For instance, `"charged twice"` scores 5 points under *Billing*, whereas `"where is my order"` scores 5 points under *Shipping*.
2. **Dynamic Confidence Formula**:
   Confidence starts at a base score of 75% and adjusts based on:
   - **Lead Margin**: How clearly the top category beat the second-place category.
   - **Entity Bonus**: +5% if an order number (`#1234`) or customer name was successfully extracted.
   - **Ambiguity Penalty**: -20% if the top two category scores are nearly identical.
3. **Template-Driven Draft Engine**: Response drafts are generated using verified merchant policy templates merged with extracted variables (`{Customer_Name}`, `{Order_Number}`, `{Store_Name}`). This completely eliminates AI hallucinations around return policy rules or refund timelines.

---

## 5. Business Model & Unit Economics

### Costs to Run SupportGenie (Per 1,000 Tickets)

| Expense Item | Traditional Manual Process | SupportGenie AI | Net Difference |
|---|---|---|---|
| Support Labor ($22/hr) | $4,580 (208 hours) | $550 (25 hours review) | **-$4,030 saved** |
| Infrastructure & Database | $0.00 | $0.00 (Supabase Free Tier) | $0.00 |
| AI API Processing | $0.00 | $2.50 ($0.0025/ticket) | +$2.50 |
| **Total Cost / 1,000 Tickets** | **$4,580.00** | **$552.50** | **-87.9% overall cost reduction** |

### Simple Pricing Tiers
- **Starter (Free)**: Up to 50 tickets/month — great for tiny stores just getting started.
- **Pro ($29/month)**: Up to 1,500 tickets/month with Supabase cloud database sync.
- **Growth ($79/month)**: Unlimited tickets, multi-store support, and custom response templates.

---

## 6. Evaluation & Test Results

We tested SupportGenie against **15 real-world support ticket scenarios** to verify its accuracy and fallback behavior.

- **Normal Happy Path Cases (6/6 Passed)**: Perfectly categorized standard shipping, billing, technical, return, and praise emails.
- **Complex & Edge Cases (5/5 Passed)**: Handled typos, informal slang (*"wuz wondering if u restock"*), and multi-topic questions cleanly.
- **Failure & Guardrail Cases (4/4 Passed)**: Gibberish input (`"asdfghjkl"`) correctly scored 35% confidence and triggered the manual review flag. Legal threats correctly triggered **CRITICAL** priority alerts.

*(For the complete test matrix with line-by-line inputs and outputs, see [`TEST_RESULTS.md`](file:///Users/saraitsoltuion/Desktop/Faizan/SupportGenie/docs/TEST_RESULTS.md).)*

---

## 7. 60-Day Post-Launch Validation Plan

To validate this product with real merchants, we will run a phased pilot:

```
    Weeks 1 - 2                 Weeks 3 - 4                 Weeks 5 - 8
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Alpha Pilot      │ ───►  │ Beta Expansion   │ ───►  │ Shopify App Store│
│ 10 Shopify Stores│       │ 50 Active Stores │       │ Commercial Launch│
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

### Proceed / Iterate / Stop Decision Framework

| Product Metric | Green Light (Proceed) | Yellow Light (Iterate) | Red Light (Stop / Pivot) |
|---|---|---|---|
| **Human Draft Edit Rate** | Agents edit < 20% of text | Agents edit 20% – 45% | Agents rewrite > 50% |
| **First Response Time** | < 10 Minutes | 10 – 30 Minutes | > 60 Minutes |
| **Merchant CSAT Rating** | > 4.5 / 5.0 | 4.0 – 4.4 / 5.0 | < 3.8 / 5.0 |
| **Monthly Churn Rate** | < 5% | 5% – 10% | > 15% |

- **If Green**: Expand into the official Shopify App Store ecosystem.
- **If Yellow**: Re-tune category keywords and connect live Shopify order tracking APIs.
- **If Red**: Pause auto-drafting and pivot to a pure ticket routing and tagging tool.

---

## 8. Technical Architecture & Handoff Notes

### Code Base Layout
```
SupportGenie/
├── index.html           # Marketing Landing Page
├── login.html           # User Login Screen
├── signup.html          # User Registration Screen
├── pages/
│   ├── dashboard.html   # Main Metrics Dashboard
│   ├── new-ticket.html  # Live Ticket Analyzer Studio
│   ├── analysis.html   # Extracted Entity & Intent Insights
│   ├── response.html   # Draft Response Editor
│   └── history.html    # Full Filterable Ticket Table
├── css/
│   └── styles.css       # Custom Glassmorphism CSS Design System
├── js/
│   ├── auth.js         # Supabase Auth Client
│   ├── db.js           # Supabase Database CRUD + LocalStorage Fallback
│   └── ai-engine.js    # Core Categorization & Response Generator Logic
└── docs/
    ├── supabase-schema.sql # Database DDL SQL Script
    ├── TEST_RESULTS.md     # 15-Case Evaluation Matrix
    └── CASE_STUDY.md       # Product Case Study Document
```

### Stack Choices
- **Frontend**: Standard HTML5, custom Vanilla CSS (Glassmorphism design, no heavy framework bloat), and Vanilla JS ES6+. Loads instantly on all devices.
- **Backend & Database**: **Supabase** (Postgres DB with Row Level Security policies).
- **Hosting**: Netlify CI/CD at `supportgenieai.netlify.app`.

---

## 9. AI Tool-Use Disclosure
- **AI Tools Employed**: Antigravity AI Code Assistant (Gemini 3.6 Flash).
- **How They Were Used**: Scaffolding UI layouts, setting up Supabase client scripts, crafting test matrices, and editing documentation.
- **Human Verification**: All code and user flows were manually verified through browser testing and functional validation.

---

## 10. Prior Work Disclosure
This entire project — including the web frontend, styling system, JavaScript AI engine, database queries, test suite, and case study documentation — was created **100% from scratch** during the 5-day product sprint. No third-party templates or starter kits were used.
