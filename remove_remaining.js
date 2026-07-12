const fs = require('fs');

['./src/app/master-admin/integrasi/page.tsx', './src/app/master-admin/logs/page.tsx'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/export const unstable_instant[\s\S]*?};\n?/g, '');
  fs.writeFileSync(f, newContent);
});
console.log('Fixed remaining files');
