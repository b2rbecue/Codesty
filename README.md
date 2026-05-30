# 🤖 Serverlist Discord Botu

Discord sunucu listesi botu — oylamayla sıralama sistemi.

---

## 📋 Kurulum Adımları

### 1. Discord Bot Oluştur
1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**
2. **Bot** sekmesi → **Add Bot**
3. **Token**'ı kopyala → `.env` dosyasına yapıştır
4. **Privileged Gateway Intents** → `SERVER MEMBERS INTENT` aç
5. **OAuth2** → **URL Generator** → `bot` + `applications.commands` seç
6. Bot izinleri: `Send Messages`, `Embed Links`, `Use Slash Commands`
7. Oluşan URL ile botu sunucuna ekle

### 2. MongoDB Atlas Kur (Ücretsiz)
1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Kayıt ol
2. **Free Tier** cluster oluştur
3. **Database Access** → kullanıcı oluştur
4. **Network Access** → `0.0.0.0/0` ekle (her yerden erişim)
5. **Connect** → **Compass** → connection string'i kopyala
6. `.env` dosyasına `MONGODB_URI` olarak yapıştır

### 3. Lokal Kurulum
```bash
# Repoyu klonla
git clone <repo-url>
cd serverlist-bot

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle ve token/uri bilgilerini gir

# Slash komutlarını Discord'a yükle (bir kere çalıştır)
npm run deploy

# Botu başlat
npm start
```

### 4. Railway'e Deploy Et (7/24)
1. [railway.app](https://railway.app) → GitHub ile giriş yap
2. **New Project** → **Deploy from GitHub repo**
3. Repoyu seç
4. **Variables** sekmesi → `.env` değişkenlerini tek tek ekle:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `MONGODB_URI`
   - `WEBSITE_URL`
5. Deploy otomatik başlar — bot 7/24 çalışır!

---

## 🎮 Bot Komutları

| Komut | Kim Kullanır | Açıklama |
|-------|-------------|----------|
| `/vote` | Herkes | Sunucuya oy ver (24 saatte 1) |
| `/sunucu-kaydet` | Sunucu yöneticisi | Sunucuyu listeye ekle |
| `/sunucu-bilgi` | Herkes | Oy istatistiklerini gör |

---

## 📁 Proje Yapısı

```
serverlist-bot/
├── src/
│   ├── index.js              # Ana bot dosyası
│   ├── deploy-commands.js    # Slash komut yükleyici
│   ├── commands/
│   │   ├── vote.js           # /vote komutu
│   │   ├── sunucu-kaydet.js  # /sunucu-kaydet komutu
│   │   └── sunucu-bilgi.js   # /sunucu-bilgi komutu
│   ├── events/
│   │   ├── ready.js          # Bot hazır eventi
│   │   └── interactionCreate.js
│   └── models/
│       └── index.js          # MongoDB modelleri
├── .env.example
├── railway.toml              # Railway ayarları
└── package.json
```

---

## 🔧 Yeni Komut Eklemek

`src/commands/` klasörüne yeni bir `.js` dosyası oluştur:

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('komut-adi')
    .setDescription('Açıklama'),

  async execute(interaction) {
    await interaction.reply('Merhaba!');
  }
};
```

Sonra `npm run deploy` ile Discord'a yükle.
