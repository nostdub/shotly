import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STYLES_INPUT_DIR = path.join(__dirname, '../public/styles');
const TEMPLATES_OUTPUT_DIR = path.join(__dirname, '../uploads/templates');
const SEED_DATA_FILE = path.join(__dirname, '../convex/seed-styles-data.json');

// Ensure output directory exists
if (!fs.existsSync(TEMPLATES_OUTPUT_DIR)) {
  fs.mkdirSync(TEMPLATES_OUTPUT_DIR, { recursive: true });
}

/**
 * Create three variants: full (1MP), small (512px), preview (256px)
 */
async function makeThreeVariants(inputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Calculate dimensions to get ~1MP for full
  const targetPixels = 1000000;
  const fullWidth = Math.floor(Math.sqrt(targetPixels * (metadata.width / metadata.height)));
  const fullHeight = Math.floor(fullWidth / (metadata.width / metadata.height));

  const full = await image
    .resize(fullWidth, fullHeight, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer();

  const small = await sharp(full)
    .resize(512, 512, { fit: 'cover' })
    .webp({ quality: 80 })
    .toBuffer();

  const preview = await sharp(full)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();

  return { full, small, preview, width: fullWidth, height: fullHeight };
}

/**
 * Save three variants to disk
 */
async function saveVariants(styleId, variants) {
  const styleDir = path.join(TEMPLATES_OUTPUT_DIR, styleId);
  
  // Create style directory
  if (!fs.existsSync(styleDir)) {
    fs.mkdirSync(styleDir, { recursive: true });
  }

  const results = {};
  
  for (const [key, buffer] of Object.entries(variants)) {
    if (key === 'width' || key === 'height') continue;
    
    try {
      const filename = `${key}.webp`;
      const filepath = path.join(styleDir, filename);
      fs.writeFileSync(filepath, buffer);
      
      // Return relative URL path for server
      const relativeUrl = `/uploads/templates/${styleId}/${filename}`;
      results[key] = relativeUrl;
      console.log(`  ✓ ${key}: ${relativeUrl}`);
    } catch (e) {
      console.error(`  ✗ ${key} failed:`, e.message);
      throw e;
    }
  }
  
  return results;
}

/**
 * Upload variants to local server (DEPRECATED - using local save instead)
 */
async function uploadVariants(styleId, variants) {
  const results = {};
  
  for (const [key, buffer] of Object.entries(variants)) {
    if (key === 'width' || key === 'height') continue;
    
    try {
      const form = new FormData();
      form.append('file', buffer, `${styleId}-${key}.webp`);

      const url = new URL('/upload', UPLOAD_SERVER_URL);
      url.searchParams.append('type', 'template');
      url.searchParams.append('userId', 'admin');

      const response = await fetch(url, { method: 'POST', body: form });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      
      const data = await response.json();
      results[key] = data.url;
      console.log(`  ✓ ${key}: ${data.url}`);
    } catch (e) {
      console.error(`  ✗ ${key} failed:`, e.message);
      throw e;
    }
  }
  
  return results;
}

/**
 * Get SHA-256 hash of a file
 */
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Insert style template data to be seeded later
 */
function queueStyleTemplateForSeed(styleId, fileHash, urls, width, height) {
  let seedData = [];
  if (fs.existsSync(SEED_DATA_FILE)) {
    seedData = JSON.parse(fs.readFileSync(SEED_DATA_FILE, 'utf-8'));
  }

  seedData.push({
    styleId,
    fileHash,
    categories: ['normal'], // Now an array
    tags: ['template'],
    urls,
    width,
    height,
    description: `Style template ${styleId}`,
  });

  fs.writeFileSync(SEED_DATA_FILE, JSON.stringify(seedData, null, 2));
  console.log(`  → Queued for seeding: ${styleId} (hash: ${fileHash.slice(0, 8)}...)`);
  return styleId;
}

/**
 * Process a single image file
 */
async function processStyleImage(filePath, index) {
  const filename = path.basename(filePath);
  const styleId = `style-${String(index + 1).padStart(3, '0')}`;
  const fileHash = getFileHash(filePath);
  
  console.log(`\n[${index + 1}] Processing: ${filename} → ${styleId}`);

  try {
    // 1. Create variants
    console.log('  Creating variants...');
    const variants = await makeThreeVariants(filePath);

    // 2. Save variants to disk (not upload server)
    console.log('  Saving to disk...');
    const urls = await saveVariants(styleId, variants);

    // 3. Queue for seeding
    console.log('  Queuing for seed...');
    await queueStyleTemplateForSeed(styleId, fileHash, urls, variants.width, variants.height);

    console.log(`✅ ${styleId} complete`);
    return { styleId, success: true };
  } catch (e) {
    console.error(`❌ ${styleId} failed:`, e.message);
    return { styleId, success: false, error: e.message };
  }
}

/**
 * Main batch upload function
 */
async function batchUpload() {
  console.log('🎨 Style Template Upload Script\n');
  console.log(`Input directory: ${STYLES_INPUT_DIR}`);
  console.log(`Output directory: ${TEMPLATES_OUTPUT_DIR}`);
  console.log(`Seed data file: ${SEED_DATA_FILE}\n`);

  // Get all image files
  const files = fs.readdirSync(STYLES_INPUT_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .map(f => path.join(STYLES_INPUT_DIR, f));

  console.log(`Found ${files.length} images to process\n`);

  if (files.length === 0) {
    console.log('No images found in input directory!');
    process.exit(1);
  }

  const results = [];
  const batchSize = 5; // Process 5 at a time for local testing

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((file, idx) => processStyleImage(file, i + idx))
    );
    results.push(...batchResults);
    
    const progress = Math.min(i + batchSize, files.length);
    console.log(`\n📊 Progress: ${progress}/${files.length}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY');
  console.log('='.repeat(50));
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/${files.length}`);
  console.log(`❌ Failed: ${files.length - successful}/${files.length}`);
  
  if (results.some(r => !r.success)) {
    console.log('\nFailed styles:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.styleId}: ${r.error}`);
    });
  }

  console.log('\n✨ Upload complete!');
  console.log(`\n📝 Seed data saved to: ${SEED_DATA_FILE}`);
  console.log('Next step: Run the Convex seed mutation to insert into styleLibrary');
}

// Run
batchUpload().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
