# Write the updated api_server.py
"""
api_server.py — Unified Ayurveda Flask REST API v2.0
=======================================================
Endpoints:
  GET  /health      — system status
  GET  /dashboard   — module listing  
  POST /recommend   — Ayurvedic formulation recommender
  POST /dosha       — Dosha detection (ML + classical scoring)
  POST /diet        — Diet plan based on dosha
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

FORMULATION_CSV = os.environ.get("CSV_PATH",  "herbal_formulation.csv")
DOSHA_CSV       = os.environ.get("DOSHA_CSV", "dosh_dataset.csv")

_recommender = None
_dosha_engine = None

def get_recommender():
    global _recommender
    if _recommender is None:
        from ayurveda_recommender import load_and_preprocess, AyurvedaRecommender
        print("Loading formulation recommender…")
        df = load_and_preprocess(FORMULATION_CSV)
        _recommender = AyurvedaRecommender(df)
        print("Formulation recommender ready.")
    return _recommender

def get_dosha_engine():
    global _dosha_engine
    if _dosha_engine is None:
        from dosha import load_dosha_engine
        print("Loading dosha engine…")
        _dosha_engine = load_dosha_engine(DOSHA_CSV)
        print("Dosha engine ready.")
    return _dosha_engine

DIET_PLANS = {
    "Vata": {
        "dosha": "Vata", "season": "Autumn & Winter",
        "principle": "Warm, grounding, and nourishing foods to calm the airy Vata",
        "meal_plan": {"breakfast": ["Warm spiced oatmeal with ghee, honey, and cardamom","Soaked almond milk with saffron and dates"],"lunch": ["Kitchari (mung dal + basmati rice) with cumin and turmeric","Vegetable soup with root vegetables"],"dinner": ["Light soup or dal — never heavy at night","Cooked seasonal vegetables with warming spices"],"snacks": ["Soaked walnuts or almonds (4-6)","Warm ginger or cardamom tea"]},
        "eating_rules": ["Eat at consistent times — never skip meals","Always eat warm or room-temperature food","Add healthy fats (ghee, sesame) to every meal"],
        "best_spices": ["Ginger","Cumin","Cardamom","Cinnamon","Fennel"],
        "best_foods": ["Ghee","Sweet potato","Basmati rice","Mung dal","Sesame seeds"],
        "avoid_foods": ["Raw salads","Popcorn","Cold drinks","Carbonated water"],
    },
    "Pitta": {
        "dosha": "Pitta", "season": "Summer & Late Spring",
        "principle": "Cool, refreshing, and moderately oily foods to temper the fiery Pitta",
        "meal_plan": {"breakfast": ["Sweet fruits with coconut flakes","Barley porridge with rose water and maple syrup"],"lunch": ["Large, satisfying lunch — Pitta digests best at noon","Basmati rice with cooling dal (mung) and ghee"],"dinner": ["Light, early dinner before 7 PM","Kitchari or simple vegetable stew"],"snacks": ["Cucumber slices with mint chutney","Coconut water","Fresh pomegranate or sweet grapes"]},
        "eating_rules": ["Never skip lunch — Pitta burns without fuel","Eat in a relaxed, pleasant environment","Drink cool (not iced) water between meals"],
        "best_spices": ["Coriander","Fennel","Cardamom","Turmeric","Mint"],
        "best_foods": ["Coconut","Ghee","Cucumber","Leafy greens","Sweet fruits"],
        "avoid_foods": ["Chili","Garlic (raw)","Vinegar","Alcohol","Red meat"],
    },
    "Kapha": {
        "dosha": "Kapha", "season": "Spring & Early Winter",
        "principle": "Light, warm, and stimulating foods to kindle the slow Kapha fire",
        "meal_plan": {"breakfast": ["If not hungry, skip — Kapha benefits from intermittent fasting","Light ginger tea with honey if hungry"],"lunch": ["Largest meal of the day at noon","Spiced lentil soup with trikatu spices"],"dinner": ["Small, early, and light dinner","Vegetable broth with barley"],"snacks": ["Ginger tea with honey","Light herbal teas: tulsi, ginger, cinnamon"]},
        "eating_rules": ["Avoid overeating — eat until 75% full","Eat only when truly hungry","Use pungent, bitter, and astringent tastes"],
        "best_spices": ["Ginger","Black pepper","Trikatu","Turmeric","Clove"],
        "best_foods": ["Mung beans","Barley","Apples","Pomegranate","Leafy greens","Honey"],
        "avoid_foods": ["Dairy","Fried food","Sweets","White bread","Ice cream","Bananas"],
    },
}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "version": "2.0", "modules": ["recommend","dosha","diet"]})

@app.route("/dashboard", methods=["GET"])
def dashboard():
    return jsonify({"modules": [
        {"name": "Ayurveda Recommendation","description": "Get classical formulations based on symptoms","endpoint": "/recommend","method": "POST"},
        {"name": "Dosha Detector","description": "Find your Prakriti (body-mind constitution)","endpoint": "/dosha","method": "POST"},
        {"name": "Diet Planner","description": "Personalised diet plan based on your dosha","endpoint": "/diet","method": "POST"},
    ]})

@app.route("/recommend", methods=["POST"])
def recommend():
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
    body = request.get_json(silent=True) or {}
    required = ["body_type","skin","digestion","sleep"]
    missing = [f for f in required if not body.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}","required": required}), 400
    valid = {"body_type":["Thin","Medium","Heavy"],"skin":["Dry","Normal","Oily"],"digestion":["Irregular","Strong","Slow"],"sleep":["Light","Moderate","Heavy"]}
    for field, choices in valid.items():
        if body.get(field) not in choices:
            return jsonify({"error": f"Invalid value for '{field}'","valid_choices": choices}), 400
    try:
        result = get_dosha_engine().predict(body)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/diet", methods=["POST"])
def diet():
    body  = request.get_json(silent=True) or {}
    dosha = body.get("dosha","").strip().capitalize()
    if dosha not in DIET_PLANS:
        return jsonify({"error": f"Invalid dosha '{dosha}'","valid": ["Vata","Pitta","Kapha"]}), 400
    return jsonify(DIET_PLANS[dosha])

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    print(f"\n🌿  Ayurveda API starting on port {port}…\n")
    app.run(port=port, debug=False)
