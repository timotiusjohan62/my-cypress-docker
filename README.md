# Cypress Docker Backend API Testing with JSON Evidence Recording

A comprehensive backend API testing setup using Cypress in Docker with advanced JSON evidence recording for audit trails and compliance.

## 🏗️ Architecture

This project demonstrates a complete backend API testing infrastructure with:

- **Backend API**: Node.js/Express application with PostgreSQL database
- **Cypress E2E Tests**: Comprehensive API testing suite  
- **JSON Evidence Recording**: Structured evidence capture for all test activities
- **Docker Environment**: Containerized setup for consistent testing

## 🚀 Features

### ✅ Backend API Testing
- **Books CRUD API**: Complete Create, Read, Update, Delete operations
- **Health Check Endpoint**: System health validation
- **Database Integration**: PostgreSQL with proper migrations
- **Docker Containerization**: Isolated and reproducible environment

### 📊 Advanced Evidence Recording
- **JSON Evidence Logging**: Structured evidence capture in JSON format
- **API Request/Response Capture**: Complete HTTP transaction recording
- **Validation Evidence**: Detailed assertion results and comparisons
- **Performance Metrics**: Response times and duration tracking
- **Test Metadata**: Rich context including timestamps and browser info

### 🐳 Docker Setup
- **Multi-container Setup**: Backend, Database, and Testing containers
- **Health Checks**: Proper dependency management between services
- **Volume Mounting**: Evidence persistence on host system

## 📁 Project Structure

```
my-cypress-docker/
├── backend/                    # Node.js Express API
│   ├── index.js               # Main application
│   ├── package.json           # Backend dependencies
│   └── Dockerfile             # Backend container config
├── cypress/                   # Cypress testing framework
│   ├── e2e/                   # End-to-end test files
│   │   ├── books.cy.js        # Books API tests
│   │   ├── health.cy.js       # Health check tests
│   │   └── spec.cy.js         # Template tests
│   ├── support/               # Support files and custom commands
│   │   ├── commands.js        # Custom evidence recording commands
│   │   └── e2e.js             # Setup and configuration
│   └── evidence/              # JSON evidence files (ignored by git)
├── docker-compose.yml         # Multi-container orchestration
├── Dockerfile                 # Cypress container config
├── cypress.config.js          # Cypress configuration with custom tasks
├── package.json               # Test dependencies
├── EVIDENCE_RECORDING.md      # Evidence system documentation
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🛠️ Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git for version control

### 1. Clone and Setup
```bash
git clone <repository-url>
cd my-cypress-docker
```

### 2. Run the Complete Test Suite
```bash
# Start all services and run tests with evidence recording
docker compose up --build

# Or run tests only (assumes services are already running)
docker compose run --rm -v $(pwd)/cypress/evidence:/e2e/cypress/evidence cypress
```

### 3. View Evidence
```bash
# Check generated evidence files
ls -la cypress/evidence/

# View a sample evidence report
cat cypress/evidence/test-evidence-report-*.json | jq '.'
```

## 📊 Evidence Recording System

### Custom Commands Available

#### `cy.logStep(description, additionalData)`
Records structured test steps with contextual data:
```javascript
cy.logStep('Starting user authentication', {
  operation: 'LOGIN',
  endpoint: '/auth/login',
  method: 'POST'
});
```

#### `cy.captureApiEvidence(alias, stepName, context)`
Captures comprehensive API evidence:
```javascript
cy.request('POST', '/books', bookData).as('createBook');
cy.captureApiEvidence('@createBook', 'create-book', {
  operation: 'CREATE_BOOK',
  expectedStatus: 201
});
```

#### `cy.addEvidence(type, description, data)`
Adds custom evidence entries:
```javascript
cy.addEvidence('VALIDATION', 'Book creation validation', {
  expectedStatus: 201,
  actualStatus: response.status,
  hasId: !!response.body.id
});
```

### Evidence Structure

Each test generates structured JSON evidence:

```json
{
  "timestamp": "2025-08-06T06:04:57.873Z",
  "spec": "books",
  "test": "should create a book",
  "step": "API create-book",
  "type": "API_EVIDENCE",
  "request": {
    "method": "POST",
    "headers": { /* complete headers */ },
    "body": { /* request payload */ }
  },
  "response": {
    "status": 201,
    "statusText": "Created",
    "headers": { /* response headers */ },
    "body": { /* response data */ },
    "duration": 34
  },
  "context": {
    "operation": "CREATE_BOOK",
    "expectedStatus": 201
  }
}
```

## 🧪 Test Suites

### Books API Tests (`cypress/e2e/books.cy.js`)
- ✅ Create a book (POST /books)
- ✅ Get all books (GET /books)
- ✅ Get specific book (GET /books/:id)
- ✅ Update a book (PUT /books/:id)
- ✅ Delete a book (DELETE /books/:id)

### Health Check Tests (`cypress/e2e/health.cy.js`)
- ✅ Backend and database health validation (GET /health)

## 🐳 Docker Services

### Backend Service
- **Port**: 4000
- **Database**: PostgreSQL
- **Health Check**: `/health` endpoint
- **Dependencies**: Database must be healthy

### Database Service
- **Database**: PostgreSQL 15
- **Port**: 5432
- **Health Check**: `pg_isready`
- **Persistence**: Volume-mounted data

### Cypress Service
- **Base Image**: `cypress/included:13.7.3`
- **Evidence**: Volume-mounted to host
- **Dependencies**: Backend must be healthy

## 📋 Evidence Types

| Type | Description | Content |
|------|-------------|----------|
| `STEP` | Test execution steps | Step description and context |
| `API_EVIDENCE` | HTTP transactions | Complete request/response |
| `VALIDATION` | Assertion results | Expected vs actual values |
| `TEST_START` | Test initialization | Test metadata and setup |
| `TEST_END` | Test completion | Results and cleanup |

## 🔧 Configuration

### Cypress Configuration (`cypress.config.js`)
- Video recording disabled for efficiency
- Custom evidence logging tasks
- JSON evidence file management
- Test metadata capture

### Docker Configuration (`docker-compose.yml`)
- Multi-service orchestration
- Health check dependencies
- Volume mounting for evidence
- Network isolation

## 📈 Benefits

- **🔍 Complete Audit Trail**: Every API call and validation recorded
- **📊 Structured Evidence**: JSON format enables automated analysis
- **🚀 CI/CD Ready**: Containerized and production-ready
- **🔒 Compliance**: Detailed evidence for regulatory requirements
- **🐛 Debugging**: Rich context for failure investigation
- **📱 Backend-Focused**: Optimized for API testing without UI overhead

## 🛠️ Development

### Adding New Tests
1. Create test files in `cypress/e2e/`
2. Use evidence recording commands for comprehensive logging
3. Include proper beforeEach/afterEach hooks for evidence management

### Custom Evidence
```javascript
// Add custom evidence types
cy.addEvidence('PERFORMANCE', 'Response time validation', {
  endpoint: '/books',
  responseTime: 45,
  threshold: 100,
  passed: true
});
```

### Extending API Coverage
1. Add new endpoints to backend
2. Create corresponding Cypress tests
3. Implement evidence recording for new operations

## 📚 Documentation

- **[Evidence Recording Guide](EVIDENCE_RECORDING.md)**: Detailed evidence system documentation
- **API Documentation**: Available at `http://localhost:4000/docs` when backend is running
- **Cypress Best Practices**: Follow patterns established in existing test files

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests with evidence recording
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Evidence Analysis**: Use `jq` for JSON processing: `cat evidence.json | jq '.'`
- **Docker Logs**: `docker compose logs <service-name>` for debugging

---

**Built with ❤️ for comprehensive backend API testing and evidence recording**
