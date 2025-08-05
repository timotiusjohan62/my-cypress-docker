const express = require('express');
const app = express();
const pool = require('./db');

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});
