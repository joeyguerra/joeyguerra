# The Actual Business (Boiled Down)

Ignore the Notion/Typeform noise. The real idea is this:

> A transaction-lifecycle friction reducer for real estate brokers that monetizes trust, repetition, and local knowledge.

**More concretely:**
- Brokers repeatedly:
- Answer the same vendor questions
- Get blindsided by preventable deal-killers
- Lose long-term referral value after closing

**Existing CRMs are:**
- Too heavy
- Too generic
- Built around leads, not transactions

## The wedge

Not competing with Zillow, HubSpot, Follow Up Boss, etc.

We are building:

**Operational infrastructure for the 30–60 day chaos between “offer accepted” and “keys delivered” — plus a tiny memory afterward.**

# The Core Product (Name it Internally)

Internally, think of this as:

**Transaction Friction System for Brokers**

It has three tightly scoped modules that reinforce each other:
1. Risk Surfacing (before listing / early in deal)
2. Trusted Vendor Distribution (during deal)
3. Referral Memory (after deal)

Each module is valuable alone. Together, they form a moat.

## System Design Document

### Goals & Non-Goals

**Goals**
- Reduce broker time spent on repetitive communication
- Surface deal-killing risks early
- Preserve referral value post-close
- Be lighter than a CRM
- Be transaction-centric, not contact-centric

**Non-Goals**
- Lead generation
- Marketing automation
- Full client communication replacement
- Accounting or compliance tooling

## User Roles

| Role | Description |
| --- | --- |
| Broker / Agent | Primary user. Owns deals and vendor lists |
| Client (Buyer/Seller) | Fills checklists, views vendor portal |
| Vendor | Passive participant; may later pay for ad placements |
| Broker Admin (future) | Oversight, analytics |
| | |

# Core Concepts (Data Model)

Events and artifacts, not "records".

**Entities**
```text
Broker
- id
- name
- brokerage
- branding (logo, colors)
```

```text
Transaction
- id
- broker_id
- address
- type (buyer | seller)
- status (draft | active | closed | dead)
- close_date
```

```text
RiskCheckList
- id
- transaction_id
- questions[]
- responses[]
- flagged_risks[]
```

```text
Vendor
- id
- category (inspector, plumber, lender, etc.)
- name
- contacct_info
- featured (boolean)
```

```text
VendorPortal
- id
- broker_id
- transaction_id
- vendors[]
- public_share_url
```

```text
ReferralLedgerEntry
- transaction_id
- close_date
- anniversary_date
- last_contacted_at
```

# Module 1: Deal-Killer Early Warning (The Shield)

## Purpose

Surface known unknowns before emotional and financial momentum sets in.

## Flow
1.	Broker creates a transaction
2.	System generates a checklist (local + generic)
3.	Seller completes it
4.	Any “Yes / Unknown” flags are surfaced immediately

## Key Design Principle

This is not compliance.
It’s forced conversation.

## UI
- One mobile-friendly checklist
- Conditional logic
- Clear “Next Step” notes for broker only

# Module 2: Vendor Recommendation Portal (The Engine)

## Purpose
Replace chaotic texts and PDFs with one trusted link.

## Flow
1.	Broker curates vendors once
2.	For each transaction, system generates a branded portal
3.	Broker shares one link
4.	Client self-serves

## Important Detail
This is white-label:
- Broker branding
- Broker language
- Broker trust

We're infrastructure, not the face.

# Module 3: Post-Close Referral Ledger (The Harvest)

## Purpose

Preserve top-of-mind awareness without becoming spammy.

## Flow
1.	Transaction closes
2.	System schedules:
    - 6-month reminder (optional)
    - Annual anniversary reminder
3.	Reminder includes:
    - Property value estimate
    - Suggested text message copy

This is memory, not marketing.

# Architecture (Practical)

## MVP Stack (Build-first, optimize later)

| Layer | Choice |
| --- | --- |
| Frontend | Simple server-rendered HTML with the juphjacs web framework - static pages for static information and can be updated with event architecture |
| Backend | Node.js |
| Database | ndjson files, JSON files and SQLIte as they make sense |
| Auth | Magic link email |
| Notifications | Email first |
| Hosting | k3ds on my mac mini at first |
| | |

# High-Level Architecture

```text
Browser
    ↓
Web App
    ↓
Transaction Engine
    ├─ Risk Engine
    ├─ Vendor Portal Generator
    └─ Referral Scheduler
    ↓
SQLite/JSON/ndjson files
```

# Monetization (Important)

Three revenue levers:
1.	Broker Subscription
    - $19–49/month
2.	Vendor Placement
    - Featured vendor slots
3.	Brokerage Licenses
    - Bulk agent access
    - Retention & recruiting angle

This becomes a two-sided marketplace only after brokers are locked in.

# Expansion Paths (Later)
- Localized risk packs (RGV, coastal, rural)
- Vendor performance analytics
- Brokerage-level dashboards
- API for MLS / title companies

Only after traction.

# Failure Modes (Dad talk)

Here’s where this dies if you’re not careful:
1.	Overbuilding CRM features
2.	Selling to vendors before brokers
3.	Making it feel generic
4.	Ignoring transaction lifecycle timing
5.	Letting it become “another tool” instead of infrastructure

If brokers don’t say:

> I use this on every deal

We've missed the mark.

# LLM Prompt

```text
You are a senior product architect helping design a transaction-centric SaaS platform for real estate brokers.

The product’s goal is to reduce transaction friction between offer acceptance and closing, while preserving post-close referral value.

Core modules:
1. Deal-killer early warning checklist
2. White-label vendor recommendation portal
3. Post-close referral reminder system

Constraints:
- Must be lighter than a CRM
- Transaction-centric, not lead-centric
- Designed for individual brokers first, brokerages later
- Monetization via broker subscriptions and vendor placement

Your task:
1. Propose improvements to one module without increasing complexity
2. Identify risks or edge cases in real broker workflows
3. Suggest data models or UX flows that reinforce habitual use
4. Avoid CRM-style bloat

Respond with clear sections and practical reasoning.
```

