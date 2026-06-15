from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'crop_recommendation_model.joblib')
SCALER_PATH = os.path.join(BASE_DIR, 'crop_recommendation_scaler.joblib')

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURES = [
    'nitrogen',
    'phosphorus',
    'potassium',
    'temperature',
    'humidity',
    'ph',
    'rainfall'
]

FEATURE_ALIASES = {
    'nitrogen': 'N',
    'phosphorus': 'P',
    'potassium': 'K',
    'temperature': 'temperature',
    'humidity': 'humidity',
    'ph': 'ph',
    'rainfall': 'rainfall'
}

@app.get('/health')
def health():
    return jsonify({
        'success': True,
        'message': 'Crop recommendation service is running'
    })

@app.post('/predict')
def predict():
    payload = request.get_json(silent=True) or {}

    missing = [key for key in FEATURES if key not in payload]
    if missing:
        return jsonify({
            'success': False,
            'error': f"Missing fields: {', '.join(missing)}"
        }), 400

    try:
        values = [float(payload[key]) for key in FEATURES]
    except (TypeError, ValueError):
        return jsonify({
            'success': False,
            'error': 'All input values must be numeric'
        }), 400

    sample_df = pd.DataFrame([values], columns=FEATURES)

    expected_features = getattr(scaler, 'feature_names_in_', None)
    if expected_features is not None:
        mapped = {}
        for feature in expected_features:
            source = next((key for key, value in FEATURE_ALIASES.items() if value == feature), None)
            if source is None:
                return jsonify({
                    'success': False,
                    'error': f'Unexpected feature name in scaler: {feature}'
                }), 500
            mapped[feature] = float(payload[source])
        sample_df = pd.DataFrame([mapped], columns=list(expected_features))

    sample_scaled = scaler.transform(sample_df)

    prediction = model.predict(sample_scaled)[0]
    proba = model.predict_proba(sample_scaled)[0]

    top_indices = np.argsort(proba)[::-1][:3]
    top_predictions = [
        {
            'crop': model.classes_[idx],
            'confidence': round(float(proba[idx]) * 100, 2)
        }
        for idx in top_indices
    ]

    return jsonify({
        'success': True,
        'data': {
            'prediction': prediction,
            'confidence': round(float(np.max(proba)) * 100, 2),
            'topPredictions': top_predictions,
            'input': {key: float(payload[key]) for key in FEATURES}
        },
        'modelUsed': 'RandomForest (scikit-learn)'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
