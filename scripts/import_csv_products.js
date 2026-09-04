const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = 'https://ljppcdhcayvvqywthvya.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcHBjZGhjYXl2dnF5d3RodnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDc5NzIsImV4cCI6MjEwNDA4Mzk3Mn0.xyltnaU4h78figDzWiqe68kba94D95PMprLu9S87Ck0';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim().replace(/^["']|["']$/g, '');
        if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
        if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = val;
      }
    }
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Robust CSV Parser
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal);
      if (currentRow.some(c => c.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }
  return rows;
}

// Ensure public/images/products directory exists
const productsImagesDir = path.join(__dirname, '..', 'public', 'images', 'products');
if (!fs.existsSync(productsImagesDir)) {
  fs.mkdirSync(productsImagesDir, { recursive: true });
}

async function runImport() {
  console.log('========================================');
  console.log('🔄 Reading products_rows.csv...');
  console.log('========================================');

  const csvFile = path.join(__dirname, '..', 'products_rows.csv');
  if (!fs.existsSync(csvFile)) {
    console.error('❌ ERROR: products_rows.csv not found');
    process.exit(1);
  }

  const raw = fs.readFileSync(csvFile, 'utf8');
  const allRows = parseCSV(raw);
  const dataRows = allRows.slice(1);
  console.log(`Found ${dataRows.length} product rows in CSV.\n`);

  const processedProducts = [];

  for (let idx = 0; idx < dataRows.length; idx++) {
    const r = dataRows[idx];
    const rawId = r[0]?.trim();
    const rawTitle = r[1]?.trim();
    const rawSlug = r[2]?.trim();
    const rawPrice = parseFloat(r[3]) || 0;
    const rawComparePrice = r[4] && !isNaN(parseFloat(r[4])) ? parseFloat(r[4]) : undefined;
    const rawCategory = r[5]?.trim() || 'Luxury Pret';
    const rawFabric = r[6]?.trim() || '';
    const rawImagesStr = r[7]?.trim() || '[]';
    const rawDescription = r[8]?.trim() || '';
    const rawSizesStr = r[9]?.trim() || '["XS", "Small", "Medium", "Large", "XL"]';
    const rawIsFeatured = r[10] === 'true';
    const rawIsNew = r[11] === 'true';
    const rawRating = parseFloat(r[12]) || 4.9;
    const rawReviewsCount = parseInt(r[13], 10) || 10;
    const rawCreatedAt = r[14]?.trim() || new Date().toISOString();

    // Parse sizes
    let sizes = ['XS', 'Small', 'Medium', 'Large', 'XL'];
    try {
      const parsed = JSON.parse(rawSizesStr);
      if (Array.isArray(parsed) && parsed.length > 0) sizes = parsed;
    } catch {
      // fallback
    }

    // Parse images and decode base64 if present
    let images = [];
    try {
      const parsedImages = JSON.parse(rawImagesStr);
      if (Array.isArray(parsedImages)) {
        for (let imgIdx = 0; imgIdx < parsedImages.length; imgIdx++) {
          const img = parsedImages[imgIdx];
          if (img.startsWith('data:image/')) {
            // It's base64! Decode and save to public/images/products/
            const match = img.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (match) {
              let ext = match[1].toLowerCase();
              if (ext === 'jpeg') ext = 'jpg';
              const base64Data = match[2];
              const safeSlug = (rawSlug || rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')).substring(0, 30);
              const fileName = `${safeSlug}_${imgIdx + 1}.${ext}`;
              const filePath = path.join(productsImagesDir, fileName);
              fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
              const publicPath = `/images/products/${fileName}`;
              images.push(publicPath);
            } else {
              images.push(img);
            }
          } else {
            // Normal URL or local path
            images.push(img);
          }
        }
      }
    } catch (e) {
      console.warn(`Warning parsing images for row ${idx + 1}:`, e.message);
      images = ['/images/g1.webp'];
    }

    if (images.length === 0) {
      images = ['/images/g1.webp'];
    }

    // Clean slug
    const cleanSlug = rawSlug || rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const product = {
      id: rawId || `prod-${Date.now()}-${idx}`,
      title: rawTitle || 'Untitled Product',
      slug: cleanSlug,
      price: rawPrice,
      compare_at_price: rawComparePrice,
      category: rawCategory,
      fabric: rawFabric,
      images: images,
      description: rawDescription,
      sizes: sizes,
      is_featured: rawIsFeatured,
      is_new: rawIsNew,
      rating: rawRating,
      reviews_count: rawReviewsCount,
      created_at: rawCreatedAt
    };

    processedProducts.push(product);
    console.log(`[${idx + 1}/${dataRows.length}] Processed "${product.title}" (${images.length} images)`);
  }

  console.log(`\n✅ Successfully processed all ${processedProducts.length} products.`);

  // 1. Save to Supabase in batches of 10
  console.log('\n⏳ Uploading all 50 products to Supabase...');
  const batchSize = 10;
  for (let i = 0; i < processedProducts.length; i += batchSize) {
    const batch = processedProducts.slice(i, i + batchSize);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`❌ Error uploading batch ${i / batchSize + 1}:`, error.message);
    } else {
      console.log(`   Uploaded batch ${i + 1} to ${Math.min(i + batchSize, processedProducts.length)}...`);
    }
  }

  // 2. Update local fallback products.json
  const productsJsonPath = path.join(__dirname, '..', 'src', 'lib', 'products.json');
  fs.writeFileSync(productsJsonPath, JSON.stringify(processedProducts, null, 2), 'utf8');
  console.log(`\n✅ Updated src/lib/products.json with all ${processedProducts.length} products.`);

  // 3. Update backup latest_backup.json
  const backupJsonPath = path.join(__dirname, '..', 'backups', 'latest_backup.json');
  let existingBackup = {};
  try {
    existingBackup = JSON.parse(fs.readFileSync(backupJsonPath, 'utf8'));
  } catch {}

  const updatedBackup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    summary: {
      totalProducts: processedProducts.length,
      totalOrders: existingBackup.summary?.totalOrders || 1
    },
    data: {
      products: processedProducts,
      orders: existingBackup.data?.orders || []
    }
  };
  fs.writeFileSync(backupJsonPath, JSON.stringify(updatedBackup, null, 2), 'utf8');
  console.log(`✅ Updated backups/latest_backup.json with all ${processedProducts.length} products.`);

  // Verify in Supabase
  const { count, error: countErr } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log('\n========================================');
  console.log(`🎉 Supabase Live Total Products Count: ${count}`);
  console.log('========================================\n');
}

runImport().catch(err => {
  console.error('Fatal import error:', err);
});
