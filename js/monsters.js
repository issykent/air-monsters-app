// monsters.js
export function getMonsterFromAQI(aqi) {
    if (aqi <= 50)  return 'breezy';
    if (aqi <= 100) return 'sprout';
    if (aqi <= 150) return 'argo';
    if (aqi <= 200) return 'sili';
    if (aqi <= 250) return 'rusty';
    return 'smokey';
}

export const monsterLocations = [
    {
        id: 1,
        name: "Test Location",
        lat: 51.500884,
        lon: -0.067971,
        aqiValue: 50,
        monsterType: 'sprout'
    }
];