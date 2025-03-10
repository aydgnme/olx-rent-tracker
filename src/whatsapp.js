const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

class WhatsAppNotifier {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.isReady = false;
    this.messageQueue = [];
    this.initializeClient();
  }

  initializeClient() {
    this.client.on('qr', (qr) => {
      console.log('WhatsApp QR Code:', qr);
      qrcode.generate(qr, { small: true });
      console.log('Lütfen WhatsApp Web\'de bu QR kodu okutun');
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client hazır!');
      this.isReady = true;
      this.processMessageQueue();
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp oturumu doğrulandı');
    });

    this.client.initialize().catch(err => {
      console.error('WhatsApp başlatma hatası:', err);
    });
  }

  async processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      await this.sendMessage(message);
    }
  }

  async sendMessage(listing) {
    if (!this.isReady) {
      this.messageQueue.push(listing);
      return;
    }

    try {
      const message = this.formatMessage(listing);
      await this.client.sendMessage(`${config.WHATSAPP_NUMBER}@c.us`, message);
      console.log('WhatsApp mesajı gönderildi');
    } catch (error) {
      console.error('WhatsApp mesaj gönderme hatası:', error);
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
👋 Hey!

🏠 Apartament nou găsit!
📍 Locație: ${listing.location}
💰 Preț: ${listing.price}
🚪 Camere: ${listing.rooms}
🔗 Vezi anunțul: ${listing.link}
    `.trim();
  }

  async deleteMessage(messageId) {
    // WhatsApp Web API mesaj silmeyi desteklemiyor
    return true;
  }

  async checkAndDeleteRemovedListings(currentListings) {
    // WhatsApp'ta mesaj silme işlemi yapılmayacak
    return;
  }
}

module.exports = WhatsAppNotifier; 