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
    """
    POST /diet
    Body: {
        "dosha":           "Vata",          # required
        "secondary_dosha": "Pitta",         # optional
        "season":          "Summer",        # optional (auto-detected if absent)
        "goal":            "Energy",        # optional (default: Balance)
        "lifestyle":       "Vegetarian"     # optional (default: Vegetarian)
    }
    """
    body = request.get_json(silent=True) or {}

    dosha     = body.get("dosha", "").strip().capitalize()
    secondary = body.get("secondary_dosha", "").strip().capitalize() or None
    season    = body.get("season", "").strip().capitalize() or None
    goal      = body.get("goal", "Balance").strip().capitalize()
    lifestyle = body.get("lifestyle", "Vegetarian").strip().capitalize()

    # Normalise "Weight-loss" → "Weight"
    if goal.startswith("Weight"):
        goal = "Weight"

    # Validate dosha
    valid_doshas = ["Vata", "Pitta", "Kapha"]
    if dosha not in valid_doshas:
        return jsonify({
            "error": f"Invalid dosha '{dosha}'",
            "valid": valid_doshas,
        }), 400

    # Validate goal
    valid_goals = ["Balance", "Detox", "Energy", "Weight", "Immunity"]
    if goal not in valid_goals:
        goal = "Balance"

    # Validate lifestyle
    valid_lifestyles = ["Vegetarian", "Vegan", "Non-vegetarian"]
    if lifestyle not in valid_lifestyles:
        lifestyle = "Vegetarian"

    # Validate season
    valid_seasons = ["Spring", "Summer", "Autumn", "Winter"]
    if season and season not in valid_seasons:
        season = None

    try:
        from diet_engine import generate_diet_plan
        plan = generate_diet_plan(
            dosha=dosha,
            secondary_dosha=secondary,
            season=season,
            goal=goal,
            lifestyle=lifestyle,
        )
        return jsonify(plan)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"\n🌿  Ayurveda API v3.0 starting on port {port}…\n")
    app.run(port=port, debug=False)