import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

let uploadCounter = 0;

// Helper to get upload path based on type and userId
const getUploadPath = (type, userId) => {
  // Validate and normalize type (accept both 'product' and 'product_upload')
  const validTypes = ['product', 'product_upload', 'style', 'style_upload', 'generated', 'template'];
  let typeDir = type;
  
  // Normalize type names (remove _upload suffix for folder)
  if (typeDir === 'product_upload') typeDir = 'product';
  if (typeDir === 'style_upload') typeDir = 'style';
  
  // If type is not valid, default to 'other'
  if (!validTypes.includes(type)) typeDir = 'other';
  
  // Structure: uploads/userId/type/
  const userSubdir = userId || 'anonymous';
  return path.join(UPLOAD_DIR, userSubdir, typeDir);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { type, userId } = req.query; // Read from query params
    const destPath = getUploadPath(type, userId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = `${Date.now()}_${++uploadCounter}`;
    const name = `${uniqueId}_${file.originalname}`.replace(/\s+/g, '_');
    cb(null, name);
  }
});

const upload = multer({ storage });
const app = express();

// Simple CORS allow for local dev (adjust in prod)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/uploads', express.static(UPLOAD_DIR));

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  // Return relative path from uploads root (read from query params)
  const { type, userId } = req.query;
  const userSubdir = userId || 'anonymous';
  
  // Normalize type for URL
  let typeDir = type;
  if (typeDir === 'product_upload') typeDir = 'product';
  if (typeDir === 'style_upload') typeDir = 'style';
  
  // Structure: uploads/userId/type/filename
  const relativePath = `${userSubdir}/${typeDir}/${req.file.filename}`;
  const url = `/uploads/${relativePath}`;
  
  res.json({ 
    url, 
    originalname: req.file.originalname, 
    size: req.file.size, 
    mime: req.file.mimetype,
    type: type,
    userId: userId 
  });
});

// List uploaded files (simple JSON index)
app.get('/uploads/list', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR).map((f) => ({
      name: f,
      url: `/uploads/${f}`,
    }));
    res.json(files);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Local upload server listening at http://localhost:${port}`);
  console.log(`Uploads served from ${UPLOAD_DIR}`);
});
