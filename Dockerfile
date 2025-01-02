FROM ghcr.io/puppeteer/puppeteer:21.7.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Set environment variables
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Start the app
CMD [ "node", "src/index.js" ] 