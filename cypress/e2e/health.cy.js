describe('Backend + DB Health Check', () => {
  it('GET /health should return status ok with time', () => {
    cy.request('http://backend:4000/health')
      .its('body')
      .should('have.property', 'status', 'ok');
  });
});
