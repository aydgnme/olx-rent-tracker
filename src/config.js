// Load environment variables
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Environment configuration
const DEBUG = process.env.DEBUG === 'true';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Scraping configuration
const SCRAPING_INTERVAL = (DEBUG ? 
  parseInt(process.env.DEBUG_CHECK_INTERVAL || '1') : 
  parseInt(process.env.CHECK_INTERVAL || '5')) * 60 * 1000; // Convert to milliseconds

// Search criteria configuration
const DEFAULT_CRITERIA = {
  city: process.env.SEARCH_CITY || 'Suceava',
  maxPrice: parseInt(process.env.SEARCH_MAX_PRICE || '400'),
  minPrice: parseInt(process.env.SEARCH_MIN_PRICE || '200'),
  minRooms: parseInt(process.env.SEARCH_MIN_ROOMS || '2'),
  maxRooms: parseInt(process.env.SEARCH_MAX_ROOMS || '3')
};

// External service configuration
const WEBSITES = {
  IMOBILIARE: 'https://www.imobiliare.ro',
  OLX: 'https://www.olx.ro'
};

// Language configuration for Romanian
const ROMANIAN = {
  // Room related terms
  ROOM_TERMS: {
    SINGLE: 'camera',
    PLURAL: 'camere',
    APARTMENT: 'apartament'
  },
  
  // Location related terms
  LOCATION_TERMS: {
    RENT: 'de-inchiriat',
    APARTMENTS: 'apartamente-garsoniere'
  },
  
  // Log messages
  MESSAGES: {
    ACCESSING_URL: 'Se accesează URL-ul',
    PAGE_LOADED: 'Pagina s-a încărcat, se așteaptă anunțurile',
    LISTINGS_FOUND: 'Elemente găsite, se extrag datele',
    FOUND_LISTINGS: 'S-au găsit %d elemente de anunț',
    TOTAL_VALID_LISTINGS: 'S-au găsit %d anunțuri valide din %d total',
    NO_PRICE: 'Anunț fără preț ignorat',
    PRICE_RANGE_ERROR: 'Preț în afara intervalului (%d > %d sau %d > %d): %s',
    ROOMS_RANGE_ERROR: 'Număr de camere în afara intervalului (%d > %d sau %d > %d): %s',
    SCRAPING_ERROR: 'Eroare la extragerea datelor OLX',
    ERROR_URL: 'URL cu eroare'
  },
  
  // Sample listing labels
  LISTING_LABELS: {
    SAMPLE_LISTINGS: 'Exemple de anunțuri',
    LISTING: 'Anunț',
    TITLE: 'Titlu',
    PRICE: 'Preț',
    ROOMS: 'Camere',
    LOCATION: 'Locație',
    LINK: 'Link'
  }
};

// Export configuration
module.exports = {
  // Environment
  NODE_ENV,
  DEBUG,
  
  // Scraping settings
  SCRAPING_INTERVAL,
  
  // Telegram settings
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER, // Format: 905123456789 (with country code)
  
  // External services
  WEBSITES,
  
  // Search defaults
  DEFAULT_CRITERIA,
  
  // Language settings
  ROMANIAN
}; 