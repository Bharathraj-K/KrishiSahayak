const FERTILIZER_ADVICE = {
  NHigh: {
    title: 'Nitrogen is high in soil',
    summary: 'Nitrogen is above target for this crop and may increase excessive vegetative growth.',
    suggestions: [
      'Use balanced or phosphorus-potassium focused fertilizer and avoid high-N formulations for now.',
      'Increase organic carbon inputs (compost, dry biomass) to improve nutrient buffering.',
      'Grow nitrogen-demanding follow-up crops where feasible.',
      'Avoid over-irrigation with additional soluble nitrogen sources.'
    ]
  },
  Nlow: {
    title: 'Nitrogen is low in soil',
    summary: 'Nitrogen is below target for this crop and can limit foliage and yield.',
    suggestions: [
      'Apply nitrogen-rich fertilizers in split doses to reduce losses.',
      'Use well-decomposed manure or compost to improve long-term nitrogen availability.',
      'Incorporate legumes in rotation to improve biological nitrogen fixation.',
      'Monitor moisture to reduce volatilization and leaching losses.'
    ]
  },
  PHigh: {
    title: 'Phosphorus is high in soil',
    summary: 'Phosphorus is above target and additional P application is not recommended.',
    suggestions: [
      'Avoid phosphorus-heavy fertilizers for this crop cycle.',
      'Use formulations with little or no phosphorus where possible.',
      'Prefer balanced nutrient plans based on remaining N and K gaps.',
      'Track pH because extreme pH can worsen nutrient imbalance.'
    ]
  },
  Plow: {
    title: 'Phosphorus is low in soil',
    summary: 'Phosphorus is below target and may impact root development and flowering.',
    suggestions: [
      'Apply phosphorus-containing fertilizer near the root zone (band placement).',
      'Use phospho-compost or rock phosphate where suitable for your soil.',
      'Keep soil pH in a crop-appropriate range to improve P availability.',
      'Avoid over-watering right after application to reduce movement losses.'
    ]
  },
  KHigh: {
    title: 'Potassium is high in soil',
    summary: 'Potassium is above target and extra K may not be beneficial right now.',
    suggestions: [
      'Pause potassium-rich fertilizer inputs this cycle.',
      'Use balanced fertilizer focused on nutrients currently deficient.',
      'Improve soil structure with organic matter to stabilize nutrient uptake.',
      'Retest soil before the next season to confirm K trend.'
    ]
  },
  Klow: {
    title: 'Potassium is low in soil',
    summary: 'Potassium is below target and may reduce stress tolerance and quality.',
    suggestions: [
      'Apply potash-based fertilizers as per label recommendations.',
      'Split K application where soils are light or irrigation is frequent.',
      'Use organic potassium sources (composted residues, bio-inputs) as supplement.',
      'Maintain moisture consistency to improve K uptake.'
    ]
  }
};

module.exports = {
  FERTILIZER_ADVICE
};
