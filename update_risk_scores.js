const fs = require('fs');

// Read the mock data file
const content = fs.readFileSync('src/lib/mock-data.ts', 'utf8');

// Generate realistic risk scores between 0-100 for each county
const riskScores = [
  35, 28, 42, 38, 45, 52, 41, 25, 48, 55, 33, 68, 44, 58, 49, 36, 31, 46, 62, 39, 
  47, 34, 51, 29, 40, 37, 43, 50, 56, 54, 32, 48, 61, 53, 57, 42, 35, 59, 46, 38, 
  41, 44, 47, 15, 40, 39, 42, 45, 48, 43, 41, 44, 47, 50, 46, 49, 45
];

let updatedContent = content;
let countyIndex = 0;

// Replace all computed_risk_score values
updatedContent = updatedContent.replace(/"computed_risk_score":\s*\d+/g, (match) => {
  if (countyIndex < riskScores.length) {
    return `"computed_risk_score": ${riskScores[countyIndex++]}`;
  }
  return match;
});

// Write the updated content back to the file
fs.writeFileSync('src/lib/mock-data.ts', updatedContent);
console.log('Updated all computed_risk_score values successfully!');
