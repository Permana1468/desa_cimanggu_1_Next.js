const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modified = 0;
walkDir('./src/app', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Match exactly the 'false' version
    let newContent = content.replace(/export const unstable_instant\s*=\s*false;\n?/g, '');
    
    // Match the exact block we saw
    newContent = newContent.replace(/export const unstable_instant\s*=\s*\{\r?\n\s*prefetch:\s*"static",\r?\n\s*samples:\s*\[\r?\n\s*\{\s*searchParams:\s*\{\s*tenantId:\s*null\s*\}\s*\}\r?\n\s*\]\r?\n\};\r?\n?/g, '');

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log('Modified', filePath);
      modified++;
    }
  }
});
console.log('Total modified files:', modified);
