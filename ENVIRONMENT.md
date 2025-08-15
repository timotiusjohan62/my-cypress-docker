# Environment Variables Guide

This document describes all available environment variables for the My Cypress Docker project and how to use them.

## 📋 Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your specific values

3. Run the project:
   ```bash
   docker-compose up
   ```

## 🎯 Environment-Specific Configurations

### Development Environment
```bash
docker-compose --env-file .env.development up
```

### Test Environment
```bash
docker-compose --env-file .env.test up
```

### Production Environment
```bash
docker-compose --env-file .env.production up
```

## 📝 Available Environment Variables

### Database Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `testdb` | PostgreSQL database name |
| `POSTGRES_HOST` | `db` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `DATABASE_URL` | `postgresql://...` | Full database connection URL |

### Backend/API Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `4000` | Backend service port |
| `BACKEND_HOST` | `backend` | Backend service hostname |
| `NODE_ENV` | `development` | Node.js environment |
| `API_BASE_URL` | `http://backend:4000` | API base URL |
| `PG_HOST` | `db` | Database host for backend |

### Cypress Testing Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `CYPRESS_BASE_URL` | `http://backend:4000` | Base URL for Cypress tests |
| `CYPRESS_VIDEO` | `false` | Enable/disable video recording |
| `CYPRESS_SCREENSHOTS_ON_FAILURE` | `false` | Screenshots on test failure |
| `CYPRESS_VIEWPORT_WIDTH` | `1280` | Browser viewport width |
| `CYPRESS_VIEWPORT_HEIGHT` | `720` | Browser viewport height |
| `CYPRESS_BROWSER` | `electron` | Browser to use for tests |
| `CYPRESS_HEADED` | `false` | Run tests in headed mode |
| `CYPRESS_EVIDENCE_DIR` | `/e2e/cypress/evidence` | Evidence output directory |
| `CYPRESS_SPEC_PATTERN` | `cypress/e2e/**/*.cy.js` | Test file pattern |
| `CYPRESS_RECORD_KEY` | - | Cypress Cloud record key |
| `CYPRESS_PROJECT_ID` | - | Cypress Cloud project ID |

### JMeter Load Testing Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `JMETER_TEST_PLAN` | `simple-load-test.jmx` | JMeter test plan file |
| `JMETER_USERS` | `5` | Number of virtual users |
| `JMETER_RAMP_TIME` | `10` | Ramp-up time in seconds |
| `JMETER_HOST` | `backend` | Target host for load tests |
| `JMETER_PORT` | `4000` | Target port for load tests |
| `JMETER_RESULTS_DIR` | `/tests/results` | Results output directory |

### Docker & Networking
| Variable | Default | Description |
|----------|---------|-------------|
| `COMPOSE_PROJECT_NAME` | `my-cypress-docker` | Docker Compose project name |
| `NETWORK_NAME` | `app-network` | Docker network name |

### Development & Debugging
| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `false` | Enable debug mode |
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |
| `HEALTH_CHECK_INTERVAL` | `30s` | Health check interval |
| `HEALTH_CHECK_TIMEOUT` | `10s` | Health check timeout |
| `HEALTH_CHECK_RETRIES` | `3` | Health check retry count |

### Testing Environment
| Variable | Default | Description |
|----------|---------|-------------|
| `IS_TESTING` | `false` | Indicates if running in test mode |
| `TEST_TIMEOUT` | `60000` | Test timeout in milliseconds |
| `CI` | `false` | Continuous Integration flag |

## 🔧 Usage Examples

### Running with Different Environments

#### Development Mode
```bash
# Use development environment
docker-compose --env-file .env.development up

# Or set individual variables
CYPRESS_VIDEO=true CYPRESS_HEADED=true docker-compose up cypress
```

#### Test Mode with Custom Settings
```bash
# Run tests with video recording and increased users
CYPRESS_VIDEO=true JMETER_USERS=10 docker-compose up
```

#### Production Mode
```bash
# Use production environment
docker-compose --env-file .env.production up
```

### Single Service with Environment Variables
```bash
# Run only Cypress with custom base URL
CYPRESS_BASE_URL=http://localhost:3000 docker-compose up cypress

# Run backend with debug logging
DEBUG=true LOG_LEVEL=debug docker-compose up backend

# Run JMeter with high load
JMETER_USERS=100 JMETER_RAMP_TIME=60 docker-compose up jmeter
```

### Override Docker Compose Settings
```bash
# Use custom network name
NETWORK_NAME=my-custom-network docker-compose up

# Use different ports
BACKEND_PORT=3000 POSTGRES_PORT=5433 docker-compose up
```

## 🚀 Advanced Configuration

### Environment File Precedence
1. Command-line environment variables (highest priority)
2. `.env.local` (not tracked in git)
3. `.env.{NODE_ENV}` (e.g., `.env.development`)
4. `.env`
5. Default values in configuration files

### Creating Custom Environment Files
```bash
# Create environment-specific file
cp .env.example .env.staging

# Edit with staging-specific values
nano .env.staging

# Use the staging environment
docker-compose --env-file .env.staging up
```

### Cypress Cloud Integration
```bash
# Set up Cypress Cloud recording
export CYPRESS_RECORD_KEY="your-record-key"
export CYPRESS_PROJECT_ID="your-project-id"

# Run with recording enabled
docker-compose up cypress
```

## 🔒 Security Best Practices

1. **Never commit actual `.env` files** to version control
2. **Use strong passwords** in production environments
3. **Rotate secrets regularly** in production
4. **Use different databases** for each environment
5. **Limit database permissions** for each service
6. **Use Docker secrets** for sensitive data in production

### Production Security Checklist
- [ ] Change default passwords
- [ ] Use environment-specific database names
- [ ] Enable SSL for database connections
- [ ] Set secure health check intervals
- [ ] Use non-root users in containers
- [ ] Enable container security scanning

## 🐛 Troubleshooting

### Common Issues

**Environment variables not loading:**
```bash
# Check if .env file exists
ls -la .env*

# Verify file format (no spaces around =)
cat .env | grep -v '^#' | grep '='
```

**Database connection issues:**
```bash
# Test database connection
docker-compose exec backend npm run db:migrate

# Check database logs
docker-compose logs db
```

**Cypress tests failing:**
```bash
# Verify base URL is accessible
docker-compose exec cypress curl -f $CYPRESS_BASE_URL/health

# Check Cypress environment
docker-compose exec cypress npx cypress info
```

### Debug Commands
```bash
# Show all environment variables in a service
docker-compose exec backend env | sort

# Test specific environment variable
docker-compose exec backend echo $NODE_ENV

# Validate docker-compose configuration
docker-compose config
```

## 📚 Related Documentation

- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Cypress Environment Variables](https://docs.cypress.io/guides/guides/environment-variables)
- [Node.js Environment Variables Best Practices](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)

---

For more information about the project setup, see the main [README.md](README.md) file.
