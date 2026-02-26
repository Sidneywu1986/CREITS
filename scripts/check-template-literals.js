const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/coze-integration/llm-service.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Check for unmatched backticks
let inTemplate = false;
let lastBacktickLine = -1;
const lines = content.split('\n');

lines.forEach((line, lineNum) => {
  let backtickCount = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '`') {
      backtickCount++;
      inTemplate = !inTemplate;
      if (inTemplate) {
        lastBacktickLine = lineNum + 1;
      } else {
        lastBacktickLine = -1;
      }
    }
  }
  if (backtickCount % 2 !== 0) {
    console.log(`Line ${lineNum + 1} has odd number of backticks: ${backtickCount}`);
  }
});

if (inTemplate) {
  console.log(`\nERROR: Template string not closed! Last backtick at line ${lastBacktickLine}`);
} else {
  console.log('All template strings are properly closed.');
}

// Check for unmatched quotes
const singleQuoteCount = (content.match(/'/g) || []).length;
const doubleQuoteCount = (content.match(/"/g) || []).length;

console.log(`\nSingle quotes: ${singleQuoteCount}`);
console.log(`Double quotes: ${doubleQuoteCount}`);

if (singleQuoteCount % 2 !== 0) {
  console.log('WARNING: Odd number of single quotes!');
}

if (doubleQuoteCount % 2 !== 0) {
  console.log('WARNING: Odd number of double quotes!');
}
