const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env.development'),
    path.join(__dirname, '..', '.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let val = match[2].trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ljppcdhcayvvqywthvya.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcHBjZGhjYXl2dnF5d3RodnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDc5NzIsImV4cCI6MjEwNDA4Mzk3Mn0.xyltnaU4h78figDzWiqe68kba94D95PMprLu9S87Ck0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncDatabase() {
  console.log('🔄 Syncing Supabase with 26 matched Canbeera products (a-z images)...');
  
  const productsPath = path.join(__dirname, '..', 'src', 'lib', 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  console.log(`Loaded ${products.length} products to push.`);

  // 1. Delete all existing products in supabase to remove unmatched products
  const { error: delErr } = await supabase.from('products').delete().neq('id', '___non_existent___');
  if (delErr) {
    console.warn('Warning deleting existing products:', delErr.message);
  } else {
    console.log('Cleared previous products from Supabase.');
  }

  // 2. Insert the 26 matched products
  const { data, error: insertErr } = await supabase.from('products').insert(products);
  if (insertErr) {
    console.error('Error inserting matched products:', insertErr.message);
  } else {
    console.log(`✅ Successfully inserted ${products.length} matched products into Supabase!`);
  }

  // 3. Update backup file
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  
  const backupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    summary: {
      totalProducts: products.length,
      totalOrders: 0
    },
    data: {
      products: products,
      orders: []
    }
  };

  fs.writeFileSync(path.join(backupDir, 'latest_backup.json'), JSON.stringify(backupData, null, 2));
  console.log('✅ Updated backups/latest_backup.json');
}

syncDatabase().catch(console.error);
