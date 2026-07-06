const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.join(__dirname, '.env');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    }
  });
} catch (err) {
  console.error("Could not read .env:", err.message);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing credentials in .env. Tried path:", envPath);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Listing files in 'videos' bucket...");
  const { data, error } = await supabase.storage.from('videos').list('', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error) {
    console.error("Error listing videos:", error.message);
  } else {
    console.log("Files found in videos:", data);
  }

  console.log("\nListing files in 'thumbnails' bucket...");
  const { data: thumbData, error: thumbErr } = await supabase.storage.from('thumbnails').list('', {
    limit: 100
  });

  if (thumbErr) {
    console.error("Error listing thumbnails:", thumbErr.message);
  } else {
    console.log("Thumbnails found in thumbnails:", thumbData);
  }
}

run();
