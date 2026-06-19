export const barriers = [
  {
    id: 'fear',
    label: 'Fear of diagnosis',
    title: 'The fear is doing its job — just not for you',
    ack: "Not knowing can feel safer than knowing. That's a normal way for a brain to protect itself in the short term — but it doesn't make the worry go away, it just postpones it.",
    step: 'Tiny next step: try a 5-minute anonymous symptom check before you commit to anything bigger. You can stop after.',
    res: 'Free teleconsults are available via government platforms like eSanjeevani — no clinic visit required.',
  },
  {
    id: 'stigma',
    label: 'Social stigma',
    title: "Stigma lives in your neighbourhood, not in your blood test",
    ack: "What people might say isn't really about your health — it's about their comfort. Your health doesn't owe anyone that comfort.",
    step: 'Tiny next step: look for a remote-first or phone consult, so no one in your building has to know you went anywhere.',
    res: 'Tele-MANAS (14416) and most teleconsult apps never require you to be seen walking in.',
  },
  {
    id: 'masculinity',
    label: 'Masculinity norms',
    title: '"I\'ll be fine" was never proof of strength',
    ack: "Somewhere along the way, brushing it off became the only acceptable answer. Real strength is acting on a problem before it controls you — not pretending it isn't there.",
    step: 'Tiny next step: tell one person, not a doctor — just one person you trust. Saying it out loud is usually the hardest 10% of the whole problem.',
    res: "For context: roughly 7 in 10 callers to India's KIRAN mental health helpline are men. You'd be in good company.",
  },
  {
    id: 'cost',
    label: 'Cost concerns',
    title: 'Worrying about the bill before the diagnosis is exhausting',
    ack: "That worry is completely rational — and waiting on it usually makes the eventual bill bigger, not smaller.",
    step: "Tiny next step: check if you already qualify for free treatment before assuming you can't afford it.",
    res: 'Ayushman Bharat (PM-JAY), 14555 — covers treatment at empanelled hospitals at zero cost for eligible families.',
  },
  {
    id: 'time',
    label: 'Lack of time',
    title: "This isn't denial. It's triage, and health lost today's round",
    ack: "You're juggling twelve things and health didn't win the slot today. That's a scheduling problem, not a character flaw.",
    step: 'Tiny next step: block 10 minutes, not a day. A phone triage call fits inside a lunch break.',
    res: 'National Health Helpline, 104 — general advice without leaving your desk.',
  },
  {
    id: 'denial',
    label: 'Denial and uncertainty',
    title: '"Probably nothing" is doing a lot of heavy lifting',
    ack: 'Maybe it is nothing. The only way to actually stop wondering is to check, once, instead of carrying the question around.',
    step: "Tiny next step: set a 48-hour rule with yourself. If it's still there in 2 days, you call — write the date down now.",
    res: 'A 2-day deadline turns an open-ended worry into a closed one.',
  },
]

export const quickPrompts = [
  "I think something's wrong but I'm scared to check",
  "I don't want anyone to know",
  "I can't afford a doctor right now",
  "I keep telling myself it's fine",
]

export const CRISIS_WORDS = [
  'suicide', 'kill myself', 'end my life', 'end it all', 'dont want to live',
  "don't want to live", 'no reason to live', 'self harm', 'self-harm',
  'harm myself', 'hurt myself', 'better off dead', 'cant go on', "can't go on",
]

export const CATEGORIES = [
  { id: 'crisis', words: CRISIS_WORDS },
  { id: 'fear', words: ['scared', 'afraid', 'fear', 'dont want to know', "don't want to know", 'worried it', 'what if it', 'diagnosis', 'test result'] },
  { id: 'stigma', words: ['what will people say', 'log kya kahenge', 'judge', 'judged', 'neighbour', 'neighbor', 'someone sees', 'reputation', 'shame', 'embarrass'] },
  { id: 'masculinity', words: ['man up', "i'll be fine", 'ill be fine', 'men dont', "men don't", 'weak', 'be strong', 'handle it myself', 'crying'] },
  { id: 'cost', words: ['afford', 'money', 'cost', 'expensive', 'bill', 'cant pay', "can't pay", 'no insurance', 'cheap'] },
  { id: 'time', words: ['no time', 'too busy', "don't have time", 'dont have time', 'work', 'schedule', 'day off'] },
  { id: 'denial', words: ['probably nothing', "it's fine", 'its fine', 'not that serious', 'overreacting', 'just stress', 'sure its ok', "sure it's ok"] },
  { id: 'mental', words: ['anxious', 'anxiety', 'depressed', 'depression', 'panic', 'overwhelmed', 'cant sleep', "can't sleep", 'stressed'] },
]

export const RESPONSES = {
  crisis: [
    "I hear how heavy this is — and I want you talking to a real person right now, not a screen. Please call **Tele-MANAS at 14416** or **KIRAN at 1800-599-0019** — both are free, run by trained counsellors, available right now in many languages. If you're in immediate danger, call **108**. You don't have to explain yourself first. Just dial.",
  ],
  fear: [
    "That hesitation makes sense — not knowing can feel safer than knowing, even though it usually isn't. You don't have to commit to a diagnosis today. A 5-minute anonymous symptom check is a much smaller ask than 'go to the hospital.' Want me to point you to a no-pressure first step?",
    "Fear of the answer is one of the most common reasons people wait — you're not being dramatic. What if the goal today isn't 'get diagnosed' but just 'ask one question to one helpline'? That's a much smaller door to walk through.",
  ],
  stigma: [
    "What people might say is about their comfort, not your health. A lot of people solve this exact worry with a remote or phone consult — nobody has to see you walk anywhere. Would that change things for you?",
    "Stigma is loud, but it's also local — it doesn't follow you onto a phone call. Tele-MANAS (14416) talks to people in total privacy, in their own language, every single day.",
  ],
  masculinity: [
    "Brushing it off was never proof of strength — acting on it before it gets worse is. For what it's worth, roughly 7 in 10 callers to India's KIRAN helpline are men. You'd be in good company, not an exception.",
    "You don't have to call yourself 'sick' to make a call. Try telling just one person you trust — not a doctor yet. Saying it out loud tends to be the hardest 10% of this whole thing.",
  ],
  cost: [
    "Worrying about the bill before you even know what's wrong is exhausting, and it's a rational worry — but waiting usually makes the eventual cost bigger, not smaller. Check Ayushman Bharat (PM-JAY) at 14555 before assuming you can't afford care — many families already qualify and don't know it.",
    "Cost is a real barrier, not an excuse. One call to 14555 can tell you in minutes whether treatment is already free for your family under PM-JAY.",
  ],
  time: [
    "This sounds less like avoidance and more like triage — health just hasn't won a time slot yet. A phone helpline call is 10 minutes, not a day off. The National Health Helpline (104) is built for exactly that.",
    "You don't need a free day. You need a free 10 minutes. Could you find that today, even just to ask one question?",
  ],
  denial: [
    "'Probably nothing' is doing a lot of heavy lifting right now. Here's a trick: give yourself a 48-hour rule. If it's still there in two days, you call — no more re-deciding every morning.",
    "Maybe it really is nothing. The only way to actually stop wondering is to check once — carrying the question around is its own kind of tiring.",
  ],
  mental: [
    "That sounds like a lot to be carrying alone. Tele-MANAS (14416) is a free, confidential government helpline, available right now, in most Indian languages — you don't need a 'serious enough' reason to call.",
    "Feeling overwhelmed is a real, valid reason to reach out — not a sign you're being too much. A counsellor at 14416 is trained exactly for this conversation.",
  ],
  fallback: [
    "Thank you for putting that into words — that's often the hardest part. Can you tell me a bit more about what's making this feel hard to act on: fear, cost, time, or something else?",
    "I'm listening. If you had to name the one thing actually stopping you from making a call today, what would it be?",
  ],
}

export function classify(text) {
  const t = text.toLowerCase()
  for (const cat of CATEGORIES) {
    if (cat.words.some((w) => t.includes(w))) return cat.id
  }
  return 'fallback'
}

export const resourceGroups = [
  {
    cat: 'Mental health',
    rows: [
      { name: 'Tele-MANAS', desc: '24/7 govt helpline, 20+ languages, free counselling', num: '14416', tel: '14416' },
      { name: 'KIRAN', desc: '24/7 mental health rehab helpline, 13 languages, anonymous', num: '1800-599-0019', tel: '18005990019' },
      { name: 'iCall (TISS)', desc: 'Free psychosocial counselling helpline', num: '9152987821', tel: '9152987821' },
    ],
  },
  {
    cat: 'Cost & coverage',
    rows: [
      { name: 'Ayushman Bharat (PM-JAY)', desc: 'Check free treatment eligibility at empanelled hospitals', num: '14555', tel: '14555' },
      { name: 'PM-JAY (alt line)', desc: 'Toll-free, same scheme', num: '1800-111-565', tel: '18001115651' },
    ],
  },
  {
    cat: 'General & emergency',
    rows: [
      { name: 'National Health Helpline', desc: 'General medical advice, any time', num: '104', tel: '104' },
      { name: 'Ambulance', desc: 'Medical emergencies', num: '108', tel: '108' },
      { name: "Women's Helpline", desc: 'Safety & health support', num: '181', tel: '181' },
    ],
  },
]

export const voices = [
  {
    quote: "I told myself a 34-year-old man doesn't go to the doctor for chest tightness. My brother finally just booked the call for me.",
    tag: 'Masculinity norms',
    name: '"Vikram", composite story',
    foot: 'Acted after: one person nudged, not a symptom getting worse',
  },
  {
    quote: "I didn't want my building's WhatsApp group to know I was seeing a counsellor. A phone helpline meant no waiting room to be seen in.",
    tag: 'Social stigma',
    name: '"Anjali", composite story',
    foot: 'Acted after: finding a remote-first option',
  },
  {
    quote: "I assumed the test alone would cost a month's salary. Turns out my family already qualified under PM-JAY. Nobody had told us.",
    tag: 'Cost concerns',
    name: '"Ramesh", composite story',
    foot: 'Acted after: one phone call to check eligibility',
  },
]

export const tasks = [
  'Saved a helpline number to my phone',
  "Told one person what I'm dealing with",
  'Looked up a free or remote consult option',
  'Set my 48-hour decide-by date',
]
