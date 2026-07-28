# Kaizen Growth Story — Working Notes

*Started: July 18, 2026*
*Purpose: raw material for a future piece — could be a LinkedIn post, a longer essay, or a case study. Capture the real arc as it happens, not the cleaned-up version.*

---

## The arc so far (session 1 — July 18, 2026)

**Started as:** "help me find a business idea, I need to make more money."

**What actually happened, in order:**

1. Brainstormed a general list of niche SaaS patterns — no personal grounding yet.
2. Tried Shopify App Store as a distribution channel. Real numbers looked decent on paper (0% take under $1M lifetime revenue, developers averaging $93K/year) — until it became clear the *buyer* I actually have expertise in (large-org bureaucracy, GameStop/Home Depot-style enterprise complexity) doesn't shop in a self-serve app marketplace at all. Killed the plan, not just the vertical.
3. Pivoted to "something like Membership Toolkit" — PTO/PTA/booster club software — because of my wife's real experience as PTO VP/president and booster club treasurer struggling with 990-N filings, 1099s, receipt tracking.
   - Turned out this exact pain is already solved by MoneyMinder, PTA Treasurer, Aplos, even free state-PTA-sponsored filing services.
   - Bigger tell: my wife had *three* resources (Membership Toolkit's ledger, a separate 1099 SaaS, and a friend who works at Membership Toolkit) — and it was the **friend**, not the software, that actually got her unstuck. That reframed the whole thing: it's a tacit-knowledge gap, not a product gap. Content/authority opportunity, not a SaaS.
4. **The real pivot:** admitted the actual driver was "I need a lot more money and I don't see how with kaizen — 3 of us, running on the CEO's personal network."
   - This reframed everything away from "invent a product" toward "reprice/recapture value from expertise I already have."
   - Real market data: AI/security fractional CTO specialists charge $300–500/hr vs $150–300/hr generalist — a 2x premium. GameStop-style agent-credential-scoping work sits exactly in that premium category.
   - Current comp: $215K W-2, VP of Engineering title.
5. Named the contradiction: "VP of Engineering" pay in the market ($250K–450K+ base, scaling toward $400K-900K total comp) tracks *organizational scale* — hiring managers, building an org of 20-500+ engineers — not the title. Kaizen is 3 people. There's no VP-scale scope to be paid for there. Wanting VP-market pay *at kaizen specifically* was structurally incoherent.
6. **The key admission, unprompted:** "I want to own more, but I don't feel like I can without bringing in business" — turned out to be **my own inference**, never actually confirmed with the CEO. Flagged as possibly the single most important finding of the whole session — an assumption driving 90 minutes of business-idea generation that had never been tested.
7. Then the real numbers came out: kaizen does **$1M/year revenue, 90% (~$900K) from GameStop alone**, ~12 months of visibility, no confirmed renewal. Remaining ~$100K/year is occasional change-request maintenance work for one other client. Zero active pipeline. Zero repeatable origination system — pure CEO-network inbound.
8. **Reframe landed:** this was never a "how do I grow personally" question. It's **kaizen has a 90% single-client revenue concentration risk with no second engine being built, and the runway to fix that is now, while GameStop still funds it** — not after the contract ends.
9. **Where it converged:** the GameStop engagement itself is proof-of-work for a specific, premium-priced market specialization (AI agent security / credential scoping for enterprises adopting Claude Code / Copilot without exposing prod). That expertise, currently trapped inside one NDA'd client relationship, is the raw material for:
   - A content/case-study engine (generalized, NDA-safe writeups of the actual architecture)
   - A repositioning of kaizen from "generalist shop that happened to land GameStop" to "the specialist firm for AI-agent security in bureaucratic enterprises"
   - A very different equity conversation with the CEO: not "give me equity because I want ownership" but "we have a concentration risk, I can see the second engine, I want to build it and be compensated for building a real asset, not just billing hours."

---

## Themes worth pulling into the eventual piece

- **The reframe trap:** how easy it is to spend 90 minutes hunting for a *product* when the actual constraint is a *relationship* or a *conversation* nobody's had yet.
- **Assumptions masquerading as facts:** "I can't own more without bringing in business" felt like a settled constraint. It wasn't even asked. How much of business strategy is downstream of unexamined inferences like this?
- **Distribution is the real moat, always:** every idea (Shopify app, PTO software) died the same way — not on execution, on distribution. That's a pattern worth naming on its own.
- **Title inflation vs. real scope:** "VP of Engineering" means something completely different at a 3-person firm vs. a 200-person org. Compensation follows scope, not title — a useful, underdiscussed idea.
- **The scariest number was hiding in plain sight:** $1M revenue, 90% one client, no pipeline — a business that looks "fine" on the surface (positive revenue, real client, decent personal salary) but is one contract renewal away from a cliff. Worth writing about how "we're doing fine" and "we have 12 months of runway before a 90% revenue drop" can both be true at once.

---

## Open threads to update as they develop

- [ ] Did I have the direct conversation with the CEO about equity/ownership assumptions?
- [ ] What did he actually say — was "bring in business" ever a real stated rule, or confirmed as inference?
- [ ] Reaction to the concentration-risk framing / second-engine proposal?
- [ ] First piece of content published (the Claude Code / credential-scoping writeup)? Reaction/traction?
- [ ] Any inbound interest generated from content, independent of kaizen?
- [ ] Status of GameStop renewal conversation, if any signal emerges.
- [ ] Revisit: is this still "grow kaizen" or does new information point back toward Path A (leave, real VP role at scale)?

---

*Add dated entries below as things happen.*

### [2026-07-25] — Remote Agent Strategy

Friday I was able to run an instance of Claude on a VM and interact with it via VS Code Remote-ssh extension.

Then I deployed a Claude Code instance in a kubernetes cluster.

Today, I got interacting with the Claude Code instance on the pod via VS Code + Remote - SSH + Claude Code extension in VS Code running on my machine.
