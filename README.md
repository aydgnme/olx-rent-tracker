# 🏠 Bot Căutare Chirii OLX

Bot pentru monitorizarea anunțurilor de închiriere de pe OLX.ro. Primește notificări pe Telegram când apar apartamente noi care se potrivesc criteriilor tale.

## 📋 Caracteristici

- 🔍 Monitorizează continuu anunțurile de pe OLX.ro
- 🏢 Filtrare după număr de camere (2-3 camere)
- 💰 Filtrare după preț (200-400€)
- 📍 Căutare în orașul specificat (Suceava)
- 📱 Notificări instant pe Telegram
- ⏰ Verifică anunțurile la fiecare 5 minute

## 🚀 Deployment pe Render

1. Fork acest repository

2. Creează cont pe [Render.com](https://render.com)

3. În Render Dashboard:
   - Click "New +"
   - Selectează "Web Service"
   - Conectează-te la GitHub și selectează repository-ul
   - Render va detecta automat configurația din `render.yaml`

4. Configurează variabilele de mediu:
   - `TELEGRAM_BOT_TOKEN`: Token-ul de la @BotFather
   - `TELEGRAM_CHAT_ID`: ID-ul tău de chat

5. Click "Create Web Service"

## 📱 Configurare Bot Telegram

1. Deschide Telegram și caută [@BotFather](https://t.me/botfather)
2. Trimite comanda `/newbot`
3. Urmează instrucțiunile pentru a crea bot-ul
4. Copiază token-ul primit
5. Începe o conversație cu [@userinfobot](https://t.me/userinfobot)
6. Copiază ID-ul primit
7. Adaugă aceste valori în setările Render

## 🔔 Format Notificări 

🏠 Apartament nou găsit!
📍 Locație: Suceava
💰 Preț: 300€
🚪 Camere: 2
🔗 Vezi anunțul: [Link către OLX]

## ⚙️ Configurare

Modifică în `render.yaml`:
- `SEARCH_CITY`: Orașul (implicit: Suceava)
- `SEARCH_MIN_PRICE`: Preț minim (implicit: 200€)
- `SEARCH_MAX_PRICE`: Preț maxim (implicit: 400€)
- `SEARCH_MIN_ROOMS`: Camere minim (implicit: 2)
- `SEARCH_MAX_ROOMS`: Camere maxim (implicit: 3)
- `CHECK_INTERVAL`: Interval verificare în minute (implicit: 5)

## 📝 Structura Proiectului
olx-rent-tracker/
├── src/
│ ├── index.js # Punct de intrare
│ ├── config.js # Configurații
│ ├── scraper.js # Logica de scraping
│ └── telegram.js # Notificări Telegram
├── .env # Variabile locale
├── render.yaml # Configurare Render
└── README.md # Documentație


## 🤖 Comenzi Bot

- `/start` - Pornește bot-ul
- Bot-ul va trimite o confirmare când este activ
- Vei primi notificări automat pentru anunțurile noi

## 📌 Note

- Bot-ul rulează continuu pe Render
- Verifică periodic anunțurile noi
- Filtrează automat duplicatele
- Consumă puține resurse
- Gratuit pentru utilizare personală