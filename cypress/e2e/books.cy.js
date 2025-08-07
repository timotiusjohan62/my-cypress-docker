describe('Books API', () => {
  let bookId;

  beforeEach(() => {
    // Reset evidence for each test
    const gmt7Time = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
    cy.addEvidence('TEST_START', 'Test execution started', {
      timestamp: gmt7Time.toISOString().replace('Z', '+07:00'),
      testFile: 'books.cy.js',
      timezone: 'GMT+7'
    });
  });

  afterEach(() => {
    // Generate evidence report after each test
    const gmt7Time = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
    cy.addEvidence('TEST_END', 'Test execution completed', {
      timestamp: gmt7Time.toISOString().replace('Z', '+07:00'),
      result: 'completed',
      timezone: 'GMT+7'
    });
    cy.generateEvidenceReport();
  });

  it('should create a book', () => {
    cy.logStep('Starting book creation test', {
      operation: 'CREATE',
      endpoint: '/books',
      method: 'POST'
    });
    
    const bookData = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      published: 2008,
    };
    
    cy.request('POST', 'http://backend:4000/books', bookData).as('createBookRequest');
    
    cy.captureApiEvidence('@createBookRequest', 'create-book', {
      operation: 'CREATE_BOOK',
      expectedStatus: 201,
      requestData: bookData,
      method: 'POST'
    });
    
    cy.get('@createBookRequest').then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      bookId = res.body.id;
      
      cy.addEvidence('VALIDATION', 'Book creation validation', {
        expectedStatus: 201,
        actualStatus: res.status,
        hasId: res.body.hasOwnProperty('id'),
        bookId: bookId,
        createdBook: res.body
      });
      
      cy.logStep(`Book created successfully with ID: ${bookId}`, {
        bookId,
        status: 'SUCCESS'
      });
    });
  });

  it('should get all books and validate response body', () => {
    cy.logStep('Starting get all books test', {
      operation: 'READ_ALL',
      endpoint: '/books',
      method: 'GET'
    });
    
    cy.request('http://backend:4000/books').as('getAllBooksRequest');
    
    cy.captureApiEvidence('@getAllBooksRequest', 'get-all-books', {
      operation: 'GET_ALL_BOOKS',
      expectedStatus: 200,
      method: 'GET'
    });
    
    cy.get('@getAllBooksRequest').then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
      
      cy.addEvidence('VALIDATION', 'Get all books validation', {
        expectedStatus: 200,
        actualStatus: res.status,
        isArray: Array.isArray(res.body),
        bookCount: res.body.length,
        books: res.body
      });
      
      cy.logStep(`Retrieved ${res.body.length} books from the API`, {
        bookCount: res.body.length,
        status: 'SUCCESS'
      });

      // Validate structure of first book (if exists)
      if (res.body.length > 0) {
        const book = res.body[0];
        expect(book).to.have.all.keys('id', 'title', 'author', 'published');

        // Optional: type checks
        expect(book.title).to.be.a('string');
        expect(book.published).to.be.a('number');
        
        cy.addEvidence('VALIDATION', 'Book structure validation', {
          hasRequiredKeys: book.hasOwnProperty('id') && book.hasOwnProperty('title') && book.hasOwnProperty('author') && book.hasOwnProperty('published'),
          titleType: typeof book.title,
          publishedType: typeof book.published,
          sampleBook: book
        });
        
        cy.logStep('Book structure validation completed successfully', {
          validationResult: 'PASSED'
        });
      }
    });
  });

  it('should get the created book', () => {
    cy.logStep(`Starting get specific book test for ID: ${bookId}`, {
      operation: 'READ_ONE',
      endpoint: `/books/${bookId}`,
      method: 'GET',
      bookId
    });
    
    cy.request(`http://backend:4000/books/${bookId}`).as('getBookRequest');
    
    cy.captureApiEvidence('@getBookRequest', 'get-specific-book', {
      operation: 'GET_BOOK_BY_ID',
      expectedStatus: 200,
      bookId,
      method: 'GET'
    });
    
    cy.get('@getBookRequest').then((res) => {
      expect(res.body).to.include({ title: 'Clean Code' });
      
      cy.addEvidence('VALIDATION', 'Specific book retrieval validation', {
        expectedTitle: 'Clean Code',
        actualTitle: res.body.title,
        bookId: res.body.id,
        fullBook: res.body,
        titleMatches: res.body.title === 'Clean Code'
      });
      
      cy.logStep('Successfully retrieved and validated specific book', {
        bookId: res.body.id,
        title: res.body.title,
        status: 'SUCCESS'
      });
    });
  });

  it('should update the book', () => {
    const updateData = { published: 2010 };
    
    cy.logStep(`Starting book update test for ID: ${bookId}`, {
      operation: 'UPDATE',
      endpoint: `/books/${bookId}`,
      method: 'PUT',
      bookId,
      updateData
    });
    
    cy.request('PUT', `http://backend:4000/books/${bookId}`, updateData).as('updateBookRequest');
    
    cy.captureApiEvidence('@updateBookRequest', 'update-book', {
      operation: 'UPDATE_BOOK',
      expectedStatus: 200,
      bookId,
      updateData,
      method: 'PUT'
    });
    
    cy.get('@updateBookRequest').then((res) => {
      expect(res.status).to.eq(200);
      
      cy.addEvidence('VALIDATION', 'Book update validation', {
        expectedStatus: 200,
        actualStatus: res.status,
        bookId,
        updateData,
        updatedBook: res.body
      });
    });
    
    cy.logStep('Book update completed successfully', {
      bookId,
      status: 'SUCCESS',
      updatedFields: Object.keys(updateData)
    });
  });

  it('should delete the book', () => {
    cy.logStep(`Starting book deletion test for ID: ${bookId}`, {
      operation: 'DELETE',
      endpoint: `/books/${bookId}`,
      method: 'DELETE',
      bookId
    });
    
    cy.request('DELETE', `http://backend:4000/books/${bookId}`).as('deleteBookRequest');
    
    cy.captureApiEvidence('@deleteBookRequest', 'delete-book', {
      operation: 'DELETE_BOOK',
      expectedStatus: 204,
      bookId,
      method: 'DELETE'
    });
    
    cy.get('@deleteBookRequest').then((res) => {
      expect(res.status).to.eq(204);
      
      cy.addEvidence('VALIDATION', 'Book deletion validation', {
        expectedStatus: 204,
        actualStatus: res.status,
        bookId,
        deletionSuccessful: res.status === 204
      });
    });
    
    cy.logStep('Book deletion completed successfully', {
      bookId,
      status: 'SUCCESS',
      operation: 'DELETED'
    });
  });
});
