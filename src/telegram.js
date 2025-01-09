const axios = require('axios');
const config = require('./config');

class TelegramNotifier {
  constructor() {
    this.baseUrl = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}`;
    this.messageIds = new Map(); // link -> messageId mapping
  }

  async sendMessage(listing) {
    const message = this.formatMessage(listing);
    
    try {
      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: config.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });

      // Bot status mesajı için message ID saklamıyoruz
      if (listing.title !== '🤖 Bot Active') {
        this.messageIds.set(listing.link, response.data.result.message_id);
      }

      return response.data.result.message_id;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return null;
    }
  }

  async deleteMessage(messageId) {
    try {
      await axios.post(`${this.baseUrl}/deleteMessage`, {
        chat_id: config.TELEGRAM_CHAT_ID,
        message_id: messageId
      });
      return true;
    } catch (error) {
      console.error('Error deleting Telegram message:', error);
      return false;
    }
  }

  async checkAndDeleteRemovedListings(currentListings) {
    const currentLinks = new Set(currentListings.map(listing => listing.link));
    
    for (const [link, messageId] of this.messageIds.entries()) {
      if (!currentLinks.has(link)) {
        console.log('🗑️ Listing removed, deleting message:', link);
        await this.deleteMessage(messageId);
        this.messageIds.delete(link);
      }
    }
  }

  formatMessage(listing) {
    // Removed the section that sends a message when the bot is active
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