describe('Backend + DB Health Check', () => {
  beforeEach(() => {
    const gmt7Time = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
    cy.addEvidence('TEST_START', 'Health check test started', {
      timestamp: gmt7Time.toISOString().replace('Z', '+07:00'),
      testFile: 'health.cy.js',
      timezone: 'GMT+7'
    });
  });

  afterEach(() => {
    const gmt7Time = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));
    cy.addEvidence('TEST_END', 'Health check test completed', {
      timestamp: gmt7Time.toISOString().replace('Z', '+07:00'),
      result: 'completed',
      timezone: 'GMT+7'
    });
    cy.generateEvidenceReport();
  });

  it('GET /health should return status ok with time', () => {
    cy.logStep('Starting backend and database health check', {
      operation: 'HEALTH_CHECK',
      endpoint: '/health',
      method: 'GET',
      purpose: 'Verify backend and database connectivity'
    });
    
    cy.request('http://backend:4000/health').as('healthRequest');
    
    cy.captureApiEvidence('@healthRequest', 'health-check', {
      operation: 'SYSTEM_HEALTH_CHECK',
      expectedStatus: 200,
      expectedProperties: ['status']
    });
    
    cy.get('@healthRequest').then((res) => {
      expect(res.body).to.have.property('status', 'ok');
      
      cy.addEvidence('VALIDATION', 'Health check validation', {
        expectedStatus: 'ok',
        actualStatus: res.body.status,
        hasTimeProperty: res.body.hasOwnProperty('time'),
        responseTime: res.duration,
        fullResponse: res.body,
        healthCheckPassed: res.body.status === 'ok'
      });
      
      cy.logStep('Health check completed successfully - backend and database are healthy', {
        systemStatus: res.body.status,
        responseTime: res.duration,
        timestamp: res.body.time,
        status: 'SUCCESS'
      });
    });
  });
});
