"""
api_server.py — Unified Ayurveda Flask REST API v3.0
=======================================================
Endpoints:
  GET  /health        — system status
  GET  /dashboard     — module listing
  POST /recommend     — Ayurvedic formulation recommender
  POST /dosha         — Dosha detection (ML + classical scoring)
  POST /diet          — Full personalised diet plan (diet_engine.py)
  GET  /diet/options  — Available options (doshas, goals, lifestyles, seasons)
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

FORMULATION_CSV = os.environ.get("CSV_PATH",  "herbal_formulation.csv")
DOSHA_CSV       = os.environ.get("DOSHA_CSV", "dosh_dataset.csv")

_recommender  = None
_dosha_engine = None


def get_recommender():
    global _recommender
    if _recommender is None:
        from ayurveda_recommender import load_and_preprocess, AyurvedaRecommender
        print("⚙  Loading formulation recommender…")
        df = load_and_preprocess(FORMULATION_CSV)
        _recommender = AyurvedaRecommender(df)
        print("✓  Formulation recommender ready.")
    return _recommender


def get_dosha_engine():
    global _dosha_engine
    if _dosha_engine is None:
        from dosha import load_dosha_engine
        print("⚙  Loading dosha engine…")
        _dosha_engine = load_dosha_engine(DOSHA_CSV)
        print("✓  Dosha engine ready.")
    return _dosha_engine


# ─────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "version": "3.0",
        "modules": ["recommend", "dosha", "diet"],
    })


@app.route("/dashboard", methods=["GET"])
def dashboard():
    return jsonify({
        "modules": [
            {
                "name": "Ayurveda Recommendation",
                "description": "Get classical formulations based on symptoms",
                "endpoint": "/recommend",
                "method": "POST",
                "body": {"query": "string", "top_n": "int (default 5)"},
            },
            {
                "name": "Dosha Detector",
                "description": "Find your Prakriti — Vata, Pitta, or Kapha",
                "endpoint": "/dosha",
                "method": "POST",
                "body": {
                    "body_type":  "Thin | Medium | Heavy",
                    "skin":       "Dry | Normal | Oily",
                    "digestion":  "Irregular | Strong | Slow",
                    "sleep":      "Light | Moderate | Heavy",
                    "energy":     "(optional) Bursts | Intense | Sustained",
                    "mind":       "(optional) Creative | Analytical | Calm",
                    "appetite":   "(optional) Variable | Sharp | Steady",
                    "emotion":    "(optional) Anxious | Irritable | Attached",
                },
            },
            {
                "name": "Diet Planner",
                "description": "Full personalised Ayurvedic diet plan",
                "endpoint": "/diet",
                "method": "POST",
                "body": {
                    "dosha":           "Vata | Pitta | Kapha  (required)",
                    "secondary_dosha": "Vata | Pitta | Kapha  (optional)",
                    "season":          "Spring | Summer | Autumn | Winter  (optional — auto-detected)",
                    "goal":            "Balance | Detox | Energy | Weight | Immunity  (default: Balance)",
                    "lifestyle":       "Vegetarian | Vegan | Non-vegetarian  (default: Vegetarian)",
                },
            },
        ]
    })


@app.route("/recommend", methods=["POST"])
def recommend():
    """POST /recommend — { query, top_n }"""
    body  = request.get_json(silent=True) or {}
    query = body.get("query", "").strip()
    top_n = int(body.get("top_n", 5))

    if not query:
        return jsonify({"error": "query field is required"}), 400

    try:
        results = get_recommender().recommend_formulations(query, top_n=top_n)
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/dosha", methods=["POST"])
def dosha():
    """POST /dosha — { body_type, skin, digestion, sleep, [energy, mind, appetite, emotion] }"""
    body = request.get_json(silent=True) or {}

    required = ["body_type", "skin", "digestion", "sleep"]
    missing  = [f for f in required if not body.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}", "required": required}), 400

    valid = {
        "body_type":  ["Thin", "Medium", "Heavy"],
        "skin":       ["Dry", "Normal", "Oily"],
        "digestion":  ["Irregular", "Strong", "Slow"],
        "sleep":      ["Light", "Moderate", "Heavy"],
    }
    for field, choices in valid.items():
        if body.get(field) not in choices:
            return jsonify({"error": f"Invalid '{field}'", "valid_choices": choices}), 400

    try:
        result = get_dosha_engine().predict(body)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/diet/options", methods=["GET"])
def diet_options():
    """GET /diet/options — returns valid parameter choices"""
    return jsonify({
        "doshas":     ["Vata", "Pitta", "Kapha"],
        "goals":      ["Balance", "Detox", "Energy", "Weight", "Immunity"],
        "lifestyles": ["Vegetarian", "Vegan", "Non-vegetarian"],
        "seasons":    ["Spring", "Summer", "Autumn", "Winter"],
    })


@app.route("/diet", methods=["POST"])
def diet():
    body = request.get_json(silent=True) or {}

    dosha     = body.get("dosha", "Vata")
    season    = body.get("season", "Summer")
    goal      = body.get("goal", "Balance")
    lifestyle = body.get("lifestyle", "Vegetarian")
    seed = random.randint(1, 100000)

    try:
        import requests, json, os, random

        SYSTEM_PROMPT = """                You are an expert Ayurvedic nutritionist and creative meal planner. Generate a UNIQUE daily meal plan every time. Even for identical inputs, vary the meals creatively.

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
               10. Each response must differ significantly from previous outputs in ingredients, cuisine style, and dish names.
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

                Ensure 2-3 items per meal section. No meal repeated across sections.
"""

        user_prompt = f"""
                        Generate Ayurvedic meal plan:

                        Dosha: {dosha}
                        Goal: {goal}
                        Lifestyle: {lifestyle}
                        Season: {season}

                        IMPORTANT RULES:
                        - Vegan: no dairy or animal products
                        - Vegetarian: dairy allowed, no eggs/meat
                        - Non-vegetarian: MUST include eggs/fish/chicken
                        - Lunch heaviest, dinner light
                        - 2-3 items per meal
                        Random seed: {seed}
                        Create a completely different plan than previous ones.
                        
             """

        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.9
            }
        )

        data= response.json()
        if "choices" not in data:
            raise Exception(f"OpenAI error: {data}")
        content = data["choices"][0]["message"]["content"]

        # clean JSON
        content = content.replace("```json", "").replace("```", "").strip()
        try:
          meals = json.loads(content)
        except:
            raise Exception("Invalid AI JSON response")

        return jsonify({
            "meals": meals,
            "dosha": dosha,
            "goal": goal,
            "lifestyle": lifestyle,
            "season": season,
            "source": "ai"
        })

    except Exception as e:
        print("AI failed:", e)

        # fallback
        from diet_engine import generate_diet_plan

        meals = generate_diet_plan(
            dosha=dosha,
            season=season,
            goal=goal,
            lifestyle=lifestyle
        )

        return jsonify({
            "meals": meals,
            "dosha": dosha,
            "goal": goal,
            "lifestyle": lifestyle,
            "season": season,
            "source": "fallback"
        })


# ─────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"\n🌿  Ayurveda API v3.0 starting on port {port}…\n")
    app.run(port=port, debug=False)