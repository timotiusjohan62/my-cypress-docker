FROM cypress/included:13.7.3
WORKDIR /e2e

# Copy package files from parent directory
COPY package*.json ./
RUN npm ci

# Copy cypress configuration file
COPY cypress.config.js ./

# Copy cypress directory with all tests and support files
COPY cypress ./cypress/

# Ensure evidence directory exists for JSON logs
RUN mkdir -p cypress/evidence

CMD ["npx", "cypress", "run"]
