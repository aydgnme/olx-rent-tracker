const puppeteer = require('puppeteer');
const config = require('./config');

class RentScraper {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    console.log('Browser başlatılıyor...');
    this.browser = await puppeteer.launch({
      headless: true,
      product: 'firefox',
      executablePath: process.env.FIREFOX_BIN || '/snap/bin/firefox',
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-zygote',
        '--disable-extensions',
        '--window-size=1920,1080'
      ],
      timeout: 60000,
      env: {
        ...process.env,
        MOZ_HEADLESS: '1'
      }
    });
    console.log('Browser başlatıldı');
  }

  async scrapeOLX(criteria) {
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0');
      
      const cityFormatted = criteria.city.toLowerCase()
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-');

      const url = `${config.WEBSITES.OLX}/imobiliare/apartamente-garsoniere-de-inchiriat/${cityFormatted}`;
      console.log('Se accesează URL:', url);
      
      await page.goto(url, {
        waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
        timeout: 90000
      });

      console.log('Pagina s-a încărcat, se așteaptă anunțurile...');

      await page.waitForSelector('[data-cy="l-card"]', {
        timeout: 60000
      });

      console.log('Elemente găsite, se extrag datele...');

      const listings = await page.evaluate(() => {
        const items = document.querySelectorAll('[data-cy="l-card"]');
        console.log(`${items.length} elemente de anunț găsite`);
        
        return Array.from(items).map(item => {
          try {
            const title = item.querySelector('h6')?.textContent.trim();
            const priceElement = item.querySelector('[data-testid="ad-price"]');
            const price = priceElement ? priceElement.textContent.trim() : null;
            const link = item.querySelector('a')?.href || '';
            const location = item.querySelector('[data-testid="location-date"]')?.textContent.split('-')[0].trim();
            
            let rooms = null;
            
            if (link) {
              const urlMatch = link.match(/apartament-(\d+)-cam/);
              if (urlMatch) rooms = urlMatch[1];
            }
            
            if (!rooms && title) {
              const titleText = title.toLowerCase();
              if (titleText.includes('camera') || titleText.includes('camere')) {
                const matches = titleText.match(/(\d+)\s*cam/);
                if (matches) rooms = matches[1];
              }
            }
            
            return { title, price, rooms, location, link };
          } catch (error) {
            console.error('İlan ayrıştırma hatası:', error);
            return null;
          }
        }).filter(item => item !== null);
      });

      console.log(`Total ${listings.length} anunțuri găsite`);
      
      return listings.filter(listing => {
        if (!listing.price) {
          console.log('Anunț fără preț ignorat');
          return false;
        }

        const price = parseInt(listing.price.replace(/[^0-9]/g, ''));
        const rooms = parseInt(listing.rooms) || 0;

        const priceValid = price >= criteria.minPrice && price <= criteria.maxPrice;
        const roomsValid = rooms >= criteria.minRooms && rooms <= criteria.maxRooms;

        if (!priceValid || !roomsValid) {
          console.log(`Anunț ignorat - Preț: ${price}€, Camere: ${rooms}`);
        }

        return priceValid && roomsValid;
      });
      
    } catch (error) {
      console.error('Eroare la extragerea datelor OLX:', error);
      console.error('URL cu eroare:', await page.url());
      return [];
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Browser închis');
    }
  }
}

module.exports = RentScraper; 