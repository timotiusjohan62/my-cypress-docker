#!/bin/bash

# Default values
TEST_PLAN=${TEST_PLAN:-"books-api-load-test.jmx"}
USERS=${USERS:-10}
DURATION=${DURATION:-60}
RAMP_TIME=${RAMP_TIME:-30}
HOST=${HOST:-"backend"}
PORT=${PORT:-4000}

echo "Starting JMeter performance test..."
echo "Test Plan: $TEST_PLAN"
echo "Users: $USERS"
echo "Duration: ${DURATION}s"
echo "Ramp Time: ${RAMP_TIME}s"
echo "Target: http://${HOST}:${PORT}"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
while ! curl -f http://${HOST}:${PORT}/health > /dev/null 2>&1; do
    echo "Backend not ready, waiting..."
    sleep 5
done
echo "Backend is ready!"

# Run JMeter test
jmeter -n \
    -t /tests/plans/${TEST_PLAN} \
    -l /tests/results/results.jtl \
    -e -o /tests/results/html-report \
    -Jusers=${USERS} \
    -Jduration=${DURATION} \
    -Jramp_time=${RAMP_TIME} \
    -Jhost=${HOST} \
    -Jport=${PORT}

echo "JMeter test completed!"
echo "Results saved to /tests/results/"
echo "HTML report available at /tests/results/html-report/index.html"
