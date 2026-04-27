"""
dosha.py — Practical & Comprehensive Dosha Detection Engine
============================================================

Uses a multi-layer scoring approach:
  1. ML model (DecisionTree trained on dataset)
  2. Weighted trait scoring per classical Ayurvedic texts
  3. Dual-dosha detection (e.g. Vata-Pitta, Pitta-Kapha)
  4. Rich result payload: description, imbalance signs, diet,
     herbs, lifestyle, yoga, and seasonal tips
"""

import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier


# ─── Encoding maps ─────────────────────────────────────────────────────────

BODY_MAP      = {"Thin": 0, "Medium": 1, "Heavy": 2}
SKIN_MAP      = {"Dry": 0, "Normal": 1, "Oily": 2}
DIGESTION_MAP = {"Irregular": 0, "Strong": 1, "Slow": 2}
SLEEP_MAP     = {"Light": 0, "Moderate": 1, "Heavy": 2}
DOSHA_MAP     = {"Vata": 0, "Pitta": 1, "Kapha": 2}
REVERSE_MAP   = {0: "Vata", 1: "Pitta", 2: "Kapha"}

# Classical trait-weight scoring table
# Each answer maps to (vata_score, pitta_score, kapha_score)
TRAIT_WEIGHTS = {
    "body_type": {
        "Thin":   (3, 1, 0),
        "Medium": (1, 3, 1),
        "Heavy":  (0, 1, 3),
    },
    "skin": {
        "Dry":    (3, 0, 0),
        "Normal": (0, 2, 1),
        "Oily":   (0, 1, 3),
    },
    "digestion": {
        "Irregular": (3, 0, 1),
        "Strong":    (0, 3, 0),
        "Slow":      (1, 0, 3),
    },
    "sleep": {
        "Light":    (3, 1, 0),
        "Moderate": (1, 2, 1),
        "Heavy":    (0, 0, 3),
    },
    # Extended traits for richer scoring (optional, from extended form)
    "energy": {
        "Bursts":    (3, 1, 0),
        "Intense":   (0, 3, 0),
        "Sustained": (0, 1, 3),
    },
    "mind": {
        "Creative":   (3, 0, 0),
        "Analytical": (0, 3, 0),
        "Calm":       (0, 0, 3),
    },
    "appetite": {
        "Variable": (3, 0, 0),
        "Sharp":    (0, 3, 0),
        "Steady":   (0, 0, 3),
    },
    "emotion": {
        "Anxious":   (3, 0, 0),
        "Irritable": (0, 3, 0),
        "Attached":  (0, 0, 3),
    },
}


# ─── Rich knowledge base ───────────────────────────────────────────────────

DOSHA_KNOWLEDGE = {
    "Vata": {
        "element": "Air + Ether",
        "symbol": "🌬️",
        "color": "#6B7FD4",
        "gradient": "linear-gradient(135deg, #6B7FD4, #A8B4E8)",
        "qualities": ["Light", "Dry", "Cold", "Subtle", "Mobile"],
        "tagline": "The Force of Movement & Creativity",
        "description": (
            "Vata governs all movement in the body and mind — from breath to thoughts. "
            "You are naturally creative, enthusiastic, and quick-thinking. "
            "When balanced, Vata types are vivacious, artistic, and spiritually inclined. "
            "When out of balance, anxiety, dryness, and irregularity arise."
        ),
        "strengths": [
            "Quick to learn and adapt",
            "Naturally creative and expressive",
            "Enthusiastic and energetic in bursts",
            "Spiritually inclined and intuitive",
        ],
        "imbalance_signs": [
            "Anxiety and worry",
            "Dry skin, hair, and nails",
            "Irregular digestion and bloating",
            "Insomnia and restless sleep",
            "Joint stiffness and crackling",
            "Cold hands and feet",
        ],
        "diet": {
            "favor": [
                "Warm, oily, and nourishing foods",
                "Sweet, sour, and salty tastes",
                "Ghee, sesame oil, olive oil",
                "Root vegetables (sweet potato, beet)",
                "Warm milk with honey and spices",
                "Soaked nuts (almonds, walnuts)",
                "Cooked grains (rice, oats, wheat)",
            ],
            "avoid": [
                "Raw, cold, and dry foods",
                "Bitter, pungent, astringent tastes",
                "Crackers, dry cereals, popcorn",
                "Carbonated drinks and caffeine",
                "Excessive fasting or skipping meals",
            ],
        },
        "herbs": [
            {"name": "Ashwagandha", "benefit": "Grounds Vata, reduces anxiety, builds strength"},
            {"name": "Shatavari",   "benefit": "Nourishes tissues, calms nerves, hydrates"},
            {"name": "Triphala",    "benefit": "Regulates irregular digestion gently"},
            {"name": "Brahmi",      "benefit": "Calms the restless mind, improves focus"},
            {"name": "Bala",        "benefit": "Strengthens muscles and nervous system"},
        ],
        "lifestyle": [
            "Follow a consistent daily routine (Dinacharya)",
            "Abhyanga — daily warm sesame oil self-massage",
            "Sleep before 10 PM; avoid late nights",
            "Stay warm — avoid cold, wind, and drafts",
            "Practice slow, rhythmic breathing (Nadi Shodhana)",
            "Minimize screen time and multitasking",
        ],
        "yoga": [
            "Slow Hatha yoga and Yin yoga",
            "Grounding poses: Tadasana, Balasana, Virasana",
            "Avoid fast-paced or very strenuous practice",
            "Finish with long Savasana (10+ minutes)",
        ],
        "seasonal_tip": "Winter and early spring are Vata seasons — increase warmth, oil, and routine.",
        "mantra": "I am grounded, stable, and at peace.",
    },

    "Pitta": {
        "element": "Fire + Water",
        "symbol": "🔥",
        "color": "#D4541A",
        "gradient": "linear-gradient(135deg, #D4541A, #F0A060)",
        "qualities": ["Hot", "Sharp", "Light", "Liquid", "Oily"],
        "tagline": "The Force of Transformation & Intelligence",
        "description": (
            "Pitta governs digestion, metabolism, and transformation — physical and mental. "
            "You are naturally driven, sharp-minded, and goal-oriented. "
            "When balanced, Pitta types excel as leaders, teachers, and visionaries. "
            "When out of balance, inflammation, irritability, and perfectionism flare up."
        ),
        "strengths": [
            "Sharp intellect and analytical mind",
            "Natural leader and decision-maker",
            "Strong digestion and metabolism",
            "Focused, goal-driven, and courageous",
        ],
        "imbalance_signs": [
            "Anger, irritability, and frustration",
            "Skin inflammation, rashes, acne",
            "Heartburn and acid reflux",
            "Excessive hunger or hypoglycemia",
            "Perfectionism and burnout",
            "Sensitivity to heat",
        ],
        "diet": {
            "favor": [
                "Cool, refreshing, and lightly oily foods",
                "Sweet, bitter, and astringent tastes",
                "Coconut water, cucumber, mint",
                "Leafy greens, broccoli, zucchini",
                "Sweet fruits (grapes, melons, pears)",
                "Basmati rice, barley, quinoa",
                "Ghee (cooling and healing to Pitta)",
            ],
            "avoid": [
                "Hot, spicy, and fermented foods",
                "Sour and salty tastes in excess",
                "Chili, mustard, vinegar, pickles",
                "Alcohol and coffee",
                "Red meat and fried foods",
            ],
        },
        "herbs": [
            {"name": "Amalaki",    "benefit": "Cooling, anti-inflammatory, rich in Vitamin C"},
            {"name": "Shatavari",  "benefit": "Cools excess heat, nourishes and calms"},
            {"name": "Brahmi",     "benefit": "Cools the fiery mind, reduces stress"},
            {"name": "Neem",       "benefit": "Purifies blood, clears skin inflammation"},
            {"name": "Rose",       "benefit": "Cools emotions, supports heart health"},
        ],
        "lifestyle": [
            "Avoid excessive competition and overworking",
            "Take moonlit walks and spend time in nature",
            "Practice cooling pranayama (Sheetali, Sheetkari)",
            "Avoid exercising in peak heat (noon sun)",
            "Incorporate rest and play — not just productivity",
            "Cool showers and coconut oil massage",
        ],
        "yoga": [
            "Moderate, cooling yoga flows",
            "Moon salutations over sun salutations",
            "Chest-opening poses: Ustrasana, Matsyasana",
            "Forward folds to cool and calm the nervous system",
        ],
        "seasonal_tip": "Summer is Pitta season — prioritize cooling, rest, and sweet foods.",
        "mantra": "I lead with compassion and let go of control.",
    },

    "Kapha": {
        "element": "Earth + Water",
        "symbol": "🌍",
        "color": "#2E7D52",
        "gradient": "linear-gradient(135deg, #2E7D52, #6ABF8E)",
        "qualities": ["Heavy", "Slow", "Cool", "Oily", "Smooth"],
        "tagline": "The Force of Structure & Endurance",
        "description": (
            "Kapha governs structure, lubrication, and stability in the body and mind. "
            "You are naturally calm, compassionate, and enduring. "
            "When balanced, Kapha types radiate strength, loyalty, and deep love. "
            "When out of balance, heaviness, congestion, and inertia set in."
        ),
        "strengths": [
            "Emotionally stable and deeply compassionate",
            "Excellent endurance and physical strength",
            "Reliable, patient, and loyal",
            "Long-term memory and methodical thinking",
        ],
        "imbalance_signs": [
            "Weight gain and water retention",
            "Congestion, mucus, and sinus issues",
            "Lethargy, oversleeping, and sluggishness",
            "Emotional attachment and possessiveness",
            "Depression and low motivation",
            "Slow digestion and heaviness after meals",
        ],
        "diet": {
            "favor": [
                "Light, dry, warm, and spiced foods",
                "Pungent, bitter, and astringent tastes",
                "Ginger, black pepper, turmeric, cumin",
                "Legumes, leafy greens, and cruciferous vegetables",
                "Light fruits (apples, pears, berries)",
                "Barley, millet, buckwheat",
                "Raw honey (stimulating, not processed)",
            ],
            "avoid": [
                "Heavy, oily, and cold foods",
                "Sweet, sour, and salty tastes in excess",
                "Dairy, cheese, and ice cream",
                "Wheat, white rice, and refined grains",
                "Sweets, pastries, and fried food",
            ],
        },
        "herbs": [
            {"name": "Trikatu",      "benefit": "Kindles digestive fire, clears congestion"},
            {"name": "Guggulu",      "benefit": "Stimulates metabolism, reduces fat tissue"},
            {"name": "Ginger",       "benefit": "Warming, stimulates digestion, clears mucus"},
            {"name": "Punarnava",    "benefit": "Reduces water retention, supports kidneys"},
            {"name": "Bibhitaki",    "benefit": "Clears respiratory congestion, rejuvenates"},
        ],
        "lifestyle": [
            "Rise early (before 6 AM) — avoid excessive sleep",
            "Daily vigorous exercise — running, hiking, dancing",
            "Dry brushing (Garshana) to stimulate circulation",
            "Keep environment warm, dry, and stimulating",
            "Embrace change and new experiences",
            "Avoid daytime napping",
        ],
        "yoga": [
            "Vigorous, dynamic, and heating yoga",
            "Sun salutations (Surya Namaskar) at a fast pace",
            "Inversions and backbends to energize",
            "Kapalbhati and Bhastrika pranayama",
        ],
        "seasonal_tip": "Spring is Kapha season — move more, eat lighter, and welcome change.",
        "mantra": "I embrace change with joy and vitality.",
    },
}

# ─── Dual-dosha combinations ───────────────────────────────────────────────

DUAL_DOSHA_INFO = {
    "Vata-Pitta": {
        "description": "A dynamic combination of creativity and drive. You are quick, sharp, and enthusiastic but prone to burnout and inflammation when stressed.",
        "key_tip": "Balance movement with cooling rest. Warm nourishment and calming practices are your foundation.",
    },
    "Pitta-Vata": {
        "description": "Fire that moves — brilliant and driven, with a restless creative streak. Grounding and cooling are equally important.",
        "key_tip": "Prioritize consistent routine, cooling foods, and grounding yoga.",
    },
    "Pitta-Kapha": {
        "description": "Transformative power meets enduring structure. You are strong, determined, and organized but prone to congestion and heat.",
        "key_tip": "Favor light, spiced foods. Vigorous morning exercise balances both doshas beautifully.",
    },
    "Kapha-Pitta": {
        "description": "Deep strength with a fiery core. You have remarkable endurance and focus but can accumulate heat and heaviness.",
        "key_tip": "Keep moving and stay cool. Bitter greens and ginger are your allies.",
    },
    "Vata-Kapha": {
        "description": "Airy creativity with an earthy foundation. You may experience dryness and heaviness simultaneously, often in different seasons.",
        "key_tip": "Warm, lightly spiced, and moderately oily foods work well. Avoid extremes of cold and wet.",
    },
    "Kapha-Vata": {
        "description": "Grounded but prone to stagnation or sudden bursts of scattered energy. Routine and warmth are your anchors.",
        "key_tip": "Consistent warm meals, daily walks, and early rising transform your wellbeing.",
    },
}


# ─── Main Model Class ──────────────────────────────────────────────────────

class DoshaEngine:
    """
    Practical Dosha detection engine combining:
    - Random Forest ML model trained on dataset
    - Classical weighted trait scoring
    - Dual-dosha awareness
    - Rich holistic result payload
    """

    def __init__(self, csv_path: str):
        self.model, self.feature_names = self._train(csv_path)

    def _train(self, csv_path: str):
        df = pd.read_csv(csv_path)
        df["Body_Type"]  = df["Body_Type"].map(BODY_MAP)
        df["Skin"]       = df["Skin"].map(SKIN_MAP)
        df["Digestion"]  = df["Digestion"].map(DIGESTION_MAP)
        df["Sleep"]      = df["Sleep"].map(SLEEP_MAP)
        df["Dosha"]      = df["Dosha"].map(DOSHA_MAP)
        df = df.dropna()

        X = df[["Body_Type", "Skin", "Digestion", "Sleep"]].astype(int)
        y = df["Dosha"].astype(int)

        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X, y)
        return model, ["Body_Type", "Skin", "Digestion", "Sleep"]

    def _weighted_score(self, answers: dict) -> dict:
        """Compute raw Vata/Pitta/Kapha scores from trait weights."""
        scores = {"Vata": 0, "Pitta": 0, "Kapha": 0}
        key_map = {
            "body_type": "body_type",
            "skin": "skin",
            "digestion": "digestion",
            "sleep": "sleep",
            "energy": "energy",
            "mind": "mind",
            "appetite": "appetite",
            "emotion": "emotion",
        }
        for trait, answer in answers.items():
            if trait in TRAIT_WEIGHTS and answer in TRAIT_WEIGHTS[trait]:
                v, p, k = TRAIT_WEIGHTS[trait][answer]
                scores["Vata"]  += v
                scores["Pitta"] += p
                scores["Kapha"] += k
        return scores

    def _ml_probabilities(self, body_type: str, skin: str,
                           digestion: str, sleep: str) -> dict:
        """Return ML model class probabilities."""
        row = [[
            BODY_MAP.get(body_type, 1),
            SKIN_MAP.get(skin, 1),
            DIGESTION_MAP.get(digestion, 0),
            SLEEP_MAP.get(sleep, 1),
        ]]
        probs = self.model.predict_proba(row)[0]
        return {"Vata": float(probs[0]), "Pitta": float(probs[1]), "Kapha": float(probs[2])}

    def predict(self, answers: dict) -> dict:
        """
        Full dosha analysis.

        answers dict keys (all optional beyond the core 4):
          body_type, skin, digestion, sleep,
          energy, mind, appetite, emotion

        Returns rich dict with dominant, secondary, percentages,
        and full knowledge-base payload.
        """
        body_type = answers.get("body_type", "Medium")
        skin      = answers.get("skin", "Normal")
        digestion = answers.get("digestion", "Strong")
        sleep     = answers.get("sleep", "Moderate")

        # ── ML probabilities (60 % weight)
        ml_probs = self._ml_probabilities(body_type, skin, digestion, sleep)

        # ── Classical weighted scores (40 % weight)
        raw_scores = self._weighted_score(answers)
        total_raw  = sum(raw_scores.values()) or 1
        classic_probs = {k: v / total_raw for k, v in raw_scores.items()}

        # ── Blend
        blended = {
            d: round(0.60 * ml_probs[d] + 0.40 * classic_probs[d], 4)
            for d in ["Vata", "Pitta", "Kapha"]
        }
        total_blended = sum(blended.values()) or 1
        percentages = {
            d: round((blended[d] / total_blended) * 100, 1)
            for d in blended
        }

        # ── Dominant & secondary dosha
        ranked    = sorted(blended, key=blended.get, reverse=True)
        dominant  = ranked[0]
        secondary = ranked[1]

        # ── Dual-dosha detection (within 15 % of dominant)
        is_dual = (percentages[secondary] >= percentages[dominant] - 15)
        dual_key = f"{dominant}-{secondary}" if is_dual else None
        dual_info = DUAL_DOSHA_INFO.get(dual_key) if dual_key else None

        # ── Build result
        knowledge = DOSHA_KNOWLEDGE[dominant]
        result = {
            "dominant_dosha": dominant,
            "secondary_dosha": secondary,
            "is_dual_dosha": is_dual,
            "dual_combination": dual_key,
            "percentages": percentages,
            # Rich knowledge
            "element": knowledge["element"],
            "symbol": knowledge["symbol"],
            "color": knowledge["color"],
            "gradient": knowledge["gradient"],
            "qualities": knowledge["qualities"],
            "tagline": knowledge["tagline"],
            "description": knowledge["description"],
            "strengths": knowledge["strengths"],
            "imbalance_signs": knowledge["imbalance_signs"],
            "diet": knowledge["diet"],
            "herbs": knowledge["herbs"],
            "lifestyle": knowledge["lifestyle"],
            "yoga": knowledge["yoga"],
            "seasonal_tip": knowledge["seasonal_tip"],
            "mantra": knowledge["mantra"],
            # Dual dosha overlay
            "dual_info": dual_info,
            # Secondary reference
            "secondary_color": DOSHA_KNOWLEDGE[secondary]["color"],
            "secondary_tagline": DOSHA_KNOWLEDGE[secondary]["tagline"],
        }
        return result


# ─── Module-level singleton ────────────────────────────────────────────────

_engine = None

def load_dosha_engine(csv_path: str = "dosh_dataset.csv") -> DoshaEngine:
    global _engine
    if _engine is None:
        _engine = DoshaEngine(csv_path)
    return _engine


# ─── Quick test ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json
    engine = load_dosha_engine("dosh_dataset.csv")

    test_cases = [
        {"body_type": "Thin",   "skin": "Dry",    "digestion": "Irregular", "sleep": "Light",    "energy": "Bursts",    "mind": "Creative",   "appetite": "Variable", "emotion": "Anxious"},
        {"body_type": "Medium", "skin": "Oily",   "digestion": "Strong",    "sleep": "Moderate", "energy": "Intense",   "mind": "Analytical", "appetite": "Sharp",    "emotion": "Irritable"},
        {"body_type": "Heavy",  "skin": "Oily",   "digestion": "Slow",      "sleep": "Heavy",    "energy": "Sustained", "mind": "Calm",       "appetite": "Steady",   "emotion": "Attached"},
        {"body_type": "Thin",   "skin": "Normal", "digestion": "Strong",    "sleep": "Light",    "energy": "Intense",   "mind": "Analytical", "appetite": "Sharp",    "emotion": "Irritable"},
    ]

    for i, tc in enumerate(test_cases, 1):
        r = engine.predict(tc)
        print(f"\n── Test {i}: {r['dominant_dosha']} ({r['percentages'][r['dominant_dosha']]}%) "
              f"| Dual: {r['dual_combination'] or 'No'}")
        print(f"   Percentages → Vata:{r['percentages']['Vata']}%  Pitta:{r['percentages']['Pitta']}%  Kapha:{r['percentages']['Kapha']}%")
        print(f"   Tagline: {r['tagline']}")