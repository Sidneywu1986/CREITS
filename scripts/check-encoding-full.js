const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/coze-integration/llm-service.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Read the file and check for any encoding issues
const lines = content.split('\n');
const line392 = lines[391]; // 0-indexed
console.log('Line 392:', line392);
console.log('Line 392 length:', line392.length);
console.log('Line 392 bytes:', Buffer.from(line392).length);

// Check for non-ASCII characters in line 392
const hasNonAscii = [...line392].some(char => char.charCodeAt(0) > 127);
console.log('Has non-ASCII:', hasNonAscii);

if (hasNonAscii) {
  console.log('Non-ASCII characters:');
  [...line392].forEach((char, idx) => {
    if (char.charCodeAt(0) > 127) {
      console.log(`  Position ${idx}: "${char}" (code: ${char.charCodeAt(0)})`);
    }
  });
}

// Check the whole file for encoding issues
let totalNonAscii = 0;
lines.forEach((line, lineNum) => {
  const nonAsciiChars = [...line].filter(char => char.charCodeAt(0) > 127);
  if (nonAsciiChars.length > 0) {
    console.log(`\nLine ${lineNum + 1} has ${nonAsciiChars.length} non-ASCII characters`);
    nonAsciiChars.forEach((char, idx) => {
      console.log(`  Char ${idx}: "${char}" (code: ${char.charCodeAt(0)})`);
    });
    totalNonAscii += nonAsciiChars.length;
  }
});

console.log(`\nTotal non-ASCII characters in file: ${totalNonAscii}`);
