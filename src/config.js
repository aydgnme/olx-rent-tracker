// Load environment variables
require('dotenv').config();

// Configuration settings
if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
  throw new Error('TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID environment variable\'ları gerekli!');
}

// Debug mode
const DEBUG = process.env.DEBUG === 'true';

module.exports = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG,
  
  // Scraping settings
  SCRAPING_INTERVAL: (DEBUG ? 
    parseInt(process.env.DEBUG_CHECK_INTERVAL || '1') : 
    parseInt(process.env.CHECK_INTERVAL || '5')) * 60 * 1000,
  
  // Telegram settings  
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  
  // Real estate websites
  WEBSITES: {
    IMOBILIARE: 'https://www.imobiliare.ro',
    OLX: 'https://www.olx.ro'
  },
  
  // Default search criteria
  DEFAULT_CRITERIA: {
    city: process.env.SEARCH_CITY || 'Suceava',
    maxPrice: parseInt(process.env.SEARCH_MAX_PRICE || '400'),
    minPrice: parseInt(process.env.SEARCH_MIN_PRICE || '200'),
    minRooms: parseInt(process.env.SEARCH_MIN_ROOMS || '2'),
    maxRooms: parseInt(process.env.SEARCH_MAX_ROOMS || '3')
  }
}; 