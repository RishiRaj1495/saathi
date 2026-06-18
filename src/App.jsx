import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { barriers, quickPrompts, RESPONSES, classify, resourceGroups, voices, tasks } from './data.js'

/* ─── tiny helpers ─────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1]

function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease, delay }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

function Eyebrow({ children, color = 'var(--marigold-2)' }) {
  return (
    <p style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 12,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color,
      marginBottom: 12,
      opacity: 0.9,
    }}>
      {children}
    </p>
  )
}

/* ─── INTRO CURTAIN ────────────────────────────────── */
function IntroCurtain({ onDone }) {
  const words = ['THE', 'REAL', 'BARRIER', "ISN'T", 'THE', 'SYSTEM.']
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.9, ease } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#0A0C13',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: 32,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 14px', maxWidth: 700, marginBottom: 24 }}>
        {words.map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.13, duration: 0.7, ease }}
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 650,
              fontSize: 'clamp(36px, 7vw, 80px)',
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            {w}
          </motion.span>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{ fontFamily: "'Karla', sans-serif", fontSize: 18, color: 'var(--marigold-2)', letterSpacing: '0.08em' }}
      >
        IT'S WHAT STOPS PEOPLE FROM USING IT.
      </motion.p>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.0, duration: 0.5, ease }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={onDone}
        style={{
          marginTop: 40,
          padding: '14px 34px',
          borderRadius: 100,
          border: 'none',
          background: 'var(--marigold)',
          color: '#1B1306',
          fontFamily: "'Karla', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          letterSpacing: '0.04em',
        }}
      >
        Enter Saathi →
      </motion.button>
    </motion.div>
  )
}

/* ─── NOISE OVERLAY ────────────────────────────────── */
function Noise() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      opacity: 0.028,
      pointerEvents: 'none',
    }} />
  )
}

/* ─── NAV ──────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  const links = [
    { label: 'Your barrier', href: '#barriers' },
    { label: 'Talk to Saathi', href: '#chat' },
    { label: 'Resources', href: '#resources' },
    { label: 'Stories', href: '#voices' },
  ]
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.7, ease }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: scrolled ? 'rgba(17,20,31,0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--marigold)' }}
        />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 650, fontSize: 20, color: 'var(--paper)' }}>Saathi</span>
      </div>
      <div style={{ display: 'flex', gap: 28 }}>
        {links.map(l => (
          <motion.a
            key={l.href}
            href={l.href}
            whileHover={{ color: 'var(--marigold-2)' }}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--soft)', textDecoration: 'none', opacity: 0.85 }}
          >
            {l.label}
          </motion.a>
        ))}
      </div>
    </motion.nav>
  )
}

/* ─── FLOATING ORB ─────────────────────────────────── */
function FloatingOrb() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['75%', '10%'])
  const bg = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ['#2C3454', '#8C3A2A', '#E8A33D']
  )
  const boxShadow = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      '0 0 60px 20px rgba(44,52,84,0.5)',
      '0 0 70px 24px rgba(140,58,42,0.45)',
      '0 0 90px 30px rgba(232,163,61,0.5)',
    ]
  )
  return (
    <motion.div
      style={{
        position: 'fixed', right: 32, y,
        width: 52, height: 52, borderRadius: '50%',
        background: bg, boxShadow,
        zIndex: 50, pointerEvents: 'none',
      }}
    />
  )
}

/* ─── HERO ─────────────────────────────────────────── */
function Hero() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.3], [0, 80])
  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  }
  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
  }

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      background: 'radial-gradient(ellipse 1000px 700px at 75% 15%, rgba(91,63,84,0.4), transparent 60%), var(--dusk)',
      padding: '140px 32px 100px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* grid dot bg */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
        backgroundSize: '28px 28px', opacity: 0.5,
      }} />
      {/* radial glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,63,84,0.35) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <motion.div style={{ y, opacity, position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,0.9fr)', gap: 60, alignItems: 'end' }}>
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Eyebrow>DesignVerse 2026 · Team Tech Tinkerers</Eyebrow>
            </motion.div>
            <motion.h1 variants={item} style={{
              fontSize: 'clamp(36px,5.5vw,62px)',
              lineHeight: 1.07,
              color: 'var(--paper)',
              marginBottom: 22,
            }}>
              Most people don't need to be convinced they're sick.{' '}
              <em style={{ color: 'var(--marigold-2)', fontStyle: 'italic' }}>They need to be convinced it's safe to find out.</em>
            </motion.h1>
            <motion.p variants={item} style={{ fontSize: 17, color: 'var(--soft)', maxWidth: 480, marginBottom: 36 }}>
              Saathi is a companion for the moment before someone decides to seek healthcare — when fear, shame, cost, or "it's probably nothing" are doing more talking than the symptom itself.
            </motion.p>
            <motion.div variants={item} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
              {[
                { label: "Find what's holding you back ↓", href: "#barriers", primary: true },
                { label: 'Talk to Saathi', href: '#chat', primary: false },
              ].map(b => (
                <motion.a
                  key={b.href}
                  href={b.href}
                  whileHover={{ scale: 1.03, boxShadow: b.primary ? '0 8px 28px rgba(232,163,61,0.38)' : 'none' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 26px', borderRadius: 100,
                    background: b.primary ? 'var(--marigold)' : 'transparent',
                    border: b.primary ? 'none' : '1.5px solid var(--line)',
                    color: b.primary ? '#1B1306' : 'var(--soft)',
                    fontWeight: 700, fontSize: 15, textDecoration: 'none',
                    fontFamily: "'Karla', sans-serif",
                  }}
                >
                  {b.label}
                </motion.a>
              ))}
            </motion.div>
            <motion.div variants={item} style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['No login required', 'Nothing stored', 'Built for India'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.65 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease }}
            style={{
              background: 'rgba(246,239,228,0.055)',
              border: '1px solid var(--line)',
              borderRadius: 20,
              padding: 28,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Eyebrow>The real problem statement</Eyebrow>
            <p style={{ fontSize: 15, color: 'var(--soft)', marginBottom: 16 }}>
              India has hospitals, clinics, and telemedicine within reach of most people. The gap isn't access. It's the seconds before someone picks up the phone.
            </p>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 18, color: 'var(--paper)', lineHeight: 1.45 }}>
              "It's probably nothing." That sentence delays more diagnoses than distance ever has.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', opacity: 0.4, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace' " }}
      >
        ↓ scroll
      </motion.div>
    </section>
  )
}

/* ─── STATS BAND ───────────────────────────────────── */
function StatsBand() {
  const stats = [
    { n: '70%', label: 'of KIRAN callers are men — yet men rarely admit needing help' },
    { n: '50cr+', label: 'families covered free under Ayushman Bharat PM-JAY' },
    { n: '6', label: 'emotional barriers stop people before cost or distance does' },
    { n: '48hr', label: 'rule — all it takes to break the "probably nothing" freeze' },
  ]
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <div ref={ref} style={{
      background: 'var(--plum)',
      borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      padding: '56px 32px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.7, ease }}
          >
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 650, color: 'var(--marigold-2)', lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 14, color: 'var(--soft)', marginTop: 10, lineHeight: 1.5, opacity: 0.8 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─── BARRIERS ─────────────────────────────────────── */
function BarrierPicker() {
  const [selected, setSelected] = useState(new Set())
  const toggle = (id) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }
  const active = barriers.filter(b => selected.has(b.id))

  return (
    <section id="barriers" style={{
      background: 'linear-gradient(180deg, var(--plum) 0%, #1E1530 100%)',
      padding: '110px 32px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeUp>
          <Eyebrow>Step 1 · Name it</Eyebrow>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', color: 'var(--paper)', marginBottom: 14 }}>What's really stopping you?</h2>
          <p style={{ fontSize: 16, color: 'var(--soft)', maxWidth: 540, marginBottom: 42 }}>
            Pick whatever is true right now. Nothing here is saved or sent anywhere.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
            {barriers.map((b, i) => (
              <motion.button
                key={b.id}
                onClick={() => toggle(b.id)}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i, duration: 0.45, ease }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '12px 22px', borderRadius: 100, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: selected.has(b.id) ? 'var(--marigold)' : 'var(--line)',
                  background: selected.has(b.id) ? 'var(--marigold)' : 'rgba(255,255,255,0.04)',
                  color: selected.has(b.id) ? '#1B1306' : 'var(--soft)',
                  fontFamily: "'Karla', sans-serif",
                  fontWeight: 700, fontSize: 14.5,
                  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                }}
              >
                {b.label}
              </motion.button>
            ))}
          </div>
          <p style={{ fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.5, marginBottom: 48 }}>↑ tap as many as apply</p>
        </FadeUp>

        <AnimatePresence mode="wait">
          {active.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                border: '1.5px dashed var(--line)', borderRadius: 16,
                padding: 36, textAlign: 'center', fontSize: 15, color: 'var(--soft)',
              }}
            >
              Pick at least one above — your personal pathway will appear here.
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}
            >
              {active.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ delay: i * 0.07, duration: 0.45, ease }}
                  style={{
                    background: 'var(--paper)', borderRadius: 18,
                    padding: 26, color: '#2B2419',
                  }}
                >
                  <h3 style={{ fontSize: 17, marginBottom: 10, color: '#2B2419', lineHeight: 1.3 }}>{b.title}</h3>
                  <p style={{ fontSize: 14, marginBottom: 16, color: '#43392A', lineHeight: 1.55 }}>{b.ack}</p>
                  <div style={{ background: 'rgba(168,83,57,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, fontWeight: 700, color: '#8C4128', marginBottom: 10 }}>{b.step}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#6E6248' }}>{b.res}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ─── CHAT ─────────────────────────────────────────── */
function BotMessage({ text }) {
  const isCrisis = text.startsWith('I hear how heavy')
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <motion.div
      initial={{ opacity: 0, x: -14, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, ease }}
      style={{
        maxWidth: '82%', alignSelf: 'flex-start',
        background: isCrisis ? '#FDEDE7' : '#fff',
        border: `1px solid ${isCrisis ? '#E3A98C' : '#E8DCC4'}`,
        borderBottomLeftRadius: 4, borderRadius: 14,
        padding: '12px 15px', fontSize: 14.5, color: isCrisis ? '#7A2E12' : '#2B2419',
        lineHeight: 1.55,
      }}
    >
      {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}
    </motion.div>
  )
}

function UserMessage({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 14, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.35, ease }}
      style={{
        maxWidth: '82%', alignSelf: 'flex-end',
        background: '#2B2419', color: 'var(--paper)',
        borderRadius: 14, borderBottomRightRadius: 4,
        padding: '12px 15px', fontSize: 14.5, lineHeight: 1.55,
      }}
    >
      {text}
    </motion.div>
  )
}

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', gap: 5, padding: '14px 16px', alignSelf: 'flex-start' }}
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ delay: i * 0.15, repeat: Infinity, duration: 1 }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#bbb', display: 'inline-block' }}
        />
      ))}
    </motion.div>
  )
}

function Chat() {
  const [msgs, setMsgs] = useState([{ from: 'bot', text: "Hi — I'm Saathi. You don't need to introduce a symptom or a diagnosis. Just tell me what's making this hard to act on, in your own words." }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [fbIdx, setFbIdx] = useState(0)
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [msgs, typing])

  const send = useCallback((text) => {
    const val = text || input.trim()
    if (!val) return
    setInput('')
    setMsgs(prev => [...prev, { from: 'user', text: val }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const cat = classify(val)
      const arr = RESPONSES[cat] || RESPONSES.fallback
      let reply
      if (cat === 'fallback') {
        reply = RESPONSES.fallback[fbIdx % RESPONSES.fallback.length]
        setFbIdx(p => p + 1)
      } else {
        reply = arr[Math.floor(Math.random() * arr.length)]
      }
      setMsgs(prev => [...prev, { from: 'bot', text: reply }])
    }, 800 + Math.random() * 500)
  }, [input, fbIdx])

  return (
    <section id="chat" style={{
      background: 'linear-gradient(180deg, #1E1530 0%, #2C1E1A 100%)',
      padding: '110px 32px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.25fr)', gap: 52, alignItems: 'start' }}>
        <FadeUp>
          <Eyebrow>Step 2 · Talk it through</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,3.8vw,40px)', color: 'var(--paper)', marginBottom: 16 }}>Saathi listens before it nudges</h2>
          <p style={{ fontSize: 15.5, color: 'var(--soft)', marginBottom: 26, lineHeight: 1.65 }}>
            Type the thing you haven't said out loud yet. Saathi won't diagnose you — it'll help you find the smallest honest next step.
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)',
            borderRadius: 14, padding: '16px 18px', fontSize: 13.5, lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--marigold-2)', display: 'block', marginBottom: 6 }}>What Saathi is — and isn't.</strong>
            It's an emotional first step, not a doctor. For anything urgent, call <strong>108</strong> (ambulance) or <strong>104</strong> (health helpline) directly.
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            style={{
              background: 'var(--paper)', borderRadius: 22, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', height: 520,
              boxShadow: '0 32px 72px rgba(0,0,0,0.4)',
            }}
          >
            {/* head */}
            <div style={{ padding: '16px 20px', background: '#2B2419', display: 'flex', alignItems: 'center', gap: 10 }}>
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }}
              />
              <span style={{ fontFamily: "'Karla', sans-serif", fontWeight: 700, fontSize: 14.5, color: 'var(--paper)' }}>Saathi · always anonymous</span>
            </div>

            {/* log */}
            <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--paper)' }}>
              {msgs.map((m, i) => m.from === 'bot'
                ? <BotMessage key={i} text={m.text} />
                : <UserMessage key={i} text={m.text} />
              )}
              <AnimatePresence>{typing && <TypingDots key="typing" />}</AnimatePresence>
            </div>

            {/* quick chips */}
            <div style={{ display: 'flex', gap: 8, padding: '0 14px 12px', flexWrap: 'wrap', background: 'var(--paper)' }}>
              {quickPrompts.map(q => (
                <motion.button
                  key={q}
                  whileHover={{ scale: 1.03, borderColor: '#C9B98F' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(q)}
                  style={{
                    fontSize: 12, padding: '7px 12px', borderRadius: 100,
                    border: '1px solid #E8DCC4', background: '#fff', color: '#6E6248',
                    fontFamily: "'Karla', sans-serif", cursor: 'pointer',
                  }}
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* input */}
            <div style={{ display: 'flex', borderTop: '1px solid #E8DCC4' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type what's on your mind…"
                style={{
                  flex: 1, border: 'none', padding: '16px 18px',
                  fontFamily: "'Karla', sans-serif", fontSize: 14.5,
                  outline: 'none', color: '#2B2419', background: 'transparent',
                }}
              />
              <motion.button
                whileHover={{ background: '#1B160F' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => send()}
                style={{
                  border: 'none', background: '#2B2419', color: 'var(--paper)',
                  padding: '0 22px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Karla', sans-serif", fontSize: 14,
                }}
              >
                Send
              </motion.button>
            </div>
          </motion.div>
        </FadeUp>
      </div>
    </section>
  )
}

/* ─── RESOURCES ────────────────────────────────────── */
function Resources() {
  return (
    <section id="resources" style={{
      background: 'linear-gradient(180deg, #2C1E1A 0%, #6B2A1A 100%)',
      padding: '110px 32px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeUp>
          <Eyebrow>Step 3 · Know where to go</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', color: 'var(--paper)', marginBottom: 14 }}>Real, free, government helplines</h2>
          <p style={{ fontSize: 16, color: 'var(--soft)', maxWidth: 540, marginBottom: 50 }}>Every number below is a verified national helpline. Save one before you close this tab.</p>
        </FadeUp>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {resourceGroups.map((g, gi) => (
            <FadeUp key={gi} delay={gi * 0.1}>
              <div style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid var(--line)',
                borderRadius: 18, padding: 24, height: '100%',
              }}>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--marigold-2)', marginBottom: 18 }}>{g.cat}</p>
                {g.rows.map((r, ri) => (
                  <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: ri > 0 ? '1px solid var(--line)' : 'none', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--paper)' }}>{r.name}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--soft)', opacity: 0.8, marginTop: 2 }}>{r.desc}</div>
                    </div>
                    <motion.a
                      href={`tel:${r.tel}`}
                      whileHover={{ color: '#fff', scale: 1.05 }}
                      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: 'var(--marigold-2)', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 500 }}
                    >
                      {r.num}
                    </motion.a>
                  </div>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── VOICES ───────────────────────────────────────── */
function Voices() {
  return (
    <section id="voices" style={{
      background: 'linear-gradient(180deg, #6B2A1A 0%, #C8762A 60%, var(--marigold) 100%)',
      padding: '110px 32px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeUp>
          <Eyebrow color="#6E4A12">Real patterns, composite stories</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', color: '#2B2006', marginBottom: 14 }}>People who waited — and what got them to act</h2>
          <p style={{ fontSize: 15.5, color: '#3F2E0C', maxWidth: 540, marginBottom: 48 }}>Composite stories built from common patterns counsellors report. Names are changed.</p>
        </FadeUp>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {voices.map((v, i) => (
            <FadeUp key={i} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(27,19,6,0.2)' }}
                transition={{ duration: 0.25 }}
                style={{
                  background: 'rgba(27,19,6,0.16)', border: '1px solid rgba(27,19,6,0.18)',
                  borderRadius: 18, padding: 26, height: '100%',
                }}
              >
                <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 17, color: '#2B2006', lineHeight: 1.5, marginBottom: 18 }}>"{v.quote}"</p>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B4310' }}>{v.tag}</span>
                <div style={{ marginTop: 10, fontWeight: 700, fontSize: 13, color: '#5B4310' }}>{v.name}</div>
                <div style={{ fontSize: 11.5, color: '#6E5722', marginTop: 4 }}>{v.foot}</div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── TRACKER ──────────────────────────────────────── */
function Tracker() {
  const [done, setDone] = useState(new Set())
  const toggle = (i) => setDone(prev => {
    const n = new Set(prev)
    n.has(i) ? n.delete(i) : n.add(i)
    return n
  })
  const pct = (done.size / tasks.length) * 100

  return (
    <section id="tracker" style={{ background: 'var(--marigold)', padding: '110px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 60, alignItems: 'center' }}>
        <FadeUp>
          <Eyebrow color="#6E4A12">Step 4 · Take one tiny step</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', color: '#2B2006', marginBottom: 14 }}>You don't have to solve this today. You have to start it.</h2>
          <p style={{ fontSize: 16, color: '#43320A', lineHeight: 1.65 }}>Tick whatever you've already done. Most people only need three of these to break the freeze.</p>
        </FadeUp>
        <FadeUp delay={0.15}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.map((t, i) => (
              <motion.div
                key={i}
                onClick={() => toggle(i)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: done.has(i) ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(27,19,6,0.15)',
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                }}
              >
                <motion.div
                  animate={{ background: done.has(i) ? '#2B2419' : 'transparent' }}
                  transition={{ duration: 0.2 }}
                  style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid #2B2419', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <AnimatePresence>
                    {done.has(i) && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        style={{ fontSize: 12, color: 'var(--marigold)', fontWeight: 700 }}
                      >✓</motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: '#2B2419', opacity: done.has(i) ? 0.5 : 1, textDecoration: done.has(i) ? 'line-through' : 'none' }}>{t}</span>
              </motion.div>
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            <div style={{ height: 10, borderRadius: 100, background: 'rgba(27,19,6,0.15)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease }}
                style={{ height: '100%', background: '#2B2419', borderRadius: 100 }}
              />
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, marginTop: 8, color: '#43320A' }}>{done.size} / {tasks.length} small steps taken</p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

/* ─── FOOTER ───────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: 'var(--paper)', color: '#2B2419', padding: '90px 32px 44px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeUp>
          <Eyebrow color="#8C5A1E">DesignVerse 2026 · Real Ideas. Real Impact.</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', color: '#2B2419', maxWidth: 680, marginBottom: 28 }}>
            Be the reason someone chooses their health today, not tomorrow.
          </h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 70 }}>
            {[
              { label: 'Start with one barrier', href: '#barriers', dark: true },
              { label: 'Talk to Saathi', href: '#chat', dark: false },
            ].map(b => (
              <motion.a
                key={b.href}
                href={b.href}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '14px 26px', borderRadius: 100, textDecoration: 'none',
                  background: b.dark ? '#2B2419' : 'transparent',
                  border: b.dark ? 'none' : '1.5px solid #2B2419',
                  color: b.dark ? 'var(--paper)' : '#2B2419',
                  fontFamily: "'Karla', sans-serif", fontWeight: 700, fontSize: 15,
                }}
              >
                {b.label}
              </motion.a>
            ))}
          </div>
        </FadeUp>
        <div style={{ borderTop: '1px solid #E0D3B6', paddingTop: 30, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 30, fontSize: 13, color: '#6E6248' }}>
          <div>
            <strong style={{ display: 'block', color: '#2B2419', fontSize: 14, marginBottom: 8 }}>Team Tech Tinkerers</strong>
            {['Rishi Raj — 24BCE10149', 'Swastik Sinha — 24BEY10075', 'Abhilash Singh — 24BCE10706'].map(m => (
              <div key={m} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, marginBottom: 3 }}>{m}</div>
            ))}
          </div>
          <p style={{ maxWidth: 420, fontSize: 12.5, lineHeight: 1.65 }}>
            Saathi identifies emotional and psychological barriers to healthcare-seeking and nudges people toward small, low-pressure actions. It does not diagnose and is not a substitute for professional medical or mental health care. Built in 48 hours for VIT Bhopal DesignVerse 2026.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─── APP ROOT ─────────────────────────────────────── */
export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroCurtain key="intro" onDone={() => setShowIntro(false)} />}
      </AnimatePresence>

      {!showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Noise />
          <Nav />
          <FloatingOrb />
          <main>
            <Hero />
            <StatsBand />
            <BarrierPicker />
            <Chat />
            <Resources />
            <Voices />
            <Tracker />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  )
}
