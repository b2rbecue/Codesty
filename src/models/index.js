const mongoose = require('mongoose');

// ─── Sunucu Modeli ────────────────────────────────────────────────────────────
const sunucuSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  isim: { type: String, required: true },
  aciklama: { type: String, default: '' },
  davetLink: { type: String, required: true },
  kategori: {
    type: String,
    enum: ['oyun', 'sohbet', 'müzik', 'eğitim', 'teknoloji', 'anime', 'diğer'],
    default: 'diğer'
  },
  toplamOy: { type: Number, default: 0 },
  aylikOy: { type: Number, default: 0 },
  ikonUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  sahipId: { type: String, required: true },
  onaylandi: { type: Boolean, default: false }, // admin onayı
  aktif: { type: Boolean, default: true },
  kayitTarihi: { type: Date, default: Date.now },
  ayBaslangic: { type: Date, default: () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }},
});

// ─── Oy Modeli ────────────────────────────────────────────────────────────────
const oySchema = new mongoose.Schema({
  kullaniciId: { type: String, required: true },
  guildId: { type: String, required: true },
  tarih: { type: Date, default: Date.now },
});

// Aynı kullanıcı aynı sunucuya indeks (duplicate engeli)
oySchema.index({ kullaniciId: 1, guildId: 1 });

// Aylık oy sıfırlama için TTL indeksi (30 gün sonra silinir)
oySchema.index({ tarih: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const Sunucu = mongoose.model('Sunucu', sunucuSchema);
const Oy = mongoose.model('Oy', oySchema);

module.exports = { Sunucu, Oy };
