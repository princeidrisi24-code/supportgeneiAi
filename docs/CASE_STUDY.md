# Support Genei AI — Case Study

**Customer Support Ticket Responder for Small E-Commerce Teams**

Live Prototype: [https://supportgenieai.netlify.app](https://supportgenieai.netlify.app)  
Source Code: [https://github.com/princeidrisi24-code/supportgeneiAi](https://github.com/princeidrisi24-code/supportgeneiAi)

---

## Section 1: Problem & User

### Who has this problem?

I focused on **solo e-commerce founders and tiny support teams** — people running independent Shopify or WooCommerce stores doing roughly $10k to $50k in monthly revenue. They usually have 1 to 3 people handling everything: marketing, inventory, packing orders, and customer support.

The specific person I kept in mind while building this was someone like a small clothing brand owner. She runs her store mostly alone. Every evening, after her regular work is done, she opens her inbox and finds 25 to 40 customer emails waiting. Most of them are the same handful of questions over and over:

- "Where is my order? It's been 2 weeks."
- "I got a Medium but I ordered a Large. How do I return this?"
- "I see two charges of $49.99 on my credit card."
- "Do you have this jacket in brown?"

She spends about 2 to 3 hours every night answering these. Not because the answers are hard — most of the time it's copy-pasting the same response with slight changes — but because she has to look up each order, figure out what the customer actually needs, and type it all out carefully.

### Why it matters

The real cost here isn't just time. It's the downstream damage:

- **Slow responses lose customers.** Research from multiple e-commerce surveys consistently shows that customers who don't hear back within a few hours are significantly less likely to order again.
- **Burnout leads to mistakes.** After answering 30 emails, the quality of responses drops. She might miss an angry customer who's about to file a chargeback.
- **She can't afford enterprise tools.** Platforms like Zendesk or Gorgias with AI features cost $300 to $750/month. That's a big chunk of margin for a small store.

### The actual bottleneck

When I broke down the manual workflow, the time per ticket breaks into three parts:

1. **Reading and understanding the email** — 2 to 3 minutes. What does this person want? Are they angry or just asking a question?
2. **Looking up context** — 3 to 5 minutes. Finding the order number, checking shipping status, verifying what they ordered.
3. **Writing and sending the response** — 5 to 7 minutes. Typing out a polite, accurate reply that covers the right policy.

Total: roughly **12 to 15 minutes per ticket**. For 30 tickets a day, that's 6+ hours of support work.

### What I scoped for 5 days

I had to be realistic about what I could build in a week. Here's what I decided to include and exclude:

**Built:**
- Paste-and-analyze ticket workflow (no email integration needed)
- AI classification into 8 categories with confidence scoring
- Sentiment detection (angry, frustrated, neutral, positive)
- Order number and customer name extraction
- Draft response generator with 3 tone options
- Dashboard with basic metrics tracking
- Supabase database for storing processed tickets

**Explicitly excluded:**
- Direct email inbox connection (would need OAuth setup, out of scope)
- Automatic email sending (too risky without human review)
- Shopify API integration for live order lookups
- Multi-user team features

---

## Section 2: Evidence & Baseline

### How I validated the problem

I looked at three types of evidence:

1. **Public datasets.** I reviewed open customer service ticket datasets (like those on Kaggle) and found that roughly 75-80% of tickets in e-commerce fall into just 4 to 5 categories. The distribution is remarkably consistent across different stores.

2. **Forum and community research.** On Reddit (r/ecommerce, r/shopify) and indie hacker communities, the complaint about support being time-consuming comes up constantly. Small sellers frequently ask for affordable alternatives to enterprise helpdesk software.

3. **Direct observation.** I timed myself going through sample support emails to establish a manual baseline. Reading, understanding context, and writing a proper reply consistently took 12 to 15 minutes when done carefully.

### Baseline numbers

| What I measured | Manual process (current) | What I aimed for |
|---|---|---|
| Time per ticket | 12 – 15 minutes | Under 2 minutes |
| First response turnaround | 18 – 24 hours (evening batch) | Under 5 minutes |
| Tickets handled per hour | ~4 | ~30 |
| Cost per ticket (at $20/hr labor) | ~$4.50 | Under $0.50 |

These aren't fancy projections. The manual baseline is what I measured myself, and the target is what I designed the tool to hit.

---

## Section 3: Solution & UX

### How the product works

The core idea is simple: **paste a customer email, get instant analysis and a ready-to-send draft**. The merchant stays in control the whole time — the AI does the tedious reading and drafting work, and the human makes the final call.

The flow has three steps:

**Step 1 — Input the ticket.**
The merchant opens the "New Ticket" page and either pastes a customer email directly or clicks one of the sample ticket buttons to try it out. There's a character counter and clear input area. Nothing fancy here — the goal was to make it feel as simple as pasting text into a search bar.

**Step 2 — See the analysis.**
Within a second, the screen shows:
- **Category** (like "Shipping & Delivery" or "Return/Refund") with a confidence percentage and a visual bar
- **Sentiment** with an emoji (😠 Angry, 😤 Frustrated, 😐 Neutral, 😊 Positive)
- **Priority level** (Critical, High, Medium, Low) — Critical tickets get a pulsing red badge so they're impossible to miss
- **Extracted details** — if the email mentioned an order number like #4521 or the customer signed their name, those get pulled out and displayed

**Step 3 — Review the draft and save.**
The system generates a complete email response based on the category and extracted info. The merchant can:
- Switch between three tones: Professional, Friendly, or Empathetic (the draft regenerates instantly)
- Edit the text directly in the text area
- Hit "Save & Complete" to log it and move to the next ticket
- Or click "Regenerate" to get a different template

### Where the human stays in the loop

This was a deliberate design choice. Two specific situations trigger warnings:

1. **Low confidence (below 70%).** When the AI isn't sure what category a ticket falls into — maybe the email is vague or touches multiple topics — it shows a yellow warning banner saying "Low AI Confidence — Manual Review Recommended." The draft still generates, but the merchant knows to read more carefully before sending.

2. **Critical escalation keywords.** If the email contains words like "lawsuit," "attorney," "BBB," "chargeback," or "legal action," the system flags it as CRITICAL regardless of the category. The idea is that these emails need personal attention from the owner, not a templated response.

---

## Section 4: AI Logic

### What the AI actually does

I want to be upfront about this: SupportGenie does not call ChatGPT or any external LLM API. I built a **rule-based classification engine** that runs entirely in the browser using JavaScript. Here's why:

- **Speed.** API calls add 1 to 3 seconds of latency. Rule-based scoring runs in under 100ms.
- **Cost.** An LLM API would cost $0.01 to $0.05 per ticket at scale. The local engine costs nothing per ticket.
- **Predictability.** With template-based responses, the output never hallucinates a fake return policy or wrong refund amount.

### How classification works

The engine uses **weighted keyword scoring** across 8 categories: Shipping, Billing, Return/Refund, Product Question, Technical, Complaint, Positive, and Other.

Each category has a dictionary of keywords and phrases with point values. Compound phrases get higher scores than individual words:

- `"charged twice"` → 5 points for Billing
- `"charge"` (alone) → 1 point for Billing
- `"where is my order"` → 5 points for Shipping
- `"ship"` (alone) → 1 point for Shipping

The ticket text gets normalized (lowercased, cleaned up), then scored against all 8 dictionaries. The category with the highest total score wins.

### Confidence scoring

Confidence isn't just the raw score. It's a computed value based on how "sure" the system is:

- Starts at a 75% base
- Gets a boost if the top category clearly beats the runner-up (bigger lead = more confident)
- Gets +5% if an order number or customer name was successfully extracted (concrete details mean clearer tickets)
- Gets a -20% penalty if the top two categories scored nearly the same (ambiguous = less confident)
- Clamped between 10% and 98%

### Sentiment detection

The engine checks for:
- Aggressive language and profanity → Angry
- Frustration words ("disappointed," "frustrated," "waited too long") → Frustrated
- Positive words ("love," "great," "amazing") → Positive
- Otherwise → Neutral

It also factors in ALL-CAPS usage and excessive punctuation (multiple "!!!" or "???").

### Response generation

Drafts come from a template bank — 3 templates per category, per tone (Professional, Friendly, Empathetic). That's 72 total pre-written templates. The system picks one and fills in `{Name}`, `{Order}`, and `{StoreName}` from extracted data.

This template approach was a deliberate trade-off: it gives up the flexibility of a generative LLM in exchange for zero hallucination risk and zero per-ticket cost.

---

## Section 5: Business & Operations

### Customer value

The core value is **time savings**. If a merchant currently spends 14 minutes per ticket and SupportGenie brings that down to 1.5 minutes, that's 12.5 minutes saved per ticket. At 30 tickets per day, that's over 6 hours saved daily.

For a solo founder paying themselves $20/hour equivalent, that's roughly $120/day or $3,600/month in recovered time — time they can spend on product development, marketing, or just not working until midnight.

### What it costs to run

| Component | Monthly cost |
|---|---|
| Supabase (database + auth) | $0 (free tier handles 50k rows) |
| Netlify (hosting) | $0 (free tier) |
| AI processing | $0 (runs locally in browser) |
| **Total infrastructure cost** | **$0/month** |

At scale with a paid Supabase plan (beyond free tier limits), costs would be roughly $25/month for the database. Still negligible compared to the value delivered.

### What still requires manual work

- The merchant still needs to paste tickets in manually (no email sync yet)
- Every draft needs human review before sending (by design, not a limitation)
- CRITICAL tickets need personal handling — the tool flags them but can't resolve legal or chargeback situations
- Template responses don't include real-time order tracking data (would need Shopify API integration)

### Key assumptions

1. Most small merchants handle fewer than 1,000 tickets/month — the free Supabase tier covers this
2. 75-80% of tickets genuinely fall into predictable categories — validated through dataset analysis
3. Merchants prefer reviewing drafts over fully automated responses — confirmed through community research
4. A rule-based engine is "good enough" for v1 — an LLM upgrade is the obvious v2 path

---

## Section 6: Evaluation

### What I tested

I created **15 test scenarios** covering three categories:

**Normal cases (6 tests)** — Standard tickets that a small store would get daily:
- Shipping delay complaint with order number
- Wrong size received, wants return
- Double charge on credit card
- Product availability question
- Can't log into account
- Positive feedback / compliment

All 6 classified correctly with confidence above 85%.

**Edge cases (5 tests)** — Trickier inputs:
- Multi-topic ticket (wrong size AND shipping fee complaint) — classified as Return/Refund with reduced 72% confidence
- Sarcastic complaint ("Oh great, another broken item. Fantastic job") — caught via negative sentiment markers
- Informal/typo-heavy text ("wuz wondering if u restock") — still classified correctly
- Urgent cancellation request — correctly escalated to High priority
- Mixed intent (shipping status + receipt request) — primary intent (shipping) identified

All 5 handled correctly, with lower confidence scores on ambiguous ones (which is the right behavior).

**Failure and guardrail cases (4 tests)** — Designed to break or stress-test:
- Gibberish input ("asdfghjkl 12345") — scored 35% confidence, triggered low-confidence flag ✅
- Legal threat ("filing a lawsuit with my attorney") — triggered CRITICAL priority ✅
- Extremely vague ticket ("the thing didn't do what it was supposed to") — scored 48% confidence, flagged for manual review ✅
- Out-of-policy request (return after 8 months) — flagged as policy exception ✅

### What worked well

- Category accuracy was strong on clear, single-topic tickets (85-95% confidence)
- The confidence scoring genuinely drops on ambiguous inputs, which is exactly what you want — it doesn't pretend to be sure when it isn't
- Escalation triggers caught every legal/chargeback keyword I tested

### What didn't work perfectly

- Multi-topic tickets (e.g., "wrong item AND was overcharged") sometimes classified under the wrong primary category depending on word placement. The score was close, and confidence dropped to flag it, but the primary label wasn't always ideal.
- Very short messages (under 10 words) tended to have low confidence even when the intent was obvious to a human. The keyword engine needs enough text to work with.
- The template responses, while accurate, can feel generic. A customer writing a very specific complaint gets a somewhat boilerplate reply that the merchant would need to personalize.

### Honest assessment

For a rule-based engine built in 5 days, the accuracy is solid. It handles the 80% of tickets that are straightforward really well. The remaining 20% — ambiguous, multi-topic, or very short messages — it correctly identifies as uncertain and flags for human attention. That's the right behavior for a v1.

---

## Section 7: 60-Day Post-Launch Validation Plan

If this were to launch as a real product, here's how I'd validate it over 60 days:

### Phase 1: Weeks 1-2 (Closed alpha with 10 stores)

Recruit 10 small Shopify stores willing to use SupportGenie alongside their existing workflow. They'd process tickets through both their manual process and SupportGenie, letting me compare side by side.

**What I'd measure:**
- How often do merchants edit the draft before sending? (Target: edits needed on less than 20% of text)
- How long does the full paste-review-send flow take? (Target: under 3 minutes)
- Do merchants actually trust the classifications? (Qualitative feedback)

### Phase 2: Weeks 3-4 (Expand to 50 stores)

Open beta to more stores if Phase 1 metrics look promising. Add basic analytics tracking to measure engagement patterns.

**What I'd measure:**
- Daily active usage (do they keep coming back or drop off after day 3?)
- Average response quality rating (ask merchants to rate each draft 1-5)
- Category accuracy on real tickets (compare AI labels vs merchant corrections)

### Phase 3: Weeks 5-8 (Decide whether to continue)

Based on the data, make a clear call:

| Metric | Proceed ✅ | Iterate 🔄 | Stop ❌ |
|---|---|---|---|
| Draft edit rate | Less than 20% of text edited | 20 – 45% edited | Over 50% rewritten |
| Daily return rate | 70%+ merchants come back daily | 40 – 70% return | Under 40% return |
| Merchant satisfaction | Above 4.5 / 5 | Between 4.0 – 4.4 | Below 3.8 |
| Time savings (self-reported) | 50%+ time reduction | 25 – 50% reduction | Under 25% reduction |

**If Proceed:** Start building direct Shopify integration (real-time order lookups) and apply for the Shopify App Store.

**If Iterate:** Focus on improving the classification engine — likely add an LLM fallback for low-confidence tickets, and expand the keyword dictionaries based on real merchant data.

**If Stop:** Pivot away from draft generation entirely. The classification and tagging piece might still be valuable as a standalone ticket routing tool, even if the response drafting isn't good enough.

---

## Section 8: Handoff Notes

### For the product team
- The core user insight is that small merchants don't want full automation — they want a fast first draft they can quickly review. Don't push toward auto-sending emails without explicit merchant opt-in.
- The tone switcher (Professional/Friendly/Empathetic) came from observing that different stores have very different brand voices. This should eventually support custom tone presets.
- The biggest feature request to expect is direct email inbox integration. That's the #1 thing that would reduce friction.

### For engineering
- The codebase is vanilla HTML/CSS/JS with no build step. Everything runs from static files on Netlify.
- `js/ai-engine.js` contains the full classification engine. It's a single class (`SupportGenieAI`) with two main methods: `analyze(text)` and `generateDraft(analysis, storeName, tone)`.
- `js/db.js` handles Supabase operations with a localStorage fallback. If the Supabase credentials aren't set, the app still works fully offline.
- `js/auth.js` manages authentication. Currently uses localStorage-based sessions; Supabase Auth is wired in but can fall back gracefully.
- The theme system (`js/theme.js`) supports light and dark modes. All colors use CSS custom properties.

### For data and operations
- The keyword dictionaries in `ai-engine.js` should be updated quarterly based on real ticket data. New product names, shipping carriers, and slang will naturally emerge.
- Tickets flagged with confidence below 70% should be manually reviewed weekly to identify patterns the engine misses — these are the best training signals for improving accuracy.
- The Supabase `tickets` table stores all processed tickets with their classifications, confidence scores, and response drafts. This data is the foundation for future ML model training.

---

## AI Tool-Use Disclosure

**Tools used:** Antigravity AI coding assistant (Gemini-based) for development support.

**What I used it for:**
- Scaffolding the initial HTML page layouts and CSS styling
- Generating the keyword dictionaries for the classification engine
- Helping structure the test case scenarios
- Drafting documentation (which I then edited and rewrote)

**What I did myself:**
- All product decisions (what to build, what to exclude, how the UX should flow)
- The classification logic design (weighted scoring, confidence formula, escalation rules)
- Business model and pricing decisions
- Testing and validation (ran all 15 test cases manually in the browser)
- Final review and editing of all code and documentation

**Limitations of AI assistance:**
- The AI helped speed up repetitive coding but sometimes generated overly complex CSS that needed simplification
- Template responses needed manual editing to sound natural rather than corporate
- The AI couldn't validate user experience decisions — I had to test the actual flow myself

---

## Prior Work Disclosure

Everything in this project was created from scratch during the 5-day sprint. No starter templates, UI kits, or pre-built components were used. The glassmorphism design system, JavaScript AI engine, Supabase integration, all 15 test scenarios, and this case study were all developed as part of this assignment.
