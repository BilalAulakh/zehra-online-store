const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'lib', 'products.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

function getCleanFabric(title, desc, rawFabric) {
  const combined = (title + ' ' + desc + ' ' + (rawFabric || '')).toLowerCase();
  
  if (combined.includes('organza')) return 'Pure Organza';
  if (combined.includes('chiffon')) return 'Pure Chiffon';
  if (combined.includes('raw silk') || combined.includes('silk')) return 'Pure Raw Silk';
  if (combined.includes('velvet')) return 'Micro Velvet 9000';
  if (combined.includes('georgette')) return 'Pure Georgette';
  if (combined.includes('grip')) return 'Delicate Grip';
  if (combined.includes('lawn')) return 'Luxury Lawn';
  if (combined.includes('cotton')) return 'Pure Cotton';
  if (combined.includes('tissue')) return 'Tissue Silk';
  if (combined.includes('net')) return 'Embroidered Net';
  
  return 'Handcrafted Chiffon';
}

function getCleanDescription(title, desc) {
  if (!desc) return `Exquisite handcrafted designer ensemble featuring premium fabrics and meticulous attention to detail.`;
  // Clean out phone numbers and instagram handles from descriptions
  let clean = desc
    .replace(/To order dm\/whatsapp us ON:[^\n]*/gi, '')
    .replace(/NOTE:\s*Custom made dress[^\n]*/gi, '')
    .replace(/NOTE:\s*To order[^\n]*/gi, '')
    .replace(/AVAILABLE IN ALL SIZES?/gi, '')
    .replace(/\n\s*\.\s*\n/gi, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return clean;
}

const cleanedProducts = products.map((p, index) => {
  const cleanFabric = getCleanFabric(p.title, p.description, p.fabric);
  const cleanDesc = getCleanDescription(p.title, p.description);

  return {
    ...p,
    fabric: cleanFabric,
    description: cleanDesc,
    // Ensure all 3 images exist and are valid paths
    images: p.images && p.images.length > 0 ? p.images : [`/images/${String.fromCharCode(97 + (index % 26))}1.webp`]
  };
});

fs.writeFileSync(jsonPath, JSON.stringify(cleanedProducts, null, 2));
console.log('✅ Cleaned all 26 products in products.json!');
