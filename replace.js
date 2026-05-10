const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { pattern: /bg-\[#101319\](?:\/\d+)?/g, replacement: 'bg-background' },
  { pattern: /bg-\[#0b0e13\](?:\/\d+)?/g, replacement: 'bg-sidebar' },
  { pattern: /bg-\[#1d2025\](?:\/\d+)?/g, replacement: 'bg-card' },
  { pattern: /bg-\[#272a30\](?:\/\d+)?/g, replacement: 'bg-muted' },
  { pattern: /border-\[#32353b\](?:\/\d+)?/g, replacement: 'border-border' },
  { pattern: /text-\[#e1e2ea\]/g, replacement: 'text-foreground' },
  { pattern: /text-\[#849495\]/g, replacement: 'text-muted-foreground' },
  { pattern: /text-\[#b9cacb\]/g, replacement: 'text-secondary-foreground' },
  { pattern: /bg-\[#32353b\](?:\/\d+)?/g, replacement: 'bg-accent' },
  // And specific single occurrences easily missed:
  { pattern: /bg: '#101319'/g, replacement: 'bg: "var(--background)"' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { pattern, replacement } of replacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Done replacing colors.');
