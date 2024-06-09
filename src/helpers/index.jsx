import dayjs from "dayjs";

export const stringToColor = str => {
    let hash = 0;
    // Crée un hash à partir de la chaîne de caractères
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convertit le hash en une couleur hexadécimale
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
  }

export const calculateMedian = (data, key) => {
    const values = data.map(item => item[key]).filter(value => value !== null).sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    if (values.length % 2) {
        return values[half];
    } else {
        return (values[half - 1] + values[half]) / 2.0;
    }
};

export const imputeMissingValues = (data, key, median) => {
    return data.map(item => ({
        ...item,
        [key]: [null, 0].includes(item[key]) ? median : item[key]
    }));
};

export const tooltipRenderer = ({ datum, xKey, yKey, unite }) => {
    return { content: `${datum[xKey]} => ${datum[yKey].toFixed(2)} ${unite}` };
}

export const calculateTrendLine = (data, xKey, yKey, key) => {
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d[xKey], 0);
    const sumY = data.reduce((sum, d) => sum + d[yKey], 0);
    const sumXY = data.reduce((sum, d) => sum + d[xKey] * d[yKey], 0);
    const sumX2 = data.reduce((sum, d) => sum + d[xKey] * d[xKey], 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map(d => ({ [xKey]: d[xKey], [key]: slope * d[xKey] + intercept }));
}

// Fonction pour calculer les anomalies (z-scores)
export const calculateZScores = (data, yKey) => {
    const mean = data.reduce((sum, d) => sum + d[yKey], 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d[yKey] - mean, 2), 0) / data.length);
    return data.map(d => ({ ...d, zScore: (d[yKey] - mean) / stdDev }));
}

 // Fonction pour identifier les événements extrêmes
export const identifyExtremes = (data, timeKey, yKey, threshold, name) => {
    return data.filter(d => Math.abs(d.zScore) >= threshold).map(d => ({
        [timeKey]: d[timeKey],
        annotation: d[yKey],
        //label: d[yKey] > 0 ? 'Événement Extrême Haut' : 'Événement Extrême Bas'
        label: `${name} => ${d.zScore > 0 ? 'Événement Extrême Haut' : 'Événement Extrême Bas'}`
    }));
}

export const disableFutureYears = current => current && current > dayjs().endOf('year')
