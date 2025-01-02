FROM ghcr.io/puppeteer/puppeteer:21.7.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Start the app
CMD [ "node", "src/index.js" ] 