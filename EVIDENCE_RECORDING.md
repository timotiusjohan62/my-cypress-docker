# Cypress JSON Evidence Recording Setup

This project has been configured to automatically record comprehensive evidence for each backend API test case using structured JSON logs and detailed API evidence capture.

## 📁 Evidence Storage

Evidence is automatically stored in the following directories:
- **JSON Evidence**: `cypress/evidence/` - Structured JSON evidence files with full API details
- **Console Logs**: Detailed console output with test steps and API responses

## 🎯 Evidence Recording Features

### 1. Structured JSON Evidence
- **Automatic**: JSON evidence entries created for each test step
- **API Evidence**: Complete request/response capture with headers, body, status, timing
- **Validation Evidence**: Detailed validation results and assertions
- **Test Metadata**: Timestamps, test names, spec files, Cypress version info

### 2. Enhanced API Logging
- **Test Steps**: Each step logged with contextual data
- **Request/Response Capture**: Full HTTP request and response details
- **Performance Metrics**: Response times and durations
- **Validation Results**: Expected vs actual values with detailed comparisons

## 🚀 Custom Commands Available

### `cy.logStep(description, additionalData)`
Records a test step with timestamp and contextual data in JSON format.
```javascript
cy.logStep('Starting user login process', {
  operation: 'LOGIN',
  endpoint: '/auth/login',
  method: 'POST'
});
```

### `cy.addEvidence(type, description, data)`
Adds custom evidence entry to the JSON log.
```javascript
cy.addEvidence('VALIDATION', 'User authentication check', {
  expectedStatus: 200,
  actualStatus: response.status,
  tokenReceived: !!response.body.token
});
```

### `cy.captureApiEvidence(alias, stepName, additionalContext)`
Captures comprehensive API request/response evidence in JSON.
```javascript
cy.request('GET', '/api/users').as('getUsers');
cy.captureApiEvidence('@getUsers', 'fetch-users', {
  operation: 'GET_USERS',
  expectedStatus: 200
});
```

### `cy.apiRequestWithEvidence(method, url, body, stepName, expectedStatus)`
Makes an API request with automatic comprehensive evidence capture.
```javascript
cy.apiRequestWithEvidence('POST', '/api/books', bookData, 'create-book', 201);
```

### `cy.generateEvidenceReport()`
Generates final comprehensive test evidence report.
```javascript
cy.generateEvidenceReport(); // Called automatically in afterEach
```

## 📊 Evidence Structure

Each test generates structured JSON evidence with:

### Individual Evidence Entries:
```json
{
  "timestamp": "2025-08-06T05:59:13.123Z",
  "spec": "books",
  "test": "should create a book",
  "step": "Starting book creation test",
  "type": "STEP",
  "data": {
    "operation": "CREATE",
    "endpoint": "/books",
    "method": "POST"
  }
}
```

### API Evidence Entries:
```json
{
  "timestamp": "2025-08-06T05:59:14.456Z",
  "spec": "books",
  "test": "should create a book",
  "step": "API create-book",
  "type": "API_EVIDENCE",
  "request": {
    "method": "POST",
    "url": "http://backend:4000/books",
    "headers": {},
    "body": {
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "published": 2008
    }
  },
  "response": {
    "status": 201,
    "statusText": "Created",
    "headers": {},
    "body": {
      "id": 7,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "published": 2008
    },
    "duration": 45
  }
}
```

## 🏃‍♂️ Running Tests with Evidence Recording

```bash
# Run all tests with JSON evidence recording
docker compose run --rm -v $(pwd)/cypress/evidence:/e2e/cypress/evidence cypress

# Evidence will be generated in:
# - cypress/evidence/
```

## 📂 Evidence Files Naming Convention

### Individual Evidence Logs
```
cypress/evidence/evidence_books_2025-08-06T05-59-13-123Z.json
cypress/evidence/evidence_health_2025-08-06T05-59-20-456Z.json
```

### Comprehensive Test Reports
```
cypress/evidence/test-evidence-report-2025-08-06T06-00-01-789Z.json
```

## 🔧 Configuration Files

### Main Config: `cypress.config.js`
- Video recording disabled
- Screenshots disabled
- Custom JSON evidence logging tasks
- Evidence storage configuration

### Custom Commands: `cypress/support/commands.js`
- JSON evidence recording commands
- API testing utilities with evidence capture
- Structured logging functions

## 💡 Best Practices

1. **Use descriptive step names** with contextual data in `cy.logStep()`
2. **Capture API evidence** for all backend interactions
3. **Add validation evidence** with expected vs actual comparisons
4. **Include operation context** in evidence entries
5. **Review JSON evidence files** for detailed test execution traces
6. **Use structured data** in evidence entries for better analysis

## 🗂️ Evidence Review Process

After test execution:
1. **Review individual evidence files** in `cypress/evidence/` for step-by-step details
2. **Check comprehensive reports** for complete test execution summaries
3. **Analyze API evidence** for request/response validation
4. **Use JSON structure** for automated evidence analysis and reporting
5. **Export evidence** for compliance and audit requirements

## 🧹 Evidence Cleanup

Evidence files are automatically cleaned before each test run (`trashAssetsBeforeRuns: true`). To manually clean:

```bash
# Remove all evidence files
rm -rf cypress/evidence/*
```

## 📋 Sample Evidence Output

### Complete Test Evidence Report Structure:
```json
{
  "metadata": {
    "spec": "books",
    "test": "should create a book",
    "timestamp": "2025-08-06T05:59:13.123Z",
    "totalSteps": 8,
    "cypress": {
      "version": "13.7.3",
      "browser": "Electron 118"
    }
  },
  "evidence": [
    {
      "timestamp": "2025-08-06T05:59:13.123Z",
      "type": "TEST_START",
      "step": "Test execution started",
      "data": { "testFile": "books.cy.js" }
    },
    {
      "timestamp": "2025-08-06T05:59:14.456Z",
      "type": "API_EVIDENCE",
      "step": "API create-book",
      "request": { /* full request details */ },
      "response": { /* full response details */ }
    },
    {
      "timestamp": "2025-08-06T05:59:15.789Z",
      "type": "VALIDATION",
      "step": "Book creation validation",
      "data": {
        "expectedStatus": 201,
        "actualStatus": 201,
        "hasId": true,
        "bookId": 7,
        "createdBook": { /* full book object */ }
      }
    }
  ]
}
```

This JSON-based evidence system provides comprehensive, structured, and easily analyzable evidence perfect for backend API testing, compliance, and automated reporting.
