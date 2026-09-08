# Support Genei AI — Case Study

**Customer Support Ticket Responder for Small E-Commerce Teams**

Live Prototype: [https://supportgenieai.netlify.app](https://supportgenieai.netlify.app)  
Source Code: [https://github.com/princeidrisi24-code/supportgeneiAi](https://github.com/princeidrisi24-code/supportgeneiAi)

---

## What is Support Genei AI?

Support Genei AI is a web-based tool that helps small e-commerce store owners handle customer support tickets faster. You paste a customer email into the app, and it instantly tells you what the customer wants, how they're feeling, how urgent it is, and gives you a ready-made reply you can edit and send.

That's the short version. The rest of this document explains why I built it, how I built it, what AI tools I used in the process, and what I learned along the way.

---

## The Problem I Picked and Why

### Who actually deals with this?

Small online store owners. People running Shopify or WooCommerce stores with maybe 1 or 2 people doing everything — from uploading product photos to packing boxes to answering customer emails.

These people get 20 to 40 support emails a day. Most emails ask the same things:

- "Where's my package?"
- "I got the wrong size. How do I return it?"
- "You charged me twice."
- "Is this available in blue?"

The answers are almost always the same too. But the store owner still has to read each email, figure out what the customer needs, look up the order details, and type out a polite response. That takes about 12 to 15 minutes per ticket when done properly.

For 30 tickets, that's 6 hours of work every single day just on customer support.

### Why this matters beyond just time

- Slow replies lose customers. If someone doesn't hear back within a few hours, they're less likely to buy from you again.
- After replying to 25 angry emails, you start making mistakes. You might miss a customer who's about to file a chargeback.
- Tools like Zendesk and Gorgias cost $300 to $750 per month with AI features. That's too expensive for a store doing $15k to $30k in revenue.

So the gap is clear: small merchants need something fast, cheap, and simple that doesn't require them to sign up for expensive enterprise software.

---

## The AI Tools and Platforms I Used to Build This

This is the part the assignment asks me to highlight, so let me be specific about every tool and platform involved.

### 1. Antigravity AI (Gemini-based Coding Assistant) — The Main AI Tool

This was the primary AI tool I used throughout the sprint. It's a coding assistant powered by Google's Gemini model. Here's what I actually used it for:

**What it helped with:**
- Generating the initial HTML page structure for all 8 pages (landing, login, signup, dashboard, new ticket, analysis, response, history)
- Writing the CSS design system — the glassmorphism effects, gradient backgrounds, responsive layouts, and the full light/dark theme system
- Building out the keyword dictionaries for the classification engine. I described the categories I wanted, and it generated weighted keyword lists that I then reviewed and adjusted
- Setting up the Supabase database schema with Row Level Security policies
- Creating test case scenarios for the evaluation
- Structuring documentation files

**What it could NOT do (and what I did myself):**
- It couldn't decide what product to build. I picked the problem domain, defined the target user, and chose the scope
- It didn't design the user flow. I decided on the 3-step paste → analyze → draft workflow
- It couldn't test the product. I ran every test case manually in the browser and verified the outputs
- The AI-generated CSS sometimes had color conflicts between light and dark themes — I had to debug those myself
- Template responses needed editing to sound like actual human support replies instead of corporate boilerplate
- All product and business decisions (pricing, what to exclude, how the 60-day plan works) were mine

**My honest take:** The AI assistant probably saved me 15 to 20 hours across the 5 days. Without it, I would not have been able to build 8 HTML pages, a full CSS design system, a 537-line AI engine, database integration, and documentation in one sprint. But it also introduced bugs that took time to fix — especially around theme colors bleeding into each other and layout gaps not being consistent.

### 2. Supabase — Backend Database and Authentication

I used Supabase as the backend. It gives you a free PostgreSQL database with built-in user authentication.

**Why Supabase:**
- Free tier is generous enough for a prototype (50,000 rows, unlimited API calls)
- Has a visual SQL editor — I could paste my schema and run it in 30 seconds
- Built-in Row Level Security means each user only sees their own tickets. I didn't have to write authorization logic from scratch
- JavaScript client library (`@supabase/supabase-js`) works directly in the browser

**What I set up in Supabase:**
- `profiles` table — stores user display name, email, and store name
- `tickets` table — stores every analyzed ticket with category, priority, sentiment, confidence score, draft response, time saved, customer name, and order number
- RLS policies so users can only read, create, and delete their own data
- Indexes on `user_id` and `created_at` for faster queries

**Fallback design:** The app also works without Supabase. If the connection fails or credentials aren't set, everything falls back to localStorage. This was important because I wanted the prototype to work even if someone clones the repo without setting up their own Supabase project.

### 3. Netlify — Deployment and Hosting

I used Netlify to deploy the app. The site is live at `supportgenieai.netlify.app`.

**Why Netlify:**
- Zero configuration needed for static sites. I connected it and it just worked
- Free tier includes custom domains, HTTPS, and CDN distribution
- Auto-deploys whenever I push to the GitHub `main` branch
- No server needed — the entire app runs client-side in the browser

### 4. GitHub — Version Control and Code Repository

The code is hosted at `github.com/princeidrisi24-code/supportgeneiAi`.

**How I used it:**
- Initialized a Git repository locally
- Pushed all project files (19 files total) to the `main` branch
- Connected Netlify to this repo for auto-deployment
- Used SSH authentication (`git@github.com`) for pushing code

### 5. VS Code — Code Editor

Standard code editor. Nothing special here. Used it for manual code edits, debugging, and reviewing AI-generated code before accepting it.

---

## How the Product Actually Works (Step by Step)

### Step 1: Sign Up or Log In

The merchant creates an account with their name, email, password, and store name. Authentication is handled by Supabase Auth (JWT sessions). If Supabase isn't connected, it falls back to localStorage-based auth.

### Step 2: Paste a Customer Email

On the "New Ticket" page, the merchant pastes a raw customer email. They can also click one of 5 pre-loaded sample tickets to test the system:
- Angry Shipping complaint
- Return/Exchange request
- Billing/Double charge
- Product availability question
- Technical/Login issue

### Step 3: Instant AI Analysis

In under 1 second, the engine processes the text and shows:

- **Category**: One of 8 categories (Shipping, Billing, Return/Refund, Product Question, Technical, Complaint, Positive Feedback, Other)
- **Confidence Score**: A percentage showing how sure the system is (with a visual bar)
- **Sentiment**: Customer's emotional state — Angry 😠, Frustrated 😤, Neutral 😐, or Positive 😊
- **Priority**: Critical (pulsing red badge), High, Medium, or Low
- **Extracted Info**: Order number (like #4521), customer name (from email signature), and product name

### Step 4: Review and Edit the Draft Response

The system generates a complete email reply. The merchant can:
- Pick a tone — Professional, Friendly, or Empathetic. The draft regenerates instantly
- Edit the text directly in the textarea
- Click "Regenerate" to get a different template
- Hit "Save & Complete" to log the ticket and move to the next one

### Step 5: Dashboard and History

The dashboard shows total tickets processed, average confidence, total time saved, and a category breakdown chart. The history page shows all past tickets in a filterable table.

---

## What the AI Engine Does Under the Hood

I want to be clear: the AI engine inside the product does **not** call ChatGPT, Claude, or any external API. It's a rule-based classification system written in JavaScript that runs entirely in the browser. Here's why I made that choice:

- **No API cost.** An LLM call costs $0.01 to $0.05 per ticket. At 1,000 tickets/month, that's $10 to $50/month just for the AI layer. My engine costs $0/month.
- **No latency.** API calls take 1 to 3 seconds. My engine processes a ticket in under 100ms.
- **No hallucinations.** Because responses come from pre-written templates, the system never makes up fake return policies, wrong refund amounts, or imaginary tracking numbers.

### Classification Logic

The engine uses **weighted keyword scoring**. Each of the 8 categories has a dictionary of keywords with point values:

| Keyword | Category | Points |
|---|---|---|
| "charged twice" | Billing | 5 |
| "charge" | Billing | 1 |
| "where is my order" | Shipping | 5 |
| "ship" | Shipping | 1 |
| "wrong size" | Return/Refund | 5 |
| "return" | Return/Refund | 2 |
| "can't log in" | Technical | 5 |
| "lawsuit" | Complaint | 5 |

Compound phrases get higher scores because they're more specific. The ticket is scored against all 8 dictionaries, and the category with the highest total wins.

### Confidence Formula

Confidence starts at 75% and adjusts based on:
- **High score lead** → confidence goes up (the top category clearly won)
- **Order number extracted** → +5% (concrete details mean clearer ticket)
- **Short text (under 12 words)** → -15% (not enough signal to be sure)
- **Two categories tied** → -10% (ambiguous intent)
- Final value is clamped between 15% and 98%

### Sentiment Detection

The engine checks for:
- Profanity and aggressive words ("unacceptable," "worst," "horrible") → Angry
- Frustration indicators ("disappointed," "frustrated") → Frustrated
- ALL CAPS words and excessive `!!!` or `???` → increases anger score
- Sarcasm detection ("oh great," "fantastic job," "thanks for nothing")
- Positive words ("love," "great," "amazing") → Positive

### Safety and Edge Case Handling

This is where I spent a lot of time to make sure the product doesn't cause problems:

**PII Detection:** The engine scans for email addresses, phone numbers, credit card patterns, and SSN formats. If found, it flags the ticket for human review so sensitive data isn't accidentally included in a template response.

**Spam and Abuse Filtering:** Keywords like "buy cheap," "casino," "crypto investment" flag potential spam. Profanity flags abusive tickets for careful handling.

**Input Validation:**
- Empty or whitespace-only input → rejected with clear error message
- Text under 10 characters → rejected (too short to analyze)
- Text over 5,000 characters → rejected (too long)
- Repetitive spam characters (like "aaaaaaaaa...") → detected and rejected based on character uniqueness ratio

**Critical Escalation Triggers:** If the ticket contains words like "lawsuit," "attorney," "BBB," "consumer court," "chargeback," "unauthorized," "hacked," or "security breach," the system automatically sets priority to CRITICAL. These tickets need personal human attention, not a template response.

**Low Confidence Fallback:** When confidence drops below 70%, the UI shows a yellow warning banner: "Low AI Confidence — Manual Review Recommended." The draft still generates (so the merchant has something to start with), but they know to read the ticket carefully before sending.

**Multi-Intent Detection:** If two categories score within 3 points of each other, the system marks both (primary and secondary intent) and reduces confidence. For example, "I got the wrong item AND I was overcharged" touches both Return/Refund and Billing.

**False Urgency Handling:** If someone writes "URGENT" but the ticket is just a product question, the system assigns Medium priority instead of High. It doesn't blindly trust urgency keywords without checking the actual content.

---

## How This Reduces Workload and Saves Time

### The math is simple

| Task | Without Support Genei | With Support Genei |
|---|---|---|
| Read and understand the email | 2–3 minutes | 0 minutes (AI does it) |
| Identify category and priority | 1–2 minutes | 0 minutes (instant) |
| Look up order number | 3–5 minutes | 0 minutes (auto-extracted) |
| Write the response | 5–7 minutes | 30 seconds (edit the draft) |
| **Total per ticket** | **12–15 minutes** | **1–2 minutes** |

For a store handling 30 tickets per day:
- **Without the tool:** 6+ hours of support work
- **With the tool:** About 45 minutes to 1 hour

That's roughly 5 hours saved every single day. In a month, that's 150 hours of recovered time.

### Where the time savings come from

1. **No more reading and re-reading.** The AI reads the email and shows you the summary, category, and sentiment in 1 second. You don't have to mentally parse a 3-paragraph angry email.

2. **No more typing from scratch.** Instead of writing "Dear customer, we apologize for the inconvenience..." for the 50th time today, you get a complete draft that already has the customer's name, order number, and correct policy language.

3. **No more missing urgent tickets.** Critical tickets get a pulsing red badge. You see them immediately instead of discovering a chargeback threat buried in your inbox at midnight.

4. **No more context switching.** Order numbers are extracted right there in the analysis. You don't have to tab over to Shopify and search for "#4521" manually.

---

## Market Edge Cases I Considered

### 1. What if the customer writes in slang or with typos?

Tested this. Input like "wuz wondering if u restock size S blue hoodie text me" still classified correctly as Product Question. The keyword engine matches partial words and common patterns even when spelling is off.

### 2. What if one email has multiple issues?

The engine detects secondary intent. "I got the wrong item AND was charged twice" scores both Return/Refund and Billing. The primary category goes to whichever scored higher, and the secondary is flagged. Confidence drops to signal ambiguity.

### 3. What if someone sends gibberish?

Input like "asdfghjkl 12345" gets a 35% confidence score and triggers the low-confidence flag. The system doesn't pretend it understands — it tells you it doesn't.

### 4. What about legal threats?

Keywords like "lawsuit," "attorney," "BBB," or "chargeback" trigger CRITICAL priority regardless of the category. These need personal attention, not an automated template.

### 5. What if the email is sarcastic?

Sarcasm phrases like "oh great, another broken item" or "fantastic job guys" are detected. The sentiment marks it as "Frustrated (Sarcastic)" instead of misreading "great" and "fantastic" as positive.

### 6. What about sensitive customer data in the email?

The PII detector catches email addresses, phone numbers, credit card patterns, and SSN formats. When found, the ticket gets flagged for human review so the agent can handle the data carefully.

### 7. What if someone tries to spam the system?

Spam keywords ("buy cheap," "casino," "click here to win") and abusive language trigger safety flags. Repetitive characters are caught by the uniqueness ratio check.

### 8. What if the store doesn't have Supabase set up?

Everything falls back to localStorage. The product works fully offline — no database required for the core functionality.

### 9. What about mobile users?

The CSS is fully responsive. The layout switches from multi-column to single-column on smaller screens. All buttons and inputs are touch-friendly.

### 10. What if a customer asks about a return outside the return window?

Tested with "Can I exchange my item if I bought it 8 months ago?" — the system flags it as a policy exception at 64% confidence and routes to human review.

---

## The Sprint Process (How I Actually Built This in 5 Days)

### Day 1: Figuring out the problem

I spent most of this day researching. Looked at Reddit threads from small e-commerce owners, browsed Kaggle customer service datasets, and timed myself manually responding to sample support emails. The consistent pattern was clear: most tickets are repetitive, and small sellers can't afford enterprise tools.

I defined my target user, mapped the manual workflow, and set a clear scope for what I would and wouldn't build.

### Day 2: Designing the product and the AI logic

I sketched the 3-step user flow (paste → analyze → draft) and decided on the 8 categories. I designed the weighted keyword scoring system and figured out the confidence formula. I also made the deliberate call to use rule-based AI instead of calling an LLM API — cost, speed, and predictability all favored this approach for a v1.

### Day 3: Building the prototype

This is where Antigravity AI (Gemini) was most useful. I used it to scaffold the HTML pages, generate the CSS design system, and build out the keyword dictionaries. I wrote the core classification logic with its help and set up Supabase for database storage.

I spent a lot of time on the theme system — getting light mode and dark mode to look right without colors bleeding into each other was harder than expected.

### Day 4: Testing and fixing

I created 15 test scenarios across three categories (normal, edge, failure) and ran them all manually. Found and fixed several bugs:
- The analysis page wasn't showing extracted customer names properly (field naming mismatch)
- Multi-topic tickets sometimes showed "Not detected" for fields that were actually extracted
- Some CSS colors in light mode were too close to the background, making text hard to read
- The theme toggle wasn't persisting correctly on page navigation

### Day 5: Documentation and packaging

Wrote this case study, the test results matrix, the demo video script, and the README. Connected the repo to GitHub and deployed on Netlify. Packaged everything into a submission zip.

---

## Business Model (If This Were a Real Product)

### What it costs to run

| Item | Monthly cost |
|---|---|
| Supabase (database + auth) | $0 — free tier |
| Netlify (hosting + CDN) | $0 — free tier |
| AI engine processing | $0 — runs in the browser |
| **Total** | **$0/month** |

At scale (beyond free tier limits), Supabase would cost about $25/month and Netlify about $19/month. Still under $50/month total.

### Potential pricing

- **Free tier**: 50 tickets/month — good enough for brand new stores
- **Pro ($19/month)**: 1,000 tickets/month with cloud storage and custom tones
- **Growth ($49/month)**: Unlimited tickets, multi-store, team access

### Key assumption

The biggest assumption is that 75-80% of real-world tickets fall into predictable categories. The public datasets I reviewed support this, but it would need to be validated with actual merchant data in a pilot.

---

## 60-Day Post-Launch Validation Plan

### Weeks 1-2: Alpha with 10 stores

Give the tool to 10 small Shopify stores. Have them use it alongside their existing workflow. Measure how often they edit drafts before sending (target: under 20% of text edited).

### Weeks 3-4: Beta with 50 stores

If alpha numbers look good, expand. Track daily return rate, draft quality ratings, and category accuracy against merchant corrections.

### Weeks 5-8: Make the call

| Metric | Proceed ✅ | Iterate 🔄 | Stop ❌ |
|---|---|---|---|
| Draft edit rate | Under 20% | 20 – 45% | Over 50% |
| Daily return rate | 70%+ come back | 40 – 70% | Under 40% |
| Merchant satisfaction | Above 4.5/5 | 4.0 – 4.4 | Below 3.8 |
| Time savings | 50%+ reduction | 25 – 50% | Under 25% |

**Proceed** → Build Shopify API integration, apply for App Store listing  
**Iterate** → Add LLM fallback for low-confidence tickets, expand keyword dictionaries  
**Stop** → Pivot to pure ticket tagging/routing tool without draft generation

---

## Tech Stack Summary

| Layer | Tool / Platform | Why I Chose It |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JS (ES6+) | No build step, loads instantly, easy to deploy |
| Design | Glassmorphism CSS with CSS Variables | Modern look, easy light/dark theme switching |
| Backend | Supabase (PostgreSQL + Auth) | Free tier, built-in RLS, JS client library |
| AI Engine | Custom weighted keyword scorer (JS) | Zero cost, sub-100ms speed, no hallucinations |
| Hosting | Netlify | Free, auto-deploys from GitHub, HTTPS included |
| Version Control | GitHub | Standard, connected to Netlify for CI/CD |
| AI Development Tool | Antigravity (Gemini-based assistant) | Scaffolding, code generation, documentation help |
| Code Editor | VS Code | Manual review, debugging, final edits |

---

## Project Structure

```
SupportGenie/
├── index.html              # Landing page
├── login.html              # Login
├── signup.html             # Registration
├── pages/
│   ├── dashboard.html      # Metrics dashboard
│   ├── new-ticket.html     # Ticket input
│   ├── analysis.html       # AI analysis results
│   ├── response.html       # Draft response editor
│   └── history.html        # Ticket history table
├── css/
│   └── styles.css          # Full design system (light + dark themes)
├── js/
│   ├── auth.js             # Authentication (Supabase + localStorage fallback)
│   ├── db.js               # Database CRUD (Supabase + localStorage fallback)
│   ├── ai-engine.js        # Classification engine (537 lines)
│   └── theme.js            # Light/Dark theme manager
└── docs/
    ├── CASE_STUDY.md        # This document
    ├── TEST_RESULTS.md      # 15-case evaluation matrix
    ├── DEMO_VIDEO_SCRIPT.md # Demo recording guide
    └── supabase-schema.sql  # Database setup script
```

---

## AI Tool-Use Disclosure

**Tool used:** Antigravity AI (Gemini 3.6 Flash and Claude Opus 4.6 Thinking)

**What I used it for:**
- HTML page scaffolding and CSS styling
- Keyword dictionary generation for the classification engine
- Test case scenario creation
- Documentation structuring and editing
- Debugging theme color conflicts
- Setting up Supabase schema with RLS policies

**What I did myself:**
- Picked the problem, defined the user, set the scope
- Designed the user flow and product experience
- Made all business decisions (pricing, what to include/exclude)
- Designed the classification logic (weighted scoring, confidence formula, escalation rules)
- Ran all 15 test cases manually and verified outputs
- Fixed bugs the AI introduced (theme bleeding, field naming mismatches, layout gaps)
- Reviewed and edited every piece of code before committing

**Limitations I ran into:**
- AI-generated CSS needed manual fixes for theme consistency
- Template responses sounded too corporate — had to edit them to sound natural
- The AI couldn't test the product or validate UX decisions — that was all manual work

---

## Prior Work Disclosure

Everything in this project — the web app, the design system, the AI classification engine, the Supabase integration, all 15 test cases, and this case study — was built from scratch during the 5-day sprint. No pre-existing templates, UI kits, or starter code were used.
