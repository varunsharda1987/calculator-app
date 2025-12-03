const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (fallback when no database)
let memoryHistory = [];
let memoryId = 1;

// PostgreSQL connection (optional)
let pool = null;
let useDatabase = false;

async function initDB() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('username:password')) {
    try {
      const { Pool } = require('pg');
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });

      await pool.query(`
        CREATE TABLE IF NOT EXISTS calculations (
          id SERIAL PRIMARY KEY,
          expression VARCHAR(255) NOT NULL,
          result VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      useDatabase = true;
      console.log('Connected to Neon database');
    } catch (err) {
      console.log('Database not available, using in-memory storage');
      console.error(err.message);
    }
  } else {
    console.log('No DATABASE_URL configured, using in-memory storage');
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: useDatabase ? 'connected' : 'in-memory' });
});

// Calculate and save
app.post('/api/calculate', async (req, res) => {
  const { expression } = req.body;

  if (!expression) {
    return res.status(400).json({ error: 'Expression is required' });
  }

  try {
    // Safely evaluate the expression (only allow numbers and basic operators)
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    if (sanitized !== expression) {
      return res.status(400).json({ error: 'Invalid characters in expression' });
    }

    // Evaluate the expression
    const result = Function('"use strict"; return (' + sanitized + ')')();

    if (!isFinite(result)) {
      return res.status(400).json({ error: 'Invalid calculation result' });
    }

    // Save to database or memory
    if (useDatabase) {
      await pool.query(
        'INSERT INTO calculations (expression, result) VALUES ($1, $2)',
        [expression, result.toString()]
      );
    } else {
      memoryHistory.unshift({
        id: memoryId++,
        expression,
        result: result.toString(),
        created_at: new Date().toISOString()
      });
      if (memoryHistory.length > 50) memoryHistory.pop();
    }

    res.json({ expression, result: result.toString() });
  } catch (err) {
    console.error('Calculation error:', err);
    res.status(400).json({ error: 'Invalid expression' });
  }
});

// Get calculation history
app.get('/api/history', async (req, res) => {
  try {
    if (useDatabase) {
      const result = await pool.query(
        'SELECT * FROM calculations ORDER BY created_at DESC LIMIT 50'
      );
      res.json(result.rows);
    } else {
      res.json(memoryHistory);
    }
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Clear history
app.delete('/api/history', async (req, res) => {
  try {
    if (useDatabase) {
      await pool.query('DELETE FROM calculations');
    } else {
      memoryHistory = [];
    }
    res.json({ message: 'History cleared' });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
