import { useState, useEffect } from "react";

/* ─── Inline theme constants ───────────────────────────────────────────── */
const DOSHA_THEME = {
  Vata:  { colour: "#5B6BBF", light: "#EEF0FB", text: "#2D3580", dark: "#1A2060", bg: "linear-gradient(135deg,#6B7FD4 0%,#A8B4E8 100%)", sym: "🌬️", el: "Air + Ether", agni: "Vishama Agni" },
  Pitta: { colour: "#C4430A", light: "#FBF0EB", text: "#7A2005", dark: "#4A1003", bg: "linear-gradient(135deg,#D4541A 0%,#F0A060 100%)", sym: "🔥", el: "Fire + Water", agni: "Tikshna Agni" },
  Kapha: { colour: "#1E7A4A", light: "#EAF7F0", text: "#0F4D2E", dark: "#082E1C", bg: "linear-gradient(135deg,#2E7D52 0%,#6ABF8E 100%)", sym: "🌍", el: "Earth + Water", agni: "Manda Agni" },
};

const GOALS = [
  { id: "Balance",   label: "Balance",    icon: "⚖️", desc: "Restore doshic harmony" },
  { id: "Detox",     label: "Detox",      icon: "🫧", desc: "Cleanse Ama (toxins)" },
  { id: "Energy",    label: "Energy",     icon: "⚡", desc: "Build Ojas & vitality" },
  { id: "Weight",    label: "Weight",     icon: "🌿", desc: "Healthy weight management" },
  { id: "Immunity",  label: "Immunity",   icon: "🛡️", desc: "Strengthen natural defenses" },
];

const LIFESTYLES = [
  { id: "Vegetarian",     label: "Vegetarian",      icon: "🥗" },
  { id: "Vegan",          label: "Vegan",            icon: "🌱" },
  { id: "Non-vegetarian", label: "Non-Vegetarian",   icon: "🍳" },
];

const SEASONS = [
  { id: "Spring", label: "Spring", icon: "🌸" },
  { id: "Summer", label: "Summer", icon: "☀️" },
  { id: "Autumn", label: "Autumn", icon: "🍂" },
  { id: "Winter", label: "Winter", icon: "❄️" },
];

const MEAL_ICONS = {
  breakfast: "🌅",
  mid_morning: "🍵",
  lunch: "☀️",
  evening: "🌤️",
  dinner: "🌙",
};

const MEAL_LABELS = {
  breakfast: "Breakfast",
  mid_morning: "Mid-Morning",
  lunch: "Lunch",
  evening: "Evening Snack",
  dinner: "Dinner",
};

/* ─── Local diet knowledge (fallback when API unavailable) ─────────────── */
const LOCAL_PLANS = {
  Vata: {
    dosha: "Vata", element: "Air + Ether",
    agni_type: "Vishama Agni (Variable digestive fire)",
    agni_desc: "Vata's digestion is irregular. Regularity and warmth are medicine.",
    principle: "Warm, unctuous, nourishing, and grounding. Favour sweet, sour, and salty tastes.",
    meal_timing: { wake:"6:00–7:00 AM", breakfast:"7:30–8:30 AM (NEVER skip)", mid_morning:"10:30 AM (light snack)", lunch:"12:00–1:00 PM (main meal)", evening:"4:00–5:00 PM (herbal tea)", dinner:"6:30–7:30 PM (warm, light)", sleep:"10:00–10:30 PM" },
    meals: {
      breakfast: ["Warm spiced oatmeal with ghee, honey, and cardamom","Soft rice porridge (kanji) with sesame oil","Stewed apples or pears with cinnamon and dates","Soaked almonds (8–10) + warm turmeric milk"],
      mid_morning: ["Warm ginger-cardamom tea with a date","Small banana with almond butter","Warm milk with ashwagandha and honey"],
      lunch: ["Kitchari (mung dal + basmati rice) with ghee","Warm vegetable soup with root vegetables + roti","Dal tadka with basmati rice + sautéed beets","Stuffed paratha with paneer + raita"],
      evening: ["Warm ashwagandha milk or CCF tea","Soaked walnuts (4–5) with warm water","Warm herbal soup — thin broth with ginger"],
      dinner: ["Light mung dal soup with soft roti","Warm vegetable stew","Kitchari with sautéed zucchini or pumpkin"],
    },
    weekly_theme: ["Monday: Kitchari day — full day to reset digestion","Tuesday: Root vegetable focus — sweet potato, beet, carrot","Wednesday: Protein day — dal, paneer","Thursday: Grain day — oats, rice, wheat roti","Friday: Sweet taste day — dates, figs, naturally sweet foods","Saturday: Warm soup day — lentil or vegetable broth","Sunday: Lighter day — fruit in morning, kitchari for meals"],
    spice_blends: [
      { name:"Vata Churna", recipe:"Cumin, coriander, fennel, ginger, cinnamon, cardamom, hing", use:"Add to any cooked dish. 1 tsp per serving." },
      { name:"Trikatu", recipe:"Ginger, black pepper, long pepper (equal parts)", use:"½ tsp with warm water before meals." },
      { name:"CCF Tea", recipe:"Cumin, coriander, fennel seeds (equal parts)", use:"Boil 1 tsp in 2 cups water for 5 min. Drink warm." },
    ],
    favour: { tastes:["Sweet","Sour","Salty"], grains:["Basmati rice","Oats (cooked)","Wheat"], vegetables:["Sweet potato","Beets","Carrots","Zucchini","Pumpkin"], fruits:["Avocado","Bananas","Mangoes","Dates","Figs"], oils:["Sesame oil","Ghee","Olive oil"], drinks:["Warm water","Ginger tea","Almond milk","CCF tea"] },
    avoid: { tastes:["Bitter (excess)","Pungent (excess)","Astringent"], qualities:["Cold","Dry","Light","Rough"], other:["Raw salads","Popcorn","Carbonated drinks","Skipping meals"] },
    eating_rules: ["Eat at the SAME time every day — routine is medicine","Always eat warm or room-temperature food","Add ghee or oil to every meal — fats ground Vata","Sit down to eat — never eat standing","Do not eat when anxious or distracted","Finish eating by 7:30 PM"],
    supplements: [
      {name:"Ashwagandha", dose:"500mg with warm milk at bedtime", benefit:"Grounds Vata, builds Ojas"},
      {name:"Shatavari", dose:"1 tsp with warm milk twice daily", benefit:"Nourishes tissues, calms nerves"},
      {name:"Triphala", dose:"½ tsp with warm water before bed", benefit:"Regulates digestion overnight"},
    ],
    fasting: { recommended:"12–14 hour overnight fast only", best_day:"Sunday — kitchari mono-diet", avoid:"Multi-day fasting or skipping meals" },
    viruddha_ahara: ["Milk + fruit (creates toxins)","Honey + ghee in equal quantities","Fish + dairy","Cold water after hot food","Fruit + cooked food in same meal"],
    sample_day: { "06:30":"Warm water with lemon. Tongue scraping.","07:30":"Warm spiced oatmeal with ghee and cardamom.","10:30":"CCF tea + 4 soaked almonds.","12:30":"Kitchari with ghee and roasted root vegetables.","16:00":"Ashwagandha golden milk.","19:00":"Light mung soup or khichdi.","21:30":"Warm milk with nutmeg or triphala." },
    seasonal_adjustments: { Summer:"Add cooling foods but keep warm. Reduce pungent spices. Stay hydrated.", Autumn:"Increase oils and fats. More sesame oil, more ghee.", Winter:"Eat heartily — soups, stews. Ashwagandha milk nightly.", Spring:"Introduce lighter foods. Reduce oil. Add bitter greens." },
  },
  Pitta: {
    dosha: "Pitta", element: "Fire + Water",
    agni_type: "Tikshna Agni (Sharp, intense digestive fire)",
    agni_desc: "Pitta digests powerfully but overheats easily. Cool, moderate, and prevent inflammation.",
    principle: "Cool, slightly oily, refreshing, and moderate. Favour sweet, bitter, and astringent tastes.",
    meal_timing: { wake:"5:30–6:30 AM", breakfast:"7:00–8:00 AM (moderate)", mid_morning:"10:00 AM (if intense hunger)", lunch:"12:00–1:00 PM (LARGEST meal)", evening:"4:00–5:00 PM (cooling tea)", dinner:"6:00–7:00 PM (light and early)", sleep:"10:00–11:00 PM" },
    meals: {
      breakfast: ["Fresh sweet fruits — grapes, melons, pears (room temperature)","Barley porridge with coconut milk, dates, and cardamom","Coconut-banana smoothie (room temp, not chilled)","Soaked raisins or dates with sweet lassi"],
      mid_morning: ["Coconut water (room temperature)","A handful of sweet grapes or pomegranate","Rose petal jam (gulkand) with a little warm milk"],
      lunch: ["Basmati rice + mung dal + ghee + cucumber raita","Steamed vegetables with coconut chutney and roti","Quinoa salad with cucumber, coriander, lime (room temp)","White rice + mild sambar + cooling raita"],
      evening: ["Coriander-mint herbal tea","Fresh pomegranate juice","Fennel tea — excellent for Pitta","A few sweet grapes or a pear"],
      dinner: ["Kitchari with cooling vegetables (zucchini, asparagus)","Light dal with steamed rice — small portions","Vegetable soup with coriander and fennel"],
    },
    weekly_theme: ["Monday: Mono-fruit morning + kitchari for meals","Tuesday: Green vegetable day — asparagus, zucchini, leafy greens","Wednesday: Cooling grains day — barley, quinoa","Thursday: Dairy day — lassi, paneer, ghee-rich meals","Friday: Legume day — mung beans, chickpeas with coriander","Saturday: Detox kitchari + coconut water + herbal teas","Sunday: Rest day — fruits and lighter meals"],
    spice_blends: [
      { name:"Pitta Churna", recipe:"Coriander, fennel, cardamom, turmeric, mint, shatavari", use:"Sprinkle on food. Cools digestion without dulling it." },
      { name:"CCF Tea (Pitta)", recipe:"Coriander, cardamom, fennel, rose petals (2:1:2:1)", use:"Steep 1 tsp in hot water. Let cool before drinking." },
      { name:"Gulkand Drink", recipe:"1 tsp rose petal jam in room-temp milk", use:"Take in the afternoon to cool Pitta heat." },
    ],
    favour: { tastes:["Sweet","Bitter","Astringent"], grains:["Basmati rice","Barley","Oats","Quinoa"], vegetables:["Cucumber","Zucchini","Asparagus","Leafy greens","Broccoli"], fruits:["Grapes","Melons","Pears","Pomegranate","Mangoes (ripe)","Coconut"], oils:["Ghee","Coconut oil","Sunflower oil"], drinks:["Coconut water","Rose water","Fennel tea","Cool water","Aloe vera juice"] },
    avoid: { tastes:["Pungent (excess)","Sour (excess)","Salty (excess)"], qualities:["Hot","Sharp"], other:["Chili","Garlic (raw)","Vinegar","Alcohol","Eating when angry"] },
    eating_rules: ["Never eat when angry or stressed — Pitta creates internal fire","Make lunch the LARGEST meal — digestion peaks at noon","Eat in a pleasant, cool, and beautiful environment","Add ghee to food — specifically cooling for Pitta","Eat dinner before 7 PM","Avoid icy water — cool or room temperature is fine"],
    supplements: [
      {name:"Amalaki (Amla)", dose:"1 tsp powder with water, morning", benefit:"Cooling, anti-inflammatory, richest Vitamin C source"},
      {name:"Shatavari", dose:"1 tsp in warm milk at bedtime", benefit:"Cools Pitta heat, nourishes tissues"},
      {name:"Brahmi", dose:"300mg or ½ tsp with water", benefit:"Cools the fiery mind, reduces perfectionism"},
      {name:"Aloe Vera Juice", dose:"2 tbsp in water on empty stomach", benefit:"Deeply cooling, heals gut inflammation"},
    ],
    fasting: { recommended:"1-day moon fast — fruits only", best_day:"Monday or Ekadashi (11th lunar day)", avoid:"Skipping lunch — Pitta becomes irritable and hypoglycaemic" },
    viruddha_ahara: ["Honey + hot water (toxic when heated)","Milk + salty foods","Yogurt at night — very heating","Fish + milk","Alcohol + hot spicy food"],
    sample_day: { "06:00":"Cool water + aloe vera juice or coconut water.","07:30":"Fresh sweet fruits — melon or ripe mango with coconut flakes.","10:00":"Fennel herbal tea. Sweet grapes.","12:30":"Large lunch: basmati rice + mung dal + ghee + cucumber raita.","16:30":"Rose water drink or coriander-mint tea.","18:30":"Light kitchari with zucchini and leafy greens.","21:00":"Warm milk with shatavari or gulkand." },
    seasonal_adjustments: { Summer:"Maximum cooling. Coconut, rose, aloe, mint. Avoid hot spices entirely.", Autumn:"Slowly add warming foods. Ginger and cumin now fine.", Winter:"More warming foods acceptable. Ghee is your best friend.", Spring:"Bitter greens excellent for Pitta cleansing. Begin with 3-day kitchari cleanse." },
  },
  Kapha: {
    dosha: "Kapha", element: "Earth + Water",
    agni_type: "Manda Agni (Slow, dull digestive fire)",
    agni_desc: "Kapha's digestion is slow and steady. Stimulate agni before and during meals.",
    principle: "Light, dry, warm, and stimulating. Favour pungent, bitter, and astringent tastes. Eat less.",
    meal_timing: { wake:"5:30–6:00 AM (before sunrise — critical)", breakfast:"8:00–9:00 AM (light or skip)", mid_morning:"NO snacking between meals", lunch:"12:00–1:30 PM (main and largest)", evening:"4:30–5:00 PM (stimulating herbal tea ONLY)", dinner:"6:00–7:00 PM (very light — smallest meal)", sleep:"10:00–10:30 PM" },
    meals: {
      breakfast: ["SKIP if not hungry — Kapha benefits from 16-hour overnight fast","Light ginger-honey tea with a few berries","Fresh apple or pear (single fruit only)","1 slice dry toast with a smear of honey"],
      mid_morning: ["Do NOT snack — allow digestion to complete","Stimulating ginger tea only if needed","Warm water with lemon and black pepper"],
      lunch: ["Spiced lentil soup (masoor dal) with trikatu","Mixed vegetable sabzi with minimal oil + dry roti","Barley or millet with roasted bitter vegetables","Light chickpea curry with warming spices and leafy greens"],
      evening: ["Trikatu tea (ginger, black pepper, long pepper)","Tulsi (holy basil) tea — decongesting","Warm water with honey and black pepper"],
      dinner: ["Thin vegetable soup — lightly spiced, no cream","Steamed bitter greens with lemon","Small portion of mung dal — lightest dal","Simple broth with ginger, cumin, and turmeric"],
    },
    weekly_theme: ["Monday: Detox day — mung dal only with lots of trikatu tea","Tuesday: Green day — bitter and dark leafy greens, legumes","Wednesday: Grain day — barley or millet only","Thursday: Protein day — legumes and plant-based protein","Friday: Spice day — extra emphasis on trikatu and ginger","Saturday: Light day — single grain, single vegetable, single legume","Sunday: Intermittent fast — 16:8 window; light kitchari afternoon"],
    spice_blends: [
      { name:"Kapha Churna", recipe:"Ginger, black pepper, trikatu, cumin, turmeric, mustard seed", use:"Add generously to all cooked foods." },
      { name:"Trikatu", recipe:"Ginger, black pepper, pippali (equal parts)", use:"¼ tsp with honey 15 min before meals." },
      { name:"Agni Tea", recipe:"Ginger, turmeric, black pepper, lemon, honey", use:"Boil ginger 10 min. Cool. Add honey + lemon. Drink morning." },
    ],
    favour: { tastes:["Pungent","Bitter","Astringent"], grains:["Barley","Millet","Buckwheat","Quinoa","Brown rice"], vegetables:["Leafy greens","Bitter gourd","Asparagus","Broccoli","Radish","Garlic"], fruits:["Apples","Pears","Pomegranate","Berries","Cranberries"], oils:["Tiny amounts — mustard oil, sunflower oil","Max 1 tsp per meal"], drinks:["Ginger tea","Trikatu tea","Tulsi tea","Warm water with lemon","Green tea"] },
    avoid: { tastes:["Sweet (excess)","Sour (excess)","Salty (excess)"], qualities:["Heavy","Cold","Oily","Dense"], other:["Dairy","Fried food","White bread","Ice cream","Bananas","Daytime sleeping"] },
    eating_rules: ["Eat only when TRULY hungry","Never overeat — stop at 50–75% full","Make lunch the biggest meal; keep dinner very small","Skip breakfast if not hungry — 16-hour fast is ideal","No snacking between meals — 4–5 hrs between meals","Always add generous spices — they are medicine","Use minimal oil — no more than 1 tsp per meal"],
    supplements: [
      {name:"Trikatu", dose:"¼ tsp with honey 15 min before meals", benefit:"Kindles digestive fire, clears Ama"},
      {name:"Guggulu", dose:"1 tablet twice daily with warm water", benefit:"Stimulates metabolism"},
      {name:"Punarnava", dose:"½ tsp powder with warm water", benefit:"Reduces water retention"},
      {name:"Ginger (fresh)", dose:"Small piece with salt before meals", benefit:"Stimulates digestive enzymes"},
    ],
    fasting: { recommended:"Weekly 24-hour fast or 16:8 intermittent fasting daily", best_day:"Monday or any day with a light schedule", avoid:"Heavy eating late at night, skipping morning exercise" },
    viruddha_ahara: ["Honey + hot water (turns toxic)","Milk + banana — creates mucus","Yogurt at night","Cold food after warm food","Sweet dessert immediately after full meal"],
    sample_day: { "05:30":"Tongue scraping. Dry brushing (Garshana).","06:00":"Vigorous exercise — run or cycle for 30–45 min.","07:30":"Agni tea: ginger, lemon, honey, black pepper.","09:00":"Light breakfast if hungry: apple with cinnamon.","12:30":"Main meal: spiced lentil soup + millet + bitter vegetables.","16:30":"Trikatu herbal tea. No food until dinner.","18:30":"Thin vegetable broth or steamed greens with dal." },
    seasonal_adjustments: { Spring:"MAXIMUM stimulation. Lightest foods. Warm ginger water. 3-day kitchari cleanse.", Summer:"Maintain lightness. Bitter and astringent. Avoid icy food.", Autumn:"Add some warming. Slight oil increase. Continue exercise.", Winter:"Very active lifestyle critical. Maintain spice emphasis. Avoid all dairy." },
  },
};

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function DietPlanner() {
  const [dosha, setDosha]       = useState("Vata");
  const [goal, setGoal]         = useState("Balance");
  const [lifestyle, setLifestyle] = useState("Vegetarian");
  const [season, setSeason]     = useState(() => {
    const m = new Date().getMonth() + 1;
    if (m <= 2 || m === 12) return "Winter";
    if (m <= 5)  return "Spring";
    if (m <= 8)  return "Summer";
    return "Autumn";
  });
  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState("meals");
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [generated, setGenerated] = useState(false);

  const theme = DOSHA_THEME[dosha];

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const res = await fetch("http://127.0.0.1:5050/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dosha, goal, lifestyle, season }),
      });
      const data = await res.json();
      if (res.ok && data.meals) {
        setPlan(data);
      } else throw new Error();
    } catch {
      // Use local fallback
      const local = JSON.parse(JSON.stringify(LOCAL_PLANS[dosha]));
      local.goal = goal;
      local.lifestyle = lifestyle;
      local.current_season = season;
      local.seasonal_note = local.seasonal_adjustments?.[season] || "";
      if (lifestyle === "Vegan") {
        const veganFilter = s => !/(paneer|milk|ghee|egg|fish|meat|butter|yogurt|lassi|dairy|cream)/i.test(s);
        Object.keys(local.meals).forEach(k => { local.meals[k] = local.meals[k].filter(veganFilter); });
        local.lifestyle_note = "Dairy items filtered. Use coconut oil in place of ghee, plant milks in place of dairy.";
      }
      setPlan(local);
    } finally {
      setLoading(false);
      setGenerated(true);
      setActiveTab("meals");
    }
  };

  const TABS = [
    { id: "meals",     label: "Meal Plan",     icon: "🍽️" },
    { id: "timing",    label: "Daily Timing",  icon: "⏰" },
    { id: "weekly",    label: "Weekly Plan",   icon: "📅" },
    { id: "spices",    label: "Spice Blends",  icon: "🌶️" },
    { id: "rules",     label: "Eating Rules",  icon: "📜" },
    { id: "incompatible", label: "Foods to Avoid", icon: "⚠️" },
    { id: "supplements", label: "Supplements",icon: "🌱" },
    { id: "fasting",   label: "Fasting",       icon: "🕐" },
    { id: "day",       label: "Sample Day",    icon: "📖" },
  ];

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
        }
        .dp-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 65% 50% at 5% 5%, rgba(139,92,42,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 55% 40% at 95% 95%, rgba(92,46,10,0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* Navbar */
        .nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 62px;
          background: rgba(253,250,245,0.95);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #E8D9C5;
          box-shadow: 0 1px 20px rgba(44,24,16,0.05);
          flex-shrink: 0;
        }
        .nav-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 600; color: #2C1810;
          display: flex; align-items: center; gap: 9px;
        }
        .nav-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg,#5C2E0A,#8B5C2A);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }

        /* Layout */
        .page {
          flex: 1; display: flex; gap: 0;
          position: relative; z-index: 1;
          min-height: 0;
        }

        /* ── Config panel (left) ──────────────────────────── */
        .config-panel {
          width: 320px;
          flex-shrink: 0;
          padding: 1.8rem 1.6rem;
          border-right: 1px solid #E8D9C5;
          overflow-y: auto;
          background: #FFF;
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        .config-section-title {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #B0967A;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        /* Dosha selector */
        .dosha-selector {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dosha-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 1.5px solid #E8D9C5;
          border-radius: 13px;
          background: #FDFAF5;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .dosha-btn:hover { border-color: #C4A882; background: #F5EFE6; }
        .dosha-btn.active { border-width: 2px; }
        .dosha-btn-sym { font-size: 22px; flex-shrink: 0; }
        .dosha-btn-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 500; color: #2C1810;
        }
        .dosha-btn-el { font-size: 11px; color: #A0722A; margin-top: 1px; }
        .dosha-btn-check {
          margin-left: auto;
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 2px solid #C4A882;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 10px;
          transition: all 0.2s;
        }

        /* Grid selectors */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; }
        .sel-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 6px;
          border: 1.5px solid #E8D9C5;
          border-radius: 11px;
          background: #FDFAF5;
          cursor: pointer;
          transition: all 0.18s;
          text-align: center;
        }
        .sel-btn:hover { border-color: #C4A882; background: #F5EFE6; }
        .sel-btn.active { border-width: 2px; }
        .sel-btn-icon { font-size: 18px; }
        .sel-btn-label { font-size: 11px; font-weight: 700; color: #4A2C14; }
        .sel-btn-desc { font-size: 9px; color: #A0722A; line-height: 1.3; }

        /* Generate button */
        .gen-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg,#5C2E0A,#8B5C2A);
          color: #FDF8F0;
          font-family: 'Nunito', sans-serif;
          font-size: 14px; font-weight: 800;
          border: none; border-radius: 13px;
          cursor: pointer;
          letter-spacing: 0.4px;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 6px 22px rgba(92,46,10,0.28);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .gen-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(92,46,10,0.35); }
        .gen-btn:active { transform: scale(0.98); }
        .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Results panel (right) ───────────────────────── */
        .results-panel {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        /* Empty state */
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 2rem;
          animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .empty-orb {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: #F5EFE6;
          border: 2px solid #E8D9C5;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px;
          margin: 0 auto 1.5rem;
        }
        .empty-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 500; color: #2C1810;
          margin-bottom: 8px;
        }
        .empty-sub { font-size: 13px; color: #A0722A; max-width: 320px; line-height: 1.6; }

        /* Plan hero */
        .plan-hero {
          padding: 2rem 2.5rem 1.6rem;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .plan-hero::after {
          content: attr(data-sym);
          position: absolute;
          right: -20px; bottom: -20px;
          font-size: 180px;
          opacity: 0.05;
          line-height: 1;
          pointer-events: none;
        }
        .plan-hero-eyebrow {
          font-size: 9px; font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 8px;
          display: block;
        }
        .plan-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 600;
          color: #FFF;
          line-height: 1.1; letter-spacing: -0.5px;
          margin-bottom: 5px;
        }
        .plan-hero-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px; font-style: italic;
          color: rgba(255,255,255,0.7);
          margin-bottom: 1.2rem;
        }
        .hero-tags {
          display: flex; gap: 8px; flex-wrap: wrap;
        }
        .hero-tag {
          padding: 4px 12px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 99px;
          font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.85);
        }
        .hero-agni {
          margin-top: 1rem;
          padding: 10px 14px;
          background: rgba(0,0,0,0.15);
          border-radius: 10px;
          font-size: 12px;
          color: rgba(255,255,255,0.75);
          line-height: 1.55;
        }
        .hero-agni strong { color: #FFF; }

        /* Seasonal warning */
        .seasonal-banner {
          margin: 0 2rem 0;
          padding: 10px 14px;
          background: rgba(212,168,67,0.12);
          border: 1px solid rgba(212,168,67,0.35);
          border-radius: 10px;
          font-size: 12.5px; color: #7A5A10;
          display: flex; gap: 8px; align-items: flex-start;
          line-height: 1.55;
        }

        /* Tabs */
        .tabs-bar {
          border-bottom: 1px solid #E8D9C5;
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0 1.5rem;
          gap: 2px;
          flex-shrink: 0;
        }
        .tabs-bar::-webkit-scrollbar { display: none; }
        .tab-btn {
          padding: 0.9rem 12px;
          border: none; background: transparent;
          font-family: 'Nunito', sans-serif;
          font-size: 11.5px; font-weight: 700;
          color: #B0967A;
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          white-space: nowrap;
          transition: all 0.18s;
          letter-spacing: 0.2px;
          display: flex; align-items: center; gap: 5px;
        }
        .tab-btn:hover { color: #6B4A2A; }
        .tab-btn.active { color: #5C2E0A; border-bottom-color: #5C2E0A; }

        /* Tab content */
        .tab-content {
          padding: 1.6rem 2.5rem 3rem;
          flex: 1;
          animation: tabIn 0.3s ease;
        }
        @keyframes tabIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

        /* Meal sub-tabs */
        .meal-tabs {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 1.4rem;
        }
        .meal-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          border: 1.5px solid #E8D9C5;
          border-radius: 99px;
          background: #FDFAF5;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 700;
          color: #8B6A4A;
          transition: all 0.18s;
        }
        .meal-tab:hover { border-color: #C4A882; background: #F5EFE6; }
        .meal-tab.active { border-width: 2px; color: var(--theme-text); }

        /* Meal items */
        .meal-items {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .meal-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 14px;
          background: #FFF;
          border: 1px solid #E8D9C5;
          border-radius: 12px;
          font-size: 13.5px;
          color: #3D2010;
          line-height: 1.55;
          transition: border-color 0.18s, transform 0.18s;
        }
        .meal-item:hover { border-color: #C4A882; transform: translateX(3px); }
        .meal-item-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }

        /* Timing schedule */
        .timing-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }
        .timing-list::before {
          content: '';
          position: absolute;
          left: 44px; top: 24px; bottom: 24px;
          width: 1px;
          background: linear-gradient(180deg, transparent, #E8D9C5 10%, #E8D9C5 90%, transparent);
        }
        .timing-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 12px 0;
          position: relative;
        }
        .timing-time {
          width: 80px;
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 800;
          color: #A0722A;
          letter-spacing: 0.3px;
          text-align: right;
          padding-top: 3px;
        }
        .timing-dot-wrap {
          width: 18px;
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 6px;
          position: relative;
          z-index: 1;
        }
        .timing-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          border: 2px solid #FFF;
          box-shadow: 0 0 0 2px #E8D9C5;
          flex-shrink: 0;
        }
        .timing-text {
          font-size: 13px;
          color: #3D2010;
          line-height: 1.55;
          padding-top: 1px;
        }
        .timing-label {
          font-weight: 700;
          font-size: 11px;
          color: #8B5C2A;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        /* Spice cards */
        .spice-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .spice-card {
          padding: 1.2rem;
          border: 1px solid #E8D9C5;
          border-radius: 14px;
          background: #FFF;
          transition: border-color 0.18s, transform 0.18s;
        }
        .spice-card:hover { border-color: #C4A882; transform: translateY(-2px); }
        .spice-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 500; color: #2C1810;
          margin-bottom: 6px;
        }
        .spice-recipe {
          font-size: 12px; color: #8B5C2A;
          line-height: 1.5; margin-bottom: 8px;
          font-style: italic;
        }
        .spice-use {
          font-size: 12px; color: #6B4A2A;
          line-height: 1.5;
          padding-top: 8px;
          border-top: 1px solid #F0E6D6;
        }

        /* Rules list */
        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          counter-reset: rules;
        }
        .rule-item {
          counter-increment: rules;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 11px 14px;
          background: #FFF;
          border: 1px solid #E8D9C5;
          border-radius: 12px;
          font-size: 13.5px;
          color: #3D2010;
          line-height: 1.55;
        }
        .rule-num {
          width: 24px; height: 24px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800;
          flex-shrink: 0;
          margin-top: 1px;
          color: #FFF;
        }

        /* Weekly */
        .weekly-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .weekly-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: #FFF;
          border: 1px solid #E8D9C5;
          border-radius: 12px;
          font-size: 13px; color: #3D2010; line-height: 1.6;
        }
        .weekly-day {
          font-weight: 800;
          font-size: 11px;
          min-width: 70px;
          flex-shrink: 0;
          padding-top: 1px;
        }

        /* Favour / Avoid grid */
        .fav-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 1.2rem;
        }
        .fav-panel {
          border-radius: 14px;
          padding: 1.1rem;
        }
        .fav-panel-title {
          font-size: 10px; font-weight: 800;
          letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
        }
        .fav-item {
          font-size: 12.5px; color: #3D2010;
          padding: 4px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          line-height: 1.5;
        }
        .fav-item:last-child { border-bottom: none; }

        /* Supplement cards */
        .supp-list {
          display: flex; flex-direction: column; gap: 10px;
        }
        .supp-card {
          display: flex;
          gap: 14px;
          padding: 1rem 1.2rem;
          border: 1px solid #E8D9C5;
          border-radius: 13px;
          background: #FFF;
          transition: border-color 0.18s;
        }
        .supp-card:hover { border-color: #C4A882; }
        .supp-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: #F5EFE6;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .supp-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px; font-weight: 500; color: #2C1810;
          margin-bottom: 3px;
        }
        .supp-dose { font-size: 12px; color: #8B5C2A; margin-bottom: 4px; font-weight: 600; }
        .supp-benefit { font-size: 12px; color: #6B4A2A; line-height: 1.5; }

        /* Fasting card */
        .fasting-box {
          background: #FFF;
          border: 1px solid #E8D9C5;
          border-radius: 14px;
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .fasting-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 13.5px; color: #3D2010; line-height: 1.55;
        }
        .fasting-label {
          font-size: 10px; font-weight: 800;
          letter-spacing: 1px; text-transform: uppercase;
          min-width: 90px; flex-shrink: 0;
          margin-top: 2px;
        }

        /* Incompatible combos */
        .incompat-list { display: flex; flex-direction: column; gap: 8px; }
        .incompat-item {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 10px 13px;
          background: #FFF5F0;
          border: 1px solid #F4BBAA;
          border-radius: 11px;
          font-size: 13px; color: #4A1803; line-height: 1.55;
        }

        /* Sample day timeline */
        .sampleday-list { display: flex; flex-direction: column; gap: 0; position: relative; }
        .sampleday-list::before { content:''; position:absolute; left:32px; top:20px; bottom:20px; width:1px; background:linear-gradient(180deg,transparent,#E8D9C5 10%,#E8D9C5 90%,transparent); }
        .sampleday-item { display:flex; gap:14px; align-items:flex-start; padding:10px 0; position:relative; }
        .sampleday-time { width:55px; flex-shrink:0; font-size:11px; font-weight:800; color:#A0722A; text-align:right; padding-top:3px; }
        .sampleday-dot-wrap { width:20px; flex-shrink:0; display:flex; justify-content:center; padding-top:5px; position:relative; z-index:1; }
        .sampleday-dot { width:10px; height:10px; border-radius:50%; border:2px solid #FFF; box-shadow:0 0 0 2px; }
        .sampleday-text { font-size:13px; color:#3D2010; line-height:1.6; padding-top:1px; }

        /* Section title */
        .sec-title {
          font-size: 10px; font-weight: 800;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: #8B5C2A;
          margin-bottom: 1rem; padding-bottom: 8px;
          border-bottom: 1px solid #F0E6D6;
          display: flex; align-items: center; gap: 7px;
        }

        /* Loading */
        .loading-overlay {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 3rem;
          animation: fadeIn 0.3s ease;
        }
        .load-orb {
          width: 72px; height: 72px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px;
          margin: 0 auto 1.2rem;
          animation: pulse 1.5s ease infinite;
        }
        @keyframes pulse { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(92,46,10,0.3)} 50%{transform:scale(1.05);box-shadow:0 0 0 16px rgba(92,46,10,0)} }

        @media (max-width: 900px) {
          .page { flex-direction: column; }
          .config-panel { width: 100%; border-right: none; border-bottom: 1px solid #E8D9C5; }
          .fav-grid { grid-template-columns: 1fr; }
          .spice-grid { grid-template-columns: 1fr; }
          .tab-content { padding: 1.2rem 1.2rem 2rem; }
          .nav { padding: 0 1rem; }
        }
      `}</style>

      <div className="dp-root">
        {/* Navbar */}
        <nav className="nav">
          <div className="nav-brand">
            <div className="nav-icon">🌿</div>
            Ayurveda · Diet Planner
          </div>
          {generated && plan && (
            <span style={{ fontSize: 12, color: "#A0722A", fontWeight: 600 }}>
              {plan.dosha} Plan · {plan.goal} · {plan.current_season}
            </span>
          )}
        </nav>

        <div className="page">
          {/* ── Config Panel ── */}
          <aside className="config-panel">
            {/* Dosha */}
            <div>
              <div className="config-section-title">🌿 Your Dosha</div>
              <div className="dosha-selector">
                {Object.entries(DOSHA_THEME).map(([d, t]) => (
                  <button
                    key={d}
                    className={`dosha-btn${dosha === d ? " active" : ""}`}
                    style={dosha === d ? { borderColor: t.colour, background: t.light } : {}}
                    onClick={() => setDosha(d)}
                  >
                    <span className="dosha-btn-sym">{t.sym}</span>
                    <div>
                      <div className="dosha-btn-name">{d}</div>
                      <div className="dosha-btn-el">{t.el}</div>
                    </div>
                    <div className="dosha-btn-check"
                      style={dosha === d ? { background: t.colour, borderColor: t.colour, color: "#FFF" } : {}}>
                      {dosha === d ? "✓" : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <div className="config-section-title">🎯 Wellness Goal</div>
              <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {GOALS.map(g => (
                  <button key={g.id} className={`sel-btn${goal === g.id ? " active" : ""}`}
                    style={goal === g.id ? { borderColor: theme.colour, background: theme.light } : {}}
                    onClick={() => setGoal(g.id)}>
                    <span className="sel-btn-icon">{g.icon}</span>
                    <span className="sel-btn-label">{g.label}</span>
                    <span className="sel-btn-desc">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div>
              <div className="config-section-title">🌍 Current Season</div>
              <div className="grid-2">
                {SEASONS.map(s => (
                  <button key={s.id} className={`sel-btn${season === s.id ? " active" : ""}`}
                    style={season === s.id ? { borderColor: theme.colour, background: theme.light } : {}}
                    onClick={() => setSeason(s.id)}>
                    <span className="sel-btn-icon">{s.icon}</span>
                    <span className="sel-btn-label">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <div className="config-section-title">🥗 Diet Preference</div>
              <div className="grid-3">
                {LIFESTYLES.map(l => (
                  <button key={l.id} className={`sel-btn${lifestyle === l.id ? " active" : ""}`}
                    style={lifestyle === l.id ? { borderColor: theme.colour, background: theme.light } : {}}
                    onClick={() => setLifestyle(l.id)}>
                    <span className="sel-btn-icon">{l.icon}</span>
                    <span className="sel-btn-label">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button className="gen-btn" onClick={handleGenerate} disabled={loading}>
              {loading ? <>🌀 Generating…</> : <>✨ Generate My Diet Plan</>}
            </button>
          </aside>

          {/* ── Results Panel ── */}
          <section className="results-panel">
            {loading ? (
              <div className="loading-overlay">
                <div className="load-orb" style={{ background: theme.bg }}>🌿</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: "#2C1810", marginBottom: 8 }}>
                  Crafting your plan…
                </div>
                <p style={{ fontSize: 13, color: "#A0722A" }}>
                  Consulting the classical Ayurvedic texts
                </p>
              </div>
            ) : !generated ? (
              <div className="empty-state">
                <div className="empty-orb">🌿</div>
                <div className="empty-title">Your Personalised Diet Awaits</div>
                <p className="empty-sub">
                  Select your dosha, goal, season, and diet preference on the left, then generate your complete Ayurvedic diet plan.
                </p>
              </div>
            ) : plan && (
              <>
                {/* Hero banner */}
                <div className="plan-hero" data-sym={theme.sym} style={{ background: theme.bg }}>
                  <span className="plan-hero-eyebrow">Ayurvedic Diet Plan · {plan.current_season} Season</span>
                  <div className="plan-hero-title">{plan.dosha} Diet</div>
                  <div className="plan-hero-sub">{plan.principle}</div>
                  <div className="hero-tags">
                    <span className="hero-tag">{theme.sym} {plan.dosha}</span>
                    <span className="hero-tag">🎯 {plan.goal}</span>
                    <span className="hero-tag">{SEASONS.find(s=>s.id===plan.current_season)?.icon} {plan.current_season}</span>
                    <span className="hero-tag">{LIFESTYLES.find(l=>l.id===plan.lifestyle)?.icon || "🥗"} {plan.lifestyle}</span>
                  </div>
                  <div className="hero-agni">
                    <strong>{plan.agni_type}</strong><br />{plan.agni_desc}
                  </div>
                </div>

                {/* Seasonal note */}
                {plan.seasonal_note && (
                  <div style={{ padding: "0 2rem", marginTop: "0.8rem" }}>
                    <div className="seasonal-banner">
                      <span>🌿</span>
                      <span><strong>Seasonal Adjustment:</strong> {plan.seasonal_note}</span>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="tabs-bar" style={{ marginTop: "1rem" }}>
                  {TABS.map(t => (
                    <button
                      key={t.id}
                      className={`tab-btn${activeTab === t.id ? " active" : ""}`}
                      onClick={() => setActiveTab(t.id)}
                    >
                      <span>{t.icon}</span>{t.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="tab-content" key={activeTab}
                  style={{ "--theme-colour": theme.colour, "--theme-light": theme.light, "--theme-text": theme.text }}>

                  {/* ── MEALS ── */}
                  {activeTab === "meals" && plan.meals && (
                    <>
                      <div className="meal-tabs">
                        {Object.keys(plan.meals).map(m => (
                          <button key={m}
                            className={`meal-tab${activeMeal === m ? " active" : ""}`}
                            style={activeMeal === m ? { borderColor: theme.colour, background: theme.light, color: theme.text } : {}}
                            onClick={() => setActiveMeal(m)}>
                            <span>{MEAL_ICONS[m] || "🍽️"}</span>
                            {MEAL_LABELS[m] || m}
                          </button>
                        ))}
                      </div>
                      <div className="meal-items">
                        {(plan.meals[activeMeal] || []).map((item, i) => (
                          <div key={i} className="meal-item">
                            <div className="meal-item-dot" style={{ background: theme.colour }} />
                            {item}
                          </div>
                        ))}
                      </div>
                      {plan.favour && (
                        <div style={{ marginTop: "1.6rem" }}>
                          <div className="sec-title">Best Foods to Include</div>
                          <div className="fav-grid">
                            <div className="fav-panel" style={{ background: "#EAF7F0", border: "1px solid #9FD9C0" }}>
                              <div className="fav-panel-title" style={{ color: "#1E7A4A" }}>✓ Favour</div>
                              {[...(plan.favour?.grains||[]), ...(plan.favour?.vegetables||[]), ...(plan.favour?.fruits||[])].slice(0,8).map((f,i)=>(
                                <div key={i} className="fav-item">{f}</div>
                              ))}
                            </div>
                            <div className="fav-panel" style={{ background: "#FFF0F0", border: "1px solid #F4BBBB" }}>
                              <div className="fav-panel-title" style={{ color: "#C0392B" }}>✗ Avoid</div>
                              {[...(plan.avoid?.other||[]), ...(plan.avoid?.drinks||[])].slice(0,8).map((f,i)=>(
                                <div key={i} className="fav-item">{f}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── TIMING ── */}
                  {activeTab === "timing" && plan.meal_timing && (
                    <div className="timing-list">
                      {Object.entries(plan.meal_timing).map(([key, val], i) => (
                        <div key={i} className="timing-item">
                          <div className="timing-time">
                            {val.split(" ")[0] || ""}
                          </div>
                          <div className="timing-dot-wrap">
                            <div className="timing-dot" style={{ background: theme.colour, boxShadow: `0 0 0 2px ${theme.colour}` }} />
                          </div>
                          <div className="timing-text">
                            <div className="timing-label">{key.replace(/_/g, " ").toUpperCase()}</div>
                            {val}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── WEEKLY ── */}
                  {activeTab === "weekly" && plan.weekly_theme && (
                    <>
                      <div className="weekly-list">
                        {plan.weekly_theme.map((item, i) => {
                          const [day, ...rest] = item.split(": ");
                          const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                          return (
                            <div key={i} className="weekly-item">
                              <div className="weekly-day" style={{ color: theme.colour }}>{days[i] || day}</div>
                              <div>{rest.join(": ") || item}</div>
                            </div>
                          );
                        })}
                      </div>
                      {plan.seasonal_adjustments && (
                        <div style={{ marginTop: "1.6rem" }}>
                          <div className="sec-title">Seasonal Diet Adjustments</div>
                          {Object.entries(plan.seasonal_adjustments).map(([s, note]) => (
                            <div key={s} className="weekly-item" style={{ marginBottom: 8 }}>
                              <div className="weekly-day" style={{ color: theme.colour, minWidth: 60 }}>
                                {SEASONS.find(x=>x.id===s)?.icon} {s}
                              </div>
                              <div style={{ fontSize: 13, color: "#4A2C14", lineHeight: 1.6 }}>{note}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── SPICES ── */}
                  {activeTab === "spices" && plan.spice_blends && (
                    <div className="spice-grid">
                      {plan.spice_blends.map((s, i) => (
                        <div key={i} className="spice-card" style={{ borderColor: `${theme.colour}30` }}>
                          <div className="spice-name" style={{ color: theme.text }}>🌶️ {s.name}</div>
                          <div className="spice-recipe">{s.recipe}</div>
                          <div className="spice-use"><strong>How to use:</strong> {s.use}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── RULES ── */}
                  {activeTab === "rules" && plan.eating_rules && (
                    <div className="rules-list">
                      {plan.eating_rules.map((r, i) => (
                        <div key={i} className="rule-item">
                          <div className="rule-num" style={{ background: theme.colour }}>{i + 1}</div>
                          {r}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── INCOMPATIBLE ── */}
                  {activeTab === "incompatible" && (
                    <>
                      {plan.viruddha_ahara && (
                        <>
                          <div className="sec-title">⚠️ Viruddha Ahara — Incompatible Food Combinations</div>
                          <div className="incompat-list" style={{ marginBottom: "1.6rem" }}>
                            {plan.viruddha_ahara.map((item, i) => (
                              <div key={i} className="incompat-item">
                                <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                                {item}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      {plan.avoid && (
                        <>
                          <div className="sec-title">Foods to Minimise</div>
                          <div className="fav-grid">
                            {Object.entries(plan.avoid).filter(([, v]) => Array.isArray(v) && v.length > 0).map(([cat, items]) => (
                              <div key={cat} className="fav-panel" style={{ background: "#FFF5F0", border: "1px solid #F4BBAA", borderRadius: 14 }}>
                                <div className="fav-panel-title" style={{ color: "#C0392B" }}>{cat.replace(/_/g," ").toUpperCase()}</div>
                                {items.map((it, i) => <div key={i} className="fav-item">{it}</div>)}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* ── SUPPLEMENTS ── */}
                  {activeTab === "supplements" && plan.supplements && (
                    <div className="supp-list">
                      {plan.supplements.map((s, i) => (
                        <div key={i} className="supp-card" style={{ borderColor: `${theme.colour}30` }}>
                          <div className="supp-icon" style={{ background: theme.light }}>🌱</div>
                          <div>
                            <div className="supp-name" style={{ color: theme.text }}>{s.name}</div>
                            <div className="supp-dose">📋 {s.dose}</div>
                            <div className="supp-benefit">{s.benefit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── FASTING ── */}
                  {activeTab === "fasting" && plan.fasting && (
                    <div className="fasting-box" style={{ borderColor: `${theme.colour}30` }}>
                      {Object.entries(plan.fasting).map(([key, val]) => (
                        <div key={key} className="fasting-row">
                          <div className="fasting-label" style={{ color: theme.colour }}>
                            {key.replace(/_/g," ").toUpperCase()}
                          </div>
                          <div>{val}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── SAMPLE DAY ── */}
                  {activeTab === "day" && plan.sample_day && (
                    <div className="sampleday-list">
                      {Object.entries(plan.sample_day).map(([time, activity], i) => (
                        <div key={i} className="sampleday-item">
                          <div className="sampleday-time">{time}</div>
                          <div className="sampleday-dot-wrap">
                            <div className="sampleday-dot"
                              style={{ background: theme.colour, boxShadow: `0 0 0 2px ${theme.colour}` }} />
                          </div>
                          <div className="sampleday-text">{activity}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Goal note */}
                  {plan.goal_info && (
                    <div style={{ marginTop: "1.6rem", padding: "1.2rem", background: theme.light, border: `1px solid ${theme.colour}30`, borderRadius: 14 }}>
                      <div className="sec-title" style={{ border: "none", marginBottom: 6, paddingBottom: 0 }}>
                        🎯 {plan.goal} Goal — Key Guidance
                      </div>
                      <p style={{ fontSize: 13, color: theme.text, marginBottom: 8, fontStyle: "italic" }}>
                        {plan.goal_info.note}
                      </p>
                      {(plan.goal_info.extra_tips || []).map((tip, i) => (
                        <div key={i} style={{ fontSize: 12.5, color: "#4A2C14", lineHeight: 1.55, padding: "4px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                          • {tip}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
