<div align="center">

<br/>

# 🤝 Saathi
### *Be the reason someone chooses their health today.*

<br/>

> **India's healthcare problem isn't about hospitals. It's about the ten seconds before someone decides to pick up the phone.**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-saathi--beta.vercel.app-6366f1?style=for-the-badge)](https://saathi-beta.vercel.app/)
[![DesignVerse 2026](https://img.shields.io/badge/🏆%20DesignVerse-2026%20Submission-f59e0b?style=for-the-badge)](https://saathi-beta.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.3-0055ff?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

<br/>

</div>

---

## ✦ The Problem, In One Line

Every health app assumes the user has already decided to act — and just needs a *form.*

Nobody is building for **the moment of hesitation itself.**

Fear of diagnosis, social stigma, masculinity norms, cost anxiety, time pressure, and plain denial all do their damage *before* a person ever reaches a hospital. Saathi was built for that gap.

---

## ✦ What We Built

A single-page companion that walks someone from *"I can't bring myself to go"* to *"I know my next step"* — in under five minutes.

```
Name it  →  Talk it through  →  Know where to go  →  Take one tiny step
```

### Step 1 — Name It 🏷️
A barrier picker surfaces six root causes: **Fear of Diagnosis, Social Stigma, Masculinity Norms, Cost Concerns, Lack of Time, Denial & Uncertainty.** Select one or more, and a personalised pathway appears instantly. No login. Nothing saved. Nothing sent anywhere.

### Step 2 — Talk It Through 💬
**Saathi** — a built-in conversational companion — classifies what you type across 8 emotional categories (fear, stigma, masculinity, cost, time, denial, general distress, crisis) and responds with warm validation plus *one small, concrete next step.* Never a diagnosis.

> Crisis detection is a hard-coded, non-negotiable safety behaviour — not a soft instruction. If anyone types language suggesting self-harm, Saathi immediately surfaces Tele-MANAS and KIRAN, bypassing all other logic.

### Step 3 — Know Where to Go 📞
A directory of verified Indian government helplines, tap-to-call on mobile:

| Helpline | Number | Purpose |
|---|---|---|
| Tele-MANAS | `14416` | 24/7 mental health, 20+ languages |
| KIRAN | `1800-599-0019` | Mental health rehab, anonymous |
| PM-JAY / Ayushman Bharat | `14555` | Free treatment eligibility |
| National Health Line | `104` | Medical advice over the phone |
| Ambulance | `108` | Emergency |

### Step 4 — Take One Tiny Step ✅
A lightweight micro-commitment checklist — *"saved a number," "told one person," "set a 48-hour rule"* — turns abstract awareness into a gamified, trackable action in the same session.

---

## ✦ Why It Works

The whole product is engineered around **micro-commitments**, not big leaps. Asking someone to "go to a hospital" is exactly what causes the freeze. Asking them to save one number doesn't.

The scroll-linked **"sunrise" gradient** down the page is the visual signature: colour temperature literally warms from indigo dusk to marigold dawn as the user moves from naming the problem to taking action — mirroring the emotional arc the product is designed around.

---

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.3 |
| Build Tool | Vite 5.4 |
| Animations | Framer Motion 11.3 |
| Fonts | Fraunces · Karla · IBM Plex Mono |
| Deployment | Vercel |

> Fonts were chosen deliberately — editorial and human rather than sterile and clinical.

---

## ✦ Getting Started

```bash
git clone https://github.com/RishiRaj1495/saathi.git
cd saathi
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`. No API keys. No environment variables. No external services required.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

---

## ✦ Project Structure

```
saathi/
│
├── index.html          # Entry point — Fraunces, Karla, IBM Plex Mono fonts
├── vite.config.js      # Vite + React plugin config
├── package.json        # React 18, Framer Motion, Vite
│
└── src/
    └── main.jsx        # React app entry — all four steps live here
```

---

## ✦ The Roadmap

If Saathi became a real product, the next steps would be:

- **Swap rule-based chat → LLM** (e.g. Claude API) with the *same* safety guardrails hard-coded, not left to the model
- **eSanjeevani integration** — real teleconsult booking directly from Step 3
- **Regional language support** — the copy is short enough to translate cleanly into Hindi, Tamil, Bengali, and more
- **Anonymised aggregate analytics** — so institutions can see which barriers are most common on campus, without ever storing individual conversations

---

## ✦ Team

**Tech Tinkerers** · DesignVerse 2026

<div align="center">
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/RishiRaj1495">
        <img src="https://avatars.githubusercontent.com/RishiRaj1495" width="80px" style="border-radius:50%; border: 2px solid #6366f1;" alt="Rishi Raj"/><br/>
        <sub><b>Rishi Raj</b></sub><br/>
        <sub>24BCE10149</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/swastiksinha1">
        <img src="https://avatars.githubusercontent.com/swastiksinha1" width="80px" style="border-radius:50%; border: 2px solid #6366f1;" alt="Swastik Sinha"/><br/>
        <sub><b>Swastik Sinha</b></sub><br/>
        <sub>24BEY10075</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/AbhilashSingh">
        <img src="https://avatars.githubusercontent.com/u/224326754?v=4" width="80px" style="border-radius:50%; border: 2px solid #6366f1;" alt="Abhilash Singh"/><br/>
        <sub><b>Abhilash Singh</b></sub><br/>
        <sub>24BCE10706</sub>
      </a>
    </td>
  </tr>
</table>
</div>

---

## ✦ Submission Checklist

| Requirement | Status |
|---|---|
| Complete source code | ✅ `src/main.jsx` — fully self-contained React app |
| Project category | ✅ HTML / CSS / JavaScript (React + Vite) |
| Working demo | ✅ [saathi-beta.vercel.app](https://saathi-beta.vercel.app/) — live, no setup needed |
| Team details | ✅ Tech Tinkerers — Rishi Raj, Swastik Sinha, Abhilash Singh |
| Crisis safety behaviour | ✅ Hard-coded crisis detection → helplines, always takes priority |

---

<div align="center">
  <sub>Built with care for the one who almost didn't make the call.</sub>
</div>
