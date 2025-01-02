const puppeteer = require('puppeteer');
const config = require('./config');

class RentScraper {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    // Launch browser with additional settings
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--single-process',
        '--no-zygote'
      ],
      executablePath: process.env.CHROME_BIN || null,
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });
  }

  async scrapeOLX(criteria) {
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
      
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
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      console.log('Pagina s-a încărcat, se așteaptă anunțurile...');

      await page.waitForSelector('[data-cy="l-card"]', {
        timeout: 30000
      });

      console.log('Elemente găsite, se extrag datele...');

      await page.screenshot({ path: 'debug-screenshot.png' });

      const listings = await page.evaluate(() => {
        const items = document.querySelectorAll('[data-cy="l-card"]');
        console.log(`${items.length} elemente de anunț găsite`);
        
        return Array.from(items).map(item => {
          const title = item.querySelector('h6')?.textContent.trim();
          const priceElement = item.querySelector('[data-testid="ad-price"]');
          const price = priceElement ? priceElement.textContent.trim() : null;
          const link = item.querySelector('a')?.href || '';
          
          let rooms = null;
          
          if (link) {
            const urlMatch = link.match(/apartament-(\d+)-cam/);
            if (urlMatch) {
              rooms = urlMatch[1];
            }
          }
          
          if (!rooms) {
            const titleText = title?.toLowerCase() || '';
            if (titleText.includes('camera') || titleText.includes('camere')) {
              const matches = titleText.match(/(\d+)\s*cam/);
              if (matches) rooms = matches[1];
            }
          }
          
          if (!rooms) {
            const descElement = item.querySelector('.css-efx9z5');
            if (descElement) {
              const descText = descElement.textContent.toLowerCase();
              if (descText.includes('camera') || descText.includes('camere')) {
                const matches = descText.match(/(\d+)\s*cam/);
                if (matches) rooms = matches[1];
              }
            }
          }

          const location = item.querySelector('[data-testid="location-date"]')?.textContent.split('-')[0].trim();
          
          console.log('Detalii anunț:', { 
            title, 
            price, 
            rooms, 
            location, 
            link,
            rawTitle: title,
            rawPrice: price,
            urlRooms: link.match(/apartament-(\d+)-cam/)?.[1] || 'nu s-a găsit'
          });
          
          return { title, price, rooms, location, link };
        });
      });

      console.log(`Total ${listings.length} anunțuri găsite`);
      console.log('Primele 3 exemple de anunțuri:');
      listings.slice(0, 3).forEach((listing, index) => {
        console.log(`\nAnunț ${index + 1}:`);
        console.log('Titlu:', listing.title);
        console.log('Preț:', listing.price);
        console.log('Camere:', listing.rooms);
        console.log('Locație:', listing.location);
        console.log('Link:', listing.link);
        console.log('Număr camere din URL:', listing.link.match(/apartament-(\d+)-cam/)?.[1] || 'nu s-a găsit');
      });

      return listings.filter(listing => {
        if (!listing.price) {
          console.log('Anunț fără preț ignorat');
          return false;
        }

        const price = parseInt(listing.price.replace(/[^0-9]/g, ''));
        const rooms = parseInt(listing.rooms) || 0;

        const priceValid = price >= criteria.minPrice && price <= criteria.maxPrice;
        const roomsValid = rooms >= criteria.minRooms && rooms <= criteria.maxRooms;

        if (!priceValid) {
          console.log(`Preț în afara intervalului (${criteria.minPrice} > ${price} sau ${price} > ${criteria.maxPrice}): ${listing.title}`);
        }
        if (!roomsValid) {
          console.log(`Număr de camere în afara intervalului (${criteria.minRooms} > ${rooms} sau ${rooms} > ${criteria.maxRooms}): ${listing.title}`);
        }

        return priceValid && roomsValid;
      });
      
    } catch (error) {
      console.error('Eroare la extragerea datelor OLX:', error);
      console.error('URL cu eroare:', await page.url());
      await page.screenshot({ path: 'error-screenshot.png' });
      return [];
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = RentScraper; 