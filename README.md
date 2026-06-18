# Saathi — DesignVerse 2026 Submission

**Team Tech Tinkerers**
Rishi Raj (24BCE10149) · Swastik Sinha (24BEY10075) · Abhilash Singh (24BCE10706)

Category: HTML / CSS / JavaScript · File: `saathi.html`

---

## How to run it

Double-click `saathi.html`, or open it in any browser. That's the whole setup — no server, no build step, no API key, no internet connection required after the page loads (it only needs network access once, to load two Google Fonts). Everything else, including the chat companion, runs entirely client-side, so the demo can't fail because of wifi on stage.

---

## The problem, restated in one line

India's healthcare access problem isn't really about hospitals or distance anymore — it's about the ten seconds before someone decides to pick up the phone. Fear of diagnosis, social stigma, masculinity norms, cost anxiety, lack of time, and plain denial all do their damage *before* a person ever reaches the system that could help them.

## Our insight

Every existing health app assumes the user has already decided to act, and just needs a *form*. Nobody is building for the moment of hesitation itself. So Saathi doesn't open with a symptom checker — it opens by asking the one honest question nobody else asks: **"What's actually stopping you?"**

## What we built

A single-page web companion with four connected steps, designed to be walked through in under five minutes:

1. **Name it.** A barrier picker — Fear of Diagnosis, Social Stigma, Masculinity Norms, Cost Concerns, Lack of Time, Denial & Uncertainty — generates a personalised "pathway" the moment you select one or more. No login, nothing saved, nothing sent anywhere.
2. **Talk it through.** A built-in conversational companion, Saathi, that classifies what a person types (fear, stigma, masculinity, cost, time, denial, general distress, or crisis language) and responds with validation plus one small, concrete next step — never a diagnosis. It is rule-based and deterministic, not a black box: every response is reviewed copy, not a model improvising. If anyone types language suggesting self-harm or suicidal thoughts, Saathi immediately surfaces real crisis helplines (Tele-MANAS, KIRAN) instead of continuing the small-talk flow — a safety behaviour we treated as non-negotiable, not an afterthought.
3. **Know where to go.** A directory of real, verified Indian government helplines (Tele-MANAS 14416, KIRAN 1800-599-0019, Ayushman Bharat/PM-JAY 14555, National Health Helpline 104, Ambulance 108) — tap-to-call on mobile.
4. **Take one tiny step.** A lightweight checklist ("saved a number," "told one person," "set a 48-hour rule") that turns the abstract advice from steps 1–3 into something gamified and trackable in the same session.

## Why this fits the brief

- **Addresses emotional and psychological barriers directly** — every barrier named in the problem statement (fear, stigma, masculinity, cost, time, denial) gets its own dedicated copy, pathway, and chat-response logic, not generic wellness platitudes.
- **Builds trust, comfort and confidence** — anonymous by design, no account, no data persistence, warm non-clinical language, and a visible "Saathi doesn't diagnose" disclaimer so expectations stay honest.
- **Drives real behaviour change** — the whole product is engineered around *micro-commitments* (a 5-minute check, a 10-minute call, telling one person) rather than asking for the big leap ("go to a hospital") that's exactly what causes the freeze in the first place.
- **Impact areas** — early detection (the 48-hour rule), preventive care and mental wellbeing (Tele-MANAS/KIRAN integration), and community health (the masculinity-norms pathway is built specifically around India's gendered help-seeking gap, where men are dramatically under-represented among helpline callers).

## Tech notes (for the judges' Q&A)

- Single HTML file, vanilla JS, no framework, no dependencies beyond two Google Fonts (Fraunces for display, Karla for body, IBM Plex Mono for data/numbers) — chosen deliberately so the product feels human and editorial rather than like a sterile clinical app.
- The Saathi chat is a keyword-classification engine with multiple response variants per category (so it doesn't feel robotic on repeat use) and a hard-coded crisis-detection path that always takes priority over everything else.
- The scroll-linked "sunrise" element down the right edge of the page is the visual signature: the page's colour temperature literally warms from indigo dusk to marigold dawn as the user moves from "naming the problem" to "taking action" — mirroring the emotional arc the product is designed around.
- **Roadmap if this became a real product:** swap the rule-based classifier for an LLM (e.g. via the Claude API) with the *same* safety guardrails hard-coded rather than left to the model — crisis detection should never be a soft instruction. Add real teleconsult booking (eSanjeevani integration), regional language support (the barriers and chat copy are short enough to translate cleanly), and anonymised aggregate analytics for the host institution to see which barriers are most common on campus, without ever storing individual conversations.

## Submission checklist mapping

| Requirement | Status |
|---|---|
| Complete source code | `saathi.html` — single file, fully self-contained |
| Project category | HTML / CSS / JavaScript |
| Working demo | Open the file directly — every interaction (barrier picker, chat, resources, tracker) works with no setup |
| Team details | Tech Tinkerers — Rishi Raj (24BCE10149), Swastik Sinha (24BEY10075), Abhilash Singh (24BCE10706) |
