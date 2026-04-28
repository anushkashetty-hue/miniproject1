import { useState, useEffect, useRef } from "react";

/* ─── Design Tokens ───────────────────────────────────────────────────────── */
const DOSHA = {
  Vata:  { color:"#7C6FCD", bg:"#F0EEFB", text:"#3B2F8F", dark:"#1A1550", accent:"#5B4EC4", sym:"🌬️", el:"Air + Ether", agni:"Vishama Agni", gradient:"linear-gradient(135deg,#6B5FC4 0%,#9B8EE4 100%)" },
  Pitta: { color:"#D05A1E", bg:"#FBF0EB", text:"#7A2A05", dark:"#4A1003", accent:"#C04010", sym:"🔥", el:"Fire + Water", agni:"Tikshna Agni", gradient:"linear-gradient(135deg,#C84A10 0%,#E88040 100%)" },
  Kapha: { color:"#2E8A52", bg:"#EAF7F0", text:"#145030", dark:"#082E1C", accent:"#1E7A42", sym:"🌍", el:"Earth + Water", agni:"Manda Agni", gradient:"linear-gradient(135deg,#267044 0%,#5AAF80 100%)" },
};

const GOALS = [
  { id:"Balance",   icon:"⚖️", desc:"Restore doshic harmony" },
  { id:"Detox",     icon:"🫧", desc:"Cleanse Ama (toxins)" },
  { id:"Energy",    icon:"⚡", desc:"Build Ojas & vitality" },
  { id:"Weight",    icon:"🌿", desc:"Healthy weight management" },
  { id:"Immunity",  icon:"🛡️", desc:"Strengthen natural defenses" },
];

const LIFESTYLES = [
  { id:"Vegetarian",     icon:"🥗", sub:"Dairy included" },
  { id:"Vegan",          icon:"🌱", sub:"No animal products" },
  { id:"Non-vegetarian", icon:"🍳", sub:"Eggs & light meats" },
];

const SEASONS = [
  { id:"Spring", icon:"🌸" }, { id:"Summer", icon:"☀️" },
  { id:"Autumn", icon:"🍂" }, { id:"Winter", icon:"❄️" },
];

const MEAL_META = {
  breakfast:   { icon:"🌅", label:"Breakfast",      time:"7:30–8:30 AM" },
  mid_morning: { icon:"🍵", label:"Mid-Morning",    time:"10:30 AM" },
  lunch:       { icon:"☀️", label:"Lunch",          time:"12:00–1:30 PM" },
  evening:     { icon:"🌤️", label:"Evening",        time:"4:00–5:00 PM" },
  dinner:      { icon:"🌙", label:"Dinner",         time:"6:30–7:30 PM" },
};

const ENERGY_COLORS = {
  Light:      { bg:"#E8F5E9", text:"#2E7D32", border:"#A5D6A7" },
  Moderate:   { bg:"#FFF8E1", text:"#F57F17", border:"#FFD54F" },
  Heavy:      { bg:"#FDE8E8", text:"#B71C1C", border:"#EF9A9A" },
  Nourishing: { bg:"#E3F2FD", text:"#0D47A1", border:"#90CAF9" },
};

const TABS = [
  { id:"meals",      label:"Meal Plan",    icon:"🍽️" },
  { id:"timing",     label:"Timing",       icon:"⏰" },
  { id:"spices",     label:"Spice Blends", icon:"🌶️" },
  { id:"wisdom",     label:"Eating Rules", icon:"📜" },
  { id:"avoid",      label:"Avoid",        icon:"⚠️" },
  { id:"supplements",label:"Herbs",        icon:"🌱" },
];

/* ─── AI System Prompt ───────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are an expert Ayurvedic nutritionist and creative meal planner. Generate a UNIQUE daily meal plan every time. Even for identical inputs, vary the meals creatively.

CRITICAL RULES:
1. VARIATION: Never repeat standard templates. Each call must feel fresh with different grains, vegetables, spices, cooking styles.
2. LIFESTYLE — THIS IS MANDATORY, NEVER IGNORE IT:
   - Vegan: ZERO dairy, ghee, eggs, fish, meat. Use coconut oil, plant milks, tofu only.
   - Vegetarian: Dairy and ghee allowed. NO eggs, fish, or meat whatsoever.
   - Non-vegetarian: You MUST include eggs, fish, or light meats (chicken/mutton) in at least 2-3 meal slots. Do NOT make a vegetarian plan for non-vegetarian users. Examples: egg scramble at breakfast, grilled fish at lunch, chicken broth at dinner. If the user chose Non-vegetarian, animal proteins are REQUIRED, not optional.
3. AYURVEDA: Match foods to dosha balance. Use warm, digestible combinations. Avoid viruddha ahara (incompatible foods). Consider Agni.
4. DIVERSITY: Rotate grains (rice, millet, quinoa, barley, ragi, amaranth), proteins (dal, eggs, fish, chicken, paneer, chickpeas), cooking styles (porridge, stew, sauté, curry, soup, stir-fry, grilled).
5. REALISTIC: Meals must be actual home-cooked dishes with clear ingredients — not vague "bowls".
6. ENERGY: Breakfast=light/moderate, Lunch=heaviest, Dinner=light.
7. THEME: Internally pick a regional or seasonal theme (South Indian, North Indian, coastal, light detox, protein-rich) WITHOUT stating it. Let it guide the variety.
8. GOAL ALIGNMENT: Reflect the goal — Detox=lighter/cleansing, Energy=ojas-building, Weight=lighter/spiced, Immunity=turmeric/ashwagandha.
9. SEASON: Adapt ingredients to the current season.

OUTPUT: Strict JSON only — no markdown fences, no prose, no explanation:
{
  "breakfast": [{"name":"...","description":"...","energy":"Light|Moderate|Heavy"}],
  "mid_morning": [{"name":"...","description":"...","energy":"Light|Moderate|Heavy"}],
  "lunch": [{"name":"...","description":"...","energy":"Light|Moderate|Heavy|Nourishing"}],
  "evening": [{"name":"...","description":"...","energy":"Light|Moderate"}],
  "dinner": [{"name":"...","description":"...","energy":"Light|Moderate"}],
  "daily_wisdom": "One Ayurvedic insight for today (1 sentence)",
  "agni_tip": "Specific tip for this dosha's digestive fire (1 sentence)"
}

Ensure 2-3 items per meal section. No meal repeated across sections.`;

/* ─── Fallback Data — three tiers per dosha ─────────────────────────────── */
const FALLBACK_VEG = {
  Vata: {
    breakfast:[
      {name:"Spiced Ragi Porridge",description:"Finger millet cooked with warm almond milk, jaggery, cardamom & a tsp of ghee",energy:"Moderate"},
      {name:"Soaked Almond Kheer",description:"Blended soaked almonds with warm milk, saffron, dates & nutmeg",energy:"Moderate"},
    ],
    mid_morning:[
      {name:"CCF Herbal Tea + Fig",description:"Cumin-coriander-fennel decoction with 2 soaked figs",energy:"Light"},
      {name:"Warm Ashwagandha Milk",description:"Warm whole milk with ashwagandha powder, honey & a pinch of cinnamon",energy:"Light"},
    ],
    lunch:[
      {name:"Tridoshic Kitchari",description:"Yellow mung dal & basmati rice slow-cooked with ghee, cumin, turmeric & seasonal root vegetables",energy:"Nourishing"},
      {name:"Paneer & Root Vegetable Curry",description:"Soft paneer cubes in a mild tomato-ginger gravy with sweet potato & carrots, served with roti",energy:"Nourishing"},
    ],
    evening:[
      {name:"Ginger-Date Elixir",description:"Fresh ginger tea with 2 medjool dates & a pinch of black salt",energy:"Light"},
    ],
    dinner:[
      {name:"Moong Soup with Soft Roti",description:"Thin green moong broth with cumin tadka served with 1 soft wheat roti & ghee",energy:"Light"},
      {name:"Pumpkin Stew",description:"Slow-simmered yellow pumpkin with warming spices, coconut & fresh coriander",energy:"Moderate"},
    ],
    daily_wisdom:"Regularity is the greatest medicine for Vata — eat at the same times daily.",
    agni_tip:"Add a small piece of fresh ginger with rock salt before meals to kindle your variable Vishama Agni.",
  },
  Pitta: {
    breakfast:[
      {name:"Coconut Barley Porridge",description:"Pearl barley simmered in coconut milk with cardamom, ripe mango chunks & rose petal jam",energy:"Moderate"},
      {name:"Sweet Fennel Oats",description:"Rolled oats cooked with fennel seeds, dates, coriander & a splash of warm milk",energy:"Light"},
    ],
    mid_morning:[
      {name:"Gulkand Rose Lassi",description:"Cooling yogurt drink blended with gulkand (rose petal jam), fennel & a pinch of cardamom",energy:"Light"},
      {name:"Pomegranate + Coconut Water",description:"Fresh pomegranate arils in chilled-to-room-temp coconut water with mint",energy:"Light"},
    ],
    lunch:[
      {name:"Cucumber Quinoa Sambar",description:"Quinoa with mild sambar featuring ash gourd, drumstick & coconut-coriander chutney",energy:"Moderate"},
      {name:"Basmati Rice + Moong Dal + Raita",description:"Fluffy basmati with ghee-tempered mung dal, cucumber-mint raita & steamed broccoli",energy:"Nourishing"},
    ],
    evening:[
      {name:"Coriander-Mint Cooling Tea",description:"Fresh coriander seeds, mint leaves & fennel steeped for 5 minutes",energy:"Light"},
    ],
    dinner:[
      {name:"Zucchini Kitchari",description:"Mild kitchari with zucchini, asparagus & cooling coriander — small portion",energy:"Light"},
      {name:"Palak Dal",description:"Masoor dal with palak (spinach), coconut oil tadka & a squeeze of cooling lime",energy:"Light"},
    ],
    daily_wisdom:"Make lunch the largest meal — Pitta's sharp Agni peaks at noon and digests best then.",
    agni_tip:"Sip fennel tea after meals to cool Tikshna Agni and prevent inflammation.",
  },
  Kapha: {
    breakfast:[
      {name:"Spiced Pear with Cinnamon",description:"Single poached pear with cinnamon, black pepper & a drizzle of honey",energy:"Light"},
      {name:"Agni Igniter Tea",description:"Strong ginger-turmeric-black pepper decoction with lemon & honey to kindle Manda Agni",energy:"Light"},
    ],
    mid_morning:[
      {name:"Trikatu Water",description:"Warm water with ¼ tsp trikatu (ginger-pepper-pippali) — stimulate digestion, no food",energy:"Light"},
    ],
    lunch:[
      {name:"Masoor Dal + Millet Bhakri",description:"Spiced red lentil soup with trikatu, served with dry-roasted millet flatbread & bitter gourd sabzi",energy:"Moderate"},
      {name:"Sprouted Moong Stir-Fry",description:"Dry-sautéed sprouted mung beans with mustard seeds, garlic, green chili & curry leaves over barley",energy:"Moderate"},
    ],
    evening:[
      {name:"Tulsi-Ginger Tea",description:"Holy basil decoction with fresh ginger & black pepper — stimulating, decongestant",energy:"Light"},
    ],
    dinner:[
      {name:"Thin Vegetable Broth",description:"Light stock with radish, bitter gourd, ginger & turmeric — minimal oil, very spiced",energy:"Light"},
      {name:"Steamed Greens + Mung Soup",description:"Blanched methi (fenugreek) leaves with a small cup of thin mung soup & lemon",energy:"Light"},
    ],
    daily_wisdom:"Kapha thrives on movement and stimulation — vigorous morning exercise before eating is medicine.",
    agni_tip:"Chew a small piece of fresh ginger with rock salt 15 minutes before lunch to activate sluggish Manda Agni.",
  },
};

const FALLBACK_VEGAN = {
  Vata: {
    breakfast:[
      {name:"Spiced Ragi Porridge",description:"Finger millet cooked with warm oat milk, jaggery, cardamom & a tsp of coconut oil",energy:"Moderate"},
      {name:"Chia-Date Warm Bowl",description:"Soaked chia seeds warmed with coconut milk, medjool dates, cinnamon & toasted sesame",energy:"Moderate"},
    ],
    mid_morning:[
      {name:"CCF Herbal Tea + Fig",description:"Cumin-coriander-fennel decoction with 2 soaked figs",energy:"Light"},
    ],
    lunch:[
      {name:"Tridoshic Kitchari",description:"Yellow mung dal & basmati rice slow-cooked with coconut oil, cumin & seasonal root vegetables",energy:"Nourishing"},
      {name:"Tofu & Root Vegetable Curry",description:"Firm tofu in a mild tomato-ginger gravy with sweet potato & carrots, served with roti",energy:"Nourishing"},
    ],
    evening:[
      {name:"Ginger-Date Elixir",description:"Fresh ginger tea with 2 medjool dates & a pinch of black salt",energy:"Light"},
    ],
    dinner:[
      {name:"Moong Soup with Soft Roti",description:"Thin green moong broth with cumin tadka, 1 soft wheat roti & coconut oil",energy:"Light"},
      {name:"Pumpkin-Coconut Stew",description:"Slow-simmered yellow pumpkin with warming spices, coconut milk & fresh coriander",energy:"Moderate"},
    ],
    daily_wisdom:"Regularity is the greatest medicine for Vata — eat at the same times daily.",
    agni_tip:"Add a small piece of fresh ginger with rock salt before meals to kindle your variable Vishama Agni.",
  },
  Pitta: {
    breakfast:[
      {name:"Coconut Barley Porridge",description:"Pearl barley simmered in coconut milk with cardamom, ripe mango & rose petal jam",energy:"Moderate"},
      {name:"Sweet Fennel Oats",description:"Rolled oats cooked with fennel seeds, dates, coriander & coconut milk",energy:"Light"},
    ],
    mid_morning:[
      {name:"Coconut Water + Pomegranate",description:"Room-temperature coconut water with fresh pomegranate arils and mint leaves",energy:"Light"},
    ],
    lunch:[
      {name:"Tofu Quinoa Sambar",description:"Quinoa with mild sambar featuring tofu, ash gourd & coconut-coriander chutney",energy:"Moderate"},
      {name:"Basmati + Moong Dal",description:"Fluffy basmati with coconut-oil-tempered mung dal, cucumber salad & steamed broccoli",energy:"Nourishing"},
    ],
    evening:[
      {name:"Coriander-Mint Cooling Tea",description:"Coriander seeds, mint & fennel steeped 5 minutes",energy:"Light"},
    ],
    dinner:[
      {name:"Zucchini Kitchari",description:"Mild kitchari with zucchini, asparagus & cooling coriander — small portion",energy:"Light"},
      {name:"Palak Tofu Dal",description:"Masoor dal with palak (spinach), coconut oil tadka, cubed tofu & lime",energy:"Light"},
    ],
    daily_wisdom:"Make lunch the largest meal — Pitta's sharp Agni peaks at noon.",
    agni_tip:"Sip fennel tea after meals to cool Tikshna Agni and prevent inflammation.",
  },
  Kapha: {
    breakfast:[
      {name:"Spiced Apple",description:"Warm stewed apple with cinnamon, black pepper & a drizzle of raw honey",energy:"Light"},
    ],
    mid_morning:[
      {name:"Trikatu Water",description:"Warm water with ¼ tsp trikatu — stimulate digestion, no food",energy:"Light"},
    ],
    lunch:[
      {name:"Masoor Dal + Millet Bhakri",description:"Spiced red lentil soup with trikatu, millet flatbread & bitter gourd sabzi",energy:"Moderate"},
      {name:"Chickpea Stir-Fry",description:"Dry-sautéed chickpeas with mustard seeds, garlic, green chili & curry leaves over barley",energy:"Moderate"},
    ],
    evening:[
      {name:"Tulsi-Ginger Tea",description:"Holy basil with fresh ginger & black pepper — decongestant, stimulating",energy:"Light"},
    ],
    dinner:[
      {name:"Spiced Vegetable Broth",description:"Radish, bitter gourd, ginger & turmeric broth — minimal coconut oil",energy:"Light"},
    ],
    daily_wisdom:"Kapha thrives on movement — vigorous morning exercise before eating is medicine.",
    agni_tip:"Chew fresh ginger with rock salt 15 minutes before lunch to activate sluggish Manda Agni.",
  },
};

const FALLBACK_NONVEG = {
  Vata: {
    breakfast:[
      {name:"Spiced Scrambled Eggs with Roti",description:"2 eggs scrambled with ghee, cumin, fresh ginger, spinach & a pinch of turmeric — served with soft wheat roti",energy:"Moderate"},
      {name:"Chicken Bone Broth Congee",description:"Slow-cooked rice porridge in chicken bone broth with ginger, sesame oil & spring onion — deeply grounding for Vata",energy:"Moderate"},
    ],
    mid_morning:[
      {name:"Warm Ashwagandha Milk",description:"Warm whole milk with ashwagandha powder, honey & a pinch of cinnamon",energy:"Light"},
      {name:"Boiled Egg + Dates",description:"1 soft-boiled egg with 2 medjool dates and CCF herbal tea",energy:"Light"},
    ],
    lunch:[
      {name:"Spiced Fish Curry with Basmati Rice",description:"Fresh white fish (rohu or pomfret) in a warming tomato-ginger-cumin gravy, served with fluffy basmati rice & ghee",energy:"Nourishing"},
      {name:"Chicken Khichdi",description:"Shredded poached chicken stirred into mung dal & basmati kitchari with trikatu spice blend",energy:"Nourishing"},
    ],
    evening:[
      {name:"Ginger-Bone Broth Tea",description:"Thin chicken or bone broth with fresh ginger, rock salt & a squeeze of lemon — warming tonic",energy:"Light"},
    ],
    dinner:[
      {name:"Light Fish Soup",description:"Delicate white fish pieces simmered in a cumin-coriander broth with zucchini & soft wheat noodles",energy:"Light"},
      {name:"Egg Drop Dal",description:"Thin moong dal soup with a swirled poached egg, cumin tadka & coriander — light and nourishing",energy:"Moderate"},
    ],
    daily_wisdom:"Regularity is the greatest medicine for Vata — eat at the same times daily.",
    agni_tip:"Add a small piece of fresh ginger with rock salt before meals to kindle your variable Vishama Agni.",
  },
  Pitta: {
    breakfast:[
      {name:"Coconut Egg White Omelette",description:"2 egg whites cooked in coconut oil with zucchini, coriander leaves & mild spices — cooling protein start",energy:"Moderate"},
      {name:"Poached Egg on Barley Porridge",description:"Soft poached egg set atop creamy barley porridge with fennel, coconut milk & fresh herbs",energy:"Moderate"},
    ],
    mid_morning:[
      {name:"Cooling Coconut Water",description:"Room-temperature coconut water with fresh pomegranate arils and mint",energy:"Light"},
    ],
    lunch:[
      {name:"Steamed Fish with Basmati & Raita",description:"Lightly steamed pomfret or tilapia with coriander-lime marinade, basmati rice & cooling cucumber-mint raita",energy:"Nourishing"},
      {name:"Chicken Quinoa Bowl",description:"Poached chicken breast shredded over quinoa with cooling cucumber, coriander chutney & a drizzle of ghee",energy:"Nourishing"},
    ],
    evening:[
      {name:"Fennel-Mint Herbal Tea",description:"Cooling fennel seeds, fresh mint & rose petals steeped — excellent Pitta pacifier",energy:"Light"},
    ],
    dinner:[
      {name:"Light Chicken Broth Soup",description:"Clear chicken broth with asparagus, zucchini & coriander — mild and cooling",energy:"Light"},
      {name:"Egg & Palak Curry",description:"Soft-boiled eggs in a mild palak (spinach) gravy with coconut oil & cooling spices",energy:"Light"},
    ],
    daily_wisdom:"Make lunch the largest meal — Pitta's Agni peaks at noon and handles protein best then.",
    agni_tip:"Sip fennel tea after meals to cool Tikshna Agni and prevent inflammation.",
  },
  Kapha: {
    breakfast:[
      {name:"Spiced Egg White Scramble",description:"3 egg whites scrambled with trikatu spice, mustard seeds, curry leaves & bitter greens — dry, no butter",energy:"Light"},
      {name:"Agni Tea + Hard-Boiled Egg",description:"Strong ginger-pepper-turmeric tea with 1 hard-boiled egg sprinkled with black salt & cumin",energy:"Light"},
    ],
    mid_morning:[
      {name:"Trikatu Water",description:"Warm water with ¼ tsp trikatu — stimulate digestion, no food",energy:"Light"},
    ],
    lunch:[
      {name:"Grilled Chicken with Millet & Bitter Greens",description:"Dry-spiced grilled chicken breast with trikatu, served over millet with sautéed methi (fenugreek) & radish",energy:"Moderate"},
      {name:"Spiced Fish & Barley",description:"Grilled mackerel or sardine with warming spices, barley grain & a side of roasted bitter gourd",energy:"Moderate"},
    ],
    evening:[
      {name:"Tulsi-Ginger Tea",description:"Holy basil with fresh ginger & black pepper — decongestant and stimulating",energy:"Light"},
    ],
    dinner:[
      {name:"Chicken & Vegetable Clear Broth",description:"Light chicken broth with radish, bitter gourd, ginger & turmeric — minimal oil, highly spiced",energy:"Light"},
      {name:"Egg Drop Vegetable Soup",description:"Thin spiced vegetable soup with a swirled egg, mustard seeds & methi leaves",energy:"Light"},
    ],
    daily_wisdom:"Kapha thrives on stimulation — vigorous morning exercise before eating is essential medicine.",
    agni_tip:"Chew fresh ginger with rock salt 15 minutes before lunch to activate sluggish Manda Agni.",
  },
};

const LOCAL_WISDOM = {
  Vata:  { meal_timing:{"06:30":"Warm water with lemon. Tongue scraping.","07:30":"Nourishing warm breakfast.","10:30":"CCF tea + soaked nuts.","12:30":"Main meal — kitchari or dal-rice.","16:00":"Ashwagandha golden milk.","19:00":"Light soup or khichdi.","21:30":"Warm milk with nutmeg."}, spice_blends:[{name:"Vata Churna",recipe:"Cumin, coriander, fennel, ginger, cinnamon, cardamom, hing",use:"1 tsp in any cooked dish"},{name:"CCF Tea",recipe:"Equal parts cumin, coriander, fennel seeds",use:"Boil 1 tsp in 2 cups water, drink warm"},{name:"Trikatu",recipe:"Equal parts ginger, black pepper, long pepper",use:"½ tsp with warm water before meals"}], eating_rules:["Eat at the SAME time daily — regularity is medicine","Always eat warm or room-temperature food","Add ghee or sesame oil to every meal","Sit down to eat — never eat standing","Finish eating by 7:30 PM","Do not eat while anxious or distracted"], avoid:{tastes:["Bitter excess","Pungent excess","Astringent excess"],qualities:["Cold","Dry","Light","Rough"],other:["Skipping meals","Raw salads","Cold water","Carbonated drinks"]}, supplements:[{name:"Ashwagandha",dose:"500mg with warm milk at bedtime",benefit:"Grounds Vata, builds Ojas"},{name:"Shatavari",dose:"1 tsp with warm milk twice daily",benefit:"Nourishes tissues, calms nerves"},{name:"Triphala",dose:"½ tsp with warm water before bed",benefit:"Regulates digestion overnight"}] },
  Pitta: { meal_timing:{"06:00":"Cool water + aloe vera juice.","07:30":"Fresh sweet fruit or barley porridge.","10:00":"Fennel tea. Sweet grapes.","12:30":"Large lunch — main meal.","16:30":"Rose water drink or coriander-mint tea.","18:30":"Light kitchari with cooling vegetables.","21:00":"Warm milk with shatavari or gulkand."}, spice_blends:[{name:"Pitta Churna",recipe:"Coriander, fennel, cardamom, turmeric, mint",use:"Sprinkle on food; cools digestion"},{name:"Cooling CCF",recipe:"Coriander, cardamom, fennel, rose petals (2:1:2:1)",use:"Steep, let cool before drinking"},{name:"Gulkand Drink",recipe:"1 tsp rose petal jam in room-temp milk",use:"Afternoon; deeply cooling for Pitta"}], eating_rules:["Never eat when angry — Pitta creates internal fire","Make lunch the LARGEST meal","Eat in a cool, pleasant environment","Add ghee — cooling for Pitta","Eat dinner before 7 PM","No icy water — cool or room-temp only"], avoid:{tastes:["Pungent excess","Sour excess","Salty excess"],qualities:["Hot","Sharp","Fermented"],other:["Chili","Raw garlic","Vinegar","Alcohol","Eating when angry"]}, supplements:[{name:"Amalaki (Amla)",dose:"1 tsp powder with water, morning",benefit:"Cooling, anti-inflammatory, richest Vitamin C"},{name:"Shatavari",dose:"1 tsp in warm milk at bedtime",benefit:"Cools Pitta heat, nourishes tissues"},{name:"Brahmi",dose:"300mg or ½ tsp with water",benefit:"Cools the fiery mind, reduces perfectionism"}] },
  Kapha: { meal_timing:{"05:30":"Tongue scraping. Dry brushing.","06:00":"Vigorous exercise — 30–45 min.","07:30":"Agni tea: ginger, lemon, honey, pepper.","09:00":"Light breakfast only if hungry.","12:30":"Main meal: spiced legumes + bitter veg.","16:30":"Trikatu herbal tea. No food till dinner.","18:30":"Thin vegetable broth or steamed greens."}, spice_blends:[{name:"Kapha Churna",recipe:"Ginger, black pepper, trikatu, cumin, turmeric, mustard seed",use:"Add generously to all cooked foods"},{name:"Trikatu Honey",recipe:"Equal ginger, black pepper, pippali mixed with raw honey",use:"¼ tsp with honey 15 min before meals"},{name:"Agni Tea",recipe:"Ginger, turmeric, black pepper, lemon, honey",use:"Boil ginger 10 min, cool, add honey+lemon"}], eating_rules:["Eat only when TRULY hungry","Never overeat — stop at 50–75% full","Largest meal at noon; dinner very small","Skip breakfast if not hungry — 16h fast ideal","No snacking between meals","Always add generous warming spices","Use minimal oil — max 1 tsp per meal"], avoid:{tastes:["Sweet excess","Sour excess","Salty excess"],qualities:["Heavy","Cold","Oily","Dense"],other:["Dairy","Fried food","White bread","Daytime sleeping","Bananas","Ice cream"]}, supplements:[{name:"Trikatu",dose:"¼ tsp with honey 15 min before meals",benefit:"Kindles digestive fire, clears Ama"},{name:"Guggulu",dose:"1 tablet twice daily with warm water",benefit:"Stimulates metabolism, reduces accumulation"},{name:"Punarnava",dose:"½ tsp powder with warm water",benefit:"Reduces water retention, supports kidneys"}] },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function AyurvedicPlanner() {
  const [dosha, setDosha]       = useState("Vata");
  const [goal, setGoal]         = useState("Balance");
  const [lifestyle, setLifestyle] = useState("Vegetarian");
  const [season, setSeason]     = useState(() => {
    const m = new Date().getMonth()+1;
    if (m<=2||m===12) return "Winter";
    if (m<=5) return "Spring";
    if (m<=8) return "Summer";
    return "Autumn";
  });
  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState("meals");
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [error, setError]       = useState(null);
  const [aiPowered, setAiPowered] = useState(false);
  const containerRef = useRef(null);

  const theme = DOSHA[dosha];

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    setAiPowered(false);

    const nonVegReminder = lifestyle === "Non-vegetarian"
      ? "\n\nIMPORTANT: This user is NON-VEGETARIAN. You MUST include eggs, fish, or chicken/mutton in at least 2-3 meal slots. Do NOT generate a vegetarian plan. Animal protein is required."
      : lifestyle === "Vegan"
      ? "\n\nIMPORTANT: This user is VEGAN. Use ZERO dairy, ghee, or animal products. Use coconut oil, tofu, and plant milks only."
      : "";

    const userPrompt = `Generate a unique daily meal plan for:
- Dosha: ${dosha}
- Goal: ${goal}
- Lifestyle: ${lifestyle}
- Season: ${season}
${nonVegReminder}

Be creative and different from typical plans. Ensure variety in grains, proteins, and cooking styles.`;

    try {
      const res = await fetch("http://localhost:5050/diet", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: SYSTEM_PROMPT,
          messages:[{role:"user",content:userPrompt}]
        })
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const raw = data.content?.map(b=>b.type==="text"?b.text:"").join("");
      const cleaned = raw.replace(/```json|```/g,"").trim();
      const meals = JSON.parse(cleaned);
      const local = LOCAL_WISDOM[dosha];
      setPlan({ meals, dosha, goal, lifestyle, season, ...local });
      setAiPowered(true);
    } catch {
      const fbMap = {
        "Vegan": FALLBACK_VEGAN,
        "Non-vegetarian": FALLBACK_NONVEG,
        "Vegetarian": FALLBACK_VEG,
      };
      const fb = fbMap[lifestyle] || FALLBACK_VEG;
      const local = LOCAL_WISDOM[dosha];
      const meals = JSON.parse(JSON.stringify(fb[dosha]));
      setPlan({ meals, dosha, goal, lifestyle, season, ...local });
      setAiPowered(false);
    } finally {
      setLoading(false);
      setActiveTab("meals");
      setActiveMeal("breakfast");
    }
  };

  const mealItems = plan?.meals?.[activeMeal] || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .ap-root{
          min-height:100vh;
          background:#FDFAF6;
          font-family:'DM Sans',sans-serif;
          display:flex;flex-direction:column;
        }

        /* ── Nav ── */
        .ap-nav{
          position:sticky;top:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 2rem;height:58px;
          background:rgba(253,250,246,0.96);
          backdrop-filter:blur(20px);
          border-bottom:1px solid #EDE0CF;
        }
        .ap-brand{
          font-family:'Playfair Display',serif;
          font-size:16px;font-weight:600;color:#2C1608;
          display:flex;align-items:center;gap:10px;letter-spacing:0.2px;
        }
        .ap-logo{
          width:34px;height:34px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;
          background:linear-gradient(135deg,#5C2E0A,#A0621A);
        }
        .ap-badge{
          font-size:10px;font-weight:600;letter-spacing:0.5px;
          padding:3px 9px;border-radius:99px;
          background:#E8F4E8;color:#2E7D32;
          border:1px solid #A5D6A7;
        }
        .ap-badge.fallback{background:#FFF8E1;color:#F57F17;border-color:#FFD54F;}

        /* ── Layout ── */
        .ap-layout{
          flex:1;display:flex;
        }

        /* ── Sidebar ── */
        .ap-sidebar{
          width:300px;flex-shrink:0;
          border-right:1px solid #EDE0CF;
          padding:1.5rem;
          overflow-y:auto;
          background:#FDFAF6;
        }
        .sidebar-section{margin-bottom:1.6rem;}
        .sidebar-label{
          font-size:10px;font-weight:600;letter-spacing:1.2px;
          text-transform:uppercase;color:#A08060;
          margin-bottom:0.7rem;
        }

        /* Dosha pills */
        .dosha-grid{display:flex;flex-direction:column;gap:6px;}
        .dosha-btn{
          display:flex;align-items:center;gap:10px;
          padding:10px 13px;border-radius:12px;
          border:1.5px solid transparent;
          cursor:pointer;transition:all 0.18s;
          background:#FFF;border-color:#EDE0CF;
        }
        .dosha-btn:hover{transform:translateX(2px);}
        .dosha-btn.active{border-width:2px;}
        .dosha-sym{font-size:18px;width:28px;text-align:center;}
        .dosha-info{flex:1;}
        .dosha-name{font-size:13px;font-weight:600;color:#2C1608;}
        .dosha-el{font-size:11px;color:#907050;margin-top:1px;}
        .dosha-agni{
          font-size:10px;font-weight:600;
          padding:2px 7px;border-radius:99px;
          background:rgba(0,0,0,0.06);color:#6B4A2A;
        }

        /* Generic pill grid */
        .pill-grid{display:flex;flex-wrap:wrap;gap:6px;}
        .pill-btn{
          padding:6px 12px;border-radius:99px;
          border:1.5px solid #EDE0CF;
          background:#FFF;
          font-size:12px;font-weight:500;color:#5A3A1A;
          cursor:pointer;transition:all 0.15s;
          display:flex;align-items:center;gap:5px;
        }
        .pill-btn:hover{border-color:#C4A882;}
        .pill-btn.active{border-width:2px;font-weight:600;}

        /* Generate button */
        .gen-btn{
          width:100%;padding:13px;
          border-radius:12px;border:none;
          font-family:'DM Sans',sans-serif;
          font-size:14px;font-weight:600;
          cursor:pointer;
          transition:all 0.2s;
          display:flex;align-items:center;justify-content:center;gap:8px;
          letter-spacing:0.1px;
          color:#FFF;
          margin-top:0.5rem;
        }
        .gen-btn:hover{transform:translateY(-1px);filter:brightness(1.08);}
        .gen-btn:active{transform:translateY(0px);}
        .gen-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}

        /* Spinner */
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{
          width:16px;height:16px;border-radius:50%;
          border:2px solid rgba(255,255,255,0.3);
          border-top-color:#FFF;
          animation:spin 0.7s linear infinite;
          flex-shrink:0;
        }

        /* ── Main Panel ── */
        .ap-main{flex:1;overflow:auto;display:flex;flex-direction:column;}

        /* Empty state */
        .ap-empty{
          flex:1;display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          gap:1rem;padding:3rem;
          color:#B09070;text-align:center;
        }
        .empty-icon{font-size:48px;margin-bottom:0.5rem;}
        .empty-title{
          font-family:'Playfair Display',serif;
          font-size:22px;color:#3D2010;margin-bottom:0.3rem;
        }
        .empty-sub{font-size:14px;line-height:1.6;max-width:340px;}

        /* Hero */
        .ap-hero{
          padding:1.8rem 2rem 1.4rem;
          color:#FFF;
          position:relative;overflow:hidden;
        }
        .ap-hero::before{
          content:'';position:absolute;
          inset:0;
          background:radial-gradient(ellipse 80% 60% at 80% 50%,rgba(255,255,255,0.08) 0%,transparent 60%);
          pointer-events:none;
        }
        .hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;}
        .hero-left{}
        .hero-sym{font-size:36px;margin-bottom:0.4rem;}
        .hero-title{
          font-family:'Playfair Display',serif;
          font-size:24px;font-weight:700;
          line-height:1.2;margin-bottom:4px;
        }
        .hero-sub{font-size:13px;opacity:0.75;font-style:italic;}
        .hero-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:1rem;}
        .hero-tag{
          padding:4px 12px;border-radius:99px;
          background:rgba(255,255,255,0.15);
          border:1px solid rgba(255,255,255,0.25);
          font-size:11px;font-weight:600;
          letter-spacing:0.3px;
        }
        .hero-agni{
          margin-top:1.1rem;padding:10px 14px;
          background:rgba(0,0,0,0.18);border-radius:10px;
          font-size:12px;opacity:0.85;line-height:1.6;
        }
        .hero-ai-note{
          margin-top:0.8rem;padding:8px 12px;
          background:rgba(255,255,255,0.12);border-radius:8px;
          font-size:11.5px;opacity:0.9;
          border:1px solid rgba(255,255,255,0.2);
          display:flex;gap:6px;align-items:center;
        }

        /* Seasonal banner */
        .seasonal{
          margin:0.8rem 2rem 0;
          padding:10px 14px;
          background:rgba(212,168,67,0.1);
          border:1px solid rgba(212,168,67,0.3);
          border-radius:10px;
          font-size:12.5px;color:#7A5A10;
          display:flex;gap:8px;line-height:1.6;
        }

        /* Wisdom bar */
        .wisdom-bar{
          margin:0.8rem 2rem 0;
          padding:10px 14px;
          border-radius:10px;
          font-size:12.5px;line-height:1.6;
          display:flex;gap:8px;align-items:flex-start;
        }

        /* Tabs */
        .ap-tabs{
          border-bottom:1px solid #EDE0CF;
          display:flex;overflow-x:auto;
          scrollbar-width:none;
          padding:0 1.5rem;gap:2px;
          flex-shrink:0;margin-top:0.8rem;
        }
        .ap-tabs::-webkit-scrollbar{display:none;}
        .ap-tab{
          padding:0.85rem 12px;
          border:none;background:transparent;
          font-family:'DM Sans',sans-serif;
          font-size:11.5px;font-weight:600;
          color:#B09070;cursor:pointer;
          border-bottom:2.5px solid transparent;
          white-space:nowrap;
          transition:all 0.15s;
          display:flex;align-items:center;gap:5px;
          letter-spacing:0.2px;
        }
        .ap-tab:hover{color:#6B4A2A;}
        .ap-tab.active{color:#3D1A0A;border-bottom-color:#3D1A0A;}

        /* Tab body */
        .ap-body{padding:1.5rem 2rem 3rem;flex:1;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .tab-anim{animation:fadeUp 0.28s ease;}

        /* Meal sub-tabs */
        .meal-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.3rem;}
        .meal-tab{
          display:flex;align-items:center;gap:6px;
          padding:7px 14px;
          border:1.5px solid #EDE0CF;border-radius:99px;
          background:#FDFAF6;cursor:pointer;
          font-family:'DM Sans',sans-serif;
          font-size:12px;font-weight:600;color:#8B6A4A;
          transition:all 0.15s;
        }
        .meal-tab:hover{border-color:#C4A882;background:#F5EFE6;}
        .meal-tab.active{border-width:2px;font-weight:700;}

        /* Meal time hint */
        .meal-time{
          font-size:11.5px;color:#A08060;margin-bottom:1rem;
          display:flex;align-items:center;gap:6px;
        }
        .time-dot{width:5px;height:5px;border-radius:50%;background:#C4A882;flex-shrink:0;}

        /* Meal cards */
        .meal-cards{display:flex;flex-direction:column;gap:10px;}
        .meal-card{
          padding:14px 16px;
          background:#FFF;
          border:1px solid #EDE0CF;border-radius:14px;
          transition:all 0.18s;
          display:flex;gap:12px;align-items:flex-start;
        }
        .meal-card:hover{border-color:#C4A882;transform:translateX(3px);box-shadow:0 2px 12px rgba(92,46,10,0.07);}
        .meal-card-icon{
          width:38px;height:38px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;flex-shrink:0;
          background:#FBF5EC;
        }
        .meal-card-body{flex:1;}
        .meal-card-name{
          font-family:'Playfair Display',serif;
          font-size:15px;font-weight:600;color:#2C1608;margin-bottom:4px;
        }
        .meal-card-desc{font-size:12.5px;color:#7A5040;line-height:1.6;}
        .meal-card-energy{
          padding:3px 10px;border-radius:99px;
          font-size:10.5px;font-weight:700;
          letter-spacing:0.3px;margin-top:7px;
          display:inline-block;
        }

        /* Section title */
        .sec-title{
          font-family:'Playfair Display',serif;
          font-size:15px;font-weight:600;color:#2C1608;
          margin-bottom:1rem;padding-bottom:0.6rem;
          border-bottom:1px solid #EDE0CF;
        }

        /* Timing list */
        .timing-list{display:flex;flex-direction:column;gap:0;position:relative;}
        .timing-list::before{
          content:'';position:absolute;
          left:48px;top:24px;bottom:24px;
          width:1px;background:linear-gradient(180deg,transparent,#E8D0B8 10%,#E8D0B8 90%,transparent);
        }
        .timing-row{
          display:flex;align-items:flex-start;gap:14px;
          padding:12px 0;position:relative;
        }
        .timing-t{
          width:85px;flex-shrink:0;
          font-size:11px;font-weight:700;color:#A07030;
          text-align:right;padding-top:3px;
        }
        .timing-dot-wrap{width:18px;flex-shrink:0;display:flex;align-items:flex-start;justify-content:center;padding-top:7px;position:relative;z-index:1;}
        .timing-dot{width:8px;height:8px;border-radius:50%;}
        .timing-text{font-size:13px;color:#4A2A10;line-height:1.5;}

        /* Spice cards */
        .spice-grid{display:flex;flex-direction:column;gap:10px;}
        .spice-card{
          padding:14px 16px;background:#FFF;
          border:1px solid #EDE0CF;border-radius:14px;
        }
        .spice-name{
          font-family:'Playfair Display',serif;
          font-size:14px;font-weight:600;color:#2C1608;margin-bottom:5px;
        }
        .spice-recipe{
          font-size:12px;color:#5A3A1A;margin-bottom:5px;line-height:1.55;
        }
        .spice-use{
          font-size:11.5px;color:#9A7050;
          font-style:italic;
          padding:6px 10px;background:#FBF5EC;border-radius:8px;
        }

        /* Rules list */
        .rules-list{display:flex;flex-direction:column;gap:8px;}
        .rule-item{
          display:flex;align-items:flex-start;gap:10px;
          padding:11px 14px;background:#FFF;
          border:1px solid #EDE0CF;border-radius:12px;
          font-size:13px;color:#3D2010;line-height:1.55;
        }
        .rule-num{
          width:22px;height:22px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:700;
          flex-shrink:0;color:#FFF;margin-top:2px;
        }

        /* Avoid grid */
        .avoid-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;}
        .avoid-panel{
          padding:12px 14px;background:#FFF;
          border:1px solid #EDE0CF;border-radius:12px;
        }
        .avoid-panel-title{
          font-size:10px;font-weight:700;letter-spacing:0.8px;
          text-transform:uppercase;color:#C0392B;margin-bottom:8px;
        }
        .avoid-item{
          font-size:12px;color:#4A2A10;
          padding:3px 0;border-bottom:1px solid #F5EBE0;line-height:1.4;
        }
        .avoid-item:last-child{border:none;}

        /* Supplements */
        .supp-list{display:flex;flex-direction:column;gap:10px;}
        .supp-card{
          display:flex;align-items:flex-start;gap:12px;
          padding:14px 16px;background:#FFF;
          border:1px solid #EDE0CF;border-radius:14px;
        }
        .supp-icon{
          width:38px;height:38px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;flex-shrink:0;
        }
        .supp-name{font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:#2C1608;margin-bottom:3px;}
        .supp-dose{font-size:12px;color:#5A3A1A;margin-bottom:3px;}
        .supp-benefit{font-size:12px;color:#9A7050;font-style:italic;}

        /* Loading overlay */
        .ap-loading{
          flex:1;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:1rem;
          color:#8B6A4A;
        }
        .loading-ring{
          width:48px;height:48px;border-radius:50%;
          border:3px solid #EDE0CF;
          animation:spin 0.8s linear infinite;
          flex-shrink:0;
        }
        .loading-text{
          font-family:'Playfair Display',serif;
          font-size:16px;color:#3D2010;font-style:italic;
        }
        .loading-sub{font-size:12px;color:#B09070;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .loading-dots span{display:inline-block;animation:pulse 1.4s ease infinite;}
        .loading-dots span:nth-child(2){animation-delay:0.2s;}
        .loading-dots span:nth-child(3){animation-delay:0.4s;}

        @media(max-width:768px){
          .ap-sidebar{width:100%;border-right:none;border-bottom:1px solid #EDE0CF;}
          .ap-layout{flex-direction:column;}
        }
      `}</style>

      <div className="ap-root">
        {/* ── Nav ── */}
        <nav className="ap-nav">
          <div className="ap-brand">
            <div className="ap-logo">🪷</div>
            <span>Āyur Āhāra</span>
            <span style={{fontSize:12,color:"#A08060",fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:400}}>
              — The Art of Mindful Eating
            </span>
          </div>
          {plan && (
            <div className={`ap-badge ${aiPowered?"":"fallback"}`}>
              {aiPowered ? "✦ AI Generated" : "⚡ Local Plan"}
            </div>
          )}
        </nav>

        <div className="ap-layout">
          {/* ── Sidebar ── */}
          <aside className="ap-sidebar">

            {/* Dosha */}
            <div className="sidebar-section">
              <div className="sidebar-label">Your Dosha (Prakriti)</div>
              <div className="dosha-grid">
                {Object.entries(DOSHA).map(([d,t]) => (
                  <button
                    key={d}
                    className={`dosha-btn${dosha===d?" active":""}`}
                    style={dosha===d?{borderColor:t.color,background:t.bg}:{}}
                    onClick={()=>setDosha(d)}
                  >
                    <span className="dosha-sym">{t.sym}</span>
                    <div className="dosha-info">
                      <div className="dosha-name" style={dosha===d?{color:t.text}:{}}>{d}</div>
                      <div className="dosha-el">{t.el}</div>
                    </div>
                    {dosha===d&&<span className="dosha-agni" style={{color:t.text,background:`${t.color}22`}}>{t.agni}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className="sidebar-section">
              <div className="sidebar-label">Goal (Lakshya)</div>
              <div className="pill-grid">
                {GOALS.map(g=>(
                  <button
                    key={g.id}
                    className={`pill-btn${goal===g.id?" active":""}`}
                    style={goal===g.id?{borderColor:theme.color,color:theme.text,background:theme.bg}:{}}
                    onClick={()=>setGoal(g.id)}
                    title={g.desc}
                  >
                    <span style={{fontSize:13}}>{g.icon}</span> {g.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle */}
            <div className="sidebar-section">
              <div className="sidebar-label">Lifestyle (Aahar)</div>
              <div className="pill-grid">
                {LIFESTYLES.map(l=>(
                  <button
                    key={l.id}
                    className={`pill-btn${lifestyle===l.id?" active":""}`}
                    style={lifestyle===l.id?{borderColor:theme.color,color:theme.text,background:theme.bg}:{}}
                    onClick={()=>setLifestyle(l.id)}
                    title={l.sub}
                  >
                    <span style={{fontSize:13}}>{l.icon}</span> {l.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div className="sidebar-section">
              <div className="sidebar-label">Season (Ritu)</div>
              <div className="pill-grid">
                {SEASONS.map(s=>(
                  <button
                    key={s.id}
                    className={`pill-btn${season===s.id?" active":""}`}
                    style={season===s.id?{borderColor:theme.color,color:theme.text,background:theme.bg}:{}}
                    onClick={()=>setSeason(s.id)}
                  >
                    <span style={{fontSize:13}}>{s.icon}</span> {s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button
              className="gen-btn"
              style={{background:theme.gradient}}
              onClick={generatePlan}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner"/> Crafting Your Plan…</>
                : <><span style={{fontSize:16}}>✦</span> Generate My Plan</>
              }
            </button>

            {plan && !loading && (
              <button
                className="gen-btn"
                style={{background:"transparent",color:theme.color,border:`1.5px solid ${theme.color}`,marginTop:8}}
                onClick={generatePlan}
                disabled={loading}
              >
                <span style={{fontSize:14}}>⟳</span> New Variation
              </button>
            )}
          </aside>

          {/* ── Main ── */}
          <main className="ap-main" ref={containerRef}>
            {loading && (
              <div className="ap-loading">
                <div className="loading-ring" style={{borderTopColor:theme.color}}/>
                <div className="loading-text">Consulting the ancient texts</div>
                <div className="loading-sub">
                  <span className="loading-dots">
                    <span>•</span><span>•</span><span>•</span>
                  </span>
                </div>
              </div>
            )}

            {!loading && !plan && (
              <div className="ap-empty">
                <div className="empty-icon">🪷</div>
                <div className="empty-title">Your Personalised Āhāra Awaits</div>
                <p className="empty-sub">
                  Select your Dosha, goal, lifestyle & season on the left, then let ancient Ayurvedic wisdom craft a unique daily meal plan just for you.
                </p>
                <p style={{fontSize:12,color:"#C4A882",marginTop:8,fontStyle:"italic"}}>
                  "Let food be thy medicine, and medicine be thy food."
                </p>
              </div>
            )}

            {!loading && plan && (
              <>
                {/* Hero */}
                <div className="ap-hero" style={{background:theme.gradient}}>
                  <div className="hero-top">
                    <div className="hero-left">
                      <div className="hero-sym">{theme.sym}</div>
                      <div className="hero-title">{dosha} Dosha Plan</div>
                      <div className="hero-sub">{theme.el} · {theme.agni}</div>
                    </div>
                  </div>
                  <div className="hero-tags">
                    <span className="hero-tag">🎯 {goal}</span>
                    <span className="hero-tag">{LIFESTYLES.find(l=>l.id===lifestyle)?.icon} {lifestyle}</span>
                    <span className="hero-tag">{SEASONS.find(s=>s.id===season)?.icon} {season}</span>
                  </div>
                  {plan.meals?.agni_tip && (
                    <div className="hero-agni">
                      <strong>Agni Tip:</strong> {plan.meals.agni_tip}
                    </div>
                  )}
                  {aiPowered && (
                    <div className="hero-ai-note">
                      <span>✦</span> Uniquely generated by AI — each plan is different
                    </div>
                  )}
                </div>

                {/* Seasonal note */}
                {plan.seasonal_note && (
                  <div className="seasonal">
                    <span style={{fontSize:14,flexShrink:0}}>🌿</span>
                    <span><strong>Seasonal Guidance:</strong> {plan.seasonal_note}</span>
                  </div>
                )}

                {/* Daily wisdom */}
                {plan.meals?.daily_wisdom && (
                  <div className="wisdom-bar" style={{background:theme.bg,border:`1px solid ${theme.color}30`}}>
                    <span style={{fontSize:14,flexShrink:0}}>💡</span>
                    <span style={{fontSize:12.5,color:theme.text,fontStyle:"italic"}}>{plan.meals.daily_wisdom}</span>
                  </div>
                )}

                {/* Tabs */}
                <div className="ap-tabs">
                  {TABS.map(t=>(
                    <button
                      key={t.id}
                      className={`ap-tab${activeTab===t.id?" active":""}`}
                      style={activeTab===t.id?{color:theme.text,borderBottomColor:theme.color}:{}}
                      onClick={()=>setActiveTab(t.id)}
                    >
                      <span style={{fontSize:13}}>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab Body */}
                <div className="ap-body tab-anim" key={activeTab}>

                  {/* ── MEALS ── */}
                  {activeTab==="meals" && (
                    <>
                      <div className="meal-tabs">
                        {Object.entries(MEAL_META).map(([k,m])=>(
                          <button
                            key={k}
                            className={`meal-tab${activeMeal===k?" active":""}`}
                            style={activeMeal===k?{borderColor:theme.color,color:theme.text,background:theme.bg}:{}}
                            onClick={()=>setActiveMeal(k)}
                          >
                            <span style={{fontSize:14}}>{m.icon}</span> {m.label}
                          </button>
                        ))}
                      </div>
                      <div className="meal-time">
                        <div className="time-dot" style={{background:theme.color}}/>
                        <span>{MEAL_META[activeMeal].time}</span>
                      </div>
                      <div className="meal-cards">
                        {(plan.meals?.[activeMeal]||[]).map((item,i)=>{
                          const ec = ENERGY_COLORS[item.energy] || ENERGY_COLORS.Moderate;
                          return (
                            <div key={i} className="meal-card">
                              <div className="meal-card-icon" style={{background:theme.bg}}>
                                {MEAL_META[activeMeal].icon}
                              </div>
                              <div className="meal-card-body">
                                <div className="meal-card-name">{item.name}</div>
                                <div className="meal-card-desc">{item.description}</div>
                                <span
                                  className="meal-card-energy"
                                  style={{background:ec.bg,color:ec.text,border:`1px solid ${ec.border}`}}
                                >
                                  {item.energy}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {(plan.meals?.[activeMeal]||[]).length===0&&(
                          <div style={{color:"#B09070",fontSize:13,fontStyle:"italic",padding:"1rem 0"}}>
                            No specific items for this meal slot with your lifestyle filter.
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── TIMING ── */}
                  {activeTab==="timing" && plan.meal_timing && (
                    <>
                      <div className="sec-title">Daily Dinacharya Schedule</div>
                      <div className="timing-list">
                        {Object.entries(plan.meal_timing).map(([k,v],i)=>(
                          <div key={i} className="timing-row">
                            <div className="timing-t">{k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div>
                            <div className="timing-dot-wrap">
                              <div className="timing-dot" style={{background:theme.color,boxShadow:`0 0 0 2px ${theme.color}`}}/>
                            </div>
                            <div className="timing-text">{v}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ── SPICES ── */}
                  {activeTab==="spices" && plan.spice_blends && (
                    <>
                      <div className="sec-title">Sacred Spice Blends (Churnas)</div>
                      <div className="spice-grid">
                        {plan.spice_blends.map((s,i)=>(
                          <div key={i} className="spice-card" style={{borderLeft:`4px solid ${theme.color}`}}>
                            <div className="spice-name">🌶️ {s.name}</div>
                            <div className="spice-recipe"><strong>Recipe:</strong> {s.recipe}</div>
                            <div className="spice-use">💡 {s.use}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ── WISDOM ── */}
                  {activeTab==="wisdom" && plan.eating_rules && (
                    <>
                      <div className="sec-title">Āhāra Vidhi — Eating Rules</div>
                      <div className="rules-list">
                        {plan.eating_rules.map((r,i)=>(
                          <div key={i} className="rule-item">
                            <div className="rule-num" style={{background:theme.color}}>{i+1}</div>
                            {r}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ── AVOID ── */}
                  {activeTab==="avoid" && plan.avoid && (
                    <>
                      <div className="sec-title">Foods to Minimise</div>
                      <div className="avoid-grid">
                        {Object.entries(plan.avoid).filter(([,v])=>Array.isArray(v)&&v.length>0).map(([cat,items])=>(
                          <div key={cat} className="avoid-panel">
                            <div className="avoid-panel-title">{cat.replace(/_/g," ")}</div>
                            {items.map((it,i)=>(
                              <div key={i} className="avoid-item">⚠️ {it}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ── SUPPLEMENTS ── */}
                  {activeTab==="supplements" && plan.supplements && (
                    <>
                      <div className="sec-title">Herbal Support (Dravyaguna)</div>
                      <div className="supp-list">
                        {plan.supplements.map((s,i)=>(
                          <div key={i} className="supp-card" style={{borderLeft:`3px solid ${theme.color}`}}>
                            <div className="supp-icon" style={{background:theme.bg}}>🌿</div>
                            <div>
                              <div className="supp-name">{s.name}</div>
                              <div className="supp-dose">📋 {s.dose}</div>
                              <div className="supp-benefit">{s.benefit}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
