"""
diet_engine.py — Comprehensive Ayurvedic Diet Planning Engine
==============================================================

Generates a full personalised diet plan based on:
  - Primary dosha (Vata / Pitta / Kapha)
  - Optional secondary dosha (dual-dosha support)
  - Current season (auto-detected or user-supplied)
  - Goal: Balance | Detox | Energy | Weight-loss | Immunity
  - Lifestyle: Vegetarian | Vegan | Non-vegetarian

Returns a rich structured plan:
  - Daily meal schedule (breakfast, mid-morning, lunch, evening, dinner)
  - Weekly rotation suggestions
  - Seasonal adjustments
  - Spice blends (churnas)
  - What to eat / avoid
  - Fasting protocols per dosha
  - Eating rules / dinacharya
  - Foods to NEVER combine (viruddha ahara)
  - Agni (digestive fire) assessment tips
"""

import datetime
from typing import Optional

# ─── Seasonal detection ────────────────────────────────────────────────────

def get_current_season() -> str:
    month = datetime.date.today().month
    if month in (3, 4, 5):   return "Spring"
    if month in (6, 7, 8):   return "Summer"
    if month in (9, 10, 11): return "Autumn"
    return "Winter"

SEASON_DOSHA = {
    "Spring": "Kapha",   # Kapha accumulates and liquefies in spring
    "Summer": "Pitta",   # Pitta peaks in summer heat
    "Autumn": "Vata",    # Vata rises in dry, windy autumn
    "Winter": "Vata",    # Vata + Kapha in deep winter
}

# ─── Core Diet Knowledge Base ──────────────────────────────────────────────

DIET_DB = {

    # ══════════════════════════════════════════════════════════════════
    "Vata": {
        "dosha": "Vata",
        "element": "Air + Ether",
        "agni_type": "Vishama Agni (Variable digestive fire)",
        "agni_desc": "Vata's digestion is irregular — sometimes strong, sometimes weak. The key is regularity and warmth.",
        "principle": "Warm, unctuous, nourishing, and grounding. Favour sweet, sour, and salty tastes.",
        "season": "Autumn & Winter",
        "colour": "#6B7FD4",
        "light": "#EEF0FB",
        "text": "#2D3580",

        # ── Meal timing ───────────────────────────────────────────────
        "meal_timing": {
            "wake":         "6:00 – 7:00 AM",
            "morning_ritual":"Warm water with lemon + sesame oil pulling",
            "breakfast":    "7:30 – 8:30 AM  (NEVER skip — critical for Vata)",
            "mid_morning":  "10:30 AM  (light snack if hungry)",
            "lunch":        "12:00 – 1:00 PM  (main meal of the day)",
            "evening":      "4:00 – 5:00 PM  (herbal tea + small snack)",
            "dinner":       "6:30 – 7:30 PM  (warm, easily digestible)",
            "sleep":        "10:00 – 10:30 PM  (critical — Vata needs rest)",
        },

        # ── Daily meal plans ─────────────────────────────────────────
        "meals": {
            "breakfast": [
                "Warm spiced oatmeal with ghee, honey, and cardamom",
                "Soft rice porridge (kanji) with sesame oil and cumin",
                "Stewed apples or pears with cinnamon and dates",
                "Soaked almonds (8–10) + warm turmeric milk",
                "Semolina (upma) with ghee, mustard seeds, and curry leaves",
            ],
            "mid_morning": [
                "Warm ginger-cardamom tea with a date or fig",
                "Small banana with almond butter",
                "Warm milk with ashwagandha and honey",
            ],
            "lunch": [
                "Kitchari (mung dal + basmati rice) with ghee and trikatu spice",
                "Warm vegetable soup with root vegetables + roti with ghee",
                "Dal tadka with basmati rice + sautéed beets and carrots",
                "Stuffed paratha with paneer + raita (room temperature)",
                "Khichdi with seasonal vegetables and a dollop of ghee",
            ],
            "evening": [
                "Warm ashwagandha milk or CCF tea (cumin-coriander-fennel)",
                "Soaked walnuts (4–5) with warm water",
                "Warm herbal soup — thin broth with ginger",
            ],
            "dinner": [
                "Light mung dal soup with soft roti",
                "Warm vegetable stew — no raw salad",
                "Kitchari with sautéed zucchini or pumpkin",
                "Warm rice with a little ghee and cumin",
            ],
        },

        # ── Weekly rotation ──────────────────────────────────────────
        "weekly_theme": [
            "Monday: Kitchari day — full day of kitchari to reset digestion",
            "Tuesday: Root vegetable focus — sweet potato, beet, carrot",
            "Wednesday: Protein day — dal, paneer, or eggs (if non-veg: fish)",
            "Thursday: Grain day — oats, rice, wheat roti",
            "Friday: Sweet taste day — naturally sweet foods, dates, figs",
            "Saturday: Warm soup day — lentil or vegetable broth",
            "Sunday: Lighter day — fruit in the morning, kitchari for lunch & dinner",
        ],

        # ── Seasonal adjustments ────────────────────────────────────
        "seasonal_adjustments": {
            "Autumn": "Increase oils and fats significantly. More sesame oil, more ghee. Favour warming spices.",
            "Winter": "Eat heartily — soups, stews, cooked grains. Ashwagandha milk nightly. Avoid cold foods completely.",
            "Spring": "Slowly introduce lighter foods. Reduce oil slightly. Add bitter greens to cleanse.",
            "Summer": "Add some cooling foods but keep them warm. Reduce very pungent spices. Stay hydrated with warm water.",
        },

        # ── Spice blends ────────────────────────────────────────────
        "spice_blends": [
            {"name": "Vata Churna", "recipe": "Cumin, coriander, fennel, ginger, cinnamon, cardamom, hing (1:1:1:½:½:½:pinch)", "use": "Add to any cooked dish. 1 tsp per serving."},
            {"name": "Trikatu", "recipe": "Ginger, black pepper, long pepper (1:1:1)", "use": "½ tsp with warm water before meals to kindle digestion."},
            {"name": "CCF Tea", "recipe": "Cumin, coriander, fennel seeds (equal parts)", "use": "Boil 1 tsp in 2 cups water for 5 min. Drink warm between meals."},
        ],

        # ── Favour / Avoid ──────────────────────────────────────────
        "favour": {
            "tastes": ["Sweet", "Sour", "Salty"],
            "qualities": ["Warm", "Oily", "Heavy", "Smooth", "Soft"],
            "grains": ["Basmati rice", "Oats (cooked)", "Wheat", "Quinoa (warm)"],
            "vegetables": ["Sweet potato", "Beets", "Carrots", "Zucchini", "Pumpkin", "Asparagus", "Green beans"],
            "fruits": ["Avocado", "Bananas", "Mangoes", "Dates", "Figs", "Peaches", "Berries (ripe)"],
            "proteins": ["Mung dal", "Tofu (warm)", "Ghee", "Paneer", "Eggs", "Fresh fish"],
            "dairy": ["Warm milk", "Ghee", "Butter", "Fresh yogurt (room temp)"],
            "oils": ["Sesame oil", "Ghee", "Olive oil", "Almond oil"],
            "sweeteners": ["Raw honey", "Jaggery", "Maple syrup", "Dates"],
            "drinks": ["Warm water", "Ginger tea", "Almond milk", "CCF tea"],
        },
        "avoid": {
            "tastes": ["Bitter (excess)", "Pungent (excess)", "Astringent (excess)"],
            "qualities": ["Cold", "Dry", "Light", "Rough"],
            "grains": ["Dry crackers", "Popcorn", "Millet (excess)", "Corn"],
            "vegetables": ["Raw onion", "Broccoli (raw)", "Cauliflower (raw)", "Leafy greens (raw)"],
            "fruits": ["Dried fruits (without soaking)", "Cranberries", "Pomegranate (excess)"],
            "proteins": ["Lentils (excess)", "Raw legumes", "Canned beans"],
            "drinks": ["Cold water", "Carbonated drinks", "Caffeine", "Alcohol"],
            "other": ["Skipping meals", "Eating while anxious", "Late-night eating", "Fasting for long periods"],
        },

        # ── Incompatible combos ─────────────────────────────────────
        "viruddha_ahara": [
            "Milk + fruit (especially banana + milk — creates toxins)",
            "Honey + ghee in equal quantities (toxic combination)",
            "Fish + dairy — incompatible proteins",
            "Cold water immediately after hot food",
            "Fruit + cooked food in the same meal",
            "Milk + salt (in large quantities)",
        ],

        # ── Fasting protocol ────────────────────────────────────────
        "fasting": {
            "recommended": "Short fasts only — no more than 12–14 hours overnight",
            "best_day": "Sunday — a lighter mono-diet day (kitchari only)",
            "avoid": "Multi-day fasting or skipping meals — deeply aggravates Vata",
            "protocol": "If fasting, consume warm broths, CCF tea, and warm water throughout",
        },

        # ── Eating rules ────────────────────────────────────────────
        "eating_rules": [
            "Eat at the SAME time every day — routine is medicine for Vata",
            "Always eat warm or room-temperature food — never cold",
            "Eat in a calm, quiet environment — stress kills Vata digestion",
            "Add ghee or oil to every meal — fats ground Vata",
            "Chew thoroughly; eat slowly without rushing",
            "Sit down to eat — never eat standing or walking",
            "Do not eat when anxious, fearful, or distracted",
            "Wait 3–4 hours between meals before eating again",
            "Drink warm water or herbal tea — never ice water",
            "Finish eating by 7:30 PM for proper overnight digestion",
        ],

        # ── Supplements ────────────────────────────────────────────
        "supplements": [
            {"name": "Ashwagandha", "dose": "500mg with warm milk at bedtime", "benefit": "Grounds Vata, builds Ojas (vital essence)"},
            {"name": "Shatavari", "dose": "1 tsp powder with warm milk, twice daily", "benefit": "Nourishes tissues, calms nerves"},
            {"name": "Triphala", "dose": "½ tsp with warm water before bed", "benefit": "Regulates digestion gently overnight"},
            {"name": "Sesame oil (internal)", "dose": "1 tsp warm on empty stomach in winter", "benefit": "Lubricates tissues from within"},
        ],

        # ── Sample day ──────────────────────────────────────────────
        "sample_day": {
            "06:30": "Wake up. Scrape tongue. Drink 1 glass warm water with lemon.",
            "07:00": "Oil pulling (sesame oil, 10 min). Self-massage (abhyanga) if time allows.",
            "07:30": "Warm spiced oatmeal with ghee, cardamom, dates, and warm almond milk.",
            "10:30": "CCF herbal tea + 4 soaked almonds.",
            "12:30": "Kitchari with ghee, cumin tadka, and roasted root vegetables.",
            "16:00": "Ashwagandha golden milk or ginger tea + 1 date.",
            "19:00": "Light mung soup or khichdi with warm roti.",
            "21:30": "Warm milk with nutmeg (sleep aid) or triphala water.",
            "22:00": "Sleep.",
        },
    },

    # ══════════════════════════════════════════════════════════════════
    "Pitta": {
        "dosha": "Pitta",
        "element": "Fire + Water",
        "agni_type": "Tikshna Agni (Sharp, intense digestive fire)",
        "agni_desc": "Pitta has a very strong digestion — can digest almost anything, but overheats easily. The goal is to cool, moderate, and prevent inflammation.",
        "principle": "Cool, slightly oily, refreshing, and moderate. Favour sweet, bitter, and astringent tastes.",
        "season": "Summer & Late Spring",
        "colour": "#C4430A",
        "light": "#FBF0EB",
        "text": "#7A2005",

        "meal_timing": {
            "wake":          "5:30 – 6:30 AM",
            "morning_ritual": "Cool water + a few gulps of coconut water or aloe vera juice",
            "breakfast":     "7:00 – 8:00 AM  (moderate — not too heavy)",
            "mid_morning":   "10:00 – 10:30 AM  (light snack if intense hunger)",
            "lunch":         "12:00 – 1:00 PM  (LARGEST meal — Pitta digests best at noon)",
            "evening":       "4:00 – 5:00 PM  (cooling herbal tea)",
            "dinner":        "6:00 – 7:00 PM  (light and early — before sunset ideally)",
            "sleep":         "10:00 – 11:00 PM",
        },

        "meals": {
            "breakfast": [
                "Fresh sweet fruits — grapes, melons, pears, mangoes (room temperature)",
                "Barley porridge with coconut milk, dates, and cardamom",
                "Coconut-banana smoothie (room temp, not chilled)",
                "Soaked raisins or dates with sweet lassi",
                "Whole grain toast with avocado and a pinch of coriander",
            ],
            "mid_morning": [
                "Coconut water (room temperature)",
                "A handful of sweet grapes or pomegranate seeds",
                "Rose petal jam (gulkand) with a little warm milk",
            ],
            "lunch": [
                "Basmati rice + mung dal + ghee + cooling vegetable (cucumber raita)",
                "Steamed vegetables with coconut chutney and roti",
                "Quinoa salad with cucumber, coriander, lime, and olive oil (room temp)",
                "Cooling avocado and sprout bowl with lemon and cumin",
                "White rice + mild sambar + cooling raita",
            ],
            "evening": [
                "Coriander-mint herbal tea (cooling)",
                "Fresh pomegranate juice or coconut water",
                "Fennel tea — excellent for Pitta digestion",
                "A few sweet grapes or a pear",
            ],
            "dinner": [
                "Kitchari with cooling vegetables (zucchini, asparagus, leafy greens)",
                "Light dal with steamed rice — small portions",
                "Vegetable soup with coriander and fennel",
                "Soft roti with cooked leafy greens and a little ghee",
            ],
        },

        "weekly_theme": [
            "Monday: Mono-fruit morning (melon or grapes) + kitchari for lunch & dinner",
            "Tuesday: Green vegetable day — asparagus, zucchini, leafy greens",
            "Wednesday: Cooling grains day — barley, quinoa, white rice",
            "Thursday: Dairy day — lassi, paneer, ghee-rich meals",
            "Friday: Legume day — mung beans, chickpeas (well-spiced with coriander)",
            "Saturday: Detox day — simple kitchari + coconut water + herbal teas",
            "Sunday: Rest day — follow intuitive eating; favour fruits and lighter meals",
        ],

        "seasonal_adjustments": {
            "Summer": "Maximum cooling protocol. Emphasise coconut, rose, aloe, mint. Avoid hot spices entirely. Eat before noon.",
            "Autumn": "Slowly add warming foods. A little ginger and cumin now fine. Transition to more grounding foods.",
            "Winter": "More warming foods acceptable. Reduce cooling emphasis but maintain moderation. Ghee is your best friend.",
            "Spring": "Spring greens and bitter vegetables excellent for Pitta cleansing. Begin the year with a 3-day kitchari cleanse.",
        },

        "spice_blends": [
            {"name": "Pitta Churna", "recipe": "Coriander, fennel, cardamom, turmeric, mint, shatavari (2:2:1:1:1:1)", "use": "Sprinkle on food. Cools digestion without dulling it."},
            {"name": "CCF Tea (Pitta version)", "recipe": "Coriander, cardamom, fennel, rose petals (2:1:2:1)", "use": "Steep 1 tsp in hot water for 5 min. Let cool slightly before drinking."},
            {"name": "Gulkand Drink", "recipe": "1 tsp rose petal jam (gulkand) in a glass of room-temp milk", "use": "Take in the afternoon to cool Pitta heat."},
        ],

        "favour": {
            "tastes": ["Sweet", "Bitter", "Astringent"],
            "qualities": ["Cool", "Moderately oily", "Light", "Liquid"],
            "grains": ["Basmati rice", "Barley", "Wheat (moderate)", "Oats", "Quinoa"],
            "vegetables": ["Cucumber", "Zucchini", "Asparagus", "Leafy greens", "Broccoli", "Peas", "Sweet potato (small amounts)", "Artichoke"],
            "fruits": ["Grapes", "Melons", "Pears", "Pomegranate", "Mangoes (ripe)", "Figs", "Coconut", "Avocado"],
            "proteins": ["Mung dal", "Chickpeas (cooked)", "Tofu", "Paneer", "Ghee", "Eggs (occasional)"],
            "dairy": ["Ghee (cooling)", "Butter (unsalted)", "Milk (warm or room temp)", "Sweet lassi", "Coconut milk"],
            "oils": ["Ghee", "Coconut oil", "Sunflower oil", "Olive oil"],
            "sweeteners": ["Raw cane sugar", "Dates", "Maple syrup", "Rock sugar (mishri)"],
            "drinks": ["Coconut water", "Rose water", "Fennel tea", "Coriander tea", "Cool (not iced) water", "Aloe vera juice"],
        },
        "avoid": {
            "tastes": ["Pungent (excess)", "Sour (excess)", "Salty (excess)"],
            "qualities": ["Hot", "Sharp", "Oily (in excess)"],
            "grains": ["Corn", "Rye", "Brown rice (excess)"],
            "vegetables": ["Hot peppers", "Garlic", "Raw onion", "Tomatoes (in excess)", "Beets (excess)", "Radish"],
            "fruits": ["Sour fruits — grapefruit, unripe plums, tamarind", "Dried fruits in excess"],
            "proteins": ["Red meat", "Seafood (excess)", "Salted cheese"],
            "drinks": ["Alcohol", "Coffee", "Black tea", "Carbonated soft drinks", "Sour juices (orange, grapefruit)"],
            "other": ["Eating when angry or stressed", "Eating in the sun or heat", "Very late dinners", "Skipping meals and then overeating"],
        },

        "viruddha_ahara": [
            "Honey + hot water (becomes toxic when honey is heated)",
            "Milk + salty foods — incompatible",
            "Yogurt at night — very heating and heavy",
            "Fish + milk — opposite qualities create toxins",
            "Alcohol + hot spicy food — extreme Pitta aggravation",
            "Fruit + cooked food in same meal",
        ],

        "fasting": {
            "recommended": "1-day moon fast (Ekadashi) or partial fast — fruit only",
            "best_day": "Monday or Ekadashi (11th lunar day)",
            "avoid": "Skipping lunch — Pitta will become irritable and hypoglycaemic",
            "protocol": "On fasting days: coconut water, pomegranate juice, sweet fruits, herbal teas only",
        },

        "eating_rules": [
            "Never eat when angry, stressed, or rushed — Pitta will create internal fire",
            "Make lunch the LARGEST meal — Pitta's digestion peaks at noon",
            "Eat in a pleasant, cool, and beautiful environment",
            "Avoid eating in front of screens during dinner",
            "Do not eat when overheated after exercise",
            "Wait until you are truly hungry — don't snack out of boredom",
            "Avoid icy water — cool water or room temperature is fine",
            "Sit for at least 5 minutes after eating — do not rush",
            "Add ghee to food — it is specifically cooling for Pitta",
            "Eat dinner before 7 PM for best overnight processing",
        ],

        "supplements": [
            {"name": "Amalaki (Amla)", "dose": "1 tsp powder with room-temp water, morning", "benefit": "Cooling, anti-inflammatory, richest Vitamin C source"},
            {"name": "Shatavari", "dose": "1 tsp in warm milk at bedtime", "benefit": "Cools Pitta heat, nourishes reproductive tissue"},
            {"name": "Brahmi", "dose": "300mg capsule or ½ tsp powder with water", "benefit": "Cools the fiery mind, reduces stress and perfectionism"},
            {"name": "Aloe Vera Juice", "dose": "2 tbsp in water on empty stomach", "benefit": "Deeply cooling, heals gut inflammation"},
        ],

        "sample_day": {
            "06:00": "Wake. Cool water + aloe vera juice or coconut water.",
            "06:30": "Gentle morning walk in cool air. Avoid intense exercise in heat.",
            "07:30": "Fresh sweet fruits — melon slices or ripe mango with coconut flakes.",
            "10:00": "Fennel herbal tea. A handful of sweet grapes.",
            "12:30": "Large satisfying lunch: basmati rice + mung dal + ghee + cucumber raita.",
            "16:30": "Rose water drink or coriander-mint tea. Fresh pomegranate.",
            "18:30": "Light kitchari with zucchini and leafy greens.",
            "21:00": "Warm milk with shatavari or a little gulkand (rose jam).",
            "22:30": "Sleep.",
        },
    },

    # ══════════════════════════════════════════════════════════════════
    "Kapha": {
        "dosha": "Kapha",
        "element": "Earth + Water",
        "agni_type": "Manda Agni (Slow, dull digestive fire)",
        "agni_desc": "Kapha's digestion is slow and steady — the stomach fills quickly but empties slowly. The key is stimulating agni before and during meals.",
        "principle": "Light, dry, warm, and stimulating. Favour pungent, bitter, and astringent tastes. Eat less than you want to.",
        "season": "Spring & Late Winter",
        "colour": "#1E7A4A",
        "light": "#EAF7F0",
        "text": "#0F4D2E",

        "meal_timing": {
            "wake":          "5:30 – 6:00 AM  (before sunrise — critical for Kapha)",
            "morning_ritual": "Dry brush (Garshana) + vigorous exercise first thing",
            "breakfast":     "8:00 – 9:00 AM  (light or skip if not hungry)",
            "mid_morning":   "NO snacking — Kapha should not eat between meals",
            "lunch":         "12:00 – 1:30 PM  (main and largest meal)",
            "evening":       "4:30 – 5:00 PM  (stimulating herbal tea ONLY)",
            "dinner":        "6:00 – 7:00 PM  (very light — smallest meal of day)",
            "sleep":         "10:00 – 10:30 PM  (do not oversleep past 6 AM)",
        },

        "meals": {
            "breakfast": [
                "SKIP if not hungry — Kapha benefits from a 16-hour overnight fast",
                "If eating: light ginger-honey tea with a few berries",
                "Fresh apple or pear (single fruit only — no mixing)",
                "1 slice dry toast (no butter) with a smear of honey",
                "Warm spiced green tea with lemon and ginger",
            ],
            "mid_morning": [
                "Do NOT snack — allow digestion to complete",
                "Stimulating ginger tea only if needed",
                "Warm water with lemon and black pepper",
            ],
            "lunch": [
                "Spiced lentil soup (masoor or toor dal) with trikatu",
                "Mixed vegetable sabzi with minimal oil + dry roti (no ghee)",
                "Barley or millet with roasted bitter vegetables",
                "Light chickpea curry with warming spices and leafy greens",
                "Large warm salad (wilted greens) with ginger dressing and legumes",
            ],
            "evening": [
                "Trikatu tea (ginger, black pepper, long pepper) — stimulates digestion",
                "Tulsi (holy basil) tea — decongesting and energising",
                "Warm water with honey and black pepper",
            ],
            "dinner": [
                "Thin vegetable soup — lightly spiced, no cream or oil",
                "Steamed bitter greens (kale, methi, bitter gourd) with lemon",
                "Small portion of mung dal — the lightest dal",
                "A simple broth with ginger, cumin, and turmeric",
            ],
        },

        "weekly_theme": [
            "Monday: Detox day — mung dal only (full day) with lots of trikatu tea",
            "Tuesday: Green day — all bitter and dark leafy greens, legumes",
            "Wednesday: Grain day — barley or millet; avoid wheat and white rice",
            "Thursday: Protein day — legumes and light plant-based protein",
            "Friday: Spice day — extra emphasis on trikatu, ginger, and pepper",
            "Saturday: Light day — single grain, single vegetable, single legume",
            "Sunday: Intermittent fast day — 16:8 window; light kitchari in afternoon",
        ],

        "seasonal_adjustments": {
            "Spring": "MAXIMUM stimulation. Dry brush daily. Eat the lightest possible foods. Begin with warm ginger water. Honey in warm water (not hot) is excellent.",
            "Summer": "Maintain lightness. Some bitter and astringent foods. Avoid icy food still — it dulls Kapha digestion further.",
            "Autumn": "Add some warming and grounding. Slight increase in oil. Continue vigorous exercise.",
            "Winter": "Kapha's hardest season — very active lifestyle is critical. Maintain spice emphasis. Avoid all dairy and cold foods.",
        },

        "spice_blends": [
            {"name": "Kapha Churna", "recipe": "Ginger, black pepper, trikatu, cumin, turmeric, mustard seed (2:1:1:1:1:½)", "use": "Add generously to all cooked foods. Kindle agni before eating."},
            {"name": "Trikatu", "recipe": "Ginger, black pepper, pippali (long pepper) — equal parts", "use": "½ tsp with honey (never mix honey + hot water) 15 min before meals."},
            {"name": "Agni Tea", "recipe": "1-inch ginger, ½ tsp turmeric, pinch black pepper, lemon slice, honey", "use": "Boil ginger in 2 cups water 10 min. Cool slightly. Add honey + lemon. Drink morning."},
        ],

        "favour": {
            "tastes": ["Pungent", "Bitter", "Astringent"],
            "qualities": ["Light", "Dry", "Warm", "Rough", "Stimulating"],
            "grains": ["Barley", "Millet", "Buckwheat", "Corn", "Quinoa", "Brown rice (small amounts)"],
            "vegetables": ["Leafy greens (kale, spinach, methi)", "Bitter gourd", "Asparagus", "Brussels sprouts", "Broccoli", "Radish", "Turnip", "Onion (cooked)", "Garlic"],
            "fruits": ["Apples", "Pears", "Pomegranate", "Berries", "Cranberries", "Dried fruits (small amounts)"],
            "proteins": ["Mung dal", "Lentils", "Chickpeas", "Tempeh", "Tofu (lightly spiced)"],
            "dairy": ["Very small amounts only — low-fat goat milk is best", "Ghee in tiny quantities only"],
            "oils": ["Tiny amounts only — mustard oil, sunflower oil, or corn oil", "Max 1 tsp per meal"],
            "sweeteners": ["Raw honey ONLY — it is stimulating for Kapha", "No other sweeteners"],
            "drinks": ["Ginger tea", "Trikatu tea", "Tulsi tea", "Warm water with lemon and honey", "Green tea", "Warm water throughout the day"],
        },
        "avoid": {
            "tastes": ["Sweet (excess)", "Sour (excess)", "Salty (excess)"],
            "qualities": ["Heavy", "Cold", "Oily", "Dense", "Smooth"],
            "grains": ["White rice", "Wheat in excess", "White bread", "Pastries", "Pasta"],
            "vegetables": ["Sweet potato in excess", "Avocado", "Olives", "Zucchini (excess)"],
            "fruits": ["Bananas", "Avocado", "Coconut", "Mangoes (excess)", "Dates in excess", "Figs in excess"],
            "proteins": ["Red meat", "Salted cheese", "Heavy legumes in excess"],
            "dairy": ["Milk", "Cream", "Ice cream", "Cheese", "Butter", "Yogurt at night"],
            "drinks": ["Cold water or cold drinks", "Fruit juices (sweet)", "Alcohol", "Coconut water in excess"],
            "other": ["Daytime sleeping", "Eating without hunger", "Overeating", "Skipping exercise"],
        },

        "viruddha_ahara": [
            "Honey + hot water or heating it — turns toxic",
            "Milk + banana — creates heaviness and mucus",
            "Fruit + grain in same meal — leads to fermentation",
            "Yogurt at night — accumulates as Ama (toxins)",
            "Cold food after warm food",
            "Sweet dessert immediately after a full meal",
        ],

        "fasting": {
            "recommended": "Weekly 24-hour fast or 16:8 intermittent fasting daily",
            "best_day": "Monday or any day with a light schedule",
            "avoid": "Heavy eating late at night, skipping morning exercise",
            "protocol": "On fasting days: warm water, ginger tea, trikatu tea, thin mung broth if needed. Honey in warm water (once cooled) is beneficial.",
        },

        "eating_rules": [
            "Eat only when TRULY hungry — Kapha should not eat out of habit",
            "Never overeat — stop at 50–75% full",
            "Make lunch the biggest meal; keep dinner very small",
            "Skip breakfast if not hungry — a 16-hour overnight fast is ideal",
            "Eat slowly but DO NOT linger — do not sit too long after eating",
            "No snacking between meals — allow full digestion (4–5 hrs between meals)",
            "Avoid eating in front of screens or when emotionally comforting yourself",
            "Always add generous spices — they are medicine for Kapha",
            "Prefer dry cooking methods: roasting, grilling, steaming — not frying",
            "Use minimal oil — no more than 1 tsp per meal",
        ],

        "supplements": [
            {"name": "Trikatu", "dose": "¼ tsp with honey 15 min before meals", "benefit": "Kindles digestive fire, clears congestion and Ama"},
            {"name": "Guggulu", "dose": "1 tablet twice daily with warm water", "benefit": "Stimulates metabolism, reduces Kapha accumulation"},
            {"name": "Punarnava", "dose": "½ tsp powder with warm water", "benefit": "Reduces water retention, supports kidneys"},
            {"name": "Ginger (fresh)", "dose": "Small piece with salt before meals", "benefit": "Stimulates salivary and digestive enzymes"},
        ],

        "sample_day": {
            "05:30": "Wake. Tongue scraping. Dry brushing (Garshana) all over body.",
            "06:00": "Vigorous exercise — run, cycle, or dance for 30–45 min.",
            "07:30": "Agni tea: ginger, lemon, honey, black pepper in warm water.",
            "09:00": "Light breakfast if hungry: apple with cinnamon or a pear.",
            "12:30": "Main meal: spiced lentil soup + millet + roasted bitter vegetables.",
            "16:30": "Trikatu herbal tea. No food until dinner.",
            "18:30": "Very light dinner: thin vegetable broth or steamed greens with dal.",
            "21:30": "Warm tulsi or ginger tea.",
            "22:00": "Sleep (do not sleep past 10:30 PM).",
        },
    },
}

# ─── Goal-based overlays ───────────────────────────────────────────────────

GOAL_OVERLAYS = {
    "Balance": {
        "note": "Following the core dosha plan will restore balance over 4–6 weeks.",
        "extra_tips": ["Consistency is more important than perfection", "Aim for 80/20 adherence"],
    },
    "Detox": {
        "note": "A 7-day kitchari cleanse (Panchakarma-lite) is recommended.",
        "extra_tips": [
            "Eat kitchari for all 3 meals for 3–7 days",
            "Take triphala nightly",
            "Drink CCF tea throughout the day",
            "Avoid all processed foods, sugar, and alcohol",
            "Follow with a gradual re-introduction over 3 days",
        ],
    },
    "Energy": {
        "note": "Focus on Ojas-building foods and consistent meal timing.",
        "extra_tips": [
            "Eat a nourishing breakfast every day",
            "Include Ojas foods: dates, almonds, ghee, saffron, ashwagandha milk",
            "Avoid skipping meals — energy dips are Vata or blood sugar issues",
            "Add adaptogens: ashwagandha (Vata/Kapha) or shatavari (Pitta)",
        ],
    },
    "Weight": {
        "note": "Focus on agni (digestive fire) rather than calories. Ama (toxins) cause weight gain.",
        "extra_tips": [
            "Intermittent fasting (16:8) suits Kapha types well",
            "Largest meal at noon when agni is highest",
            "Avoid eating after sunset",
            "Triphala at bedtime aids elimination and metabolism",
            "Focus on quality, not quantity — remove processed foods first",
        ],
    },
    "Immunity": {
        "note": "Building Ojas through diet and lifestyle is the Ayurvedic approach to immunity.",
        "extra_tips": [
            "Golden milk (turmeric milk) nightly",
            "Chyawanprash 1 tsp daily in the morning",
            "Tulsi tea daily",
            "Avoid ama-forming foods: leftover food, incompatible combinations",
            "Sleep before 10 PM — immunity regenerates during sleep",
        ],
    },
}

# ─── Dual-dosha adjustments ────────────────────────────────────────────────

DUAL_ADJUSTMENTS = {
    "Vata-Pitta": "Warm but not heating foods. Ghee is ideal. Avoid extremes of cold or spicy. Favour sweet, sour tastes. Ashwagandha and shatavari together.",
    "Pitta-Vata": "Same as Vata-Pitta. Lean slightly more cooling in summer, more warming in winter.",
    "Pitta-Kapha": "Light and cooling. Avoid heavy and spicy extremes. Bitter greens, cooling spices, light grains. Exercise vigorously in the morning.",
    "Kapha-Pitta": "Same as Pitta-Kapha. Lean more stimulating in spring, more cooling in summer.",
    "Vata-Kapha": "Warm and lightly spiced. Not too heavy, not too dry. Root vegetables, mung dal, light grains. Ginger and cumin are your spice allies.",
    "Kapha-Vata": "Same as Vata-Kapha. Lean more warming/grounding in autumn, more stimulating in spring.",
}

# ─── Main engine ──────────────────────────────────────────────────────────

def generate_diet_plan(
    dosha: str,
    secondary_dosha: Optional[str] = None,
    season: Optional[str] = None,
    goal: str = "Balance",
    lifestyle: str = "Vegetarian",
) -> dict:
    """
    Generate a comprehensive, personalised Ayurvedic diet plan.

    Parameters
    ----------
    dosha            : Primary dosha — "Vata", "Pitta", or "Kapha"
    secondary_dosha  : Optional secondary (for dual constitutions)
    season           : "Spring" | "Summer" | "Autumn" | "Winter" (auto-detected if None)
    goal             : "Balance" | "Detox" | "Energy" | "Weight" | "Immunity"
    lifestyle        : "Vegetarian" | "Vegan" | "Non-vegetarian"

    Returns
    -------
    dict — full diet plan
    """
    dosha = dosha.capitalize()
    if dosha not in DIET_DB:
        raise ValueError(f"Invalid dosha: {dosha}. Must be Vata, Pitta, or Kapha.")

    season = season or get_current_season()
    goal   = goal if goal in GOAL_OVERLAYS else "Balance"

    plan = dict(DIET_DB[dosha])  # copy

    # Seasonal note
    plan["current_season"] = season
    plan["seasonal_note"]  = plan["seasonal_adjustments"].get(season, "")
    plan["aggravated_by_season"] = (SEASON_DOSHA.get(season) == dosha)

    # Goal overlay
    plan["goal"]          = goal
    plan["goal_info"]     = GOAL_OVERLAYS[goal]

    # Dual dosha
    if secondary_dosha and secondary_dosha.capitalize() in DIET_DB:
        sec = secondary_dosha.capitalize()
        key = f"{dosha}-{sec}"
        plan["secondary_dosha"]  = sec
        plan["dual_adjustment"]  = DUAL_ADJUSTMENTS.get(key, DUAL_ADJUSTMENTS.get(f"{sec}-{dosha}", ""))
    else:
        plan["secondary_dosha"] = None
        plan["dual_adjustment"] = None

    # Lifestyle filter (remove non-veg items for vegan)
    if lifestyle == "Vegan":
        plan["meals"] = {
            meal: [item for item in items if not any(
                w in item.lower() for w in ["paneer", "milk", "ghee", "egg", "fish", "meat", "butter", "yogurt", "lassi", "dairy", "cream"]
            )]
            for meal, items in plan["meals"].items()
        }
        plan["lifestyle_note"] = "Dairy items have been filtered. Use coconut oil in place of ghee, plant milks in place of dairy."
    elif lifestyle == "Non-vegetarian":
        plan["lifestyle_note"] = "Occasional lean meats and eggs are appropriate for your dosha if properly spiced. Avoid red meat and fried meats."
    else:
        plan["lifestyle_note"] = "A vegetarian diet is the classical Ayurvedic recommendation for all three doshas."

    plan["lifestyle"] = lifestyle
    return plan


# ─── Quick test ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json
    for dosha in ["Vata", "Pitta", "Kapha"]:
        plan = generate_diet_plan(dosha, goal="Energy", season="Summer")
        print(f"\n{'='*60}")
        print(f"  {dosha} Diet — Season: {plan['current_season']} — Goal: {plan['goal']}")
        print(f"  Principle: {plan['principle']}")
        print(f"  Agni type: {plan['agni_type']}")
        print(f"  Seasonal note: {plan['seasonal_note']}")
        print(f"  Sample breakfast: {plan['meals']['breakfast'][0]}")
        print(f"  Sample lunch: {plan['meals']['lunch'][0]}")