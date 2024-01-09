const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(cors({ credentials: false }));

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
    db.run(`
      CREATE TABLE IF NOT EXISTS ip_addresses (
        id INTEGER PRIMARY KEY,
        ip_address TEXT NOT NULL
      )
    `);
  }
});

// Middleware to log requests
app.use((req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  // Log the request
  console.log(`Received request: ${req.method} ${req.url} from IP: ${ipAddress}`);

  // Store IP address in the database
  db.run(`
    INSERT INTO ip_addresses (ip_address)
    VALUES (?)
  `, [ipAddress], (err) => {
    if (err) {
      console.error(err.message);
      // Handle the error if needed
    }
  });

  // Continue with the next middleware/route handler
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
