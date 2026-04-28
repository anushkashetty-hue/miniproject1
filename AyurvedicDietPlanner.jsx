import { useState, useRef } from "react";

/* ─── Design Tokens ───────────────────────────────────────────────────────── */
const DOSHA = {
  Vata:  {
    color: "#7C6FCD", bg: "#F0EEFB", text: "#3B2F8F",
    accent: "#5B4EC4", sym: "🌬️", el: "Air + Ether", agni: "Vishama Agni",
    gradient: "linear-gradient(135deg,#6B5FC4 0%,#9B8EE4 100%)",
    seasonalNote: "Autumn & Winter aggravate Vata. Maximise warmth, oil, and routine. Avoid cold, raw, and dry foods completely.",
  },
  Pitta: {
    color: "#D05A1E", bg: "#FBF0EB", text: "#7A2A05",
    accent: "#C04010", sym: "🔥", el: "Fire + Water", agni: "Tikshna Agni",
    gradient: "linear-gradient(135deg,#C84A10 0%,#E88040 100%)",
    seasonalNote: "Summer aggravates Pitta. Emphasise cooling, refreshing foods. Avoid heat, spice, and fermented foods.",
  },
  Kapha: {
    color: "#2E8A52", bg: "#EAF7F0", text: "#145030",
    accent: "#1E7A42", sym: "🌍", el: "Earth + Water", agni: "Manda Agni",
    gradient: "linear-gradient(135deg,#267044 0%,#5AAF80 100%)",
    seasonalNote: "Spring is peak Kapha season. Increase stimulation, movement, and light foods. Avoid heavy, cold, and oily meals.",
  },
};

const GOALS = [
  { id: "Balance",  icon: "⚖️", desc: "Restore doshic harmony" },
  { id: "Detox",    icon: "🫧", desc: "Cleanse Ama (toxins)" },
  { id: "Energy",   icon: "⚡", desc: "Build Ojas & vitality" },
  { id: "Weight",   icon: "🌿", desc: "Healthy weight management" },
  { id: "Immunity", icon: "🛡️", desc: "Strengthen natural defenses" },
];

const LIFESTYLES = [
  { id: "Vegetarian",     icon: "🥗", sub: "Dairy included" },
  { id: "Vegan",          icon: "🌱", sub: "No animal products" },
  { id: "Non-vegetarian", icon: "🍳", sub: "Eggs & light meats" },
];

const SEASONS = [
  { id: "Spring", icon: "🌸" }, { id: "Summer", icon: "☀️" },
  { id: "Autumn", icon: "🍂" }, { id: "Winter", icon: "❄️" },
];

const MEAL_META = {
  breakfast:   { icon: "🌅", label: "Breakfast",   time: "7:30 – 8:30 AM" },
  mid_morning: { icon: "🍵", label: "Mid-Morning", time: "10:30 AM" },
  lunch:       { icon: "☀️", label: "Lunch",       time: "12:00 – 1:30 PM" },
  evening:     { icon: "🌤️", label: "Evening",     time: "4:00 – 5:00 PM" },
  dinner:      { icon: "🌙", label: "Dinner",      time: "6:30 – 7:30 PM" },
};

const ENERGY_COLORS = {
  Light:      { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  Moderate:   { bg: "#FFF8E1", text: "#F57F17", border: "#FFD54F" },
  Heavy:      { bg: "#FDE8E8", text: "#B71C1C", border: "#EF9A9A" },
  Nourishing: { bg: "#E3F2FD", text: "#0D47A1", border: "#90CAF9" },
};

const TABS = [
  { id: "meals",       label: "Meal Plan",    icon: "🍽️" },
  { id: "timing",      label: "Timing",       icon: "⏰" },
  { id: "spices",      label: "Spice Blends", icon: "🌶️" },
  { id: "wisdom",      label: "Eating Rules", icon: "📜" },
  { id: "avoid",       label: "Avoid",        icon: "⚠️" },
  { id: "supplements", label: "Herbs",        icon: "🌱" },
];

/* ─── AI Prompt ──────────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are an expert Ayurvedic nutritionist and creative meal planner. Generate a UNIQUE daily meal plan every time.

CRITICAL RULES:
1. LIFESTYLE — NEVER IGNORE:
   - Vegan: ZERO dairy, ghee, eggs, fish, meat. Coconut oil, plant milks, tofu only.
   - Vegetarian: Dairy and ghee allowed. NO eggs, fish, or meat.
   - Non-vegetarian: MUST include eggs, fish, or chicken in at least 2-3 meal slots. Animal protein is REQUIRED.
2. DOSHA: Match foods to balance the specified dosha. Use warm, digestible combinations.
3. DIVERSITY: Rotate grains (rice, millet, quinoa, barley, ragi), proteins (dal, eggs, fish, paneer, chickpeas), cooking styles.
4. REALISTIC: Actual home-cooked dishes with clear ingredients.
5. ENERGY: Breakfast=Light/Moderate, Lunch=Nourishing, Dinner=Light.
6. GOAL: Detox=cleansing, Energy=ojas-building, Weight=light+spiced, Immunity=turmeric/ashwagandha.

OUTPUT — strict JSON only, no markdown, no prose:
{
  "breakfast":   [{"name":"...","description":"...","energy":"Light|Moderate|Heavy|Nourishing"}],
  "mid_morning": [{"name":"...","description":"...","energy":"Light|Moderate"}],
  "lunch":       [{"name":"...","description":"...","energy":"Nourishing|Moderate"}],
  "evening":     [{"name":"...","description":"...","energy":"Light"}],
  "dinner":      [{"name":"...","description":"...","energy":"Light|Moderate"}],
  "daily_wisdom": "One Ayurvedic insight for today (1 sentence)",
  "agni_tip":    "Specific tip for this dosha's digestive fire (1 sentence)"
}

2-3 items per section. No meal repeated across sections.`;

/* ─── Local wisdom (timing, spices, rules, avoid, supplements) ───────────── */
const LOCAL_WISDOM = {
  Vata: {
    agni_tip: "Add a small piece of fresh ginger with rock salt before meals to kindle your variable Vishama Agni.",
    daily_wisdom: "Regularity is the greatest medicine for Vata — eat at the same times daily.",
    meal_timing: {
      "06:30": "Warm water with lemon. Tongue scraping. Sesame oil pulling.",
      "07:30": "Nourishing warm breakfast — never skip.",
      "10:30": "CCF tea + 4–6 soaked almonds or 1–2 dates.",
      "12:30": "Main meal — kitchari, dal-rice with ghee, or warm curry.",
      "16:00": "Ashwagandha golden milk or ginger tea.",
      "19:00": "Light soup or khichdi — finish eating by 7:30 PM.",
      "21:30": "Warm milk with nutmeg or triphala in water.",
      "22:00": "Sleep — consistency is essential for Vata.",
    },
    spice_blends: [
      { name: "Vata Churna",  recipe: "Cumin, coriander, fennel, ginger, cinnamon, cardamom, hing (1:1:1:½:½:½:pinch)", use: "1 tsp in any cooked dish per serving" },
      { name: "CCF Tea",      recipe: "Equal parts cumin, coriander, fennel seeds", use: "Boil 1 tsp in 2 cups water for 5 min. Drink warm between meals." },
      { name: "Trikatu",      recipe: "Equal parts ginger, black pepper, long pepper", use: "½ tsp with warm water before meals to kindle digestion." },
    ],
    eating_rules: [
      "Eat at the SAME time every day — routine is medicine for Vata",
      "Always eat warm or room-temperature food — never cold",
      "Add ghee or sesame oil to every meal — fats ground Vata",
      "Sit down to eat — never eat standing or walking",
      "Eat in a calm, quiet environment — stress kills Vata digestion",
      "Chew thoroughly; never rush or eat while distracted",
      "Finish eating by 7:30 PM for proper overnight digestion",
      "Drink warm water or herbal tea — never ice water",
    ],
    avoid: {
      tastes:     ["Bitter (excess)", "Pungent (excess)", "Astringent (excess)"],
      qualities:  ["Cold", "Dry", "Light", "Rough", "Raw"],
      foods:      ["Popcorn", "Crackers", "Raw salads", "Dried fruits (unsoaked)"],
      drinks:     ["Cold water", "Carbonated drinks", "Caffeine", "Alcohol"],
      habits:     ["Skipping meals", "Eating while anxious", "Late-night eating", "Prolonged fasting"],
    },
    supplements: [
      { name: "Ashwagandha", dose: "500mg with warm milk at bedtime",           benefit: "Grounds Vata, builds Ojas and strength" },
      { name: "Shatavari",   dose: "1 tsp powder with warm milk, twice daily",  benefit: "Nourishes tissues, calms nervous system" },
      { name: "Triphala",    dose: "½ tsp with warm water before bed",          benefit: "Regulates irregular digestion overnight" },
    ],
  },

  Pitta: {
    agni_tip: "Sip fennel tea after meals to cool Tikshna Agni and prevent heat-driven inflammation.",
    daily_wisdom: "Make lunch the largest meal — Pitta's sharp Agni peaks at noon and handles the most at midday.",
    meal_timing: {
      "06:00": "Cool water + 2 tbsp aloe vera juice or coconut water.",
      "07:30": "Light, sweet, cooling breakfast — fruits or barley porridge.",
      "10:00": "Fennel herbal tea. A handful of sweet grapes or pomegranate.",
      "12:30": "LARGEST meal — Pitta digests best at noon; prioritise this meal.",
      "16:30": "Rose water drink or coriander-mint tea. No heavy snacks.",
      "18:30": "Light, early dinner before 7 PM — small portions only.",
      "21:00": "Warm milk with shatavari or gulkand (rose jam).",
      "22:30": "Sleep.",
    },
    spice_blends: [
      { name: "Pitta Churna",  recipe: "Coriander, fennel, cardamom, turmeric, mint, shatavari (2:2:1:1:1:1)", use: "Sprinkle on food; cools digestion without dulling it." },
      { name: "Cooling CCF",   recipe: "Coriander, cardamom, fennel, rose petals (2:1:2:1)",                   use: "Steep in hot water, let cool before drinking." },
      { name: "Gulkand Drink", recipe: "1 tsp rose petal jam (gulkand) in room-temperature milk",              use: "Afternoon; deeply cooling for Pitta heat." },
    ],
    eating_rules: [
      "Never eat when angry or stressed — Pitta creates internal fire",
      "Make lunch the LARGEST meal of the day",
      "Eat in a cool, pleasant, and beautiful environment",
      "Add ghee to food — it is specifically cooling for Pitta",
      "Eat dinner before 7 PM for best overnight processing",
      "Avoid icy water — cool or room-temperature is fine",
      "Do not eat when overheated after exercise",
      "Sit for at least 5 minutes after eating — do not rush",
    ],
    avoid: {
      tastes:    ["Pungent (excess)", "Sour (excess)", "Salty (excess)"],
      qualities: ["Hot", "Sharp", "Fermented", "Oily in excess"],
      foods:     ["Chili", "Raw garlic", "Vinegar", "Pickles", "Tomatoes (excess)", "Red meat"],
      drinks:    ["Alcohol", "Coffee", "Black tea", "Sour fruit juices"],
      habits:    ["Eating when angry", "Eating in the sun/heat", "Very late dinners", "Skipping then overeating"],
    },
    supplements: [
      { name: "Amalaki (Amla)", dose: "1 tsp powder with room-temp water, morning", benefit: "Cooling, anti-inflammatory, richest Vitamin C source" },
      { name: "Shatavari",      dose: "1 tsp in warm milk at bedtime",              benefit: "Cools Pitta heat, nourishes tissues" },
      { name: "Brahmi",         dose: "300mg or ½ tsp with water",                  benefit: "Cools the fiery mind, reduces perfectionism and stress" },
    ],
  },

  Kapha: {
    agni_tip: "Chew a small piece of fresh ginger with rock salt 15 minutes before lunch to activate sluggish Manda Agni.",
    daily_wisdom: "Kapha thrives on movement and stimulation — vigorous morning exercise before eating is the most important medicine.",
    meal_timing: {
      "05:30": "Wake before sunrise. Tongue scraping. Dry brushing (Garshana) all over body.",
      "06:00": "Vigorous exercise — run, cycle, or dance for 30–45 minutes.",
      "07:30": "Agni Tea: ginger, lemon, honey, black pepper in warm water.",
      "09:00": "Light breakfast ONLY if truly hungry — skip if not.",
      "12:30": "Largest meal: spiced legumes + bitter vegetables + minimal oil.",
      "16:30": "Trikatu herbal tea only. NO food until dinner.",
      "18:30": "Very light dinner — thin soup or steamed greens with dal.",
      "22:00": "Sleep (never past 10:30 PM; do not oversleep past 6 AM).",
    },
    spice_blends: [
      { name: "Kapha Churna",  recipe: "Ginger, black pepper, trikatu, cumin, turmeric, mustard seed (2:1:1:1:1:½)", use: "Add generously to all cooked foods." },
      { name: "Trikatu",       recipe: "Equal parts ginger, black pepper, pippali (long pepper)",                     use: "¼ tsp with raw honey 15 min before meals." },
      { name: "Agni Tea",      recipe: "1-inch fresh ginger, ½ tsp turmeric, pinch black pepper, lemon, honey",      use: "Boil ginger 10 min, cool slightly, add honey + lemon. Drink every morning." },
    ],
    eating_rules: [
      "Eat only when TRULY hungry — Kapha should not eat out of habit",
      "Never overeat — stop at 50–75% full",
      "Make lunch the biggest meal; keep dinner very small",
      "Skip breakfast if not hungry — a 16-hour overnight fast is beneficial",
      "No snacking between meals — allow 4–5 hours between each meal",
      "Always add generous warming spices — they are medicine for Kapha",
      "Use minimal oil — no more than 1 tsp per meal",
      "Prefer dry cooking: roasting, grilling, steaming — never deep frying",
    ],
    avoid: {
      tastes:    ["Sweet (excess)", "Sour (excess)", "Salty (excess)"],
      qualities: ["Heavy", "Cold", "Oily", "Dense", "Smooth"],
      foods:     ["Dairy", "White bread", "Pasta", "Fried foods", "Bananas", "Avocado", "Ice cream"],
      drinks:    ["Cold water", "Fruit juices (sweet)", "Alcohol", "Coconut water (excess)"],
      habits:    ["Daytime sleeping", "Eating without hunger", "Overeating", "Skipping morning exercise"],
    },
    supplements: [
      { name: "Trikatu",    dose: "¼ tsp with raw honey, 15 min before meals", benefit: "Kindles digestive fire, clears Ama and congestion" },
      { name: "Guggulu",    dose: "1 tablet twice daily with warm water",       benefit: "Stimulates metabolism, reduces Kapha accumulation" },
      { name: "Punarnava",  dose: "½ tsp powder with warm water",               benefit: "Reduces water retention, supports kidney function" },
    ],
  },
};

/* ─── Fallback meal data (Vegetarian) ─────────────────────────────────────── */
const FALLBACK_VEG = {
  Vata: {
    breakfast:   [
      { name: "Spiced Ragi Porridge",   description: "Finger millet cooked with warm almond milk, jaggery, cardamom & a tsp of ghee", energy: "Moderate" },
      { name: "Soaked Almond Kheer",    description: "Blended soaked almonds with warm milk, saffron, dates & nutmeg",               energy: "Moderate" },
    ],
    mid_morning: [
      { name: "CCF Herbal Tea + Fig",   description: "Cumin-coriander-fennel decoction with 2 soaked figs",                          energy: "Light" },
      { name: "Warm Ashwagandha Milk",  description: "Warm whole milk with ashwagandha powder, honey & cinnamon",                    energy: "Light" },
    ],
    lunch:       [
      { name: "Tridoshic Kitchari",     description: "Yellow mung dal & basmati rice slow-cooked with ghee, cumin, turmeric & root vegetables", energy: "Nourishing" },
      { name: "Paneer & Root Curry",    description: "Soft paneer cubes in mild tomato-ginger gravy with sweet potato & carrots, served with roti", energy: "Nourishing" },
    ],
    evening:     [
      { name: "Ginger-Date Elixir",    description: "Fresh ginger tea with 2 medjool dates & a pinch of black salt",                 energy: "Light" },
    ],
    dinner:      [
      { name: "Moong Soup with Roti",  description: "Thin green moong broth with cumin tadka, 1 soft wheat roti & ghee",             energy: "Light" },
      { name: "Pumpkin Stew",          description: "Slow-simmered yellow pumpkin with warming spices, coconut & coriander",         energy: "Moderate" },
    ],
  },
  Pitta: {
    breakfast:   [
      { name: "Coconut Barley Porridge", description: "Pearl barley simmered in coconut milk with cardamom, ripe mango & rose petal jam", energy: "Moderate" },
      { name: "Sweet Fennel Oats",       description: "Rolled oats cooked with fennel seeds, dates, coriander & warm milk",               energy: "Light" },
    ],
    mid_morning: [
      { name: "Gulkand Rose Lassi",    description: "Cooling yogurt drink blended with gulkand, fennel & a pinch of cardamom",           energy: "Light" },
      { name: "Pomegranate + Coconut", description: "Fresh pomegranate arils in room-temperature coconut water with mint",                energy: "Light" },
    ],
    lunch:       [
      { name: "Basmati + Moong Dal",   description: "Fluffy basmati with ghee-tempered mung dal, cucumber-mint raita & steamed broccoli", energy: "Nourishing" },
      { name: "Cucumber Quinoa Bowl",  description: "Quinoa with mild sambar, ash gourd, drumstick & coconut-coriander chutney",          energy: "Moderate" },
    ],
    evening:     [
      { name: "Coriander-Mint Tea",    description: "Fresh coriander seeds, mint leaves & fennel steeped for 5 minutes",                  energy: "Light" },
    ],
    dinner:      [
      { name: "Zucchini Kitchari",     description: "Mild kitchari with zucchini, asparagus & cooling coriander — small portion",         energy: "Light" },
      { name: "Palak Dal",             description: "Masoor dal with palak (spinach), coconut oil tadka & a squeeze of cooling lime",      energy: "Light" },
    ],
  },
  Kapha: {
    breakfast:   [
      { name: "Spiced Pear",           description: "Poached pear with cinnamon, black pepper & a drizzle of honey",                      energy: "Light" },
      { name: "Agni Igniter Tea",      description: "Strong ginger-turmeric-black pepper decoction with lemon & honey",                   energy: "Light" },
    ],
    mid_morning: [
      { name: "Trikatu Water",         description: "Warm water with ¼ tsp trikatu — stimulate digestion, no solid food",                 energy: "Light" },
    ],
    lunch:       [
      { name: "Masoor Dal + Millet",   description: "Spiced red lentil soup with trikatu, dry-roasted millet bhakri & bitter gourd sabzi", energy: "Moderate" },
      { name: "Sprouted Moong Stir-Fry", description: "Dry-sautéed sprouted mung with mustard seeds, garlic & curry leaves over barley",  energy: "Moderate" },
    ],
    evening:     [
      { name: "Tulsi-Ginger Tea",      description: "Holy basil decoction with fresh ginger & black pepper — decongestant",               energy: "Light" },
    ],
    dinner:      [
      { name: "Thin Vegetable Broth",  description: "Light stock with radish, bitter gourd, ginger & turmeric — minimal oil",             energy: "Light" },
      { name: "Steamed Greens + Mung", description: "Blanched methi (fenugreek) leaves with a small cup of thin mung soup & lemon",       energy: "Light" },
    ],
  },
};

/* ─── Fallback meal data (Vegan) ──────────────────────────────────────────── */
const FALLBACK_VEGAN = {
  Vata: {
    breakfast:   [
      { name: "Ragi Porridge (Vegan)", description: "Finger millet with warm oat milk, jaggery, cardamom & coconut oil",               energy: "Moderate" },
      { name: "Chia-Date Warm Bowl",   description: "Soaked chia in coconut milk with medjool dates, cinnamon & toasted sesame",       energy: "Moderate" },
    ],
    mid_morning: [
      { name: "CCF Tea + Fig",         description: "Cumin-coriander-fennel decoction with 2 soaked figs",                             energy: "Light" },
    ],
    lunch:       [
      { name: "Tofu Kitchari",         description: "Yellow mung dal & basmati with coconut oil, cumin, soft tofu & root vegetables",   energy: "Nourishing" },
      { name: "Pumpkin-Coconut Curry", description: "Rich pumpkin in coconut milk with warming spices, served with roti",              energy: "Nourishing" },
    ],
    evening:     [
      { name: "Ginger-Date Elixir",    description: "Fresh ginger tea with 2 medjool dates & black salt",                              energy: "Light" },
    ],
    dinner:      [
      { name: "Moong Soup + Roti",     description: "Thin green moong broth with cumin tadka, 1 soft wheat roti & coconut oil",        energy: "Light" },
      { name: "Zucchini Stew",         description: "Slow-simmered zucchini with warming spices & coriander",                          energy: "Light" },
    ],
  },
  Pitta: {
    breakfast:   [
      { name: "Coconut Barley Porridge", description: "Pearl barley in coconut milk with cardamom, mango & rose jam",                  energy: "Moderate" },
      { name: "Sweet Fennel Oats",       description: "Rolled oats with fennel, dates, coriander & coconut milk",                     energy: "Light" },
    ],
    mid_morning: [
      { name: "Coconut-Pomegranate",   description: "Room-temperature coconut water with fresh pomegranate arils and mint",            energy: "Light" },
    ],
    lunch:       [
      { name: "Tofu Basmati Bowl",     description: "Basmati with coconut-oil-tempered mung dal, cucumber salad & grilled tofu",       energy: "Nourishing" },
      { name: "Quinoa Sambar",         description: "Quinoa with mild sambar, tofu & coconut-coriander chutney",                      energy: "Moderate" },
    ],
    evening:     [
      { name: "Coriander-Mint Tea",    description: "Coriander seeds, mint & fennel steeped 5 minutes",                               energy: "Light" },
    ],
    dinner:      [
      { name: "Zucchini Kitchari",     description: "Mild kitchari with zucchini, asparagus & cooling coriander",                     energy: "Light" },
      { name: "Palak Tofu Dal",        description: "Masoor dal with palak, coconut oil tadka, cubed tofu & lime",                    energy: "Light" },
    ],
  },
  Kapha: {
    breakfast:   [
      { name: "Stewed Apple",          description: "Warm apple with cinnamon, black pepper & a drizzle of raw honey",                energy: "Light" },
      { name: "Agni Tea",              description: "Ginger-turmeric-black pepper decoction with lemon & honey",                      energy: "Light" },
    ],
    mid_morning: [
      { name: "Trikatu Water",         description: "Warm water with ¼ tsp trikatu — stimulate digestion, no solid food",            energy: "Light" },
    ],
    lunch:       [
      { name: "Masoor Dal + Millet",   description: "Spiced red lentil soup with trikatu, millet flatbread & bitter gourd sabzi",     energy: "Moderate" },
      { name: "Chickpea Stir-Fry",     description: "Dry-sautéed chickpeas with mustard seeds, garlic & curry leaves over barley",   energy: "Moderate" },
    ],
    evening:     [
      { name: "Tulsi-Ginger Tea",      description: "Holy basil with fresh ginger & black pepper — decongestant",                    energy: "Light" },
    ],
    dinner:      [
      { name: "Spiced Vegetable Broth", description: "Radish, bitter gourd, ginger & turmeric broth — minimal coconut oil",          energy: "Light" },
    ],
  },
};

/* ─── Fallback meal data (Non-vegetarian) ─────────────────────────────────── */
const FALLBACK_NONVEG = {
  Vata: {
    breakfast:   [
      { name: "Spiced Scrambled Eggs", description: "2 eggs scrambled with ghee, cumin, fresh ginger, spinach & turmeric, served with soft roti", energy: "Moderate" },
      { name: "Bone Broth Congee",     description: "Rice porridge slow-cooked in chicken bone broth with ginger, sesame oil & spring onion",     energy: "Moderate" },
    ],
    mid_morning: [
      { name: "Boiled Egg + Dates",    description: "1 soft-boiled egg with 2 medjool dates and warm CCF herbal tea",                              energy: "Light" },
    ],
    lunch:       [
      { name: "Spiced Fish Curry",     description: "Fresh white fish in warming tomato-ginger-cumin gravy, served with fluffy basmati & ghee",   energy: "Nourishing" },
      { name: "Chicken Khichdi",       description: "Shredded poached chicken stirred into mung dal & basmati with trikatu spice blend",          energy: "Nourishing" },
    ],
    evening:     [
      { name: "Bone Broth Tea",        description: "Thin chicken or bone broth with fresh ginger, rock salt & lemon — warming tonic",            energy: "Light" },
    ],
    dinner:      [
      { name: "Light Fish Soup",       description: "Delicate white fish in cumin-coriander broth with zucchini & soft wheat noodles",            energy: "Light" },
      { name: "Egg Drop Dal",          description: "Thin moong soup with a swirled poached egg, cumin tadka & coriander",                        energy: "Moderate" },
    ],
  },
  Pitta: {
    breakfast:   [
      { name: "Coconut Egg Omelette",  description: "2 eggs cooked in coconut oil with zucchini, coriander leaves & mild spices — cooling",       energy: "Moderate" },
      { name: "Poached Egg on Barley", description: "Soft poached egg on creamy barley porridge with fennel, coconut milk & fresh herbs",         energy: "Moderate" },
    ],
    mid_morning: [
      { name: "Cooling Coconut Water", description: "Room-temperature coconut water with fresh pomegranate arils and mint",                        energy: "Light" },
    ],
    lunch:       [
      { name: "Steamed Fish + Raita",  description: "Lightly steamed pomfret with coriander-lime, basmati rice & cooling cucumber-mint raita",    energy: "Nourishing" },
      { name: "Chicken Quinoa Bowl",   description: "Poached chicken breast over quinoa with cucumber, coriander chutney & a drizzle of ghee",     energy: "Nourishing" },
    ],
    evening:     [
      { name: "Fennel-Mint Tea",       description: "Cooling fennel seeds, fresh mint & rose petals steeped — excellent Pitta pacifier",          energy: "Light" },
    ],
    dinner:      [
      { name: "Chicken Broth Soup",    description: "Clear chicken broth with asparagus, zucchini & coriander — mild and cooling",                energy: "Light" },
      { name: "Egg & Palak Curry",     description: "Soft-boiled eggs in mild palak (spinach) gravy with coconut oil & cooling spices",           energy: "Light" },
    ],
  },
  Kapha: {
    breakfast:   [
      { name: "Spiced Egg White Scramble", description: "3 egg whites with trikatu, mustard seeds, curry leaves & bitter greens — dry, no butter", energy: "Light" },
      { name: "Hard-Boiled Egg + Agni Tea", description: "1 hard-boiled egg with black salt & cumin alongside strong ginger-pepper tea",           energy: "Light" },
    ],
    mid_morning: [
      { name: "Trikatu Water",         description: "Warm water with ¼ tsp trikatu — stimulate digestion, no solid food",                          energy: "Light" },
    ],
    lunch:       [
      { name: "Grilled Chicken + Millet", description: "Dry-spiced grilled chicken breast with trikatu over millet with sautéed methi & radish",   energy: "Moderate" },
      { name: "Spiced Fish + Barley",  description: "Grilled mackerel with warming spices, barley grain & roasted bitter gourd on the side",        energy: "Moderate" },
    ],
    evening:     [
      { name: "Tulsi-Ginger Tea",      description: "Holy basil with fresh ginger & black pepper — decongestant and stimulating",                   energy: "Light" },
    ],
    dinner:      [
      { name: "Chicken Vegetable Broth", description: "Light chicken broth with radish, bitter gourd, ginger & turmeric — minimal oil",            energy: "Light" },
      { name: "Egg Drop Vegetable Soup", description: "Thin spiced vegetable soup with a swirled egg, mustard seeds & methi leaves",               energy: "Light" },
    ],
  },
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function AyurvedicPlanner() {
  const [dosha,     setDosha]     = useState("Vata");
  const [goal,      setGoal]      = useState("Balance");
  const [lifestyle, setLifestyle] = useState("Vegetarian");
  const [season,    setSeason]    = useState(() => {
    const m = new Date().getMonth() + 1;
    if (m <= 2 || m === 12) return "Winter";
    if (m <= 5)  return "Spring";
    if (m <= 8)  return "Summer";
    return "Autumn";
  });

  const [plan,       setPlan]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [activeTab,  setActiveTab]  = useState("meals");
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [aiPowered,  setAiPowered]  = useState(false);

  const containerRef = useRef(null);
  const theme = DOSHA[dosha];

  /* ── When dosha changes, clear the plan so stale data isn't shown ── */
  const handleDoshaChange = (d) => {
    setDosha(d);
    setPlan(null);
    setAiPowered(false);
  };

  /* ── Derive seasonal note from dosha token (always in sync) ── */
  const seasonalNote = theme.seasonalNote;

  /* ── Generate plan ───────────────────────────────────────────── */
  const generatePlan = async () => {
    setLoading(true);
    setAiPowered(false);

    const nonVegNote = lifestyle === "Non-vegetarian"
      ? "\n\nIMPORTANT: Non-vegetarian. MUST include eggs, fish, or chicken in at least 2–3 slots."
      : lifestyle === "Vegan"
      ? "\n\nIMPORTANT: Vegan. ZERO dairy/ghee/eggs/meat. Plant-based only."
      : "";

    const userPrompt = `Unique daily meal plan for:
- Dosha: ${dosha}
- Goal: ${goal}
- Lifestyle: ${lifestyle}
- Season: ${season}
${nonVegNote}
Be creative. Vary grains, proteins, and cooking styles from standard templates.`;

    try {
      /* ── Call Anthropic API directly for AI-generated meals ── */
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const raw     = data.content?.map(b => b.type === "text" ? b.text : "").join("") || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const meals   = JSON.parse(cleaned);

      setPlan({
        dosha,
        goal,
        lifestyle,
        season,
        meals,
        ...LOCAL_WISDOM[dosha],   /* timing, spices, rules, avoid, supplements */
      });
      setAiPowered(true);

    } catch {
      /* ── Fallback to local data ── */
      const fbMap = {
        "Vegan":          FALLBACK_VEGAN,
        "Non-vegetarian": FALLBACK_NONVEG,
        "Vegetarian":     FALLBACK_VEG,
      };
      const meals = JSON.parse(JSON.stringify((fbMap[lifestyle] || FALLBACK_VEG)[dosha]));

      setPlan({
        dosha,
        goal,
        lifestyle,
        season,
        meals,
        ...LOCAL_WISDOM[dosha],
      });
      setAiPowered(false);
    }

    setLoading(false);
    setActiveTab("meals");
    setActiveMeal("breakfast");
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Render ──────────────────────────────────────────────────── */
  const mealItems = plan?.meals?.[activeMeal] || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-root {
          min-height: 100vh;
          background: #FDFAF6;
          font-family: 'DM Sans', sans-serif;
          display: flex; flex-direction: column;
        }

        /* ── Nav ── */
        .ap-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem; height: 58px;
          background: rgba(253,250,246,0.96);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid #EDE0CF;
          box-shadow: 0 1px 12px rgba(44,24,16,0.05);
        }
        .ap-brand {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 600; color: #2C1608;
          display: flex; align-items: center; gap: 10px; letter-spacing: 0.2px;
        }
        .ap-logo {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          background: linear-gradient(135deg, #5C2E0A, #A0621A);
        }
        .ap-badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
          padding: 3px 9px; border-radius: 99px;
          background: #E8F4E8; color: #2E7D32;
          border: 1px solid #A5D6A7;
        }
        .ap-badge.fallback { background: #FFF8E1; color: #F57F17; border-color: #FFD54F; }

        /* ── Layout ── */
        .ap-layout { flex: 1; display: flex; }

        /* ── Sidebar ── */
        .ap-sidebar {
          width: 300px; flex-shrink: 0;
          border-right: 1px solid #EDE0CF;
          padding: 1.5rem;
          overflow-y: auto;
          background: #FDFAF6;
          display: flex; flex-direction: column; gap: 1.4rem;
        }
        .sidebar-section {}
        .sidebar-label {
          font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
          text-transform: uppercase; color: #A08060;
          margin-bottom: 0.7rem; display: block;
        }

        /* Dosha buttons */
        .dosha-grid { display: flex; flex-direction: column; gap: 6px; }
        .dosha-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 12px;
          border: 1.5px solid #EDE0CF;
          cursor: pointer; transition: all 0.18s;
          background: #FFF; text-align: left;
        }
        .dosha-btn:hover { transform: translateX(2px); border-color: #C4A882; }
        .dosha-btn.active { border-width: 2px; }
        .dosha-sym { font-size: 18px; width: 28px; text-align: center; }
        .dosha-info { flex: 1; }
        .dosha-name { font-size: 13px; font-weight: 600; color: #2C1608; }
        .dosha-el   { font-size: 11px; color: #907050; margin-top: 1px; }
        .dosha-agni {
          font-size: 10px; font-weight: 600;
          padding: 2px 7px; border-radius: 99px;
          white-space: nowrap;
        }

        /* Pill grid */
        .pill-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .pill-btn {
          padding: 6px 12px; border-radius: 99px;
          border: 1.5px solid #EDE0CF;
          background: #FFF;
          font-size: 12px; font-weight: 500; color: #5A3A1A;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 5px;
        }
        .pill-btn:hover { border-color: #C4A882; background: #FBF5EC; }
        .pill-btn.active { border-width: 2px; font-weight: 600; }

        /* Generate button */
        .gen-btn {
          width: 100%; padding: 13px;
          border-radius: 12px; border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: 0.1px; color: #FFF;
        }
        .gen-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.08); }
        .gen-btn:active:not(:disabled) { transform: translateY(0); }
        .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .gen-btn.secondary {
          background: transparent !important; color: inherit;
          border: 1.5px solid;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #FFF;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }

        /* ── Main ── */
        .ap-main { flex: 1; overflow: auto; display: flex; flex-direction: column; }

        /* Empty */
        .ap-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 1rem; padding: 3rem; color: #B09070; text-align: center;
        }
        .empty-icon { font-size: 48px; margin-bottom: 0.5rem; }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; color: #3D2010; margin-bottom: 0.3rem;
        }
        .empty-sub { font-size: 14px; line-height: 1.6; max-width: 340px; }

        /* Hero */
        .ap-hero {
          padding: 1.8rem 2rem 1.4rem;
          color: #FFF;
          position: relative; overflow: hidden;
        }
        .ap-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-sym   { font-size: 36px; margin-bottom: 0.4rem; }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700;
          line-height: 1.2; margin-bottom: 4px;
        }
        .hero-sub { font-size: 13px; opacity: 0.75; font-style: italic; }
        .hero-tags { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 1rem; }
        .hero-tag {
          padding: 4px 12px; border-radius: 99px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
        }
        .hero-agni {
          margin-top: 1.1rem; padding: 10px 14px;
          background: rgba(0,0,0,0.18); border-radius: 10px;
          font-size: 12px; opacity: 0.9; line-height: 1.6;
        }
        .hero-ai-note {
          margin-top: 0.8rem; padding: 8px 12px;
          background: rgba(255,255,255,0.12); border-radius: 8px;
          font-size: 11.5px; opacity: 0.9;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex; gap: 6px; align-items: center;
        }

        /* Seasonal banner */
        .seasonal {
          margin: 0.8rem 2rem 0;
          padding: 10px 14px;
          background: rgba(212,168,67,0.1);
          border: 1px solid rgba(212,168,67,0.3);
          border-radius: 10px;
          font-size: 12.5px; color: #7A5A10;
          display: flex; gap: 8px; line-height: 1.6;
        }

        /* Wisdom bar */
        .wisdom-bar {
          margin: 0.8rem 2rem 0;
          padding: 10px 14px; border-radius: 10px;
          font-size: 12.5px; line-height: 1.6;
          display: flex; gap: 8px; align-items: flex-start;
        }

        /* Tabs */
        .ap-tabs {
          border-bottom: 1px solid #EDE0CF;
          display: flex; overflow-x: auto;
          scrollbar-width: none;
          padding: 0 1.5rem; gap: 2px;
          flex-shrink: 0; margin-top: 0.8rem;
        }
        .ap-tabs::-webkit-scrollbar { display: none; }
        .ap-tab {
          padding: 0.85rem 12px;
          border: none; background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px; font-weight: 600;
          color: #B09070; cursor: pointer;
          border-bottom: 2.5px solid transparent;
          white-space: nowrap;
          transition: color 0.15s, border-bottom-color 0.15s;
          display: flex; align-items: center; gap: 5px;
          letter-spacing: 0.2px;
        }
        .ap-tab:hover { color: #6B4A2A; }
        /* Active state purely via inline style; no hard-coded CSS colour here */

        /* Tab body */
        .ap-body { padding: 1.5rem 2rem 3rem; flex: 1; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .tab-anim { animation: fadeUp 0.28s ease; }

        /* Meal sub-tabs */
        .meal-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 1.3rem; }
        .meal-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          border: 1.5px solid #EDE0CF; border-radius: 99px;
          background: #FDFAF6; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; color: #8B6A4A;
          transition: all 0.15s;
        }
        .meal-tab:hover { border-color: #C4A882; background: #F5EFE6; }
        .meal-tab.active { border-width: 2px; font-weight: 700; }

        .meal-time {
          font-size: 11.5px; color: #A08060; margin-bottom: 1rem;
          display: flex; align-items: center; gap: 6px;
        }
        .time-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* Meal cards */
        .meal-cards { display: flex; flex-direction: column; gap: 10px; }
        .meal-card {
          padding: 14px 16px; background: #FFF;
          border: 1px solid #EDE0CF; border-radius: 14px;
          transition: all 0.18s;
          display: flex; gap: 12px; align-items: flex-start;
        }
        .meal-card:hover { border-color: #C4A882; transform: translateX(3px); box-shadow: 0 2px 12px rgba(92,46,10,0.07); }
        .meal-card-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0; background: #FBF5EC;
        }
        .meal-card-body { flex: 1; }
        .meal-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 600; color: #2C1608; margin-bottom: 4px;
        }
        .meal-card-desc { font-size: 12.5px; color: #7A5040; line-height: 1.6; }
        .meal-card-energy {
          padding: 3px 10px; border-radius: 99px;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.3px;
          margin-top: 7px; display: inline-block;
        }

        /* Section title */
        .sec-title {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 600; color: #2C1608;
          margin-bottom: 1rem; padding-bottom: 0.6rem;
          border-bottom: 1px solid #EDE0CF;
        }

        /* Timing */
        .timing-list { display: flex; flex-direction: column; gap: 0; position: relative; }
        .timing-list::before {
          content: ''; position: absolute;
          left: 54px; top: 24px; bottom: 24px;
          width: 1px; background: linear-gradient(180deg,transparent,#E8D0B8 10%,#E8D0B8 90%,transparent);
        }
        .timing-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 12px 0; position: relative;
        }
        .timing-t {
          width: 52px; flex-shrink: 0;
          font-size: 11px; font-weight: 700; color: #A07030;
          text-align: right; padding-top: 3px; font-variant-numeric: tabular-nums;
        }
        .timing-dot-wrap {
          width: 18px; flex-shrink: 0;
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 7px; position: relative; z-index: 1;
        }
        .timing-dot { width: 8px; height: 8px; border-radius: 50%; }
        .timing-text { font-size: 13px; color: #4A2A10; line-height: 1.5; }

        /* Spice */
        .spice-grid { display: flex; flex-direction: column; gap: 10px; }
        .spice-card {
          padding: 14px 16px; background: #FFF;
          border: 1px solid #EDE0CF; border-radius: 14px;
          border-left: 4px solid;
        }
        .spice-name { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 600; color: #2C1608; margin-bottom: 5px; }
        .spice-recipe { font-size: 12px; color: #5A3A1A; margin-bottom: 5px; line-height: 1.55; }
        .spice-use { font-size: 11.5px; color: #9A7050; font-style: italic; padding: 6px 10px; background: #FBF5EC; border-radius: 8px; }

        /* Rules */
        .rules-list { display: flex; flex-direction: column; gap: 8px; }
        .rule-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 11px 14px; background: #FFF;
          border: 1px solid #EDE0CF; border-radius: 12px;
          font-size: 13px; color: #3D2010; line-height: 1.55;
        }
        .rule-num {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700;
          flex-shrink: 0; color: #FFF; margin-top: 2px;
        }

        /* Avoid */
        .avoid-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 10px; }
        .avoid-panel { padding: 12px 14px; background: #FFF; border: 1px solid #EDE0CF; border-radius: 12px; }
        .avoid-panel-title { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #C0392B; margin-bottom: 8px; }
        .avoid-item { font-size: 12px; color: #4A2A10; padding: 3px 0; border-bottom: 1px solid #F5EBE0; line-height: 1.4; }
        .avoid-item:last-child { border: none; }

        /* Supplements */
        .supp-list { display: flex; flex-direction: column; gap: 10px; }
        .supp-card {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; background: #FFF;
          border: 1px solid #EDE0CF; border-radius: 14px;
          border-left: 3px solid;
        }
        .supp-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .supp-name    { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 600; color: #2C1608; margin-bottom: 3px; }
        .supp-dose    { font-size: 12px; color: #5A3A1A; margin-bottom: 3px; }
        .supp-benefit { font-size: 12px; color: #9A7050; font-style: italic; }

        /* Loading */
        .ap-loading { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: #8B6A4A; }
        .loading-ring { width: 48px; height: 48px; border-radius: 50%; border: 3px solid #EDE0CF; animation: spin 0.8s linear infinite; flex-shrink: 0; }
        .loading-text { font-family: 'Playfair Display', serif; font-size: 16px; color: #3D2010; font-style: italic; }
        .loading-sub  { font-size: 12px; color: #B09070; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .loading-dots span { display: inline-block; animation: pulse 1.4s ease infinite; }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @media (max-width: 768px) {
          .ap-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #EDE0CF; }
          .ap-layout  { flex-direction: column; }
        }
      `}</style>

      <div className="ap-root">

        {/* ── Navbar ── */}
        <nav className="ap-nav">
          <div className="ap-brand">
            <div className="ap-logo">🪷</div>
            <span>Āyur Āhāra</span>
            <span style={{ fontSize: 12, color: "#A08060", fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 400 }}>
              — The Art of Mindful Eating
            </span>
          </div>
          {plan && (
            <div className={`ap-badge${aiPowered ? "" : " fallback"}`}>
              {aiPowered ? "✦ AI Generated" : "⚡ Local Plan"}
            </div>
          )}
        </nav>

        <div className="ap-layout">

          {/* ── Sidebar ── */}
          <aside className="ap-sidebar">

            {/* Dosha selector */}
            <div className="sidebar-section">
              <span className="sidebar-label">Your Dosha (Prakriti)</span>
              <div className="dosha-grid">
                {Object.entries(DOSHA).map(([d, t]) => (
                  <button
                    key={d}
                    className={`dosha-btn${dosha === d ? " active" : ""}`}
                    style={dosha === d
                      ? { borderColor: t.color, background: t.bg }
                      : {}}
                    onClick={() => handleDoshaChange(d)}
                  >
                    <span className="dosha-sym">{t.sym}</span>
                    <div className="dosha-info">
                      <div className="dosha-name" style={{ color: dosha === d ? t.text : "#2C1608" }}>
                        {d}
                      </div>
                      <div className="dosha-el">{t.el}</div>
                    </div>
                    {dosha === d && (
                      <span className="dosha-agni" style={{ color: t.text, background: `${t.color}22` }}>
                        {t.agni}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div className="sidebar-section">
              <span className="sidebar-label">Goal (Lakshya)</span>
              <div className="pill-grid">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    className={`pill-btn${goal === g.id ? " active" : ""}`}
                    style={goal === g.id
                      ? { borderColor: theme.color, color: theme.text, background: theme.bg }
                      : {}}
                    onClick={() => setGoal(g.id)}
                    title={g.desc}
                  >
                    <span style={{ fontSize: 13 }}>{g.icon}</span> {g.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle */}
            <div className="sidebar-section">
              <span className="sidebar-label">Lifestyle (Āhāra)</span>
              <div className="pill-grid">
                {LIFESTYLES.map(l => (
                  <button
                    key={l.id}
                    className={`pill-btn${lifestyle === l.id ? " active" : ""}`}
                    style={lifestyle === l.id
                      ? { borderColor: theme.color, color: theme.text, background: theme.bg }
                      : {}}
                    onClick={() => setLifestyle(l.id)}
                    title={l.sub}
                  >
                    <span style={{ fontSize: 13 }}>{l.icon}</span> {l.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div className="sidebar-section">
              <span className="sidebar-label">Season (Ritu)</span>
              <div className="pill-grid">
                {SEASONS.map(s => (
                  <button
                    key={s.id}
                    className={`pill-btn${season === s.id ? " active" : ""}`}
                    style={season === s.id
                      ? { borderColor: theme.color, color: theme.text, background: theme.bg }
                      : {}}
                    onClick={() => setSeason(s.id)}
                  >
                    <span style={{ fontSize: 13 }}>{s.icon}</span> {s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button
              className="gen-btn"
              style={{ background: theme.gradient }}
              onClick={generatePlan}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" /> Crafting Your Plan…</>
                : <><span style={{ fontSize: 16 }}>✦</span> Generate My Plan</>}
            </button>

            {plan && !loading && (
              <button
                className="gen-btn secondary"
                style={{ borderColor: theme.color, color: theme.color }}
                onClick={generatePlan}
              >
                <span style={{ fontSize: 14 }}>⟳</span> New Variation
              </button>
            )}
          </aside>

          {/* ── Main Panel ── */}
          <main className="ap-main" ref={containerRef}>

            {loading && (
              <div className="ap-loading">
                <div className="loading-ring" style={{ borderTopColor: theme.color }} />
                <div className="loading-text">Consulting the ancient texts</div>
                <div className="loading-sub">
                  <span className="loading-dots"><span>•</span><span>•</span><span>•</span></span>
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
                <p style={{ fontSize: 12, color: "#C4A882", marginTop: 8, fontStyle: "italic" }}>
                  "Let food be thy medicine, and medicine be thy food."
                </p>
              </div>
            )}

            {!loading && plan && (
              <>
                {/* ── Hero banner ── */}
                <div className="ap-hero" style={{ background: theme.gradient }}>
                  <div className="hero-sym">{theme.sym}</div>
                  <div className="hero-title">{plan.dosha} Dosha Plan</div>
                  <div className="hero-sub">{theme.el} · {theme.agni}</div>
                  <div className="hero-tags">
                    <span className="hero-tag">🎯 {plan.goal}</span>
                    <span className="hero-tag">
                      {LIFESTYLES.find(l => l.id === plan.lifestyle)?.icon} {plan.lifestyle}
                    </span>
                    <span className="hero-tag">
                      {SEASONS.find(s => s.id === plan.season)?.icon} {plan.season}
                    </span>
                  </div>
                  {plan.agni_tip && (
                    <div className="hero-agni">
                      <strong>Agni Tip:</strong> {plan.agni_tip}
                    </div>
                  )}
                  {aiPowered && (
                    <div className="hero-ai-note">
                      <span>✦</span> Uniquely generated by AI — each plan is different
                    </div>
                  )}
                </div>

                {/* ── Seasonal note — always derived from current dosha token ── */}
                <div className="seasonal">
                  <span style={{ fontSize: 14, flexShrink: 0 }}>🌿</span>
                  <span>
                    <strong>Seasonal Guidance ({plan.season}):</strong> {seasonalNote}
                  </span>
                </div>

                {/* ── Daily wisdom ── */}
                {plan.daily_wisdom && (
                  <div className="wisdom-bar" style={{ background: theme.bg, border: `1px solid ${theme.color}30` }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                    <span style={{ fontSize: 12.5, color: theme.text, fontStyle: "italic" }}>
                      {plan.daily_wisdom}
                    </span>
                  </div>
                )}

                {/* ── Tab bar ── */}
                <div className="ap-tabs">
                  {TABS.map(t => (
                    <button
                      key={t.id}
                      className={`ap-tab${activeTab === t.id ? " active" : ""}`}
                      /* Colour driven entirely by inline style — no stale CSS override */
                      style={activeTab === t.id
                        ? { color: theme.text, borderBottomColor: theme.color }
                        : {}}
                      onClick={() => setActiveTab(t.id)}
                    >
                      <span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>

                {/* ── Tab content ── */}
                <div className="ap-body tab-anim" key={`${activeTab}-${plan.dosha}`}>

                  {/* MEALS */}
                  {activeTab === "meals" && (
                    <>
                      <div className="meal-tabs">
                        {Object.entries(MEAL_META).map(([k, m]) => (
                          <button
                            key={k}
                            className={`meal-tab${activeMeal === k ? " active" : ""}`}
                            style={activeMeal === k
                              ? { borderColor: theme.color, color: theme.text, background: theme.bg }
                              : {}}
                            onClick={() => setActiveMeal(k)}
                          >
                            <span style={{ fontSize: 14 }}>{m.icon}</span> {m.label}
                          </button>
                        ))}
                      </div>

                      <div className="meal-time">
                        <div className="time-dot" style={{ background: theme.color }} />
                        <span>{MEAL_META[activeMeal].time}</span>
                      </div>

                      <div className="meal-cards">
                        {mealItems.length > 0 ? mealItems.map((item, i) => {
                          const ec = ENERGY_COLORS[item.energy] || ENERGY_COLORS.Moderate;
                          return (
                            <div key={i} className="meal-card">
                              <div className="meal-card-icon" style={{ background: theme.bg }}>
                                {MEAL_META[activeMeal].icon}
                              </div>
                              <div className="meal-card-body">
                                <div className="meal-card-name">{item.name}</div>
                                <div className="meal-card-desc">{item.description}</div>
                                <span
                                  className="meal-card-energy"
                                  style={{ background: ec.bg, color: ec.text, border: `1px solid ${ec.border}` }}
                                >
                                  {item.energy}
                                </span>
                              </div>
                            </div>
                          );
                        }) : (
                          <div style={{ color: "#B09070", fontSize: 13, fontStyle: "italic", padding: "1rem 0" }}>
                            No items for this meal slot with your current settings.
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* TIMING */}
                  {activeTab === "timing" && plan.meal_timing && (
                    <>
                      <div className="sec-title">Daily Dinacharya Schedule</div>
                      <div className="timing-list">
                        {Object.entries(plan.meal_timing).map(([time, desc], i) => (
                          <div key={i} className="timing-row">
                            <div className="timing-t">{time}</div>
                            <div className="timing-dot-wrap">
                              <div
                                className="timing-dot"
                                style={{ background: theme.color, boxShadow: `0 0 0 2px ${theme.color}` }}
                              />
                            </div>
                            <div className="timing-text">{desc}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* SPICES */}
                  {activeTab === "spices" && plan.spice_blends && (
                    <>
                      <div className="sec-title">Sacred Spice Blends (Churnas)</div>
                      <div className="spice-grid">
                        {plan.spice_blends.map((s, i) => (
                          <div key={i} className="spice-card" style={{ borderLeftColor: theme.color }}>
                            <div className="spice-name">🌶️ {s.name}</div>
                            <div className="spice-recipe"><strong>Recipe:</strong> {s.recipe}</div>
                            <div className="spice-use">💡 {s.use}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* EATING RULES */}
                  {activeTab === "wisdom" && plan.eating_rules && (
                    <>
                      <div className="sec-title">Āhāra Vidhi — Eating Rules</div>
                      <div className="rules-list">
                        {plan.eating_rules.map((r, i) => (
                          <div key={i} className="rule-item">
                            <div className="rule-num" style={{ background: theme.color }}>{i + 1}</div>
                            {r}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* AVOID */}
                  {activeTab === "avoid" && plan.avoid && (
                    <>
                      <div className="sec-title">Foods to Minimise</div>
                      <div className="avoid-grid">
                        {Object.entries(plan.avoid)
                          .filter(([, v]) => Array.isArray(v) && v.length > 0)
                          .map(([cat, items]) => (
                            <div key={cat} className="avoid-panel">
                              <div className="avoid-panel-title">
                                {cat.replace(/_/g, " ")}
                              </div>
                              {items.map((it, i) => (
                                <div key={i} className="avoid-item">⚠️ {it}</div>
                              ))}
                            </div>
                          ))}
                      </div>
                    </>
                  )}

                  {/* HERBS */}
                  {activeTab === "supplements" && plan.supplements && (
                    <>
                      <div className="sec-title">Herbal Support (Dravyaguna)</div>
                      <div className="supp-list">
                        {plan.supplements.map((s, i) => (
                          <div key={i} className="supp-card" style={{ borderLeftColor: theme.color }}>
                            <div className="supp-icon" style={{ background: theme.bg }}>🌿</div>
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
