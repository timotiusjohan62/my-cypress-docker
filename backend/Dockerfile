FROM node:20
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
