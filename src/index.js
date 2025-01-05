const RentScraper = require('./scraper');
const TelegramNotifier = require('./telegram');
const config = require('./config');
const fs = require('fs');
const path = require('path');

class RentTracker {
  constructor() {
    this.scraper = new RentScraper();
    this.notifier = new TelegramNotifier();
    this.seenListingsFile = path.join(process.env.DATA_DIR || path.join(__dirname, '../data'), 'seen-listings.json');
    this.lastListings = new Set();
    this.loadSeenListings();
  }

  loadSeenListings() {
    try {
      // data dizini yoksa oluştur
      const dataDir = path.dirname(this.seenListingsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`Data directory created: ${dataDir}`);
      }

      // Dosya varsa oku
      if (fs.existsSync(this.seenListingsFile)) {
        const data = fs.readFileSync(this.seenListingsFile, 'utf8');
        const listings = JSON.parse(data);
        this.lastListings = new Set(listings);
        console.log(`Loaded ${this.lastListings.size} previously seen listings`);
      } else {
        fs.writeFileSync(this.seenListingsFile, '[]', { mode: 0o666 });
        console.log('Created new seen listings file');
        
        // İlk çalıştırma olduğu için başlangıç mesajı gönder
        this.sendInitialMessage();
      }
    } catch (error) {
      console.error('Error loading seen listings:', error);
      // Hata durumunda memory'de tutmaya devam et
      this.lastListings = new Set();
    }
  }

  async sendInitialMessage() {
    try {
      await this.notifier.sendMessage({
        title: '🤖 Bot Active',
        location: config.DEFAULT_CRITERIA.city,
        price: `${config.DEFAULT_CRITERIA.minPrice}€ - ${config.DEFAULT_CRITERIA.maxPrice}€`,
        rooms: `${config.DEFAULT_CRITERIA.minRooms}-${config.DEFAULT_CRITERIA.maxRooms} rooms`,
        link: config.WEBSITES.OLX
      });
      console.log('Sent initial status message');
    } catch (error) {
      console.error('Error sending initial message:', error);
    }
  }

  saveSeenListings() {
    try {
      const dataDir = path.dirname(this.seenListingsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true, mode: 0o777 });
        console.log(`Data directory created: ${dataDir}`);
      }

      const listings = Array.from(this.lastListings);
      fs.writeFileSync(this.seenListingsFile, JSON.stringify(listings, null, 2), { mode: 0o666 });
      console.log(`Saved ${listings.length} seen listings`);
    } catch (error) {
      console.error('Error saving seen listings:', error);
      // Hata durumunda sessizce devam et
    }
  }

  async start() {
    try {
      await this.scraper.initialize();

      console.log('🤖 Bot started!');
      console.log(`📍 City: ${config.DEFAULT_CRITERIA.city}`);
      console.log(`💰 Price range: ${config.DEFAULT_CRITERIA.minPrice}€ - ${config.DEFAULT_CRITERIA.maxPrice}€`);
      console.log(`🚪 Rooms: ${config.DEFAULT_CRITERIA.minRooms}-${config.DEFAULT_CRITERIA.maxRooms}`);
      
      // Check listings
      console.log('\n🔍 Checking listings...');
      await this.checkNewListings();
      
      // Save seen listings before exit
      this.saveSeenListings();
      
      // Close browser and exit after completion
      await this.scraper.close();
      console.log('\n✅ Process completed, shutting down...');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Bot initialization error:', error);
      process.exit(1);
    }
  }

  async checkNewListings() {
    try {
      console.log('\n🔍 Checking listings...');
      const listings = await this.scraper.scrapeOLX(config.DEFAULT_CRITERIA);
      console.log(`\n✅ Found ${listings.length} listings`);
      
      // Check for removed listings and delete their messages
      await this.notifier.checkAndDeleteRemovedListings(listings);
      
      // Filter and notify about new listings
      let newListingCount = 0;
      for (const listing of listings) {
        const listingKey = `${listing.link}`;
        
        if (!this.lastListings.has(listingKey) && 
            this.matchesCriteria(listing, config.DEFAULT_CRITERIA)) {
          console.log('\n📨 Sending notification for new listing:', listing.title);
          await this.notifier.sendMessage(listing);
          this.lastListings.add(listingKey);
          newListingCount++;
        }
      }
      
      console.log(`\n📊 Summary: ${newListingCount} new listings notified`);
      
    } catch (error) {
      console.error('❌ Error checking listings:', error);
    }
  }

  matchesCriteria(listing, criteria) {
    try {
      // Extract numeric price value
      const price = parseInt(listing.price.replace(/[^0-9]/g, ''));
      const rooms = parseInt(listing.rooms) || 0;

      const priceValid = price >= criteria.minPrice && price <= criteria.maxPrice;
      const roomsValid = rooms >= criteria.minRooms && rooms <= criteria.maxRooms;

      console.log('\nChecking criteria:');
      console.log(`Listing: ${listing.title}`);
      console.log(`Price: ${price}€ (Valid: ${priceValid ? 'Yes' : 'No'})`);
      console.log(`Rooms: ${rooms} (Valid: ${roomsValid ? 'Yes' : 'No'})`);
      console.log(`Price range: ${criteria.minPrice}€ - ${criteria.maxPrice}€`);
      console.log(`Room range: ${criteria.minRooms} - ${criteria.maxRooms}`);

      return priceValid && roomsValid;
    } catch (error) {
      console.error('Error checking criteria:', error);
      console.error('Listing with error:', listing);
      return false;
    }
  }
}

// Start the tracker
console.log('🚀 Starting bot...');
const tracker = new RentTracker();
tracker.start().catch(error => {
  console.error('❌ Critical error:', error);
  process.exit(1);
}); 