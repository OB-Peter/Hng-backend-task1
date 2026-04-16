/**
 * Classify an age into a human-readable group
 * @param {number} age
 * @returns {'child' | 'teenager' | 'adult' | 'senior'}
 */
export function classifyAge(age) {
  if (age >= 0 && age <= 12) return 'child';
  if (age >= 13 && age <= 19) return 'teenager';
  if (age >= 20 && age <= 59) return 'adult';
  return 'senior';
}

/**
 * Pick the country with the highest probability
 * @param {{ country_id: string, probability: number }[]} countries
 * @returns {{ country_id: string, probability: number }}
 */
export function pickTopCountry(countries) {
  return countries.reduce(
    (max, c) => (c.probability > max.probability ? c : max),
    countries[0]
  );
}