const fs = require('node:fs');
const path = require('node:path');

function quantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] === undefined) return sorted[base];
  return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
}

class YieldMetaService {
  constructor() {
    this.csvPath = path.join(__dirname, '..', '..', 'ml', 'yield_prediction', 'data', 'crop_yield.csv');
    this.meta = this.loadMeta();
  }

  loadMeta() {
    if (!fs.existsSync(this.csvPath)) {
      return {
        crops: [],
        states: [],
        seasons: [],
        yearRange: { min: 1990, max: 2035 },
        numericRanges: {
          Area: { min: 0, max: 50000000 },
          Rainfall: { min: 0, max: 10000 },
          Fertilizer: { min: 0, max: 1000000000 },
          Pesticide: { min: 0, max: 1000000000 }
        }
      };
    }

    const raw = fs.readFileSync(this.csvPath, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split(',').map((h) => h.trim());

    const idx = (name) => header.indexOf(name);
    const iCrop = idx('Crop');
    const iYear = idx('Crop_Year');
    const iSeason = idx('Season');
    const iState = idx('State');
    const iArea = idx('Area');
    const iRain = idx('Annual_Rainfall');
    const iFert = idx('Fertilizer');
    const iPest = idx('Pesticide');

    const crops = new Set();
    const states = new Set();
    const seasons = new Set();

    const years = [];
    const areas = [];
    const rains = [];
    const ferts = [];
    const pests = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length !== header.length) continue;

      const crop = String(parts[iCrop] ?? '').trim();
      const state = String(parts[iState] ?? '').trim();
      const season = String(parts[iSeason] ?? '').trim();
      const year = Number(parts[iYear]);
      const area = Number(parts[iArea]);
      const rain = Number(parts[iRain]);
      const fert = Number(parts[iFert]);
      const pest = Number(parts[iPest]);

      if (crop) crops.add(crop);
      if (state) states.add(state);
      if (season) seasons.add(season);
      if (Number.isFinite(year)) years.push(year);
      if (Number.isFinite(area)) areas.push(area);
      if (Number.isFinite(rain)) rains.push(rain);
      if (Number.isFinite(fert)) ferts.push(fert);
      if (Number.isFinite(pest)) pests.push(pest);
    }

    years.sort((a, b) => a - b);
    areas.sort((a, b) => a - b);
    rains.sort((a, b) => a - b);
    ferts.sort((a, b) => a - b);
    pests.sort((a, b) => a - b);

    const yearRange = {
      min: years[0] ?? 1990,
      max: years[years.length - 1] ?? 2035
    };

    // Use p1..p99 to reject absurd values while tolerating some outliers.
    const numericRanges = {
      Area: { min: Math.max(0, Math.floor(quantile(areas, 0.01) ?? 0)), max: Math.ceil(quantile(areas, 0.99) ?? 50000000) },
      Rainfall: { min: Math.max(0, Math.floor(quantile(rains, 0.01) ?? 0)), max: Math.ceil(quantile(rains, 0.99) ?? 10000) },
      Fertilizer: { min: Math.max(0, Math.floor(quantile(ferts, 0.01) ?? 0)), max: Math.ceil(quantile(ferts, 0.99) ?? 1000000000) },
      Pesticide: { min: Math.max(0, Math.floor(quantile(pests, 0.01) ?? 0)), max: Math.ceil(quantile(pests, 0.99) ?? 1000000000) }
    };

    return {
      crops: Array.from(crops).sort((a, b) => a.localeCompare(b)),
      states: Array.from(states).sort((a, b) => a.localeCompare(b)),
      seasons: Array.from(seasons).sort((a, b) => a.localeCompare(b)),
      yearRange,
      numericRanges
    };
  }

  getMeta() {
    return this.meta;
  }

  isValidCrop(crop) {
    return this.meta.crops.includes(crop);
  }

  isValidState(state) {
    return this.meta.states.includes(state);
  }

  isValidSeason(season) {
    return this.meta.seasons.includes(season);
  }

  suggestDefaults({ crop, state, season }) {
    if (!fs.existsSync(this.csvPath)) return null;

    const cropKey = String(crop || '').trim().toLowerCase();
    const stateKey = String(state || '').trim().toLowerCase();
    const seasonKey = String(season || '').trim().toLowerCase();
    if (!cropKey || !stateKey || !seasonKey) return null;

    const raw = fs.readFileSync(this.csvPath, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split(',').map((h) => h.trim());

    const idx = (name) => header.indexOf(name);
    const iCrop = idx('Crop');
    const iSeason = idx('Season');
    const iState = idx('State');
    const iArea = idx('Area');
    const iRain = idx('Annual_Rainfall');
    const iFert = idx('Fertilizer');
    const iPest = idx('Pesticide');

    const areas = [];
    const rains = [];
    const ferts = [];
    const pests = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length !== header.length) continue;

      const rowCrop = String(parts[iCrop] ?? '').trim().toLowerCase();
      const rowState = String(parts[iState] ?? '').trim().toLowerCase();
      const rowSeason = String(parts[iSeason] ?? '').trim().toLowerCase();

      if (rowCrop !== cropKey || rowState !== stateKey || rowSeason !== seasonKey) continue;

      const area = Number(parts[iArea]);
      const rain = Number(parts[iRain]);
      const fert = Number(parts[iFert]);
      const pest = Number(parts[iPest]);

      if (Number.isFinite(area)) areas.push(area);
      if (Number.isFinite(rain)) rains.push(rain);
      if (Number.isFinite(fert)) ferts.push(fert);
      if (Number.isFinite(pest)) pests.push(pest);
    }

    const median = (arr) => {
      if (!arr.length) return null;
      const sorted = [...arr].sort((a, b) => a - b);
      return quantile(sorted, 0.5);
    };

    const suggested = {
      Area: median(areas),
      Rainfall: median(rains),
      Fertilizer: median(ferts),
      Pesticide: median(pests)
    };

    if (Object.values(suggested).every((v) => v === null)) return null;
    return suggested;
  }
}

module.exports = new YieldMetaService();

