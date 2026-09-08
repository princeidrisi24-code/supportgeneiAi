# 🧞‍♂️ SupportGenie AI — Customer Support Ticket Responder

> **5-Day AI-Native Product Sprint Submission**  
> 🌐 **Live Application**: [https://supportgenieai.netlify.app](https://supportgenieai.netlify.app)  
> 🗄️ **Database & Auth**: Powered by **Supabase** (Postgres + Row Level Security)

---

## 📌 Project Overview

**SupportGenie AI** is a near-future, AI-powered customer support assistant built for solo e-commerce founders and small support teams. It automates email ticket classification, urgency detection, entity extraction, and response drafting — reducing average ticket processing time from **15 minutes down to under 2 minutes** (an **88% reduction in handling time**).

---

## ✨ Key Features

- 🔑 **Authentication & Multi-Tenant Support**: Full Signup, Login, and Logout connected to **Supabase Auth**.
- 🏷️ **8-Category Smart Classification**: Categorizes incoming tickets into Shipping, Billing, Return/Refund, Product Questions, Complaints, Technical Issues, Positive Feedback, or Other.
- 🚨 **Priority & Escalation Detection**: Automatically flags tickets as Critical, High, Medium, or Low based on sentiment analysis and urgency triggers.
- 💬 **Sentiment & Entity Extraction**: Identifies customer tone (Angry 😠, Frustrated 😤, Neutral 😐, Positive 😊) and extracts Order IDs, Product Names, and Customer Names.
- ✍️ **Dynamic Response Studio**: Generates customizable response drafts with multi-tone toggles (Professional, Friendly, Empathetic).
- 🛡️ **Human-in-the-Loop Safeguards**: Highlights low-confidence AI predictions (< 70%) with visual warning banners to require human approval.
- 📊 **Real-Time Analytics Dashboard**: Visual graphs and statistics powered by live Supabase query aggregation.

---

## 📂 Deliverables & Submission Documentation

All required assignment deliverables are organized in the [`/docs`](file:///Users/saraitsoltuion/Desktop/Faizan/SupportGenie/docs) directory:

| Deliverable | File / Location | Description |
|---|---|---|
| **Working Prototype** | [`https://supportgenieai.netlify.app`](https://supportgenieai.netlify.app) | Deployed live web application |
| **Portfolio Case Study** | [`docs/CASE_STUDY.md`](file:///Users/saraitsoltuion/Desktop/Faizan/SupportGenie/docs/CASE_STUDY.md) | Full 8-page assignment portfolio case study |
| **Data & Test Matrix** | [`docs/TEST_RESULTS.md`](file:///Users/saraitsoltuion/Desktop/Faizan/SupportGenie/docs/TEST_RESULTS.md) | 15-case evaluation matrix (Normal, Edge, Failure cases) |
| **Demo Video Script** | [`docs/DEMO_VIDEO_SCRIPT.md`](file:///Users/saraitsoltuion/Desktop/Faizan/SupportGenie/docs/DEMO_VIDEO_SCRIPT.md) | Step-by-step 5-minute recording guide |
| **Database Schema** | [`docs/supabase-schema.sql`](file:///Users/saraitsoltuion/Desktop/Faizan/SupportGenie/docs/supabase-schema.sql) | Supabase DDL SQL script |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, Modern CSS3 (Glassmorphism, CSS Variables, Flexbox/Grid), Vanilla JavaScript ES6+.
- **Backend & Database**: Supabase Cloud Database (PostgreSQL) with Row-Level Security policies.
- **Authentication**: Supabase Auth (JWT Session management).
- **AI Classification Engine**: Custom weighted phrase-scoring algorithm, confidence mathematical formula, and dynamic response template generator.
- **Deployment**: Netlify Continuous Integration / Continuous Deployment.

---

## 🚀 Quick Setup & Installation

### Option 1: Live Deployment (Recommended)
Simply visit [https://supportgenieai.netlify.app](https://supportgenieai.netlify.app).

### Option 2: Local Setup
1. Clone or download this repository.
2. Open `index.html` in any web browser or start a simple local server:
   ```bash
   npx serve .
   ```
3. Open `http://localhost:3000` in your browser.

---

## 🗄️ Supabase One-Time Database Setup

If connecting to a new Supabase project:
1. Open your **Supabase Dashboard → SQL Editor → New query**.
2. Copy and paste the contents of [`docs/supabase-schema.sql`](file:///Users/saraitsoltuion/Desktop/Faizan/SupportGenie/docs/supabase-schema.sql).
3. Click **Run**.
