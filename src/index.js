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
        console.log(`Data dizini oluşturuldu: ${dataDir}`);
      }

      // Dosya varsa oku
      if (fs.existsSync(this.seenListingsFile)) {
        const data = fs.readFileSync(this.seenListingsFile, 'utf8');
        const listings = JSON.parse(data);
        this.lastListings = new Set(listings);
        console.log(`${this.lastListings.size} adet önceden görülmüş ilan yüklendi`);
      } else {
        fs.writeFileSync(this.seenListingsFile, '[]', { mode: 0o666 });
        console.log('Yeni görülen ilanlar dosyası oluşturuldu');
      }
    } catch (error) {
      console.error('Görülen ilanlar yüklenirken hata:', error);
      // Hata durumunda memory'de tutmaya devam et
      this.lastListings = new Set();
    }
  }

  saveSeenListings() {
    try {
      const dataDir = path.dirname(this.seenListingsFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true, mode: 0o777 });
        console.log(`Data dizini oluşturuldu: ${dataDir}`);
      }

      const listings = Array.from(this.lastListings);
      fs.writeFileSync(this.seenListingsFile, JSON.stringify(listings, null, 2), { mode: 0o666 });
      console.log(`${listings.length} adet görülen ilan kaydedildi`);
    } catch (error) {
      console.error('Görülen ilanlar kaydedilirken hata:', error);
      // Hata durumunda sessizce devam et
    }
  }

  async start() {
    try {
      await this.scraper.initialize();
      
      // Send initial status message
      await this.notifier.sendMessage({
        title: '🤖 Bot Activ',
        location: config.DEFAULT_CRITERIA.city,
        price: `${config.DEFAULT_CRITERIA.minPrice}€ - ${config.DEFAULT_CRITERIA.maxPrice}€`,
        rooms: `${config.DEFAULT_CRITERIA.minRooms}-${config.DEFAULT_CRITERIA.maxRooms} camere`,
        link: config.WEBSITES.OLX
      });

      console.log('🤖 Bot-ul a pornit!');
      console.log(`📍 Oraș căutat: ${config.DEFAULT_CRITERIA.city}`);
      console.log(`💰 Interval de preț: ${config.DEFAULT_CRITERIA.minPrice}€ - ${config.DEFAULT_CRITERIA.maxPrice}€`);
      console.log(`🚪 Camere: ${config.DEFAULT_CRITERIA.minRooms}-${config.DEFAULT_CRITERIA.maxRooms}`);
      
      // Check listings
      console.log('\n🔍 Se verifică anunțurile...');
      await this.checkNewListings();
      
      // Save seen listings before exit
      this.saveSeenListings();
      
      // Close browser and exit after completion
      await this.scraper.close();
      console.log('\n✅ Procesul s-a încheiat, se închide...');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Eroare de inițializare a botului:', error);
      process.exit(1);
    }
  }

  async checkNewListings() {
    try {
      console.log('\n🔍 Se verifică anunțurile...');
      const listings = await this.scraper.scrapeOLX(config.DEFAULT_CRITERIA);
      console.log(`\n✅ ${listings.length} anunțuri găsite`);
      
      // Filter and notify about new listings
      let newListingCount = 0;
      for (const listing of listings) {
        const listingKey = `${listing.link}`;
        
        if (!this.lastListings.has(listingKey) && 
            this.matchesCriteria(listing, config.DEFAULT_CRITERIA)) {
          console.log('\n📨 Se trimite notificare pentru anunț nou:', listing.title);
          await this.notifier.sendMessage(listing);
          this.lastListings.add(listingKey);
          newListingCount++;
        }
      }
      
      console.log(`\n📊 Rezumat: ${newListingCount} anunțuri noi notificate`);
      
    } catch (error) {
      console.error('❌ Eroare la verificarea anunțurilor:', error);
    }
  }

  matchesCriteria(listing, criteria) {
    try {
      // Extract numeric price value
      const price = parseInt(listing.price.replace(/[^0-9]/g, ''));
      const rooms = parseInt(listing.rooms) || 0;

      const priceValid = price >= criteria.minPrice && price <= criteria.maxPrice;
      const roomsValid = rooms >= criteria.minRooms && rooms <= criteria.maxRooms;

      console.log('\nVerificare criterii:');
      console.log(`Anunț: ${listing.title}`);
      console.log(`Preț: ${price}€ (Valid: ${priceValid ? 'Da' : 'Nu'})`);
      console.log(`Camere: ${rooms} (Valid: ${roomsValid ? 'Da' : 'Nu'})`);
      console.log(`Interval de preț: ${criteria.minPrice}€ - ${criteria.maxPrice}€`);
      console.log(`Interval camere: ${criteria.minRooms} - ${criteria.maxRooms}`);

      return priceValid && roomsValid;
    } catch (error) {
      console.error('Eroare la verificarea criteriilor:', error);
      console.error('Anunț cu eroare:', listing);
      return false;
    }
  }
}

// Start the tracker
console.log('🚀 Bot-ul pornește...');
const tracker = new RentTracker();
tracker.start().catch(error => {
  console.error('❌ Eroare critică:', error);
  process.exit(1);
}); 