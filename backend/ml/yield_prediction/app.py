from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
from dataclasses import dataclass
from sklearn.base import BaseEstimator, TransformerMixin

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "yield_model_pipeline.joblib")

# IMPORTANT:
# The trained pipeline was serialized from a notebook where YearTransformer lived in __main__.
# When loading the artifact in this service (also __main__), we must provide the same symbol.
@dataclass
class YearTransformer(BaseEstimator, TransformerMixin):
    min_year: float = None
    max_year: float = None

    def fit(self, X, y=None):
        years = np.array(X).astype(float).reshape(-1)
        self.min_year = float(np.min(years))
        self.max_year = float(np.max(years))
        return self

    def transform(self, X):
        years = np.array(X).astype(float).reshape(-1)
        denom = (self.max_year - self.min_year) if self.max_year != self.min_year else 1.0
        scaled = (years - self.min_year) / denom
        return scaled.reshape(-1, 1)

def safe_log1p(x):
    x = np.array(x, dtype=float)
    x = np.clip(x, a_min=0, a_max=None)
    return np.log1p(x)

pipeline = joblib.load(MODEL_PATH)

FEATURES = [
    "Crop",
    "Year",
    "Season",
    "State",
    "Area",
    "Rainfall",
    "Fertilizer",
    "Pesticide",
]


@app.get("/health")
def health():
    return jsonify({"success": True, "message": "Yield prediction service is running"})


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    missing = [key for key in FEATURES if key not in payload]
    if missing:
        return (
            jsonify({"success": False, "error": f"Missing fields: {', '.join(missing)}"}),
            400,
        )

    try:
        row = {
            "Crop": str(payload["Crop"]).strip(),
            "State": str(payload["State"]).strip(),
            "Season": str(payload["Season"]).strip(),
            "Year": float(payload["Year"]),
            "Area": float(payload["Area"]),
            "Rainfall": float(payload["Rainfall"]),
            "Fertilizer": float(payload["Fertilizer"]),
            "Pesticide": float(payload["Pesticide"]),
        }
    except (TypeError, ValueError):
        return (
            jsonify({"success": False, "error": "Invalid input types. Year/Area/Rainfall/Fertilizer/Pesticide must be numeric."}),
            400,
        )

    df = pd.DataFrame([row], columns=FEATURES)

    try:
        pred = float(pipeline.predict(df)[0])
    except Exception as e:
        return jsonify({"success": False, "error": f"Prediction failed: {str(e)}"}), 500

    pred = float(np.clip(pred, a_min=0.0, a_max=None))

    return jsonify(
        {
            "success": True,
            "data": {
                "predictedYield": round(pred, 4),
                "unit": "Yield (dataset units)",
                "input": row,
            },
            "modelUsed": "Yield pipeline (scikit-learn / xgboost)",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=False)

