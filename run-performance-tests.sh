#!/bin/bash

# Script to run JMeter performance tests

set -e

echo "🚀 Starting Performance Testing with JMeter"

# Default values
TEST_PLAN=${1:-"simple-load-test.jmx"}
USERS=${2:-5}
RAMP_TIME=${3:-10}
DURATION=${4:-}

echo "Configuration:"
echo "  Test Plan: $TEST_PLAN"
echo "  Users: $USERS"
echo "  Ramp Time: ${RAMP_TIME}s"
if [ ! -z "$DURATION" ]; then
    echo "  Duration: ${DURATION}s"
fi

# Start the backend services
echo "🔧 Starting backend services..."
docker compose up -d db backend

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be ready..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker compose exec -T backend curl -f http://localhost:4000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    sleep 2
    timeout=$((timeout-2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Backend failed to start within 60 seconds"
    exit 1
fi

# Clean previous results
echo "🧹 Cleaning previous test results..."
rm -rf jmeter/results/*

# Run JMeter test
echo "📊 Running JMeter performance test..."
docker compose run --rm -e TEST_PLAN="$TEST_PLAN" -e USERS="$USERS" -e RAMP_TIME="$RAMP_TIME" -e DURATION="$DURATION" jmeter

echo "✅ Performance test completed!"
echo "📋 Results saved to: ./jmeter/results/"

# Check if HTML report was generated
if [ -d "jmeter/results/html-report" ]; then
    echo "📊 HTML report available at: ./jmeter/results/html-report/index.html"
    echo "💡 Open the HTML report in your browser to view detailed results"
fi

# Show basic results summary if results file exists
if [ -f "jmeter/results/results.jtl" ]; then
    echo ""
    echo "📈 Quick Results Summary:"
    echo "Total Samples: $(tail -n +2 jmeter/results/results.jtl | wc -l | tr -d ' ')"
    echo "Failed Samples: $(tail -n +2 jmeter/results/results.jtl | awk -F',' '$8=="false"' | wc -l | tr -d ' ')"
fi

echo ""
echo "🏁 Performance testing complete!"
