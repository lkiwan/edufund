const Database = require('better-sqlite3');
const path = require('path');

// Open existing SQLite database
const dbPath = path.join(__dirname, '..', 'src', 'db', 'edufund.sqlite');
const db = new Database(dbPath);

function seed() {
  const countRow = db.prepare('SELECT COUNT(*) as c FROM campaigns').get();
  const count = countRow?.c || 0;

  if (count > 0) {
    console.log(`Campaigns table already has ${count} rows. Skipping seed.`);
    return;
  }

  const insert = db.prepare(`
    INSERT INTO campaigns (
      title, description, goal_amount, current_amount, category, city, university, cover_image, status, created_at, end_date
    ) VALUES (@title, @description, @goal_amount, @current_amount, @category, @city, @university, @cover_image, @status, @created_at, @end_date)
  `);

  const now = Date.now();
  const days = (n) => new Date(now + n * 24 * 60 * 60 * 1000).toISOString();

  const samples = [
    {
      title: 'Computer Science Degree - ENSA Khouribga',
      description: 'Supporting tuition and materials for a motivated student pursuing CS at ENSA Khouribga.',
      goal_amount: 30000,
      current_amount: 4500,
      category: 'Technology',
      city: 'Khouribga',
      university: 'ENSA Khouribga',
      cover_image: 'https://images.unsplash.com/photo-1523246195644-6f88a78f1f5b',
      status: 'active',
      created_at: new Date().toISOString(),
      end_date: days(30)
    },
    {
      title: 'Medical Studies - UM5 Rabat',
      description: 'Help fund a dedicated student in medical school at Mohammed V University, Rabat.',
      goal_amount: 50000,
      current_amount: 10000,
      category: 'Medical Studies',
      city: 'Rabat',
      university: 'Université Mohammed V',
      cover_image: 'https://images.unsplash.com/photo-1513639725746-c5d3e861f32a',
      status: 'active',
      created_at: new Date().toISOString(),
      end_date: days(45)
    },
    {
      title: 'Business Administration - ISCAE Casablanca',
      description: 'Raising funds for program fees and housing for a business administration student at ISCAE.',
      goal_amount: 40000,
      current_amount: 8000,
      category: 'Business',
      city: 'Casablanca',
      university: 'ISCAE Casablanca',
      cover_image: 'https://images.unsplash.com/photo-1529336953121-b0a1526f7f5d',
      status: 'active',
      created_at: new Date().toISOString(),
      end_date: days(20)
    },
    {
      title: 'Architecture Studies - ENA Tetouan',
      description: 'Supporting supplies and studio materials for an architecture student at ENA Tetouan.',
      goal_amount: 45000,
      current_amount: 12000,
      category: 'Architecture',
      city: 'Tetouan',
      university: 'ENA Tetouan',
      cover_image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4',
      status: 'active',
      created_at: new Date().toISOString(),
      end_date: days(35)
    },
    {
      title: 'Renewable Energy Engineering - ENIM Meknes',
      description: 'Funding research materials and project costs for a renewable energy engineering student at ENIM.',
      goal_amount: 35000,
      current_amount: 7000,
      category: 'Engineering',
      city: 'Meknes',
      university: 'ENIM Meknes',
      cover_image: 'https://images.unsplash.com/photo-1505483531331-307f0323a602',
      status: 'active',
      created_at: new Date().toISOString(),
      end_date: days(28)
    },
    {
      title: 'Law Studies - Hassan II University',
      description: 'Helping a law student cover tuition and books at Hassan II University.',
      goal_amount: 28000,
      current_amount: 3000,
      category: 'Law',
      city: 'Casablanca',
      university: 'Université Hassan II',
      cover_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f',
      status: 'active',
      created_at: new Date().toISOString(),
      end_date: days(40)
    }
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

seed();