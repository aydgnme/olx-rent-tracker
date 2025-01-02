FROM ghcr.io/puppeteer/puppeteer:21.7.0

USER root

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Give permissions to Chrome
RUN chmod -R o+rwx /usr/bin/google-chrome-stable

# Switch back to pptruser
USER pptruser

# Start the app
CMD [ "node", "src/index.js" ] 