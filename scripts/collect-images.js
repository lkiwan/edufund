const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const projectRoot = path.resolve(__dirname, '..');
const scanDirs = [
  path.join(projectRoot, 'src'),
  path.join(projectRoot, 'public'),
  path.join(projectRoot, 'index.html'),
  path.join(projectRoot, 'build'),
  path.join(projectRoot, 'build', 'index.html')
];

const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json'];
const imageExts = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico'];

const results = [];
const remoteSet = new Set();

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}
function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    proto.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function addResult({ sourceFile, context, original }) {
  const isRemote = /^https?:\/\//.test(original);
  const entry = { sourceFile, context, original, isRemote };
  results.push(entry);
  if (isRemote) remoteSet.add(original);
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // <img src="...">
  const imgTagRegex = /<img[^>]*src=["']([^"']+?(?:\.(?:png|jpe?g|svg|webp|gif|ico)))["'][^>]*>/gi;
  let match;
  while ((match = imgTagRegex.exec(content)) !== null) {
    addResult({ sourceFile: filePath, context: 'img-tag', original: match[1] });
  }

  // import ... from '...'
  const importImgRegex = /import\s+[^;]*from\s+["']([^"']+?(?:\.(?:png|jpe?g|svg|webp|gif|ico)))["']/gi;
  while ((match = importImgRegex.exec(content)) !== null) {
    addResult({ sourceFile: filePath, context: 'import', original: match[1] });
  }

  // CSS url(...)
  const cssUrlRegex = /url\((?:"|')?([^"')]+?(?:\.(?:png|jpe?g|svg|webp|gif|ico))(?:\?[^"')]*)?)(?:"|')?\)/gi;
  while ((match = cssUrlRegex.exec(content)) !== null) {
    addResult({ sourceFile: filePath, context: 'css-url', original: match[1] });
  }

  // HTML link/icon
  const linkIconRegex = /<link[^>]*(?:rel=["'][^"']*icon[^"']*["'])[^>]*href=["']([^"']+?)["'][^>]*>/gi;
  while ((match = linkIconRegex.exec(content)) !== null) {
    const href = match[1];
    if (imageExts.some(ext => href.toLowerCase().endsWith(ext))) {
      addResult({ sourceFile: filePath, context: 'html-link', original: href });
    }
  }

  // JSON manifest icons
  if (filePath.toLowerCase().endsWith('manifest.json')) {
    try {
      const json = JSON.parse(content);
      const icons = json.icons || [];
      icons.forEach(icon => {
        if (icon.src) {
          addResult({ sourceFile: filePath, context: 'manifest-icon', original: icon.src });
        }
      });
    } catch {}
  }
}

function scanPath(p) {
  if (isFile(p)) {
    const ext = path.extname(p).toLowerCase();
    if (allowedExtensions.includes(ext) || p.endsWith('index.html')) {
      scanFile(p);
    }
    return;
  }
  if (isDir(p)) {
    const entries = fs.readdirSync(p);
    for (const entry of entries) {
      scanPath(path.join(p, entry));
    }
  }
}

async function main() {
  // Scan directories
  scanDirs.forEach(scanPath);

  // Also list all local image files under common asset directories
  const localImagesDirs = [
    path.join(projectRoot, 'public', 'assets', 'images'),
    path.join(projectRoot, 'src', 'assets', 'images'),
    path.join(projectRoot, 'build', 'assets', 'images')
  ];
  const localImages = [];
  for (const dir of localImagesDirs) {
    if (isDir(dir)) {
      const stack = [dir];
      while (stack.length) {
        const d = stack.pop();
        const entries = fs.readdirSync(d);
        for (const entry of entries) {
          const p = path.join(d, entry);
          if (isDir(p)) {
            stack.push(p);
          } else if (isFile(p)) {
            const ext = path.extname(p).toLowerCase();
            if (imageExts.includes(ext)) {
              localImages.push(path.relative(projectRoot, p));
            }
          }
        }
      }
    }
  }

  // Prepare downloads directory
  const downloadsDir = path.join(projectRoot, 'public', 'assets', 'images', 'remote');
  ensureDir(downloadsDir);

  // Download remote images and build mapping
  const mapping = [];
  for (const url of remoteSet) {
    const urlObj = new URL(url);
    let baseName = path.basename(urlObj.pathname);
    if (!imageExts.some(ext => baseName.toLowerCase().endsWith(ext))) {
      baseName += '.img';
    }
    const destPath = path.join(downloadsDir, baseName);
    try {
      if (!fs.existsSync(destPath)) {
        console.log(`Downloading: ${url} -> ${destPath}`);
        await downloadImage(url, destPath);
      } else {
        console.log(`Exists: ${destPath}`);
      }
      mapping.push({ original: url, local: path.relative(projectRoot, destPath) });
    } catch (e) {
      console.warn(`Failed to download ${url}:`, e.message);
      mapping.push({ original: url, local: null, error: e.message });
    }
  }

  // Build manifest with all references
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalReferences: results.length,
    totalRemote: remoteSet.size,
    references: results.map(r => ({
      sourceFile: path.relative(projectRoot, r.sourceFile),
      context: r.context,
      original: r.original,
      isRemote: r.isRemote
    })),
    remoteMapping: mapping,
    localImages
  };

  fs.writeFileSync(path.join(projectRoot, 'images-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('images-manifest.json created at project root');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});