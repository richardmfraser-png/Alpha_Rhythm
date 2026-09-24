window.APP_CONFIG = {
  storageKey: "alphaRhythmV1",
  brand: {
    appName: "Alpha Rhythm",
    organization: "Alpha School of Music",
    tagline: "Practice. Purpose. Progress.",
    shortName: "Alpha Rhythm",
    prototypeNote: "Student self-management prototype"
  },
  program: {
    defaultWeeks: 16,
    completionThreshold: 70,
    defaultTargets: {
      practice: 60,
      reading: 20,
      mindfulness: 10,
      exercise: 30
    }
  },
  habits: [
    { id: "practice", label: "Music practice", unit: "min", help: "Focused individual practice, rehearsal or technique work." },
    { id: "reading", label: "Reading / study", unit: "min", help: "Course reading, musicianship, theory or personal development." },
    { id: "mindfulness", label: "Mindfulness / meditation", unit: "min", help: "Quiet reflection, breathing, meditation or journaling." },
    { id: "exercise", label: "Exercise / movement", unit: "min", help: "Walk, gym, sport, mobility or another physical activity." }
  ]
};
