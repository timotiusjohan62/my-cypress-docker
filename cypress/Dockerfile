FROM cypress/included:13.7.3

# Set working directory
WORKDIR /e2e

# Copy package files from parent directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy cypress configuration file
COPY cypress.config.js ./

# Copy cypress directory with all tests and support files
COPY cypress ./cypress/

# Ensure evidence directory exists for JSON logs
RUN mkdir -p cypress/evidence

# Set default environment variables
ENV CYPRESS_BASE_URL=http://backend:4000
ENV CYPRESS_VIDEO=false
ENV CYPRESS_SCREENSHOTS_ON_FAILURE=false
ENV CYPRESS_VIEWPORT_WIDTH=1280
ENV CYPRESS_VIEWPORT_HEIGHT=720
ENV CYPRESS_BROWSER=electron
ENV CYPRESS_HEADED=false
ENV IS_TESTING=true

# Default command
CMD ["npx", "cypress", "run"]
