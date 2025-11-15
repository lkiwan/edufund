const pool = require('./src/db/init-db');

// Generate random date between 2024-01-01 and 2025-11-15
function getRandomDate(start = new Date('2024-01-01'), end = new Date('2025-11-15')) {
  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const date = new Date(timestamp);

  // Format as YYYY-MM-DD HH:MM:SS
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function addDateColumns() {
  console.log('🔍 Checking all tables...\n');

  try {
    // Get all tables
    const [tables] = await pool.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    console.log(`Found ${tableNames.length} tables\n`);

    for (const tableName of tableNames) {
      console.log(`📋 Processing table: ${tableName}`);

      // Get columns for this table
      const [columns] = await pool.execute(`DESCRIBE ${tableName}`);
      const columnNames = columns.map(c => c.Field);

      // Check if table already has created_at or updated_at
      const hasCreatedAt = columnNames.includes('created_at');
      const hasUpdatedAt = columnNames.includes('updated_at');
      const hasViewedAt = columnNames.includes('viewed_at');

      // Add created_at if missing
      if (!hasCreatedAt && !hasViewedAt) {
        console.log(`  ➕ Adding created_at column...`);
        await pool.execute(`
          ALTER TABLE ${tableName}
          ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        `);
      } else {
        console.log(`  ✓ Already has date column (${hasCreatedAt ? 'created_at' : 'viewed_at'})`);
      }

      // Add updated_at if missing and table has created_at
      if (!hasUpdatedAt && (hasCreatedAt || columnNames.includes('created_at'))) {
        console.log(`  ➕ Adding updated_at column...`);
        await pool.execute(`
          ALTER TABLE ${tableName}
          ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
      }

      // Now populate with random dates
      console.log(`  🎲 Filling with random dates...`);

      // Get all rows
      const [rows] = await pool.execute(`SELECT * FROM ${tableName} LIMIT 1000`);

      if (rows.length > 0) {
        const idColumn = columnNames.includes('id') ? 'id' : columnNames[0];

        for (const row of rows) {
          const randomCreatedDate = getRandomDate(new Date('2024-01-01'), new Date('2025-11-14'));
          const randomUpdatedDate = getRandomDate(new Date(randomCreatedDate), new Date('2025-11-15'));

          // Build update query based on what columns exist
          let updateQuery = `UPDATE ${tableName} SET `;
          const updateValues = [];

          if (hasCreatedAt || columnNames.includes('created_at')) {
            updateQuery += 'created_at = ?, ';
            updateValues.push(randomCreatedDate);
          }

          if (hasViewedAt) {
            updateQuery += 'viewed_at = ?, ';
            updateValues.push(randomCreatedDate);
          }

          if (hasUpdatedAt || columnNames.includes('updated_at')) {
            updateQuery += 'updated_at = ?, ';
            updateValues.push(randomUpdatedDate);
          }

          // Remove trailing comma
          updateQuery = updateQuery.slice(0, -2);
          updateQuery += ` WHERE ${idColumn} = ?`;
          updateValues.push(row[idColumn]);

          if (updateValues.length > 1) {
            await pool.execute(updateQuery, updateValues);
          }
        }

        console.log(`  ✅ Updated ${rows.length} rows with random dates`);
      } else {
        console.log(`  ℹ️  Table is empty, no data to update`);
      }

      console.log('');
    }

    console.log('✅ All tables processed successfully!\n');

    // Show sample data from a few tables
    console.log('📊 Sample Data with Dates:\n');

    const sampleTables = ['users', 'campaigns', 'donations'];
    for (const table of sampleTables) {
      if (tableNames.includes(table)) {
        console.log(`Table: ${table}`);
        const [sample] = await pool.execute(`SELECT * FROM ${table} LIMIT 3`);
        sample.forEach((row, i) => {
          console.log(`  Row ${i + 1}:`, {
            id: row.id,
            created_at: row.created_at,
            updated_at: row.updated_at || row.viewed_at || 'N/A'
          });
        });
        console.log('');
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

console.log('🗄️  Database Date Column Manager\n');
console.log('This will:');
console.log('1. Add created_at and updated_at columns to all tables');
console.log('2. Fill existing rows with random dates');
console.log('3. Format: YYYY-MM-DD HH:MM:SS\n');
console.log('Starting in 2 seconds...\n');

setTimeout(() => {
  addDateColumns();
}, 2000);
