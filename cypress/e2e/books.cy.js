describe('Books API', () => {
  let bookId;

  it('should create a book', () => {
    cy.request('POST', 'http://backend:4000/books', {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      published: 2008,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      bookId = res.body.id;
    });
  });

  it('should get all books', () => {
    cy.request('http://backend:4000/books').its('status').should('eq', 200);
  });

  it('should get the created book', () => {
    cy.request(`http://backend:4000/books/${bookId}`).then((res) => {
      expect(res.body).to.include({ title: 'Clean Code' });
    });
  });

  it('should update the book', () => {
    cy.request('PUT', `http://backend:4000/books/${bookId}`, {
      published: 2010,
    }).its('status').should('eq', 200);
  });

  it('should delete the book', () => {
    cy.request('DELETE', `http://backend:4000/books/${bookId}`).its('status').should('eq', 204);
  });
});
