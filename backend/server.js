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
    if (err) {
      // Handle specific JWT errors
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized: Token has expired' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      } else if (err.name === 'NotBeforeError') {
        return res.status(401).json({ error: 'Unauthorized: Token not active yet' });
      } else {
        // Generic error for any other JWT-related issues
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }
    req.user = user;
    next();
  });
}

// Enhanced security: Function to detect malicious content
function detectMaliciousContent(value) {
  if (typeof value !== 'string') return false;
  
  // Common XSS patterns
  const maliciousPatterns = [
    /<script[\s\S]*?>/i,                    // <script> tags
    /<\/script>/i,                          // </script> closing tags
    /javascript:/i,                         // javascript: protocol
    /on\w+\s*=/i,                          // Event handlers (onclick, onload, etc.)
    /<iframe[\s\S]*?>/i,                   // iframe tags
    /<object[\s\S]*?>/i,                   // object tags
    /<embed[\s\S]*?>/i,                    // embed tags
    /<link[\s\S]*?>/i,                     // link tags
    /<meta[\s\S]*?>/i,                     // meta tags
    /vbscript:/i,                          // vbscript: protocol
    /data:\s*text\/html/i,                 // data URLs with HTML
    /expression\s*\(/i,                    // CSS expression()
    /<\s*\w+[\s\S]*?on\w+\s*=/i,         // Any tag with event handlers
    /&#x?[0-9a-f]+;/i,                    // HTML entities that might encode scripts
    /\\\u[0-9a-f]{4}/i,                   // Unicode escapes
    /%3c.*?script.*?%3e/i,                // URL-encoded script tags
    /&lt;.*?script.*?&gt;/i,              // HTML-encoded script tags
    /<\s*style[\s\S]*?>/i,                // style tags
    /expression\s*\(/i,                    // CSS expressions
    /behavior\s*:/i,                       // IE CSS behaviors
    /binding\s*:/i,                        // XML data binding
    /-moz-binding/i,                       // Mozilla CSS binding
    /@@\w+/,                              // SQL injection patterns
    /union\s+select/i,                     // SQL UNION attacks
    /insert\s+into/i,                      // SQL INSERT attacks
    /delete\s+from/i,                      // SQL DELETE attacks
    /update\s+\w+\s+set/i,                // SQL UPDATE attacks
    /drop\s+table/i,                       // SQL DROP attacks
    /exec\s*\(/i,                         // Command execution
    /eval\s*\(/i,                         // JavaScript eval()
    /setTimeout\s*\(/i,                    // setTimeout with strings
    /setInterval\s*\(/i,                   // setInterval with strings
    /Function\s*\(/i,                     // Function constructor
    /XMLHttpRequest/i,                     // AJAX requests
    /ActiveXObject/i,                      // ActiveX objects
    /document\s*\./i,                     // DOM manipulation
    /window\s*\./i,                       // Window object access
    /location\s*\./i,                     // Location object
    /cookie/i,                            // Cookie access
    /localStorage/i,                       // Local storage access
    /sessionStorage/i,                     // Session storage access
  ];
  
  // Check against all patterns
  return maliciousPatterns.some(pattern => pattern.test(value));
}

// Enhanced security: Function to sanitize and validate all string fields
function validateSecurityAndSanitize(data) {
  const stringFields = ['title', 'author', 'isbn', 'genre', 'description', 'publisher'];
  
  for (const field of stringFields) {
    if (data[field] && typeof data[field] === 'string') {
      // Check for malicious content
      if (detectMaliciousContent(data[field])) {
        return {
          isSecure: false,
          maliciousField: field,
          error: 'Invalid input data'
        };
      }
      
      // Trim whitespace
      data[field] = data[field].trim();
      
      // Additional validation: Check for suspicious characters or patterns
      if (data[field].includes('\0') || // Null bytes
          data[field].includes('\r') || // Carriage return
          data[field].includes('\n') || // Line feed
          data[field].length !== data[field].replace(/[\x00-\x1f\x7f-\x9f]/g, '').length) { // Control characters
        return {
          isSecure: false,
          maliciousField: field,
          error: 'Invalid input data'
        };
      }
    }
  }
  
  return { isSecure: true };
}

// Simple login endpoint for demo (username: admin, password: password)
app.post('/login', (req, res) => {
  // First check if request body is completely empty
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Missing required fields",
      fields: ["username", "password"]
    });
  }

  // Then check if either username or password is missing or empty string
  const { username, password } = req.body;
  const missingFields = [];
  
  if (!username || username.trim() === '') {
    missingFields.push('username');
  }
  if (!password || password.trim() === '') {
    missingFields.push('password');
  }
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields",
      fields: missingFields
    });
  }

  // Only proceed with auth check if we have both fields
  if (username === 'admin' && password === 'password') {
    const user = { username };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ 
    error: 'Invalid credentials', 
    message: 'Username or password is incorrect' 
  });
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
    // Extract pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Extract filter parameters
    const { genre, author, year, isbn } = req.query;
    
    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({ 
        error: 'Invalid pagination', 
        message: 'Page must be a positive integer (starting from 1)' 
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ 
        error: 'Invalid pagination', 
        message: 'Limit must be between 1 and 100' 
      });
    }
    
    // Validate filter parameters
    if (year && (isNaN(parseInt(year)) || parseInt(year) < -3000 || parseInt(year) > new Date().getFullYear() + 10)) {
      return res.status(400).json({ 
        error: 'Invalid filter', 
        message: 'Year must be a valid number between -3000 and ' + (new Date().getFullYear() + 10)
      });
    }
    
    // Build base query with filters
    let query = db('books').select('*').orderBy('id', 'asc');
    let countQuery = db('books');
    
    // Apply filters
    if (genre) {
      query = query.whereILike('genre', `%${genre}%`);
      countQuery = countQuery.whereILike('genre', `%${genre}%`);
    }
    
    if (author) {
      query = query.whereILike('author', `%${author}%`);
      countQuery = countQuery.whereILike('author', `%${author}%`);
    }
    
    if (year) {
      const yearInt = parseInt(year);
      query = query.where('published', yearInt);
      countQuery = countQuery.where('published', yearInt);
    }
    
    if (isbn) {
      // Exact match for ISBN
      query = query.where('isbn', isbn);
      countQuery = countQuery.where('isbn', isbn);
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get total count for pagination metadata with filters applied
    const totalCountResult = await countQuery.count('id as count').first();
    const totalCount = parseInt(totalCountResult.count);
    
    // Get paginated books with filters
    const books = await query
      .limit(limit)
      .offset(offset)
      .orderBy('id', 'asc'); // Consistent ordering for pagination
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    // Build applied filters object for response
    const appliedFilters = {};
    if (genre) appliedFilters.genre = genre;
    if (author) appliedFilters.author = author;
    if (year) appliedFilters.year = parseInt(year);
    if (isbn) appliedFilters.isbn = isbn;
    
    // Return paginated response with filters
    res.json({
      data: books,
      filters: appliedFilters,
      pagination: {
        page: page,
        limit: limit,
        totalCount: totalCount,
        totalPages: totalPages,
        hasNext: hasNext,
        hasPrev: hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    // Handle database-specific errors for unsupported operations
    if (error.message && error.message.includes('ILIKE')) {
      // Fallback to LIKE for databases that don't support ILIKE
      console.warn('ILIKE not supported, falling back to case-sensitive LIKE');
      // You might want to implement a fallback here or use a different approach
    } 
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/books/:id', authenticate, async (req, res) => {
  try {
    const idValidation = validateBookId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid ID format', 
        message: idValidation.error
      });
    }
    
    const book = await db('books').where({ id: idValidation.id }).first();
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    // Additional check for database-specific ID errors
    if (error.message && (error.message.includes('invalid input syntax') || error.message.includes('invalid integer'))) {
      return res.status(400).json({ 
        error: 'Invalid ID format', 
        message: 'Book ID must be a positive integer' 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

function validateBookData(data) {
  const missingFields = [];
  const typeErrors = [];
  
  // Check mandatory fields - existence and type
  if (!data.title) {
    missingFields.push('title');
  } else if (typeof data.title !== 'string') {
    typeErrors.push({ field: 'title', expected: 'string', actual: typeof data.title });
  }
  
  if (!data.author) {
    missingFields.push('author');
  } else if (typeof data.author !== 'string') {
    typeErrors.push({ field: 'author', expected: 'string', actual: typeof data.author });
  }
  
  if (data.published === undefined || data.published === null) {
    missingFields.push('published');
  } else if (typeof data.published !== 'number' || !Number.isInteger(data.published)) {
    typeErrors.push({ field: 'published', expected: 'integer', actual: typeof data.published });
  }

  // Return validation result for missing mandatory fields first
  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields
    };
  }

  // Return validation result for type errors in mandatory fields
  if (typeErrors.length > 0) {
    return {
      isValid: false,
      error: 'invalid_type',
      field: typeErrors[0].field,
      expected: typeErrors[0].expected,
      actual: typeErrors[0].actual
    };
  }

  // Check title length limit (1000 characters)
  if (data.title.length > 1000) {
    return {
      isValid: false,
      error: 'field_too_long',
      field: 'title',
      maxLength: 1000,
      actualLength: data.title.length
    };
  }

  // Validate optional fields - type checking when present
  if (data.isbn !== undefined && data.isbn !== null) {
    if (typeof data.isbn !== 'string') {
      return { 
        isValid: false, 
        error: 'invalid_type', 
        field: 'isbn',
        expected: 'string',
        actual: typeof data.isbn
      };
    }
    // ISBN validation pattern (ISBN-10 or ISBN-13)
    const isbnPattern = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
    if (!isbnPattern.test(data.isbn)) {
      return { isValid: false, error: 'invalid_format', field: 'isbn' };
    }
  }
  
  if (data.genre !== undefined && data.genre !== null) {
    if (typeof data.genre !== 'string') {
      return { 
        isValid: false, 
        error: 'invalid_type', 
        field: 'genre',
        expected: 'string',
        actual: typeof data.genre
      };
    }
  }
  
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      return { 
        isValid: false, 
        error: 'invalid_type', 
        field: 'description',
        expected: 'string',
        actual: typeof data.description
      };
    }
  }
  
  if (data.pages !== undefined && data.pages !== null) {
    if (typeof data.pages !== 'number' || !Number.isInteger(data.pages) || data.pages < 0) {
      return { 
        isValid: false, 
        error: 'invalid_type', 
        field: 'pages',
        expected: 'positive integer',
        actual: typeof data.pages
      };
    }
  }
  
  if (data.publisher !== undefined && data.publisher !== null) {
    if (typeof data.publisher !== 'string') {
      return { 
        isValid: false, 
        error: 'invalid_type', 
        field: 'publisher',
        expected: 'string',
        actual: typeof data.publisher
      };
    }
  }

  // Additional validation for published year (reasonable range)
  if (data.published < -3000 || data.published > new Date().getFullYear() + 10) {
    return {
      isValid: false,
      error: 'invalid_range',
      field: 'published',
      message: 'Published year must be between -3000 and ' + (new Date().getFullYear() + 10)
    };
  }

  return { isValid: true };
}

app.delete('/books/:id', authenticate, async (req, res) => {
  try {
    const idValidation = validateBookId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid ID format', 
        message: idValidation.error
      });
    }
    
    const deleted = await db('books').where({ id: idValidation.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    
    res.status(200).json({ 
      message: 'Book deleted successfully',
      id: idValidation.id 
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    if (error.message && (error.message.includes('invalid input syntax') || error.message.includes('invalid integer'))) {
      return res.status(400).json({ 
        error: 'Invalid ID format', 
        message: 'Book ID must be a positive integer' 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to validate ID format
function validateBookId(id) {
  // Check if ID is a string of digits only and is a positive integer
  if (!/^\d+$/.test(id)) {
    return { isValid: false, error: 'ID must contain only numbers' };
  }
  
  const numericId = parseInt(id, 10);
  if (numericId <= 0) {
    return { isValid: false, error: 'ID must be a positive integer' };
  }
  
  // Check if the number is too large for the database
  if (numericId > Number.MAX_SAFE_INTEGER) {
    return { isValid: false, error: 'ID is too large' };
  }
  
  return { isValid: true, id: numericId };
}

async function isbnExists(isbn, excludeId = null) {
  const query = db('books').where({ isbn });
  if (excludeId) {
    query.whereNot({ id: excludeId });
  }
  const book = await query.first();
  return !!book;
}

// Enhanced POST endpoint for creating books with malicious data detection
app.post('/books', authenticate, async (req, res) => {
  try {
    // First check for malicious content in all string fields
    const securityValidation = validateSecurityAndSanitize(req.body);
    if (!securityValidation.isSecure) {
      return res.status(400).json({ 
        error: securityValidation.error
      });
    }

    // Then proceed with standard validation
    const validation = validateBookData(req.body);
    if (!validation.isValid) {
      if (validation.missingFields) {
        return res.status(400).json({ 
          error: "Validation failed", 
          missing_fields: validation.missingFields 
        });
      }
      if (validation.error === 'field_too_long') {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: `${validation.field} exceeds maximum length of ${validation.maxLength} characters (actual: ${validation.actualLength})` 
        });
      }
      if (validation.error === 'invalid_type') {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: `Invalid type for ${validation.field}: expected ${validation.expected}, got ${validation.actual}` 
        });
      }
      if (validation.error === 'invalid_range') {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: validation.message 
        });
      }
      if (validation.error === 'invalid_format') {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: `Invalid format for ${validation.field}` 
        });
      }
      return res.status(400).json({ 
        error: "Validation failed", 
        message: `Validation error for ${validation.field}` 
      });
    }

    // Check for duplicate ISBN before inserting
    if (req.body.isbn) {
      const exists = await isbnExists(req.body.isbn);
      if (exists) {
        return res.status(409).json({ error: "ISBN already exists" });
      }
    }

    const [result] = await db('books').insert(req.body).returning('*');
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced PUT endpoint for updating books with malicious data detection
app.put('/books/:id', authenticate, async (req, res) => {
  try {
    const idValidation = validateBookId(req.params.id);
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid ID format', 
        message: idValidation.error
      });
    }
    
    const bookId = idValidation.id;
    
    // Check if book exists
    const existingBook = await db('books').where({ id: bookId }).first();
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // First check for malicious content in all string fields
    const securityValidation = validateSecurityAndSanitize(req.body);
    if (!securityValidation.isSecure) {
      return res.status(400).json({ 
        error: securityValidation.error
      });
    }

    // Then proceed with standard validation
    const validation = validateBookData(req.body);
    if (!validation.isValid) {
      if (validation.missingFields) {
        return res.status(400).json({ 
          error: "Validation failed", 
          missing_fields: validation.missingFields 
        });
      }
      if (validation.error === 'field_too_long') {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: `${validation.field} exceeds maximum length of ${validation.maxLength} characters (actual: ${validation.actualLength})` 
        });
      }
      if (validation.error === 'invalid_format') {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: `Invalid format for ${validation.field}` 
        });
      }
      return res.status(400).json({ 
        error: "Validation failed", 
        message: `Invalid type for ${validation.field}` 
      });
    }

    // Check for duplicate ISBN before updating (excluding current book)
    if (req.body.isbn) {
      const exists = await isbnExists(req.body.isbn, bookId);
      if (exists) {
        return res.status(409).json({ error: "ISBN already exists" });
      }
    }

    const [result] = await db('books')
      .where({ id: bookId })
      .update(req.body)
      .returning('*');
    
    res.json(result);
  } catch (error) {
    console.error('Error updating book:', error);
    // Additional check for database-specific ID errors
    if (error.message && (error.message.includes('invalid input syntax') || error.message.includes('invalid integer'))) {
      return res.status(400).json({ 
        error: 'Invalid ID format', 
        message: 'Book ID must be a positive integer' 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server after running migrations
async function startServer() {
  await runMigrations();
  app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
}

startServer();