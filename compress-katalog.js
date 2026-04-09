/**
 * compress-katalog.js
 *
 * Compresses new catalog images/videos not yet in _data/compressed.yml.
 * Tracks compression at the individual file level.
 *
 * Requirements:
 *   - sharp      → npm install
 *   - ffmpeg     → https://ffmpeg.org (add to PATH)
 *
 * Usage:
 *   npm install        (first time only)
 *   npm run compress
 */

const IMAGE_QUALITY = 80;   // JPEG/PNG quality (0–100)
const MAX_WIDTH     = 1200; // max image width px, preserves aspect ratio
const VIDEO_CRF     = 28;   // video quality: lower = better (18–28 is good range)
const VIDEO_PRESET  = 'slow';

const fs           = require('fs');
const path         = require('path');
const { execSync } = require('child_process');
const sharp        = require('sharp');

const KATALOG_DIR    = path.join(__dirname, 'assets/images/posts/katalog');
const COMPRESSED_YML = path.join(__dirname, '_data/compressed.yml');
const IMAGE_EXTS     = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTS     = new Set(['.mp4', '.mov', '.webm']);

// --- Check ffmpeg ---
let hasFfmpeg = false;
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
  hasFfmpeg = true;
} catch {
  console.warn('⚠️  ffmpeg not found — videos will be skipped.');
  console.warn('   Install from https://ffmpeg.org and add to PATH.\n');
}

// --- Read compressed list ---
function readCompressed() {
  const content = fs.readFileSync(COMPRESSED_YML, 'utf8');
  const match = content.match(/^compressed:\s*\n([\s\S]*)/m);
  if (!match || !match[1].trim()) return new Set();
  const entries = match[1]
    .split('\n')
    .map(l => l.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);
  return new Set(entries);
}

// --- Write compressed list ---
function writeCompressed(set) {
  const sorted = [...set].sort();
  const list = sorted.length
    ? 'compressed:\n' + sorted.map(f => `  - ${f}`).join('\n') + '\n'
    : 'compressed:\n';
  const header = `# Files that have already been compressed.\n# Updated automatically by compress-katalog.js — do not edit manually.\n\n`;
  fs.writeFileSync(COMPRESSED_YML, header + list);
}

// --- Compress image ---
async function compressImage(filePath) {
  const ext     = path.extname(filePath).toLowerCase();
  const tmpPath = filePath + '.tmp';
  let pipeline  = sharp(filePath).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  pipeline = ext === '.png'
    ? pipeline.png({ quality: IMAGE_QUALITY, compressionLevel: 9 })
    : pipeline.jpeg({ quality: IMAGE_QUALITY, mozjpeg: true });
  await pipeline.toFile(tmpPath);
  const before = fs.statSync(filePath).size;
  const after  = fs.statSync(tmpPath).size;
  if (after < before) {
    fs.renameSync(tmpPath, filePath);
    return { before, after };
  }
  fs.unlinkSync(tmpPath);
  return { before, after: before, skipped: true };
}

// --- Compress video ---
function compressVideo(filePath) {
  const ext     = path.extname(filePath).toLowerCase();
  const tmpPath = filePath + '.tmp' + ext;
  const cmd     = ext === '.webm'
    ? `ffmpeg -i "${filePath}" -c:v libvpx-vp9 -crf ${VIDEO_CRF} -b:v 0 -c:a libopus "${tmpPath}" -y -loglevel error`
    : `ffmpeg -i "${filePath}" -c:v libx264 -crf ${VIDEO_CRF} -preset ${VIDEO_PRESET} -c:a aac -movflags +faststart "${tmpPath}" -y -loglevel error`;
  execSync(cmd);
  const before = fs.statSync(filePath).size;
  const after  = fs.statSync(tmpPath).size;
  if (after < before) {
    fs.renameSync(tmpPath, filePath);
    return { before, after };
  }
  fs.unlinkSync(tmpPath);
  return { before, after: before, skipped: true };
}

// --- Main ---
async function main() {
  const compressed = readCompressed();

  const folders = fs.readdirSync(KATALOG_DIR)
    .filter(f => fs.statSync(path.join(KATALOG_DIR, f)).isDirectory())
    .sort();

  let totalPending = 0;

  for (const folder of folders) {
    const folderPath = path.join(KATALOG_DIR, folder);
    const allFiles   = fs.readdirSync(folderPath).filter(f => !f.startsWith('.'));
    const pending    = allFiles.filter(f => {
      const ext = path.extname(f).toLowerCase();
      const key = `${folder}/${f}`;
      return (IMAGE_EXTS.has(ext) || VIDEO_EXTS.has(ext)) && !compressed.has(key);
    });

    if (pending.length === 0) continue;

    totalPending += pending.length;
    console.log(`\n📁 ${folder} — ${pending.length} new file(s):`);

    for (const file of pending) {
      const filePath = path.join(folderPath, file);
      const ext      = path.extname(file).toLowerCase();
      const key      = `${folder}/${file}`;

      try {
        if (IMAGE_EXTS.has(ext)) {
          const { before, after, skipped } = await compressImage(filePath);
          if (skipped) {
            console.log(`   ${file}: already optimal`);
          } else {
            console.log(`   ${file}: ${kb(before)} → ${kb(after)} KB (saved ${kb(before - after)} KB)`);
          }
          compressed.add(key);
          writeCompressed(compressed);
        } else if (VIDEO_EXTS.has(ext)) {
          if (!hasFfmpeg) {
            console.log(`   ${file}: skipped (ffmpeg not available)`);
            continue;
          }
          const { before, after, skipped } = compressVideo(filePath);
          if (skipped) {
            console.log(`   ${file}: already optimal`);
          } else {
            console.log(`   ${file}: ${mb(before)} → ${mb(after)} MB (saved ${mb(before - after)} MB)`);
          }
          compressed.add(key);
          writeCompressed(compressed);
        }
      } catch (err) {
        console.error(`   ❌ ${file}: ${err.message}`);
      }
    }
  }

  if (totalPending === 0) {
    console.log('✅ All files are already compressed.');
  } else {
    console.log('\nAll done.');
  }
}

const kb = b => (b / 1024).toFixed(1);
const mb = b => (b / 1024 / 1024).toFixed(2);

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
