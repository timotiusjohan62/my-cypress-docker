# JMeter Performance Testing

This directory contains JMeter performance testing setup for the Books API.

## Structure

```
jmeter/
├── Dockerfile              # JMeter Docker image configuration
├── entrypoint.sh           # JMeter execution script
├── plans/                  # JMeter test plans (.jmx files)
│   ├── simple-load-test.jmx      # Basic load test
│   └── books-api-load-test.jmx   # Comprehensive API test
├── results/                # Test results directory
└── README.md              # This file
```

## Test Plans

### 1. Simple Load Test (`simple-load-test.jmx`)
- **Purpose**: Basic load testing of health and books endpoints
- **Default Config**: 5 users, 10s ramp-up, 5 loops each
- **Operations**: Health check, Get all books
- **Use Case**: Quick smoke test or basic performance validation

### 2. Books API Load Test (`books-api-load-test.jmx`)
- **Purpose**: Comprehensive CRUD operations testing
- **Default Config**: 10 users, 30s ramp-up, 60s duration
- **Operations**: Health check, GET/POST/PUT operations on books
- **Features**: 
  - Dynamic data generation
  - Response extraction for chained requests
  - Think time simulation
  - Comprehensive metrics collection

## Running Tests

### Option 1: Using Docker Compose (Recommended)

```bash
# Run simple load test
docker compose run --rm jmeter

# Run with custom parameters
docker compose run --rm -e TEST_PLAN="books-api-load-test.jmx" -e USERS=20 -e DURATION=120 jmeter
```

### Option 2: Using NPM Scripts

```bash
# Simple performance test
npm run test:performance:simple

# Load test with more users
npm run test:performance:load

# Custom test
npm run test:performance
```

### Option 3: Using the Shell Script

```bash
# Basic usage
./run-performance-tests.sh

# Custom parameters
./run-performance-tests.sh books-api-load-test.jmx 20 60 120
```

## Configuration Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `TEST_PLAN` | JMeter test plan file | `simple-load-test.jmx` | `books-api-load-test.jmx` |
| `USERS` | Number of concurrent users | `5` | `20` |
| `RAMP_TIME` | Time to reach full user load (seconds) | `10` | `60` |
| `DURATION` | Test duration (seconds, for load test only) | `60` | `300` |
| `HOST` | Target host | `backend` | `localhost` |
| `PORT` | Target port | `4000` | `8080` |

## Results

After running tests, results are saved to `./jmeter/results/`:

- `results.jtl` - Raw test results (CSV format)
- `html-report/` - HTML dashboard with charts and metrics
- `jmeter.log` - JMeter execution log

### Key Metrics to Monitor

1. **Response Time**: Average, median, 90th, 95th, 99th percentiles
2. **Throughput**: Requests per second
3. **Error Rate**: Percentage of failed requests
4. **Active Threads**: Concurrent user simulation

## Interpreting Results

### Good Performance Indicators:
- Response times < 200ms for simple operations
- Error rate < 1%
- Consistent throughput throughout the test
- No significant increase in response time under load

### Warning Signs:
- Response times > 1s
- Error rate > 5%
- Throughput degradation over time
- Memory or CPU issues on the backend

## Customizing Tests

### Adding New Test Plans

1. Create a new `.jmx` file in the `plans/` directory
2. Use JMeter GUI to design your test plan
3. Save it with parameterized values using `${__P(property,default)}`
4. Test it using the docker setup

### Modifying Existing Tests

1. Open the `.jmx` file in JMeter GUI
2. Modify thread groups, samplers, or logic
3. Ensure you maintain the parameter structure
4. Test your changes

### Environment Variables

The entrypoint script supports these environment variables:

```bash
TEST_PLAN=books-api-load-test.jmx
USERS=10
DURATION=60
RAMP_TIME=30
HOST=backend
PORT=4000
```

## Troubleshooting

### Common Issues

1. **Backend not ready**: The entrypoint script waits for backend health check
2. **Out of memory**: Increase Docker memory limits for high user counts
3. **Connection refused**: Ensure backend is running and accessible
4. **Permission denied**: Check script permissions with `chmod +x`

### Debug Mode

To see detailed JMeter logs:

```bash
docker compose run --rm -e JVM_ARGS="-Dlog_level.jmeter=DEBUG" jmeter
```

## Performance Testing Best Practices

1. **Start Small**: Begin with low user counts and short durations
2. **Baseline First**: Establish baseline performance before load testing
3. **Monitor Resources**: Watch backend CPU, memory, and database performance
4. **Gradual Increase**: Increase load gradually to find breaking points
5. **Realistic Scenarios**: Use test patterns that match real user behavior
6. **Clean Environment**: Ensure consistent test environment for reliable results

## Integration with CI/CD

You can integrate these tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Run Performance Tests
  run: |
    ./run-performance-tests.sh simple-load-test.jmx 10 30
    # Parse results and fail if thresholds are exceeded
```
