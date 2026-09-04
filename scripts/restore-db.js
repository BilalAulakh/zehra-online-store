const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Manually parse .env.local
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

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Supabase credentials not found in .env.local\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runRestore() {
  console.log('\n========================================');
  console.log('🔄 Starting Zehra Studio Database Restore...');
  console.log('========================================');

  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    const latestFilePath = path.join(backupDir, 'latest_backup.json');

    if (!fs.existsSync(latestFilePath)) {
      throw new Error('No backup file found at backups/latest_backup.json');
    }

    const fileData = JSON.parse(fs.readFileSync(latestFilePath, 'utf8'));
    const { products = [], orders = [] } = fileData.data || {};

    console.log(`📅 Loaded backup file created on: ${fileData.timestamp}`);
    console.log(`   - Products found: ${products.length}`);
    console.log(`   - Orders found: ${orders.length}`);

    // Restore Products
    if (products.length > 0) {
      console.log('\n⏳ Restoring products to Supabase...');
      const { error: prodErr } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'id' });

      if (prodErr) {
        throw new Error(`Error restoring products: ${prodErr.message}`);
      }
      console.log(`✅ ${products.length} products successfully restored/upserted!`);
    }

    // Restore Orders
    if (orders.length > 0) {
      console.log('\n⏳ Restoring orders to Supabase...');
      const { error: ordErr } = await supabase
        .from('orders')
        .upsert(orders, { onConflict: 'id' });

      if (ordErr) {
        throw new Error(`Error restoring orders: ${ordErr.message}`);
      }
      console.log(`✅ ${orders.length} orders successfully restored/upserted!`);
    }

    console.log('\n----------------------------------------');
    console.log('🎉 RESTORE COMPLETED SUCCESSFULLY!');
    console.log('========================================\n');
  } catch (err) {
    console.error('\n❌ Restore failed with error:', err.message);
    process.exit(1);
  }
}

runRestore();
