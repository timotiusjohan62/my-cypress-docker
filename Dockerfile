FROM cypress/included:13.7.3
WORKDIR /e2e
COPY . .
RUN npm ci

# Ensure evidence directory exists for JSON logs
RUN mkdir -p cypress/evidence

CMD ["npx", "cypress", "run"]
