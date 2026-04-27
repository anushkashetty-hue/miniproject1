import { useState, useEffect } from "react";

/* ─── Question bank ────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    key: "body_type",
    label: "Body Frame",
    subtitle: "Your natural build, regardless of recent weight changes",
    icon: "🧍",
    options: [
      { value: "Thin",   label: "Thin & Light",   desc: "Slender, hard to gain weight, prominent joints",   vata: true },
      { value: "Medium", label: "Medium & Athletic", desc: "Moderate frame, gains/loses weight moderately", pitta: true },
      { value: "Heavy",  label: "Broad & Sturdy",  desc: "Solid build, gains weight easily, strong endurance", kapha: true },
    ],
  },
  {
    key: "skin",
    label: "Skin Nature",
    subtitle: "Your skin's default tendency in normal conditions",
    icon: "🌿",
    options: [
      { value: "Dry",    label: "Dry & Rough",   desc: "Tends toward dryness, fine pores, may crack in cold", vata: true },
      { value: "Normal", label: "Warm & Sensitive", desc: "Prone to redness, freckles, or flushing",         pitta: true },
      { value: "Oily",   label: "Oily & Smooth",  desc: "Naturally moist, large pores, cool to the touch",   kapha: true },
    ],
  },
  {
    key: "digestion",
    label: "Digestive Fire",
    subtitle: "How your body processes food most of the time",
    icon: "🔥",
    options: [
      { value: "Irregular", label: "Variable",  desc: "Hunger comes and goes; bloating, gas, or constipation", vata: true },
      { value: "Strong",    label: "Intense",   desc: "Strong appetite; irritable when meals are late",        pitta: true },
      { value: "Slow",      label: "Steady",    desc: "Can skip meals; feels heavy or sluggish after eating",  kapha: true },
    ],
  },
  {
    key: "sleep",
    label: "Sleep Pattern",
    subtitle: "Your typical sleep experience without interference",
    icon: "🌙",
    options: [
      { value: "Light",    label: "Light & Restless", desc: "Light sleeper, vivid dreams, wakes easily",        vata: true },
      { value: "Moderate", label: "Moderate & Sharp",  desc: "Sleeps well, wakes refreshed, rarely oversleeps", pitta: true },
      { value: "Heavy",    label: "Deep & Long",       desc: "Heavy sleeper, loves long sleep, hard to wake",   kapha: true },
    ],
  },
  {
    key: "energy",
    label: "Energy Pattern",
    subtitle: "How your energy naturally flows through the day",
    icon: "⚡",
    options: [
      { value: "Bursts",    label: "Bursts & Crashes", desc: "Enthusiastic spurts followed by exhaustion", vata: true },
      { value: "Intense",   label: "Focused & Intense", desc: "Sustained drive until the task is done",    pitta: true },
      { value: "Sustained", label: "Steady & Enduring", desc: "Slow to start but remarkably consistent",  kapha: true },
    ],
  },
  {
    key: "mind",
    label: "Mental Style",
    subtitle: "How your mind naturally processes and responds",
    icon: "🧠",
    options: [
      { value: "Creative",   label: "Creative & Scattered", desc: "Rapid thoughts, imaginative, easily distracted", vata: true },
      { value: "Analytical", label: "Focused & Precise",    desc: "Sharp logic, detail-oriented, decisive",          pitta: true },
      { value: "Calm",       label: "Steady & Reflective",  desc: "Methodical, patient, excellent long-term memory", kapha: true },
    ],
  },
  {
    key: "appetite",
    label: "Appetite",
    subtitle: "Your relationship with hunger and eating",
    icon: "🍽️",
    options: [
      { value: "Variable", label: "Irregular",     desc: "Hunger varies greatly day to day",          vata: true },
      { value: "Sharp",    label: "Strong Hunger", desc: "Intense appetite; gets irritable if delayed", pitta: true },
      { value: "Steady",   label: "Low & Stable",  desc: "Can easily skip meals without distress",    kapha: true },
    ],
  },
  {
    key: "emotion",
    label: "Emotional Nature",
    subtitle: "Your natural emotional tendency under stress",
    icon: "💫",
    options: [
      { value: "Anxious",   label: "Anxious & Worrying",  desc: "Tend toward fear, worry, and overwhelm",         vata: true },
      { value: "Irritable", label: "Fiery & Assertive",   desc: "Tend toward frustration, anger, and criticism",  pitta: true },
      { value: "Attached",  label: "Steady & Attached",   desc: "Tend toward attachment, withdrawal, or sadness", kapha: true },
    ],
  },
];

const DOSHA_THEME = {
  Vata:  { color: "#5B6BBF", light: "#EEF0FB", text: "#2D3580", symbol: "🌬️", element: "Air + Ether", bg: "linear-gradient(135deg,#6B7FD4,#A8B4E8)" },
  Pitta: { color: "#C4430A", light: "#FBF0EB", text: "#7A2005", symbol: "🔥", element: "Fire + Water", bg: "linear-gradient(135deg,#D4541A,#F0A060)" },
  Kapha: { color: "#1E7A4A", light: "#EAF7F0", text: "#0F4D2E", symbol: "🌍", element: "Earth + Water", bg: "linear-gradient(135deg,#2E7D52,#6ABF8E)" },
};

export default function DoshaDetector() {
  const [step, setStep] = useState(0); // 0 = intro, 1–8 = questions, 9 = result
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [animKey, setAnimKey] = useState(0);

  const totalQuestions = QUESTIONS.length;
  const isQuestion = step >= 1 && step <= totalQuestions;
  const currentQ = isQuestion ? QUESTIONS[step - 1] : null;
  const progress = isQuestion ? ((step - 1) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (isQuestion) {
      const saved = answers[currentQ.key];
      setSelected(saved || null);
      setAnimKey(k => k + 1);
    }
  }, [step]);

  const handleSelect = (val) => setSelected(val);

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [currentQ.key]: selected };
    setAnswers(newAnswers);
    if (step < totalQuestions) {
      setStep(s => s + 1);
    } else {
      submitDosha(newAnswers);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else setStep(0);
  };

  const submitDosha = async (finalAnswers) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5050/dosha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setStep(totalQuestions + 1);
    } catch (e) {
      // Fallback: local calculation when backend unavailable
      setResult(localFallback(finalAnswers));
      setStep(totalQuestions + 1);
    } finally {
      setLoading(false);
    }
  };

  // Client-side fallback when API is unavailable
  const localFallback = (ans) => {
    const scores = { Vata: 0, Pitta: 0, Kapha: 0 };
    QUESTIONS.forEach(q => {
      const opt = q.options.find(o => o.value === ans[q.key]);
      if (opt?.vata)  scores.Vata++;
      if (opt?.pitta) scores.Pitta++;
      if (opt?.kapha) scores.Kapha++;
    });
    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    const pct = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round((v / total) * 100)]));
    const ranked = Object.entries(pct).sort((a, b) => b[1] - a[1]);
    const dominant = ranked[0][0];
    const secondary = ranked[1][0];
    const theme = DOSHA_THEME[dominant];
    return {
      dominant_dosha: dominant,
      secondary_dosha: secondary,
      is_dual_dosha: (pct[secondary] >= pct[dominant] - 15),
      dual_combination: null,
      percentages: pct,
      element: theme.element,
      symbol: theme.symbol,
      color: theme.color,
      tagline: { Vata: "The Force of Movement & Creativity", Pitta: "The Force of Transformation & Intelligence", Kapha: "The Force of Structure & Endurance" }[dominant],
      description: { Vata: "You are naturally creative, enthusiastic, and quick-thinking — governed by Air and Ether.", Pitta: "You are naturally driven, sharp-minded, and goal-oriented — governed by Fire and Water.", Kapha: "You are naturally calm, compassionate, and enduring — governed by Earth and Water." }[dominant],
      strengths: { Vata: ["Creative & expressive", "Quick to learn", "Enthusiastic energy", "Spiritually inclined"], Pitta: ["Sharp intellect", "Natural leader", "Strong digestion", "Focused & courageous"], Kapha: ["Emotionally stable", "Deep compassion", "Excellent endurance", "Long-term memory"] }[dominant],
      imbalance_signs: { Vata: ["Anxiety & worry", "Dry skin & hair", "Irregular digestion", "Restless sleep"], Pitta: ["Anger & irritability", "Skin inflammation", "Heartburn", "Perfectionism"], Kapha: ["Weight gain", "Congestion", "Lethargy", "Slow digestion"] }[dominant],
      herbs: { Vata: [{name:"Ashwagandha",benefit:"Grounds Vata, reduces anxiety"},{name:"Shatavari",benefit:"Nourishes tissues, calms nerves"},{name:"Brahmi",benefit:"Calms the restless mind"}], Pitta: [{name:"Amalaki",benefit:"Cooling, anti-inflammatory"},{name:"Brahmi",benefit:"Cools the fiery mind"},{name:"Neem",benefit:"Purifies blood, clears skin"}], Kapha: [{name:"Trikatu",benefit:"Kindles digestive fire"},{name:"Ginger",benefit:"Warming, stimulates digestion"},{name:"Guggulu",benefit:"Stimulates metabolism"}] }[dominant],
      lifestyle: { Vata: ["Follow a consistent daily routine","Daily warm oil self-massage","Sleep before 10 PM"], Pitta: ["Avoid overworking","Practice cooling pranayama","Moonlit walks in nature"], Kapha: ["Rise before 6 AM","Daily vigorous exercise","Embrace new experiences"] }[dominant],
      yoga: { Vata: ["Slow Hatha yoga & Yin yoga","Grounding poses: Tadasana, Balasana"], Pitta: ["Moderate, cooling yoga flows","Moon salutations over sun"], Kapha: ["Vigorous, dynamic yoga","Sun salutations at a fast pace"] }[dominant],
      diet: {
        favor: { Vata: ["Warm, oily, nourishing foods","Ghee, sesame oil","Root vegetables"], Pitta: ["Cool, refreshing foods","Coconut water, cucumber","Sweet fruits"], Kapha: ["Light, warm, spiced foods","Ginger, black pepper","Bitter greens"] }[dominant],
        avoid: { Vata: ["Raw, cold foods","Carbonated drinks","Excessive fasting"], Pitta: ["Hot, spicy foods","Alcohol & coffee","Salty snacks"], Kapha: ["Dairy & cheese","Fried foods","Sweets & pastries"] }[dominant],
      },
      seasonal_tip: { Vata: "Winter is Vata season — increase warmth, oil, and routine.", Pitta: "Summer is Pitta season — prioritize cooling, rest, and sweet foods.", Kapha: "Spring is Kapha season — move more, eat lighter, welcome change." }[dominant],
      mantra: { Vata: "I am grounded, stable, and at peace.", Pitta: "I lead with compassion and let go of control.", Kapha: "I embrace change with joy and vitality." }[dominant],
      dual_info: null,
    };
  };

  const reset = () => {
    setStep(0); setAnswers({}); setSelected(null);
    setResult(null); setError(""); setActiveTab("overview");
  };

  const theme = result ? DOSHA_THEME[result.dominant_dosha] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Nunito:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dp-root {
          min-height: 100vh;
          background: #FDFAF5;
          font-family: 'Nunito', sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient background */
        .dp-bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 0% 0%, rgba(139,92,42,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 60% 45% at 100% 100%, rgba(92,46,10,0.06) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* Navbar */
        .dp-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          height: 62px;
          background: rgba(253,250,245,0.94);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #E8D9C5;
          box-shadow: 0 1px 18px rgba(44,24,16,0.05);
        }
        .dp-nav-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 600;
          color: #2C1810;
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .dp-nav-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg,#5C2E0A,#8B5C2A);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .dp-nav-back {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: transparent;
          border: 1px solid #E8D9C5;
          border-radius: 9px;
          color: #8B5C2A;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
        }
        .dp-nav-back:hover { background: #F5EFE6; }

        /* Progress bar */
        .dp-progress-wrap {
          position: sticky;
          top: 62px;
          z-index: 40;
          background: rgba(253,250,245,0.9);
          backdrop-filter: blur(8px);
          padding: 10px 2.5rem;
          border-bottom: 1px solid #EEE5D8;
        }
        .dp-progress-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #B0967A;
          margin-bottom: 7px;
        }
        .dp-progress-bar {
          height: 4px;
          background: #EEE5D8;
          border-radius: 99px;
          overflow: hidden;
        }
        .dp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg,#8B5C2A,#C4A882);
          border-radius: 99px;
          transition: width 0.45s cubic-bezier(0.4,0,0.2,1);
        }

        /* Main area */
        .dp-main {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 3rem 1.5rem 4rem;
          position: relative;
          z-index: 1;
        }
        .dp-content {
          width: 100%;
          max-width: 660px;
        }

        /* ── INTRO ──────────────────────────────────────── */
        .intro-card {
          background: #FFF;
          border: 1px solid #E8D9C5;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(44,24,16,0.08);
          animation: slideUp .55s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(28px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .intro-hero {
          background: linear-gradient(135deg,#3D1C08 0%,#7A3A0A 60%,#A0722A 100%);
          padding: 3rem 2.5rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .intro-hero::after {
          content: '☸';
          position: absolute;
          right: -20px;
          top: -20px;
          font-size: 180px;
          opacity: .04;
          color: #F5DEB3;
          line-height: 1;
          pointer-events: none;
        }
        .intro-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          background: rgba(245,222,179,0.15);
          border: 1px solid rgba(245,222,179,0.3);
          border-radius: 99px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245,222,179,0.8);
          margin-bottom: 14px;
        }
        .intro-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px,5vw,44px);
          font-weight: 500;
          color: #F5DEB3;
          line-height: 1.15;
          letter-spacing: -0.5px;
          margin-bottom: 10px;
        }
        .intro-title em { font-style: italic; color: #FFD77A; }
        .intro-sub {
          font-size: 14px;
          color: rgba(245,222,179,0.65);
          font-weight: 300;
          max-width: 420px;
          margin: 0 auto 1.8rem;
          line-height: 1.65;
        }

        /* Dosha preview pills */
        .intro-pills {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .intro-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid;
        }

        .intro-body {
          padding: 2rem 2.5rem 2.5rem;
        }
        .intro-features {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px;
          margin-bottom: 1.8rem;
        }
        .intro-feat {
          text-align: center;
          padding: 1.2rem .8rem;
          background: #FDFAF5;
          border: 1px solid #E8D9C5;
          border-radius: 14px;
        }
        .intro-feat-icon { font-size: 22px; margin-bottom: 8px; }
        .intro-feat-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 500;
          color: #2C1810;
          margin-bottom: 3px;
        }
        .intro-feat-desc { font-size: 11px; color: #A0722A; line-height: 1.5; }

        .start-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg,#5C2E0A,#8B5C2A);
          color: #FDF8F0;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: transform .18s, box-shadow .18s;
          box-shadow: 0 6px 22px rgba(92,46,10,0.28);
        }
        .start-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(92,46,10,0.35); }
        .start-btn:active { transform: scale(0.98); }

        /* ── QUESTION ────────────────────────────────────── */
        .q-card {
          animation: questionIn .4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes questionIn {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .q-header { margin-bottom: 1.6rem; }
        .q-step-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #F5EFE6;
          border: 1px solid #E8D9C5;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #8B5C2A;
          margin-bottom: 14px;
        }
        .q-icon-row { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
        .q-icon { font-size: 32px; }
        .q-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 500;
          color: #2C1810;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .q-subtitle { font-size: 13.5px; color: #A0722A; margin-top: 4px; line-height: 1.5; }

        /* Options */
        .q-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 2rem; }
        .q-option {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 1.1rem 1.3rem;
          border: 1.5px solid #E8D9C5;
          border-radius: 14px;
          cursor: pointer;
          background: #FFF;
          transition: border-color .2s, background .2s, transform .15s;
          position: relative;
          overflow: hidden;
        }
        .q-option:hover { border-color: #C4A882; background: #FDFAF5; transform: translateX(3px); }
        .q-option.selected { border-color: #8B5C2A; background: #FAF4EC; }
        .q-option.selected::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: linear-gradient(180deg,#5C2E0A,#8B5C2A);
          border-radius: 4px 0 0 4px;
        }
        .q-opt-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #C4A882;
          flex-shrink: 0;
          margin-top: 2px;
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .q-option.selected .q-opt-radio {
          border-color: #5C2E0A;
          background: #5C2E0A;
          box-shadow: 0 0 0 3px rgba(92,46,10,0.15);
        }
        .q-opt-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FFF;
          opacity: 0;
          transition: opacity .15s;
        }
        .q-option.selected .q-opt-dot { opacity: 1; }
        .q-opt-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 500;
          color: #2C1810;
          margin-bottom: 3px;
        }
        .q-opt-desc { font-size: 12.5px; color: #A0722A; line-height: 1.5; }

        /* Question footer */
        .q-footer { display: flex; gap: 12px; }
        .q-back-btn {
          padding: 13px 22px;
          background: transparent;
          border: 1.5px solid #E8D9C5;
          border-radius: 12px;
          color: #8B5C2A;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
        }
        .q-back-btn:hover { background: #F5EFE6; }
        .q-next-btn {
          flex: 1;
          padding: 13px;
          background: linear-gradient(135deg,#5C2E0A,#8B5C2A);
          color: #FDF8F0;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all .18s;
          box-shadow: 0 4px 18px rgba(92,46,10,0.22);
          opacity: 1;
          letter-spacing: 0.3px;
        }
        .q-next-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
        .q-next-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(92,46,10,0.3); }

        /* ── LOADING ─────────────────────────────────────── */
        .loading-wrap {
          text-align: center;
          padding: 4rem 2rem;
          animation: slideUp .4s ease both;
        }
        .loading-orb {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg,#5C2E0A,#8B5C2A);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 1.5rem;
          animation: pulse 1.5s ease infinite;
          box-shadow: 0 0 0 0 rgba(92,46,10,0.4);
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(92,46,10,0.3); transform: scale(1); }
          50%      { box-shadow: 0 0 0 20px rgba(92,46,10,0); transform: scale(1.04); }
        }
        .loading-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 500;
          color: #2C1810;
          margin-bottom: 8px;
        }
        .loading-sub { font-size: 14px; color: #A0722A; }

        /* ── RESULT ──────────────────────────────────────── */
        .result-card {
          background: #FFF;
          border: 1px solid #E8D9C5;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(44,24,16,0.1);
          animation: slideUp .55s cubic-bezier(.22,1,.36,1) both;
        }

        /* Hero banner */
        .result-hero {
          padding: 2.5rem 2.5rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .result-hero::after {
          content: attr(data-symbol);
          position: absolute;
          right: -30px;
          bottom: -20px;
          font-size: 200px;
          opacity: .06;
          line-height: 1;
          pointer-events: none;
        }
        .result-label {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 12px;
        }
        .result-dosha-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px,7vw,64px);
          font-weight: 600;
          color: #FFF;
          line-height: 1;
          letter-spacing: -1px;
          margin-bottom: 6px;
        }
        .result-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-style: italic;
          color: rgba(255,255,255,0.75);
          margin-bottom: 1.6rem;
        }

        /* Percentage meters */
        .dosha-meters {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 1.4rem;
        }
        .meter {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .meter-ring {
          width: 64px;
          height: 64px;
          position: relative;
        }
        .meter-ring svg { transform: rotate(-90deg); }
        .meter-ring-bg { fill: none; stroke: rgba(255,255,255,0.15); }
        .meter-ring-fill { fill: none; stroke: rgba(255,255,255,0.85); stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
        .meter-label {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .meter-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: #FFF;
        }

        .dual-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }

        /* Tabs */
        .result-tabs {
          display: flex;
          border-bottom: 1px solid #E8D9C5;
          padding: 0 1.5rem;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .result-tabs::-webkit-scrollbar { display: none; }
        .result-tab {
          padding: 1rem 14px;
          border: none;
          background: transparent;
          font-family: 'Nunito', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          color: #B0967A;
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          white-space: nowrap;
          transition: all .2s;
          letter-spacing: 0.3px;
        }
        .result-tab:hover { color: #6B4A2A; }
        .result-tab.active { color: #5C2E0A; border-bottom-color: #5C2E0A; }

        /* Tab body */
        .result-body { padding: 2rem 2.5rem; }
        .result-section { margin-bottom: 2rem; }
        .result-section:last-child { margin-bottom: 0; }
        .result-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #8B5C2A;
          margin-bottom: 1rem;
          padding-bottom: 8px;
          border-bottom: 1px solid #F0E6D6;
        }
        .result-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          color: #3D2010;
          line-height: 1.8;
          font-style: italic;
        }

        /* Quality tags */
        .quality-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .quality-tag {
          padding: 5px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          border: 1.5px solid;
        }

        /* Lists */
        .result-list { display: flex; flex-direction: column; gap: 8px; }
        .result-list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: #4A2C14;
          line-height: 1.55;
          padding: 8px 12px;
          background: #FDFAF5;
          border-radius: 10px;
          border: 1px solid #F0E6D6;
        }
        .result-list-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }

        /* Herb cards */
        .herb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; }
        .herb-card {
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #E8D9C5;
          background: #FDFAF5;
          transition: border-color .2s, transform .2s;
        }
        .herb-card:hover { border-color: #C4A882; transform: translateY(-2px); }
        .herb-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 500;
          color: #2C1810;
          margin-bottom: 4px;
        }
        .herb-benefit { font-size: 12px; color: #8B6A4A; line-height: 1.5; }

        /* Diet panels */
        .diet-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .diet-panel { border-radius: 14px; padding: 1.2rem; }
        .diet-panel-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .diet-item {
          font-size: 13px;
          line-height: 1.6;
          padding: 5px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          color: #3D2010;
        }
        .diet-item:last-child { border-bottom: none; }

        /* Mantra */
        .mantra-box {
          text-align: center;
          padding: 1.8rem;
          border-radius: 16px;
          margin-top: 1rem;
        }
        .mantra-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-style: italic;
          font-weight: 500;
          line-height: 1.6;
          color: #2C1810;
        }
        .mantra-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #B0967A;
          margin-bottom: 10px;
        }

        /* Dual dosha note */
        .dual-note {
          border-radius: 14px;
          padding: 1.2rem 1.4rem;
          margin-bottom: 1.5rem;
          border: 1.5px dashed;
        }
        .dual-note-title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .dual-note-text { font-size: 13px; color: #4A2C14; line-height: 1.6; }

        /* Reset button */
        .reset-btn {
          width: 100%;
          padding: 13px;
          background: #F5EFE6;
          border: 1.5px solid #E8D9C5;
          border-radius: 12px;
          color: #6B4A2A;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
          margin-top: 1.5rem;
        }
        .reset-btn:hover { background: #EEE0CA; border-color: #C4A882; }

        /* Seasonal tip */
        .season-tip {
          background: linear-gradient(135deg,#3D1C08,#6B3D1A);
          border-radius: 14px;
          padding: 1.4rem;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .season-tip-icon { font-size: 22px; flex-shrink: 0; }
        .season-tip-text { font-size: 14px; color: rgba(253,248,240,0.85); line-height: 1.6; font-style: italic; }

        @media (max-width: 600px) {
          .dp-nav { padding: 0 1rem; }
          .dp-progress-wrap { padding: 8px 1rem; }
          .dp-main { padding: 1.5rem 1rem 3rem; }
          .intro-body, .result-body { padding: 1.5rem; }
          .intro-hero { padding: 2rem 1.5rem 1.5rem; }
          .result-hero { padding: 2rem 1.5rem 1.5rem; }
          .intro-features { grid-template-columns: 1fr; }
          .diet-cols { grid-template-columns: 1fr; }
          .result-tabs { padding: 0 0.5rem; }
        }
      `}</style>

      <div className="dp-root">
        <div className="dp-bg" />

        {/* Navbar */}
        <nav className="dp-nav">
          <div className="dp-nav-brand">
            <div className="dp-nav-icon">🌿</div>
            Ayurveda · Dosha Detector
          </div>
          {step > 0 && !loading && (
            <button className="dp-nav-back" onClick={reset}>
              ← Start Over
            </button>
          )}
        </nav>

        {/* Progress (questions only) */}
        {isQuestion && (
          <div className="dp-progress-wrap">
            <div className="dp-progress-meta">
              <span>Question {step} of {totalQuestions}</span>
              <span>{Math.round((step / totalQuestions) * 100)}% complete</span>
            </div>
            <div className="dp-progress-bar">
              <div className="dp-progress-fill" style={{ width: `${(step / totalQuestions) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="dp-main">
          <div className="dp-content">

            {/* ── INTRO ── */}
            {step === 0 && (
              <div className="intro-card">
                <div className="intro-hero">
                  <div className="intro-badge">✦ &nbsp;Ayurvedic Constitution Test</div>
                  <h1 className="intro-title">Discover your<br /><em>Prakriti</em></h1>
                  <p className="intro-sub">
                    Your Dosha is your unique physiological and psychological blueprint — inherited at birth and refined through life. Know it to thrive.
                  </p>
                  <div className="intro-pills">
                    {Object.entries(DOSHA_THEME).map(([name, t]) => (
                      <div key={name} className="intro-pill"
                        style={{ background: `${t.color}22`, borderColor: `${t.color}55`, color: t.color === "#5B6BBF" ? "#EEF0FB" : t.color === "#C4430A" ? "#FBF0EB" : "#EAF7F0", background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}>
                        {t.symbol} {name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="intro-body">
                  <div className="intro-features">
                    <div className="intro-feat">
                      <div className="intro-feat-icon">🤖</div>
                      <div className="intro-feat-label">ML-Powered</div>
                      <div className="intro-feat-desc">Random Forest model trained on Ayurvedic data</div>
                    </div>
                    <div className="intro-feat">
                      <div className="intro-feat-icon">📖</div>
                      <div className="intro-feat-label">Classically Rooted</div>
                      <div className="intro-feat-desc">Charaka Samhita trait weights validated</div>
                    </div>
                    <div className="intro-feat">
                      <div className="intro-feat-icon">🌿</div>
                      <div className="intro-feat-label">Rich Guidance</div>
                      <div className="intro-feat-desc">Diet, herbs, lifestyle & yoga by dosha</div>
                    </div>
                  </div>
                  <button className="start-btn" onClick={() => setStep(1)}>
                    Begin the Assessment &nbsp;→
                  </button>
                </div>
              </div>
            )}

            {/* ── QUESTION ── */}
            {isQuestion && currentQ && (
              <div className="q-card" key={animKey}>
                <div className="q-header">
                  <div className="q-step-badge">
                    Step {step} of {totalQuestions} &nbsp;·&nbsp; {currentQ.icon} {currentQ.label}
                  </div>
                  <div className="q-icon-row">
                    <span className="q-icon">{currentQ.icon}</span>
                    <h2 className="q-title">{currentQ.label}</h2>
                  </div>
                  <p className="q-subtitle">{currentQ.subtitle}</p>
                </div>

                <div className="q-options">
                  {currentQ.options.map(opt => (
                    <div
                      key={opt.value}
                      className={`q-option${selected === opt.value ? " selected" : ""}`}
                      onClick={() => handleSelect(opt.value)}
                    >
                      <div className="q-opt-radio">
                        <div className="q-opt-dot" />
                      </div>
                      <div>
                        <div className="q-opt-label">{opt.label}</div>
                        <div className="q-opt-desc">{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="q-footer">
                  <button className="q-back-btn" onClick={handleBack}>← Back</button>
                  <button
                    className="q-next-btn"
                    onClick={handleNext}
                    disabled={!selected}
                  >
                    {step === totalQuestions ? "✨ Reveal My Dosha" : "Continue →"}
                  </button>
                </div>
              </div>
            )}

            {/* ── LOADING ── */}
            {loading && (
              <div className="loading-wrap">
                <div className="loading-orb">🌿</div>
                <div className="loading-title">Analysing your constitution…</div>
                <p className="loading-sub">Consulting the Charaka Samhita and ML model</p>
              </div>
            )}

            {/* ── RESULT ── */}
            {!loading && result && step === totalQuestions + 1 && (() => {
              const t = DOSHA_THEME[result.dominant_dosha];
              const r = result;
              const circumference = 2 * Math.PI * 26;
              return (
                <div className="result-card">
                  {/* Hero */}
                  <div className="result-hero" data-symbol={t.symbol} style={{ background: t.bg }}>
                    <div className="result-label">Your Prakriti — Constitution Type</div>
                    <div className="result-dosha-name">{r.dominant_dosha}</div>
                    <div className="result-tagline">{r.tagline}</div>

                    {/* Meters */}
                    <div className="dosha-meters">
                      {["Vata","Pitta","Kapha"].map(d => {
                        const pct = r.percentages[d] || 0;
                        const offset = circumference - (pct / 100) * circumference;
                        return (
                          <div key={d} className="meter">
                            <div className="meter-ring">
                              <svg width="64" height="64" viewBox="0 0 64 64">
                                <circle className="meter-ring-bg" cx="32" cy="32" r="26" strokeWidth="4" />
                                <circle
                                  className="meter-ring-fill"
                                  cx="32" cy="32" r="26" strokeWidth="4"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={offset}
                                />
                              </svg>
                              <div className="meter-value">{pct}%</div>
                            </div>
                            <div className="meter-label">{d}</div>
                          </div>
                        );
                      })}
                    </div>

                    {r.is_dual_dosha && r.secondary_dosha && (
                      <div className="dual-badge">
                        ✦ Dual constitution: {r.dominant_dosha}-{r.secondary_dosha}
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="result-tabs">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "diet",     label: "Diet & Food" },
                      { id: "herbs",    label: "Herbs" },
                      { id: "lifestyle",label: "Lifestyle" },
                      { id: "yoga",     label: "Yoga" },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        className={`result-tab${activeTab === tab.id ? " active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Body */}
                  <div className="result-body">

                    {activeTab === "overview" && (
                      <>
                        {r.dual_info && (
                          <div className="dual-note" style={{ background: `${t.color}10`, borderColor: `${t.color}40` }}>
                            <div className="dual-note-title" style={{ color: t.color }}>
                              ✦ Dual Dosha: {r.dominant_dosha}-{r.secondary_dosha}
                            </div>
                            <div className="dual-note-text">{r.dual_info.description}</div>
                            <div className="dual-note-text" style={{ marginTop: 6, fontWeight: 600 }}>
                              Key Tip: {r.dual_info.key_tip}
                            </div>
                          </div>
                        )}

                        <div className="result-section">
                          <div className="result-section-title">About Your Constitution</div>
                          <p className="result-desc">{r.description}</p>
                        </div>

                        <div className="result-section">
                          <div className="result-section-title">Core Qualities</div>
                          <div className="quality-tags">
                            {(r.qualities || []).map((q,i) => (
                              <span key={i} className="quality-tag"
                                style={{ background: `${t.color}15`, borderColor: `${t.color}40`, color: t.text }}>
                                {q}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="result-section">
                          <div className="result-section-title">Your Strengths</div>
                          <div className="result-list">
                            {(r.strengths || []).map((s,i) => (
                              <div key={i} className="result-list-item">
                                <div className="result-list-dot" style={{ background: t.color }} />
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="result-section">
                          <div className="result-section-title">Signs of Imbalance</div>
                          <div className="result-list">
                            {(r.imbalance_signs || []).map((s,i) => (
                              <div key={i} className="result-list-item" style={{ background: "#FFF5F0", borderColor: "#F4BBAA" }}>
                                <div className="result-list-dot" style={{ background: "#C0392B" }} />
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mantra-box" style={{ background: `${t.color}12`, border: `1px solid ${t.color}30` }}>
                          <div className="mantra-label">Your Mantra</div>
                          <div className="mantra-text" style={{ color: t.text }}>"{r.mantra}"</div>
                        </div>
                      </>
                    )}

                    {activeTab === "diet" && (
                      <>
                        <div className="diet-cols">
                          <div className="diet-panel" style={{ background: "#EAF7F0", border: "1px solid #9FD9C0" }}>
                            <div className="diet-panel-title" style={{ color: "#1E7A4A" }}>
                              ✓ Favor
                            </div>
                            {(r.diet?.favor || []).map((item, i) => (
                              <div key={i} className="diet-item">{item}</div>
                            ))}
                          </div>
                          <div className="diet-panel" style={{ background: "#FFF0F0", border: "1px solid #F4BBBB" }}>
                            <div className="diet-panel-title" style={{ color: "#C0392B" }}>
                              ✗ Avoid
                            </div>
                            {(r.diet?.avoid || []).map((item, i) => (
                              <div key={i} className="diet-item">{item}</div>
                            ))}
                          </div>
                        </div>

                        <div className="season-tip" style={{ marginTop: "1.5rem" }}>
                          <span className="season-tip-icon">🌿</span>
                          <span className="season-tip-text">{r.seasonal_tip}</span>
                        </div>
                      </>
                    )}

                    {activeTab === "herbs" && (
                      <div className="herb-grid">
                        {(r.herbs || []).map((h, i) => (
                          <div key={i} className="herb-card" style={{ borderColor: `${t.color}30` }}>
                            <div className="herb-name" style={{ color: t.text }}>🌱 {h.name}</div>
                            <div className="herb-benefit">{h.benefit}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "lifestyle" && (
                      <div className="result-list">
                        {(r.lifestyle || []).map((l, i) => (
                          <div key={i} className="result-list-item">
                            <div className="result-list-dot" style={{ background: t.color }} />
                            {l}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "yoga" && (
                      <>
                        <div className="result-list">
                          {(r.yoga || []).map((y, i) => (
                            <div key={i} className="result-list-item">
                              <div className="result-list-dot" style={{ background: t.color }} />
                              {y}
                            </div>
                          ))}
                        </div>
                        <div className="season-tip" style={{ marginTop: "1.5rem" }}>
                          <span className="season-tip-icon">🧘</span>
                          <span className="season-tip-text">
                            Consistency is more important than duration. Even 20 minutes daily of the right yoga transforms your doshic balance.
                          </span>
                        </div>
                      </>
                    )}

                    <button className="reset-btn" onClick={reset}>
                      🔄 &nbsp;Retake the Assessment
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </div>
    </>
  );
}