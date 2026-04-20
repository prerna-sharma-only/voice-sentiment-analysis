from flask import Flask, render_template, request, jsonify
from transformers import pipeline

app = Flask(__name__)

classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

def analyze_text(text):
    result = classifier(text)

    if isinstance(result, list) and isinstance(result[0], list):
        result = result[0]

    emotions = {}
    for item in result:
        emotions[item['label']] = round(item['score'] * 100, 2)

    main = max(emotions, key=emotions.get)

    return emotions, main

def generate_message(sentiment):
    if sentiment == "joy":
        return "You're glowing today ✨"
    elif sentiment == "sadness":
        return "Hey... things will get better 💙"
    elif sentiment == "anger":
        return "Relax... you're in control 🧘"
    else:
        return "Stay calm and balanced 😌"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze-text", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text")

    emotions, main = analyze_text(text)
    message = generate_message(main)

    return jsonify({
        "text": text,
        "main": main,
        "emotions": emotions,
        "message": message
    })

if __name__ == "__main__":
    app.run(debug=True)