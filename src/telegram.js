const axios = require('axios');
const config = require('./config');

class TelegramNotifier {
  constructor() {
    this.baseUrl = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}`;
  }

  async sendMessage(listing) {
    const message = this.formatMessage(listing);
    
    try {
      await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: config.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Eroare la trimiterea mesajului Telegram:', error);
    }
  }

  formatMessage(listing) {
    if (listing.title === '🤖 Bot Active') {
      return `
🤖 Bot-ul de căutare este activ!

📍 Oraș căutat: ${listing.location}
💰 Interval de preț: ${listing.price}
🚪 Camere: ${listing.rooms}
🔄 Interval de verificare: ${config.SCRAPING_INTERVAL / 60000} minute

🔍 Se caută anunțuri noi...
      `.trim();
    }

    return `
👋 Hey 

🏠 Apartament nou găsit!
📍 Locație: ${listing.location}
💰 Preț: ${listing.price}
🚪 Camere: ${listing.rooms}
🔗 <a href="${listing.link}">Vezi anunțul</a>
    `.trim();
  }
}

module.exports = TelegramNotifier; 