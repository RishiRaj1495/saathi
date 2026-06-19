import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  motion, AnimatePresence, useScroll, useTransform,
  useSpring, useInView, useMotionValue, useAnimationFrame
} from 'framer-motion'
import Lenis from 'lenis'
import { barriers, quickPrompts, RESPONSES, classify, resourceGroups, voices, tasks } from './data.js'

const ease = [0.16, 1, 0.3, 1]
const easeOut = [0.0, 0.0, 0.2, 1]

function useIsMobile(bp = 760) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= bp)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`)
    const h = () => setIsMobile(mq.matches)
    h()
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [bp])
  return isMobile
}

function useIsTouch() {
  return useMemo(() => typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches, [])
}

// module-level so any component (nav, buttons, back-to-top) can trigger smooth scroll
const lenisRef = { current: null }
function smoothScrollTo(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  const dest = typeof target === 'number' ? target : el
  if (lenisRef.current) {
    lenisRef.current.scrollTo(dest ?? 0, { offset: -64, duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 3), ...opts })
  } else if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => 1 - Math.pow(1 - t, 3), // snappy easeOutCubic — fixes the "slow" feel
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis
    let raf
    function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // intercept every in-page anchor click so the nav / CTA buttons use
    // Lenis's own smooth scroll instead of fighting the browser's instant jump
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const hash = a.getAttribute('href')
      if (!hash || hash === '#') return
      const el = document.querySelector(hash)
      if (!el) return
      e.preventDefault()
      smoothScrollTo(el)
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])
}

/* ══════════════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════════════ */
function Cursor() {
  const isTouch = useIsTouch()
  const mx = useMotionValue(-100)
  const my = useMotionValue(-100)
  // ring trails slightly for a soft cinematic feel; the dot itself is instant — zero lag
  const trailX = useSpring(mx, { stiffness: 600, damping: 40, mass: 0.4 })
  const trailY = useSpring(my, { stiffness: 600, damping: 40, mass: 0.4 })
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (isTouch) return
    const move = e => { mx.set(e.clientX); my.set(e.clientY) }
    const over = e => { if (e.target.closest('button,a,[data-hover]')) setHovered(true) }
    const out  = e => { if (e.target.closest('button,a,[data-hover]')) setHovered(false) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    window.addEventListener('mouseout', out)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over); window.removeEventListener('mouseout', out) }
  }, [mx, my, isTouch])

  if (isTouch) return null

  return (
    <>
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        x: trailX, y: trailY,
        translateX: '-50%', translateY: '-50%',
        width: 36, height: 36, borderRadius: '50%',
        border: '1.5px solid rgba(232,163,61,0.4)',
        mixBlendMode: 'difference',
      }}
        animate={{ scale: hovered ? 1.8 : 1, opacity: hovered ? 0.6 : 0.35 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        x: mx, y: my,
        translateX: '-50%', translateY: '-50%',
        width: 7, height: 7, borderRadius: '50%',
        background: 'var(--marigold-2)',
      }}
        animate={{ scale: hovered ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  )
}

/* ══════════════════════════════════════════════════════
   PARTICLES
══════════════════════════════════════════════════════ */
function Particles({ count = 60 }) {
  const isMobile = useIsMobile()
  const effectiveCount = isMobile ? Math.round(count * 0.4) : count
  const particles = useMemo(() => Array.from({ length: effectiveCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -20,
    opacity: Math.random() * 0.5 + 0.1,
  })), [effectiveCount])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? 'var(--marigold-2)' : p.id % 3 === 1 ? 'var(--sage)' : '#fff',
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0, p.opacity, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   SCRAMBLE TEXT
══════════════════════════════════════════════════════ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
function useScramble(target, trigger) {
  const [text, setText] = useState(target)
  useEffect(() => {
    if (!trigger) return
    let frame = 0
    const total = 18
    const id = setInterval(() => {
      frame++
      const progress = frame / total
      setText(target.split('').map((c, i) => {
        if (c === ' ') return ' '
        if (i / target.length < progress) return c
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      }).join(''))
      if (frame >= total) { clearInterval(id); setText(target) }
    }, 40)
    return () => clearInterval(id)
  }, [target, trigger])
  return text
}

/* ══════════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════════ */
function Counter({ to, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(eased * to))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

/* ══════════════════════════════════════════════════════
   MAGNETIC BUTTON
══════════════════════════════════════════════════════ */
function MagBtn({ children, style = {}, onClick, href, primary }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18 })
  const sy = useSpring(y, { stiffness: 200, damping: 18 })

  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.35)
    y.set((e.clientY - r.top - r.height / 2) * 0.35)
  }
  const handleLeave = () => { x.set(0); y.set(0) }

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '15px 30px', borderRadius: 100,
    fontFamily: "'Karla', sans-serif", fontWeight: 700, fontSize: 15,
    textDecoration: 'none', border: 'none', cursor: 'none',
    position: 'relative', overflow: 'hidden',
    background: primary ? 'var(--marigold)' : 'transparent',
    color: primary ? '#1B1306' : 'var(--soft)',
    boxShadow: primary ? '0 0 0 0 rgba(232,163,61,0)' : 'none',
    outline: !primary ? '1.5px solid var(--line)' : 'none',
    ...style,
  }

  const Tag = href ? motion.a : motion.button
  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      style={{ ...base, x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{
        boxShadow: primary ? '0 0 40px 8px rgba(232,163,61,0.4)' : 'none',
        outline: !primary ? '1.5px solid rgba(255,255,255,0.35)' : 'none',
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* shimmer on hover */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </Tag>
  )
}

/* ══════════════════════════════════════════════════════
   TILT CARD
══════════════════════════════════════════════════════ */
function TiltCard({ children, style = {} }) {
  const isTouch = useIsTouch()
  const ref = useRef(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const srx = useSpring(rotX, { stiffness: 180, damping: 22 })
  const sry = useSpring(rotY, { stiffness: 180, damping: 22 })

  const handleMove = (e) => {
    if (isTouch) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    rotY.set(px * 14)
    rotX.set(-py * 14)
  }
  const handleLeave = () => { rotX.set(0); rotY.set(0) }

  if (isTouch) {
    return <div style={style}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', perspective: 800, ...style }}
      whileHover={{ z: 12 }}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   SECTION REVEAL
══════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, y = 40 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   EYEBROW
══════════════════════════════════════════════════════ */
function Eyebrow({ children, color = 'var(--marigold-2)' }) {
  return (
    <motion.p
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease }}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12, letterSpacing: '0.16em',
        textTransform: 'uppercase', color, marginBottom: 12, opacity: 0.9,
      }}
    >
      {children}
    </motion.p>
  )
}

/* ══════════════════════════════════════════════════════
   INTRO CURTAIN
══════════════════════════════════════════════════════ */
function IntroCurtain({ onDone }) {
  const words = ['THE', 'REAL', 'BARRIER', "ISN'T", 'THE', 'SYSTEM.']
  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)', transition: { duration: 1, ease } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#070810',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 14, padding: 32,
      }}
    >
      <Particles count={40} />

      {/* scanline */}
      <motion.div
        animate={{ y: ['0vh', '100vh'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(232,163,61,0.15), transparent)',
          pointerEvents: 'none', zIndex: 1,
        }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 16px', maxWidth: 720, marginBottom: 20, zIndex: 2 }}>
        {words.map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.2 + i * 0.14, duration: 0.8, ease }}
            style={{
              fontFamily: "'Fraunces', serif", fontWeight: 650,
              fontSize: 'clamp(40px, 8vw, 88px)',
              color: i < 3 ? '#fff' : 'var(--marigold-2)',
              letterSpacing: '-0.03em', lineHeight: 1.0,
            }}
          >
            {w}
          </motion.span>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        style={{ fontFamily: "'Karla', sans-serif", fontSize: 17, color: 'var(--soft)', letterSpacing: '0.06em', zIndex: 2, textAlign: 'center' }}
      >
        IT'S WHAT STOPS PEOPLE FROM USING IT.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        style={{ width: 60, height: 1, background: 'var(--marigold)', margin: '8px 0', zIndex: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.6 }}
        style={{ zIndex: 2 }}
      >
        <MagBtn primary onClick={onDone} style={{ marginTop: 12 }}>
          Enter Saathi →
        </MagBtn>
      </motion.div>

      {/* corner labels */}
      {['CODE.', 'COLLABORATE.', 'CREATE IMPACT.'].map((t, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ delay: 2.2 + i * 0.1 }}
          style={{
            position: 'absolute',
            bottom: 28 + i * 0, left: 32 + i * 130,
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            letterSpacing: '0.12em', color: '#fff',
          }}
        >
          {t}
        </motion.span>
      ))}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   NOISE + ORB
══════════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })
  return (
    <motion.div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 110,
      background: 'linear-gradient(90deg, #5B3F54, #C06A3F, var(--marigold-2))',
      transformOrigin: '0%', scaleX,
      boxShadow: '0 0 12px rgba(232,163,61,0.6)',
    }} />
  )
}

function BackToTop() {
  const { scrollYProgress } = useScroll()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const h = () => setShow(window.scrollY > window.innerHeight * 0.8)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  const pathLength = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          data-hover
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => smoothScrollTo(0, { offset: 0, duration: 1.0 })}
          transition={{ duration: 0.3, ease }}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 90,
            width: 52, height: 52, borderRadius: '50%', cursor: 'none',
            border: 'none', background: 'rgba(20,22,35,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="52" height="52" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <motion.circle
              cx="26" cy="26" r="22" fill="none" stroke="var(--marigold-2)" strokeWidth="2"
              strokeDasharray="138.2" style={{ pathLength }}
              strokeLinecap="round"
            />
          </svg>
          <span style={{ color: 'var(--marigold-2)', fontSize: 16, transform: 'translateY(-1px)' }}>↑</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function Marquee() {
  const words = ['FEAR OF DIAGNOSIS', 'SOCIAL STIGMA', 'MASCULINITY NORMS', 'COST CONCERNS', 'LACK OF TIME', 'DENIAL & UNCERTAINTY']
  const loop = [...words, ...words]
  return (
    <div style={{
      background: '#0A0915', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      padding: '20px 0', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #0A0915 0%, transparent 8%, transparent 92%, #0A0915 100%)', zIndex: 2, pointerEvents: 'none' }} />
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 26, ease: 'linear' }}
        style={{ display: 'flex', gap: 0, width: 'max-content' }}
      >
        {loop.map((w, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, paddingRight: 28 }}>
            <span style={{
              fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 22,
              color: i % words.length === 0 ? 'var(--marigold-2)' : 'rgba(255,255,255,0.35)',
              whiteSpace: 'nowrap',
            }}>{w}</span>
            <span style={{ color: 'var(--marigold)', fontSize: 14 }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', t: 'Name what\u2019s really stopping you', d: 'Six honest barriers, not a symptom checklist. Pick the ones that are true.' },
    { n: '02', t: 'Talk to Saathi, anonymously', d: 'No login, nothing stored. Say the thing you haven\u2019t said out loud yet.' },
    { n: '03', t: 'Get one verified next step', d: 'A real government helpline, matched to your exact barrier \u2014 not a generic list.' },
    { n: '04', t: 'Take the smallest possible action', d: 'Save a number. Tell one person. Set a 48-hour rule. That\u2019s the whole ask.' },
  ]
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.4'] })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section ref={ref} style={{
      background: 'linear-gradient(180deg, #1A1030 0%, #0D0F1A 100%)',
      padding: '120px 36px', position: 'relative',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Reveal><Eyebrow>How it actually works</Eyebrow></Reveal>
        <Reveal delay={0.05}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', color: 'var(--paper)', marginBottom: 64 }}>Four steps. Five minutes. No commitment to "be sick."</h2>
        </Reveal>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 23, top: 8, bottom: 8, width: 2, background: 'rgba(255,255,255,0.08)' }} />
          <motion.div style={{ position: 'absolute', left: 23, top: 8, bottom: 8, width: 2, scaleY: lineScale, transformOrigin: 'top', background: 'linear-gradient(180deg, var(--marigold), var(--marigold-2))', boxShadow: '0 0 12px rgba(232,163,61,0.6)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.08} y={28}>
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', position: 'relative' }}>
                  <motion.div
                    whileInView={{ scale: [0.6, 1.15, 1], backgroundColor: ['rgba(255,255,255,0.06)', 'var(--marigold)', 'var(--marigold)'] }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, ease, delay: i * 0.08 }}
                    style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 14,
                      color: '#1B1306', zIndex: 2, border: '3px solid #0D0F1A',
                    }}
                  >
                    {s.n}
                  </motion.div>
                  <div style={{ paddingTop: 6 }}>
                    <h3 style={{ fontSize: 19, color: 'var(--paper)', marginBottom: 8 }}>{s.t}</h3>
                    <p style={{ fontSize: 14.5, color: 'var(--soft)', lineHeight: 1.6, maxWidth: 460 }}>{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Noise() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      opacity: 0.03, pointerEvents: 'none',
    }} />
  )
}

function FloatingOrb() {
  const { scrollYProgress } = useScroll()
  const rawY = useTransform(scrollYProgress, [0, 1], ['78%', '8%'])
  const y = useSpring(rawY, { stiffness: 60, damping: 20 })
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [0.82, 1, 1.18]), { stiffness: 80, damping: 20 })

  // Crossfading solid-color layers (opacity only) instead of interpolating
  // `background`/`boxShadow` every frame — opacity is GPU-compositable and
  // doesn't force a main-thread repaint, which is what was causing scroll jank.
  const op1 = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const op2 = useTransform(scrollYProgress, [0.15, 0.5, 0.75], [0, 1, 0])
  const op3 = useTransform(scrollYProgress, [0.6, 0.9], [0, 1])
  const layers = [
    { op: op1, c: '#2C3454' },
    { op: op2, c: '#8C3A2A' },
    { op: op3, c: '#E8A33D' },
  ]

  return (
    <motion.div style={{ position: 'fixed', right: 28, y, scale, width: 56, height: 56, zIndex: 50, pointerEvents: 'none' }}>
      {layers.map((l, i) => (
        <motion.div key={i} style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: l.c, opacity: l.op,
          boxShadow: `0 0 50px 16px ${l.c}55`,
        }} />
      ))}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════ */
function NavIcon({ name, size = 15 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'target') return <svg {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" /></svg>
  if (name === 'chat') return <svg {...p}><path d="M20.5 11.5a8 8 0 0 1-8 8 8 8 0 0 1-3.6-.85L3.5 20l1.35-5.4a8 8 0 0 1-.85-3.6 8 8 0 0 1 8-8h.2a8 8 0 0 1 8 8z" /></svg>
  if (name === 'phone') return <svg {...p}><path d="M21.5 16.4v2.9a1.9 1.9 0 0 1-2.07 1.9 18.8 18.8 0 0 1-8.2-2.92 18.5 18.5 0 0 1-5.7-5.7A18.8 18.8 0 0 1 2.6 4.37 1.9 1.9 0 0 1 4.49 2.3h2.9a1.9 1.9 0 0 1 1.9 1.63c.12.91.34 1.8.66 2.67a1.9 1.9 0 0 1-.43 2L8.1 9.98a15.2 15.2 0 0 0 5.7 5.7l1.38-1.38a1.9 1.9 0 0 1 2-.43c.86.32 1.76.54 2.66.66a1.9 1.9 0 0 1 1.66 1.93z" /></svg>
  if (name === 'quote') return <svg {...p}><path d="M7.5 7h3.5v5.5a3.5 3.5 0 0 1-3.5 3.5H6" /><path d="M15.5 7H19v5.5a3.5 3.5 0 0 1-3.5 3.5H14" /></svg>
  if (name === 'menu') return <svg {...p}><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" /></svg>
  if (name === 'close') return <svg {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
  return null
}

function Nav() {
  const isMobile = useIsMobile()
  const [scrolled, setScrolled] = useState(false)
  const [hoverIdx, setHoverIdx] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => { if (!isMobile) setMenuOpen(false) }, [isMobile])

  const links = [
    { label: 'Your barrier', href: '#barriers', icon: 'target' },
    { label: 'Talk to Saathi', href: '#chat', icon: 'chat' },
    { label: 'Resources', href: '#resources', icon: 'phone' },
    { label: 'Stories', href: '#voices', icon: 'quote' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '14px 20px' : '14px 28px',
          background: scrolled ? 'rgba(13,15,26,0.78)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px) saturate(1.6)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          transition: 'background 0.4s ease, border-color 0.4s ease',
        }}
      >
        <motion.a
          href="#hero"
          data-hover
          style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}
          whileHover={{ scale: 1.03 }}
        >
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--marigold)', display: 'inline-block', boxShadow: '0 0 10px 3px rgba(232,163,61,0.5)' }}
          />
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 650, fontSize: 20, color: 'var(--paper)' }}>Saathi</span>
        </motion.a>

        {!isMobile ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              display: 'flex', gap: 2, padding: 5, borderRadius: 100,
              background: 'rgba(255,255,255,0.045)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseLeave={() => setHoverIdx(null)}
          >
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                data-hover
                onMouseEnter={() => setHoverIdx(i)}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 15px', borderRadius: 100, textDecoration: 'none',
                  fontSize: 13.5, fontWeight: 600,
                  color: hoverIdx === i ? 'var(--marigold-2)' : 'var(--soft)',
                  transition: 'color 0.2s',
                }}
              >
                {hoverIdx === i && (
                  <motion.span
                    layoutId="navhover"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    style={{ position: 'absolute', inset: 0, borderRadius: 100, background: 'rgba(232,163,61,0.12)', border: '1px solid rgba(232,163,61,0.25)', zIndex: -1 }}
                  />
                )}
                <NavIcon name={l.icon} />
                {l.label}
              </a>
            ))}
          </motion.div>
        ) : (
          <motion.button
            data-hover
            onClick={() => setMenuOpen(v => !v)}
            whileTap={{ scale: 0.92 }}
            style={{
              width: 38, height: 38, borderRadius: 12, cursor: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <NavIcon name={menuOpen ? 'close' : 'menu'} size={17} />
          </motion.button>
        )}
      </motion.nav>

      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease }}
            style={{
              position: 'fixed', top: 66, left: 16, right: 16, zIndex: 99,
              background: 'rgba(17,18,28,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18,
              padding: 10, display: 'flex', flexDirection: 'column', gap: 2,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px', borderRadius: 12, textDecoration: 'none',
                  color: 'var(--paper)', fontSize: 14.5, fontWeight: 600,
                }}
                whileTap={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <span style={{ color: 'var(--marigold-2)' }}><NavIcon name={l.icon} size={17} /></span>
                {l.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ══════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════ */
function Hero() {
  const isMobile = useIsMobile()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.35], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.28], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.94])
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const titleText = "It's safe to find out."
  const scrambled = useScramble(titleText, inView)

  return (
    <section id="hero" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      background: 'linear-gradient(135deg, #0D0F1A 0%, #1A1030 50%, #0D0F1A 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      padding: '140px 36px 100px',
      position: 'relative', overflow: 'hidden',
    }}>
      <Particles count={70} />

      {/* dot grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      {/* hero glow blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-15%', right: '-8%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,63,84,0.28) 0%, transparent 70%)',
          zIndex: 0, filter: 'blur(2px)',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(44,52,84,0.3) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <motion.div style={{ y, opacity, scale, position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1.5fr) minmax(0,0.85fr)', gap: isMobile ? 40 : 64, alignItems: 'center' }}>
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease }}
            >
              <Eyebrow>DesignVerse 2026 · Team Tech Tinkerers</Eyebrow>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 44 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.9, ease }}
              style={{ fontSize: 'clamp(36px,5.8vw,68px)', lineHeight: 1.04, color: 'var(--paper)', marginBottom: 24 }}
            >
              Most people don't need to be convinced they're sick.{' '}
              <motion.em
                style={{ color: 'var(--marigold-2)', fontStyle: 'italic', display: 'inline-block' }}
                animate={{ textShadow: ['0 0 0px rgba(242,192,99,0)', '0 0 30px rgba(242,192,99,0.4)', '0 0 0px rgba(242,192,99,0)'] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                They need to be convinced {scrambled}
              </motion.em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.8, ease }}
              style={{ fontSize: 17, color: 'var(--soft)', maxWidth: 500, marginBottom: 38, lineHeight: 1.68 }}
            >
              Saathi is a companion for the moment before someone decides to seek healthcare — when fear, shame, cost, or "it's probably nothing" are doing more talking than the symptom itself.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.7, ease }}
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}
            >
              <MagBtn primary href="#barriers">Find what's holding you back ↓</MagBtn>
              <MagBtn href="#chat">Talk to Saathi</MagBtn>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}
            >
              {['No login required', 'Nothing stored', 'Built for India'].map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.65 + i * 0.08 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--soft)', opacity: 0.6 }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }}
                  />
                  {t}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* hero card */}
          <TiltCard>
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.94 }}
              animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.9, ease }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 22, padding: 30,
                backdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* shimmer */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
                  pointerEvents: 'none', borderRadius: 22,
                }}
              />
              <Eyebrow>The real problem statement</Eyebrow>
              <p style={{ fontSize: 15, color: 'var(--soft)', marginBottom: 18, lineHeight: 1.65 }}>
                India has hospitals, clinics, and telemedicine within reach of most people. The gap isn't access. It's the seconds before someone picks up the phone.
              </p>
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 19, color: 'var(--paper)', lineHeight: 1.45 }}
              >
                "It's probably nothing." That sentence delays more diagnoses than distance ever has.
              </motion.p>
            </motion.div>
          </TiltCard>
        </div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.1em', opacity: 0.5 }}>SCROLL</span>
        <motion.div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--marigold-2), transparent)' }} />
      </motion.div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════
   STATS BAND
══════════════════════════════════════════════════════ */
function StatsBand() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const stats = [
    { n: 70, suffix: '%', label: 'of KIRAN callers are men — yet men rarely admit needing help' },
    { n: 500, suffix: 'M+', label: 'people covered free under Ayushman Bharat PM-JAY' },
    { n: 6, suffix: '', label: 'emotional barriers stop people before cost or distance does' },
    { n: 48, suffix: 'hr', label: 'rule — all it takes to break the "probably nothing" freeze' },
  ]
  return (
    <div ref={ref} style={{
      background: 'linear-gradient(90deg, #0E0D20, #1A1030, #0E0D20)',
      borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
      padding: '64px 36px', position: 'relative', overflow: 'hidden',
    }}>
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(232,163,61,0.04) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 36 }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 28, scale: 0.9 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: i * 0.12, duration: 0.7, ease }}
          >
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 650, color: 'var(--marigold-2)', lineHeight: 1 }}>
              <Counter to={s.n} suffix={s.suffix} duration={1.8} />
            </div>
            <div style={{ width: 32, height: 2, background: 'var(--marigold)', margin: '10px 0', borderRadius: 1 }} />
            <div style={{ fontSize: 14, color: 'var(--soft)', lineHeight: 1.55, opacity: 0.8 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   BARRIERS
══════════════════════════════════════════════════════ */
function BarrierPicker() {
  const [selected, setSelected] = useState(new Set())
  const toggle = useCallback((id) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }, [])
  const active = barriers.filter(b => selected.has(b.id))

  return (
    <section id="barriers" style={{
      background: 'linear-gradient(180deg, #0D0F1A 0%, #1A0E2A 50%, #0E0D1F 100%)',
      padding: '120px 36px', position: 'relative', overflow: 'hidden',
    }}>
      {/* bg orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(73,52,94,0.4) 0%, transparent 70%)', pointerEvents: 'none' }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <Reveal><Eyebrow>Step 1 · Name it</Eyebrow></Reveal>
        <Reveal delay={0.05}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', color: 'var(--paper)', marginBottom: 14 }}>What's really stopping you?</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: 16, color: 'var(--soft)', maxWidth: 500, marginBottom: 46, lineHeight: 1.65 }}>
            Pick whatever is true right now. Nothing here is saved or sent anywhere.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
            {barriers.map((b, i) => {
              const isActive = selected.has(b.id)
              return (
                <motion.button
                  key={b.id}
                  data-hover
                  onClick={() => toggle(b.id)}
                  initial={{ opacity: 0, scale: 0.8, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.5, ease }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '13px 22px', borderRadius: 100, cursor: 'none',
                    border: '1.5px solid',
                    borderColor: isActive ? 'var(--marigold)' : 'rgba(255,255,255,0.12)',
                    background: isActive
                      ? 'linear-gradient(135deg, var(--marigold), var(--marigold-2))'
                      : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#1B1306' : 'var(--soft)',
                    fontFamily: "'Karla', sans-serif", fontWeight: 700, fontSize: 14.5,
                    boxShadow: isActive ? '0 4px 24px rgba(232,163,61,0.35)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ marginRight: 6 }}
                    >✓</motion.span>
                  )}
                  {b.label}
                </motion.button>
              )
            })}
          </div>
          <p style={{ fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.4, marginBottom: 52 }}>↑ tap as many as apply</p>
        </Reveal>

        <AnimatePresence mode="popLayout">
          {active.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ border: '1.5px dashed rgba(255,255,255,0.1)', borderRadius: 18, padding: 40, textAlign: 'center', fontSize: 15, color: 'var(--soft)', opacity: 0.6 }}
            >
              Pick at least one above — your personal pathway will appear here.
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}
            >
              {active.map((b, i) => (
                <TiltCard key={b.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ delay: i * 0.06, duration: 0.5, ease }}
                    style={{ background: 'var(--paper)', borderRadius: 18, padding: 26, height: '100%' }}
                  >
                    {/* top accent line */}
                    <motion.div
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      style={{ height: 3, background: 'linear-gradient(90deg, #E8A33D, #C06A3F)', borderRadius: 2, marginBottom: 18, transformOrigin: 'left' }}
                    />
                    <h3 style={{ fontSize: 17, marginBottom: 10, color: '#2B2419', lineHeight: 1.35 }}>{b.title}</h3>
                    <p style={{ fontSize: 14, marginBottom: 16, color: '#43392A', lineHeight: 1.6 }}>{b.ack}</p>
                    <div style={{ background: 'rgba(168,83,57,0.1)', borderRadius: 10, padding: '11px 14px', fontSize: 13.5, fontWeight: 700, color: '#8C4128', marginBottom: 12 }}>{b.step}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#6E6248', lineHeight: 1.5 }}>{b.res}</div>
                  </motion.div>
                </TiltCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════
   CHAT
══════════════════════════════════════════════════════ */
function BotMsg({ text }) {
  const isCrisis = text.includes('Tele-MANAS') && text.includes('hear how heavy')
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <motion.div
      initial={{ opacity: 0, x: -18, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, ease }}
      style={{
        maxWidth: '84%', alignSelf: 'flex-start',
        background: isCrisis ? '#FDEDE7' : '#fff',
        border: `1px solid ${isCrisis ? '#E3A98C' : '#E8DCC4'}`,
        borderBottomLeftRadius: 4, borderRadius: 14,
        padding: '12px 16px', fontSize: 14.5, color: isCrisis ? '#7A2E12' : '#2B2419',
        lineHeight: 1.6, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>)}
    </motion.div>
  )
}

function UserMsg({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.35, ease }}
      style={{
        maxWidth: '84%', alignSelf: 'flex-end',
        background: 'linear-gradient(135deg, #2B2419, #1B160F)',
        color: 'var(--paper)',
        borderRadius: 14, borderBottomRightRadius: 4,
        padding: '12px 16px', fontSize: 14.5, lineHeight: 1.6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      {text}
    </motion.div>
  )
}

function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{ display: 'flex', gap: 5, padding: '13px 16px', alignSelf: 'flex-start', background: '#fff', borderRadius: 14, borderBottomLeftRadius: 4, border: '1px solid #E8DCC4' }}
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ delay: i * 0.16, repeat: Infinity, duration: 0.9 }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: '#aaa', display: 'inline-block' }}
        />
      ))}
    </motion.div>
  )
}

function Chat() {
  const isMobile = useIsMobile()
  const [msgs, setMsgs] = useState([{ from: 'bot', text: "Hi — I'm Saathi. You don't need a diagnosis to start here. Just tell me what's making this feel hard to act on, in your own words." }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [fbIdx, setFbIdx] = useState(0)
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [msgs, typing])

  const send = useCallback((text) => {
    const val = (text || input).trim()
    if (!val) return
    setInput('')
    setMsgs(p => [...p, { from: 'user', text: val }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const cat = classify(val)
      const arr = RESPONSES[cat] || RESPONSES.fallback
      const reply = cat === 'fallback'
        ? RESPONSES.fallback[fbIdx % RESPONSES.fallback.length]
        : arr[Math.floor(Math.random() * arr.length)]
      if (cat === 'fallback') setFbIdx(p => p + 1)
      setMsgs(p => [...p, { from: 'bot', text: reply }])
    }, 900 + Math.random() * 500)
  }, [input, fbIdx])

  return (
    <section id="chat" style={{
      background: 'linear-gradient(180deg, #0E0D1F 0%, #1E0E18 50%, #2A1008 100%)',
      padding: '120px 36px', position: 'relative', overflow: 'hidden',
    }}>
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,40,20,0.35) 0%, transparent 70%)', pointerEvents: 'none' }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) minmax(0,1.3fr)', gap: isMobile ? 36 : 56, alignItems: 'start', position: 'relative', zIndex: 2 }}>
        <div>
          <Reveal><Eyebrow>Step 2 · Talk it through</Eyebrow></Reveal>
          <Reveal delay={0.05}>
            <h2 style={{ fontSize: 'clamp(26px,3.8vw,44px)', color: 'var(--paper)', marginBottom: 16 }}>Saathi listens before it nudges</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: 16, color: 'var(--soft)', marginBottom: 28, lineHeight: 1.68 }}>
              Type the thing you haven't said out loud yet. Saathi won't diagnose you — it'll help you find the smallest honest next step.
            </p>
            <motion.div
              whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 14, padding: '16px 18px', fontSize: 13.5, lineHeight: 1.65, transition: 'border-color 0.2s' }}
            >
              <strong style={{ color: 'var(--marigold-2)', display: 'block', marginBottom: 6 }}>What Saathi is — and isn't.</strong>
              An emotional first step, not a doctor. For anything urgent, call <strong>108</strong> (ambulance) or <strong>104</strong> (health helpline) directly.
            </motion.div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <motion.div
            whileInView={{ boxShadow: '0 40px 90px rgba(0,0,0,0.55)' }}
            viewport={{ once: true }}
            style={{
              background: 'var(--paper)', borderRadius: 14, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', height: 540,
              boxShadow: '0 24px 56px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* macOS-style title bar */}
            <div style={{
              position: 'relative', display: 'flex', alignItems: 'center',
              padding: '13px 16px',
              background: 'linear-gradient(180deg, #3C3C3E 0%, #2C2C2E 100%)',
              borderBottom: '1px solid rgba(0,0,0,0.35)',
            }}>
              <div className="traffic-lights" style={{ display: 'flex', gap: 8, zIndex: 2 }}>
                {[
                  { c: '#FF5F57', g: '#E0443E' },
                  { c: '#FEBC2E', g: '#D89E24' },
                  { c: '#28C840', g: '#1AAB29' },
                ].map((dot, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.15 }}
                    style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: `radial-gradient(circle at 30% 30%, ${dot.c}, ${dot.g})`,
                      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)',
                      display: 'inline-block', cursor: 'none',
                    }}
                  />
                ))}
              </div>
              <div style={{
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <motion.span
                  animate={{ scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7], boxShadow: ['0 0 0 0 rgba(124,152,133,0.5)', '0 0 0 6px rgba(124,152,133,0)', '0 0 0 0 rgba(124,152,133,0)'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }}
                />
                <span style={{ fontFamily: "'Karla', sans-serif", fontWeight: 600, fontSize: 13, color: '#E8E8EA', letterSpacing: '0.01em' }}>Saathi — always anonymous</span>
              </div>
              <span style={{ marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: 'rgba(255,255,255,0.35)', zIndex: 2 }}>private</span>
            </div>

            <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12, background: '#F8F3EA' }}>
              {msgs.map((m, i) => m.from === 'bot'
                ? <BotMsg key={i} text={m.text} />
                : <UserMsg key={i} text={m.text} />
              )}
              <AnimatePresence>{typing && <TypingDots key="typing" />}</AnimatePresence>
            </div>

            <div style={{ display: 'flex', gap: 7, padding: '0 14px 12px', flexWrap: 'wrap', background: '#F8F3EA', borderTop: '1px solid #EDE3D0' }}>
              {quickPrompts.map(q => (
                <motion.button
                  key={q} data-hover
                  whileHover={{ scale: 1.04, borderColor: '#C9B98F', background: '#FDF8F0' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => send(q)}
                  style={{ fontSize: 12, padding: '7px 12px', borderRadius: 100, border: '1px solid #E8DCC4', background: '#fff', color: '#6E6248', fontFamily: "'Karla', sans-serif", cursor: 'none', transition: 'all 0.15s' }}
                >
                  {q}
                </motion.button>
              ))}
            </div>

            <div style={{ display: 'flex', borderTop: '1px solid #E8DCC4' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Type what's on your mind…"
                style={{ flex: 1, border: 'none', padding: '16px 18px', fontFamily: "'Karla', sans-serif", fontSize: 14.5, outline: 'none', color: '#2B2419', background: '#fff' }}
              />
              <motion.button
                data-hover
                whileHover={{ background: '#1B160F' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => send()}
                style={{ border: 'none', background: '#2B2419', color: 'var(--paper)', padding: '0 24px', fontWeight: 700, cursor: 'none', fontFamily: "'Karla', sans-serif", fontSize: 14 }}
              >
                Send ↑
              </motion.button>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════
   RESOURCES
══════════════════════════════════════════════════════ */
function Resources() {
  return (
    <section id="resources" style={{
      background: 'linear-gradient(180deg, #2A1008 0%, #5A1E0E 100%)',
      padding: '120px 36px', position: 'relative', overflow: 'hidden',
    }}>
      <Particles count={25} />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <Reveal><Eyebrow>Step 3 · Know where to go</Eyebrow></Reveal>
        <Reveal delay={0.05}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', color: 'var(--paper)', marginBottom: 14 }}>Real, free, government helplines</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: 16, color: 'var(--soft)', maxWidth: 520, marginBottom: 52, lineHeight: 1.65 }}>Every number below is a verified national helpline. Save one before you close this tab.</p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {resourceGroups.map((g, gi) => (
            <Reveal key={gi} delay={gi * 0.1}>
              <TiltCard style={{ height: '100%' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(232,163,61,0.3)', background: 'rgba(255,255,255,0.09)' }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 26, height: '100%', transition: 'all 0.25s' }}
                >
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--marigold-2)', marginBottom: 18 }}>{g.cat}</p>
                  {g.rows.map((r, ri) => (
                    <motion.div
                      key={ri}
                      whileHover={{ x: 3 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: ri > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none', gap: 12, transition: 'transform 0.15s' }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--paper)' }}>{r.name}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--soft)', opacity: 0.7, marginTop: 2, lineHeight: 1.45 }}>{r.desc}</div>
                      </div>
                      <motion.a
                        href={`tel:${r.tel}`}
                        data-hover
                        whileHover={{ scale: 1.08, color: '#fff', textShadow: '0 0 16px rgba(242,192,99,0.7)' }}
                        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: 'var(--marigold-2)', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 500 }}
                      >
                        {r.num}
                      </motion.a>
                    </motion.div>
                  ))}
                </motion.div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════
   VOICES
══════════════════════════════════════════════════════ */
function Voices() {
  return (
    <section id="voices" style={{
      background: 'linear-gradient(180deg, #5A1E0E 0%, #C8762A 60%, #E8A33D 100%)',
      padding: '120px 36px', position: 'relative', overflow: 'hidden',
    }}>
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 80, ease: 'linear' }}
        style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          border: '1px solid rgba(27,19,6,0.1)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <Reveal><Eyebrow color="#6E4A12">Real patterns, composite stories</Eyebrow></Reveal>
        <Reveal delay={0.05}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', color: '#2B2006', marginBottom: 14 }}>People who waited — and what got them to act</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: 15.5, color: '#3F2E0C', maxWidth: 520, marginBottom: 52, lineHeight: 1.65 }}>Composite stories built from patterns counsellors report. Names are changed.</p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {voices.map((v, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <TiltCard style={{ height: '100%' }}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(27,19,6,0.2)' }}
                  transition={{ duration: 0.3 }}
                  style={{ background: 'rgba(27,19,6,0.15)', border: '1px solid rgba(27,19,6,0.15)', borderRadius: 18, padding: 28, height: '100%', backdropFilter: 'blur(4px)' }}
                >
                  <motion.div
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                    style={{ height: 2, background: 'rgba(27,19,6,0.25)', borderRadius: 1, marginBottom: 20, transformOrigin: 'left' }}
                  />
                  <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 18, color: '#2B2006', lineHeight: 1.5, marginBottom: 20 }}>"{v.quote}"</p>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B4310', background: 'rgba(27,19,6,0.1)', padding: '4px 10px', borderRadius: 100 }}>{v.tag}</span>
                  <div style={{ marginTop: 14, fontWeight: 700, fontSize: 13, color: '#5B4310' }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: '#6E5722', marginTop: 4, opacity: 0.8 }}>{v.foot}</div>
                </motion.div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════
   TRACKER
══════════════════════════════════════════════════════ */
function Tracker() {
  const isMobile = useIsMobile()
  const [done, setDone] = useState(new Set())
  const toggle = useCallback((i) => {
    setDone(prev => {
      const n = new Set(prev)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })
  }, [])
  const pct = (done.size / tasks.length) * 100
  const allDone = done.size === tasks.length

  return (
    <section style={{
      background: allDone
        ? 'linear-gradient(135deg, #E8A33D, #F2C063)'
        : 'var(--marigold)',
      padding: '120px 36px',
      transition: 'background 0.8s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: '110%', x: `${Math.random() * 100}%`, rotate: 0, opacity: 1 }}
                animate={{ y: '-10%', rotate: Math.random() * 360, opacity: 0 }}
                transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'easeOut' }}
                style={{ position: 'absolute', bottom: 0, width: 8, height: 8, borderRadius: '50%', background: i % 2 === 0 ? '#2B2419' : '#fff' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)', gap: isMobile ? 40 : 64, alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <Reveal>
          <Eyebrow color="#6E4A12">Step 4 · Take one tiny step</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', color: '#2B2006', marginBottom: 16 }}>You don't have to solve this today. You have to start it.</h2>
          <p style={{ fontSize: 16, color: '#43320A', lineHeight: 1.68 }}>Tick whatever you've already done. Most people only need three of these to break the freeze.</p>
        </Reveal>

        <Reveal delay={0.15}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.map((t, i) => (
              <motion.div
                key={i}
                data-hover
                onClick={() => toggle(i)}
                whileHover={{ scale: 1.025, x: 4 }}
                whileTap={{ scale: 0.98 }}
                layout
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: done.has(i) ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                  border: `1.5px solid ${done.has(i) ? 'rgba(27,19,6,0.25)' : 'rgba(27,19,6,0.1)'}`,
                  borderRadius: 12, padding: '15px 18px', cursor: 'none',
                  transition: 'background 0.2s, border-color 0.2s',
                  boxShadow: done.has(i) ? '0 4px 20px rgba(27,19,6,0.1)' : 'none',
                }}
              >
                <motion.div
                  animate={{ background: done.has(i) ? '#2B2419' : 'transparent', scale: done.has(i) ? [1, 1.3, 1] : 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: 24, height: 24, borderRadius: 7, border: '2px solid #2B2419', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <AnimatePresence>
                    {done.has(i) && (
                      <motion.span
                        initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        style={{ fontSize: 12, color: 'var(--marigold)', fontWeight: 900 }}
                      >✓</motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: '#2B2419', opacity: done.has(i) ? 0.45 : 1, textDecoration: done.has(i) ? 'line-through' : 'none', transition: 'all 0.2s' }}>{t}</span>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: '#43320A' }}>{done.size} / {tasks.length} small steps</span>
              {allDone && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ fontSize: 12.5, fontWeight: 700, color: '#2B2419' }}
                >
                  🎉 You did it.
                </motion.span>
              )}
            </div>
            <div style={{ height: 10, borderRadius: 100, background: 'rgba(27,19,6,0.15)', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #2B2419, #3D3020)', borderRadius: 100, boxShadow: pct > 0 ? '0 0 12px rgba(43,36,25,0.4)' : 'none' }}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ background: 'var(--paper)', color: '#2B2419', padding: '96px 36px 48px', position: 'relative', overflow: 'hidden' }}>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '-20%', right: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,163,61,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <Reveal>
          <Eyebrow color="#8C5A1E">DesignVerse 2026 · Real Ideas. Real Impact.</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,4.5vw,50px)', color: '#2B2419', maxWidth: 700, marginBottom: 32, lineHeight: 1.1 }}>
            Be the reason someone chooses their health today, not tomorrow.
          </h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 72 }}>
            <MagBtn primary href="#barriers" style={{ background: '#2B2419', color: 'var(--paper)', boxShadow: 'none' }}>Start with one barrier</MagBtn>
            <MagBtn href="#chat" style={{ outline: '1.5px solid #2B2419', color: '#2B2419' }}>Talk to Saathi</MagBtn>
          </div>
        </Reveal>

        <div style={{ borderTop: '1px solid #E0D3B6', paddingTop: 32, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 30 }}>
          <div>
            <strong style={{ display: 'block', color: '#2B2419', fontSize: 14, marginBottom: 10 }}>Team Tech Tinkerers</strong>
            {['Rishi Raj — 24BCE10149', 'Swastik Sinha — 24BEY10075', 'Abhilash Singh — 24BCE10706'].map(m => (
              <div key={m} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: '#6E6248', marginBottom: 4 }}>{m}</div>
            ))}
          </div>
          <p style={{ maxWidth: 400, fontSize: 12.5, color: '#6E6248', lineHeight: 1.7 }}>
            Saathi identifies emotional and psychological barriers to healthcare-seeking and nudges people toward small, low-pressure actions. It does not diagnose and is not a substitute for professional medical or mental health care. Built in 48 hours for VIT Bhopal DesignVerse 2026.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════ */
export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  useLenis()
  return (
    <>
      <Cursor />
      <AnimatePresence>
        {showIntro && <IntroCurtain key="intro" onDone={() => setShowIntro(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {!showIntro && (
          <motion.div key="main" initial={{ opacity: 0, filter: 'blur(6px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.9, ease }}>
            <Noise />
            <ScrollProgress />
            <Nav />
            <FloatingOrb />
            <BackToTop />
            <main>
              <Hero />
              <Marquee />
              <StatsBand />
              <HowItWorks />
              <BarrierPicker />
              <Chat />
              <Resources />
              <Voices />
              <Tracker />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
