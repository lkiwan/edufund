const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'db', 'edufund.sqlite');
const db = new Database(dbPath);

// Ensure required tables exist (especially campaign_metrics)
function ensureTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      goal_amount REAL NOT NULL DEFAULT 0,
      current_amount REAL NOT NULL DEFAULT 0,
      category TEXT,
      city TEXT,
      university TEXT,
      cover_image TEXT,
      status TEXT DEFAULT 'active',
      end_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS campaign_metrics (
      campaign_id INTEGER PRIMARY KEY,
      view_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      updates_posted INTEGER DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function columnExists(columns, name) {
  return columns.some(c => c.name === name);
}

function ensureColumns() {
  const columns = db.prepare('PRAGMA table_info(campaigns)').all();
  const alters = [];

  if (!columnExists(columns, 'goal_amount')) alters.push("ALTER TABLE campaigns ADD COLUMN goal_amount REAL NOT NULL DEFAULT 0");
  if (!columnExists(columns, 'current_amount')) alters.push("ALTER TABLE campaigns ADD COLUMN current_amount REAL NOT NULL DEFAULT 0");
  if (!columnExists(columns, 'category')) alters.push("ALTER TABLE campaigns ADD COLUMN category TEXT");
  if (!columnExists(columns, 'city')) alters.push("ALTER TABLE campaigns ADD COLUMN city TEXT");
  if (!columnExists(columns, 'university')) alters.push("ALTER TABLE campaigns ADD COLUMN university TEXT");
  if (!columnExists(columns, 'cover_image')) alters.push("ALTER TABLE campaigns ADD COLUMN cover_image TEXT");
  if (!columnExists(columns, 'status')) alters.push("ALTER TABLE campaigns ADD COLUMN status TEXT DEFAULT 'active'");
  if (!columnExists(columns, 'created_at')) alters.push("ALTER TABLE campaigns ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  if (!columnExists(columns, 'end_date')) alters.push("ALTER TABLE campaigns ADD COLUMN end_date TIMESTAMP");

  const tx = db.transaction(() => {
    for (const sql of alters) {
      db.exec(sql);
    }
  });
  tx();
  console.log(`Applied ${alters.length} column alterations (if any).`);
}

function seedCampaigns() {
  const countRow = db.prepare('SELECT COUNT(*) as c FROM campaigns').get();
  const count = countRow?.c || 0;
  if (count > 0) {
    console.log(`Campaigns table already has ${count} rows. Skipping seed.`);
    return;
  }

  // Detect schema variants
  const columns = db.prepare('PRAGMA table_info(campaigns)').all();
  const hasGoal = columns.some(c => c.name === 'goal');
  const hasGoalAmount = columns.some(c => c.name === 'goal_amount');
  const hasCurrentAmount = columns.some(c => c.name === 'current_amount');

  let insertSql;
  if (hasGoal && hasGoalAmount && hasCurrentAmount) {
    insertSql = `INSERT INTO campaigns (
      title, description, goal, goal_amount, current_amount, category, city, university, cover_image, status, created_at, end_date
    ) VALUES (@title, @description, @goal, @goal_amount, @current_amount, @category, @city, @university, @cover_image, @status, @created_at, @end_date)`;
  } else if (hasGoal && hasCurrentAmount) {
    insertSql = `INSERT INTO campaigns (
      title, description, goal, current_amount, category, city, university, cover_image, status, created_at, end_date
    ) VALUES (@title, @description, @goal, @current_amount, @category, @city, @university, @cover_image, @status, @created_at, @end_date)`;
  } else {
    insertSql = `INSERT INTO campaigns (
      title, description, goal_amount, current_amount, category, city, university, cover_image, status, created_at, end_date
    ) VALUES (@title, @description, @goal_amount, @current_amount, @category, @city, @university, @cover_image, @status, @created_at, @end_date)`;
  }

  const insert = db.prepare(insertSql);

  const now = Date.now();
  const days = (n) => new Date(now + n * 24 * 60 * 60 * 1000).toISOString();

  const samples = [
    { title: 'Computer Science Degree - ENSA Khouribga', description: 'Supporting tuition and materials for a motivated student pursuing CS at ENSA Khouribga.', goal_amount: 30000, goal: 30000, current_amount: 4500, category: 'Technology', city: 'Khouribga', university: 'ENSA Khouribga', cover_image: 'https://images.unsplash.com/photo-1523246195644-6f88a78f1f5b', status: 'active', created_at: new Date().toISOString(), end_date: days(30) },
    { title: 'Medical Studies - UM5 Rabat', description: 'Help fund a dedicated student in medical school at Mohammed V University, Rabat.', goal_amount: 50000, goal: 50000, current_amount: 10000, category: 'Medical Studies', city: 'Rabat', university: 'Université Mohammed V', cover_image: 'https://images.unsplash.com/photo-1513639725746-c5d3e861f32a', status: 'active', created_at: new Date().toISOString(), end_date: days(45) },
    { title: 'Business Administration - ISCAE Casablanca', description: 'Raising funds for program fees and housing for a business administration student at ISCAE.', goal_amount: 40000, goal: 40000, current_amount: 8000, category: 'Business', city: 'Casablanca', university: 'ISCAE Casablanca', cover_image: 'https://images.unsplash.com/photo-1529336953121-b0a1526f7f5d', status: 'active', created_at: new Date().toISOString(), end_date: days(20) },
    { title: 'Architecture Studies - ENA Tetouan', description: 'Supporting supplies and studio materials for an architecture student at ENA Tetouan.', goal_amount: 45000, goal: 45000, current_amount: 12000, category: 'Architecture', city: 'Tetouan', university: 'ENA Tetouan', cover_image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4', status: 'active', created_at: new Date().toISOString(), end_date: days(35) },
    { title: 'Renewable Energy Engineering - ENIM Meknes', description: 'Funding research materials and project costs for a renewable energy engineering student at ENIM.', goal_amount: 35000, goal: 35000, current_amount: 7000, category: 'Engineering', city: 'Meknes', university: 'ENIM Meknes', cover_image: 'https://images.unsplash.com/photo-1505483531331-307f0323a602', status: 'active', created_at: new Date().toISOString(), end_date: days(28) },
    { title: 'Law Studies - Hassan II University', description: 'Helping a law student cover tuition and books at Hassan II University.', goal_amount: 28000, goal: 28000, current_amount: 3000, category: 'Law', city: 'Casablanca', university: 'Université Hassan II', cover_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f', status: 'active', created_at: new Date().toISOString(), end_date: days(40) }
  ];

  const insertMetric = db.prepare('INSERT OR IGNORE INTO campaign_metrics (campaign_id) VALUES (?)');

  const tx = db.transaction(() => {
    for (const s of samples) {
      const result = insert.run(s);
      insertMetric.run(result.lastInsertRowid);
    }
  });

  tx();
  console.log(`Seeded ${samples.length} campaigns.`);
}

ensureTables();
ensureColumns();
seedCampaigns();