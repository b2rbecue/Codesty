require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ─── Express (Railway için keep-alive) ───────────────────────────────────────
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot çalışıyor! 🤖'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`[HTTP] Keep-alive sunucu ${PORT} portunda çalışıyor`));
// ─────────────────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Komutları yükle
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`[KOMUT] /${command.data.name} yüklendi`);
  }
}

// Event'leri yükle
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(`[EVENT] ${event.name} yüklendi`);
}

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('[DB] MongoDB bağlantısı başarılı'))
  .catch(err => {
    console.error('[DB] MongoDB bağlantı hatası:', err);
    process.exit(1);
  });

// Hata yakalama - botu düşürme
process.on('unhandledRejection', err => {
  console.error('[HATA] Yakalanmamış hata:', err);
});

client.login(process.env.DISCORD_TOKEN);
