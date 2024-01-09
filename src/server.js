const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Create SQLite database and table if not exists
const db = new sqlite3.Database('visitors.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS visitor_counts (
        site TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      )
    `);
  }
});

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Increment visitor count for a site
app.get('/add-visitor', (req, res) => {
  const site = req.query.site || 'auto';

  db.run(`
    INSERT OR IGNORE INTO visitor_counts (site, count)
    VALUES (?, 0)
  `, [site], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      db.run(`
        UPDATE visitor_counts
        SET count = count + 1
        WHERE site = ?
      `, [site], (err) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Internal Server Error');
        } else {
          res.send(`Visitor count for ${site} incremented successfully`);
        }
      });
    }
  });
});

// Get visitor count for a site
app.get('/visitor-count', (req, res) => {
  const site = req.query.site || 'auto';

  db.get(`
    SELECT count
    FROM visitor_counts
    WHERE site = ?
  `, [site], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      const count = row ? row.count : 0;
      res.send(`${count}`);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
