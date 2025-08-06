// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// ===============================================
// CUSTOM JSON EVIDENCE RECORDING COMMANDS
// ===============================================

let testEvidence = [];

// Helper function to get GMT+7 timestamp
function getGMT7Timestamp() {
  const now = new Date();
  // Add 7 hours (7 * 60 * 60 * 1000 milliseconds)
  const gmt7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return gmt7Time.toISOString().replace('Z', '+07:00');
}

// Command to log test step with JSON evidence
Cypress.Commands.add('logStep', (stepDescription, additionalData = {}) => {
  const timestamp = getGMT7Timestamp();
  const testName = Cypress.currentTest.title;
  const specName = Cypress.spec.name.replace('.cy.js', '');
  
  const evidenceEntry = {
    timestamp,
    spec: specName,
    test: testName,
    step: stepDescription,
    type: 'STEP',
    data: additionalData
  };
  
  testEvidence.push(evidenceEntry);
  
  cy.task('logEvidence', evidenceEntry);
  cy.log(`📝 [${timestamp}] STEP: ${stepDescription}`);
});

// Command to capture API response evidence in JSON
Cypress.Commands.add('captureApiEvidence', (alias, stepName, additionalContext = {}) => {
  cy.get(alias).then((response) => {
    const timestamp = getGMT7Timestamp();
    const testName = Cypress.currentTest.title;
    const specName = Cypress.spec.name.replace('.cy.js', '');
    
    const evidenceEntry = {
      timestamp,
      spec: specName,
      test: testName,
      step: `API ${stepName}`,
      type: 'API_EVIDENCE',
      request: {
        method: response.requestHeaders ? 'Unknown' : response.method || 'Unknown',
        url: response.url,
        headers: response.requestHeaders || {},
        body: response.requestBody || null
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.body,
        duration: response.duration
      },
      context: additionalContext
    };
    
    testEvidence.push(evidenceEntry);
    
    cy.task('logEvidence', evidenceEntry);
    cy.log(`📊 API Response (${stepName}): Status ${response.status}`);
    cy.log('Response Body:', response.body);
  });
});

// Command to make API request with comprehensive evidence logging
Cypress.Commands.add('apiRequestWithEvidence', (method, url, body, stepName, expectedStatus = null) => {
  // Log the request step (already uses GMT+7 via logStep)
  cy.logStep(`Making ${method} request to ${url}`, {
    method,
    url,
    body,
    expectedStatus
  });
  
  const requestAlias = `@${stepName}Request`;
  
  cy.request({
    method: method,
    url: url,
    body: body,
    failOnStatusCode: false // Allow us to capture failed requests too
  }).as(stepName + 'Request');
  
  cy.captureApiEvidence(requestAlias, stepName, {
    expectedStatus,
    stepName
  });
});

// Command to generate final test evidence report
Cypress.Commands.add('generateEvidenceReport', () => {
  if (testEvidence.length > 0) {
    const testName = Cypress.currentTest.title;
    const specName = Cypress.spec.name.replace('.cy.js', '');
    const timestamp = getGMT7Timestamp();
    
    const report = {
      metadata: {
        spec: specName,
        test: testName,
        timestamp,
        totalSteps: testEvidence.length,
        timezone: 'GMT+7',
        cypress: {
          version: Cypress.version,
          browser: Cypress.browser.name + ' ' + Cypress.browser.version
        }
      },
      evidence: testEvidence
    };
    
    cy.task('generateEvidenceReport', report);
    testEvidence = []; // Reset for next test
  }
});

// Command to add custom evidence entry
Cypress.Commands.add('addEvidence', (type, description, data = {}) => {
  const timestamp = getGMT7Timestamp();
  const testName = Cypress.currentTest.title;
  const specName = Cypress.spec.name.replace('.cy.js', '');
  
  const evidenceEntry = {
    timestamp,
    spec: specName,
    test: testName,
    step: description,
    type: type.toUpperCase(),
    data
  };
  
  testEvidence.push(evidenceEntry);
  cy.task('logEvidence', evidenceEntry);
  cy.log(`📋 ${type}: ${description}`);
});

//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
