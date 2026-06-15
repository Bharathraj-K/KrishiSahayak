export const FALLBACK_CATEGORY_MAP = {
  cereals: ['Rice', 'Wheat', 'Maize', 'Bajra', 'Jowar'],
  pulses: ['Arhar (Tur)', 'Moong', 'Urad', 'Masoor', 'Chana'],
  oilseeds: ['Groundnut', 'Soyabean', 'Sunflower', 'Mustard', 'Cotton Seed'],
  vegetables: ['Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal'],
  fruits: ['Mango', 'Banana', 'Apple', 'Orange', 'Pomegranate'],
  spices: ['Turmeric', 'Chilli', 'Coriander', 'Cumin', 'Black Pepper']
};

export const FALLBACK_CATEGORIES = Object.keys(FALLBACK_CATEGORY_MAP).map((key) => ({
  id: key,
  name: key.charAt(0).toUpperCase() + key.slice(1),
  crops: FALLBACK_CATEGORY_MAP[key],
  count: FALLBACK_CATEGORY_MAP[key].length
}));

export const FALLBACK_ALL_CROPS = [...new Set(Object.values(FALLBACK_CATEGORY_MAP).flat())];
