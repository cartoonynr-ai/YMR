const fs = require('fs');
let content = fs.readFileSync('src/routes/inventory.tsx', 'utf8');
content = content.replace(/กรุณากรอกข้อมูลในช่องนี้ให้ครบถ้วนครับ/g, 'กรุณากรอกข้อมูลในช่องนี้ให้ครบถ้วน');
fs.writeFileSync('src/routes/inventory.tsx', content, 'utf8');
console.log('removed ครับ');
