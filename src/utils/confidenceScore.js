function clamp01(x) {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

// Basit skor birleştirme: ağırlıklı ortalama
function weightedAvg(pairs) {
  let sum = 0;
  let wsum = 0;
  for (const { value, weight } of pairs) {
    sum += value * weight;
    wsum += weight;
  }
  if (wsum === 0) return 0;
  return clamp01(sum / wsum);
}

module.exports = { clamp01, weightedAvg };
