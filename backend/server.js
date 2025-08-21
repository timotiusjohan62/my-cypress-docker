const express = require('express');
const db = require('./db');
const app = express();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(express.json()); // <-- This must come before any routes

// Authentication middleware using JWT
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    req.user = user;
    next();
  });
}

// Simple login endpoint for demo (username: admin, password: password)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // In production, validate against a real user store
  if (username === 'admin' && password === 'password') {
    const user = { username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Run migrations on startup
async function runMigrations() {
  try {
    await db.migrate.latest();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/books', authenticate, async (req, res) => {
  try {
    const books = await db('books');
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/books/:id', authenticate, async (req, res) => {
  try {
    const book = await db('books').where({ id: req.params.id }).first();
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper: Validate book data
function validateBookData(data) {
  if (
    typeof data.title !== 'string' ||
    typeof data.author !== 'string'
  ) {
    return false;
  }
  if (
    data.hasOwnProperty('published') &&
    typeof data.published !== 'number'
  ) {
    return false;
  }
  return true;
}

app.post('/books', authenticate, async (req, res) => {
  try {
    if (!validateBookData(req.body)) {
      return res.status(400).json({ error: 'Invalid data types in request body' });
    }
    const [result] = await db('books').insert(req.body).returning('id');
    const id = result.id || result;  // Handle different return formats
    console.log('Created book with id:', id);
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/books/:id', authenticate, async (req, res) => {
  try {
    if (!validateBookData(req.body)) {
      return res.status(400).json({ error: 'Invalid data types in request body' });
    }
    const updated = await db('books').where({ id: req.params.id }).update(req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/books/:id', authenticate, async (req, res) => {
  try {
    const deleted = await db('books').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server after running migrations
async function startServer() {
  await runMigrations();
  app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
}

startServer();
