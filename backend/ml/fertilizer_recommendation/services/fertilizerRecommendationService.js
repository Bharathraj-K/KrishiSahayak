const fs = require('node:fs');
const path = require('node:path');
const { FERTILIZER_ADVICE } = require('../constants/fertilizerAdvice');

class FertilizerRecommendationService {
  constructor() {
    this.datasetPath = path.join(__dirname, '..', 'data', 'fertilizer.csv');
    this.cropProfiles = this.loadCropProfiles();
  }

  loadCropProfiles() {
    const raw = fs.readFileSync(this.datasetPath, 'utf-8');
    const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const rows = lines.slice(1);

    return rows
      .map((row) => row.split(','))
      .filter((parts) => parts.length >= 5)
      .map((parts) => {
        const crop = String(parts[1] || '').trim();
        const n = Number(parts[2]);
        const p = Number(parts[3]);
        const k = Number(parts[4]);

        if (!crop || !Number.isFinite(n) || !Number.isFinite(p) || !Number.isFinite(k)) {
          return null;
        }

        return {
          crop,
          cropKey: crop.toLowerCase(),
          requiredN: n,
          requiredP: p,
          requiredK: k
        };
      })
      .filter(Boolean);
  }

  getSupportedCrops() {
    return this.cropProfiles
      .map((item) => item.crop)
      .sort((a, b) => a.localeCompare(b));
  }

  findCropProfile(cropName) {
    const cropKey = String(cropName || '').trim().toLowerCase();
    return this.cropProfiles.find((item) => item.cropKey === cropKey) || null;
  }

  getDominantGap(profile, input) {
    const gaps = [
      { nutrient: 'N', difference: profile.requiredN - input.nitrogen, soilValue: input.nitrogen, target: profile.requiredN },
      { nutrient: 'P', difference: profile.requiredP - input.phosphorus, soilValue: input.phosphorus, target: profile.requiredP },
      { nutrient: 'K', difference: profile.requiredK - input.potassium, soilValue: input.potassium, target: profile.requiredK }
    ];

    return gaps.reduce((maxGap, current) => (
      Math.abs(current.difference) > Math.abs(maxGap.difference) ? current : maxGap
    ), gaps[0]);
  }

  resolveAdviceKey(dominantGap) {
    const isDeficit = dominantGap.difference > 0;
    if (dominantGap.nutrient === 'N') return isDeficit ? 'Nlow' : 'NHigh';
    if (dominantGap.nutrient === 'P') return isDeficit ? 'Plow' : 'PHigh';
    return isDeficit ? 'Klow' : 'KHigh';
  }

  getRecommendation({ cropName, nitrogen, phosphorus, potassium }) {
    const profile = this.findCropProfile(cropName);
    if (!profile) {
      return null;
    }

    const input = {
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium)
    };

    const dominantGap = this.getDominantGap(profile, input);
    const adviceKey = this.resolveAdviceKey(dominantGap);
    const advice = FERTILIZER_ADVICE[adviceKey];
    const direction = dominantGap.difference > 0 ? 'deficient' : 'excess';

    return {
      crop: profile.crop,
      limitingNutrient: dominantGap.nutrient,
      direction,
      adviceKey,
      difference: Math.abs(dominantGap.difference),
      recommendation: advice,
      requiredNutrients: {
        N: profile.requiredN,
        P: profile.requiredP,
        K: profile.requiredK
      },
      providedNutrients: {
        N: input.nitrogen,
        P: input.phosphorus,
        K: input.potassium
      }
    };
  }
}

module.exports = new FertilizerRecommendationService();
