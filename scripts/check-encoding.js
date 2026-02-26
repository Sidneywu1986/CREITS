const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/coze-integration/llm-service.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Read the file and check for any encoding issues
console.log('File length:', content.length);
console.log('File lines:', content.split('\n').length);

// Read line 362
const lines = content.split('\n');
const line362 = lines[361]; // 0-indexed
console.log('\nLine 362:', line362);
console.log('Line 362 length:', line362.length);
console.log('Line 362 bytes:', Buffer.from(line362).length);

// Check for non-ASCII characters in line 362
const hasNonAscii = [...line362].some(char => char.charCodeAt(0) > 127);
console.log('Has non-ASCII:', hasNonAscii);

if (hasNonAscii) {
  console.log('Non-ASCII characters:');
  [...line362].forEach((char, idx) => {
    if (char.charCodeAt(0) > 127) {
      console.log(`  Position ${idx}: "${char}" (code: ${char.charCodeAt(0)})`);
    }
  });
}
