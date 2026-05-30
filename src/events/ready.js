// ─── ready.js ─────────────────────────────────────────────────────────────────
module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[BOT] ${client.user.tag} olarak giriş yapıldı!`);
    console.log(`[BOT] ${client.guilds.cache.size} sunucuda aktif`);

    // Durum mesajı - her 10 dakikada değişir
    const durumlar = [
      { name: '/vote ile oy ver!', type: 2 },         // Listening
      { name: 'serverlist sitesi', type: 3 },          // Watching
      { name: `${client.guilds.cache.size} sunucu`, type: 3 },
    ];

    let i = 0;
    const durumGuncelle = () => {
      client.user.setActivity(durumlar[i % durumlar.length]);
      i++;
    };

    durumGuncelle();
    setInterval(durumGuncelle, 10 * 60 * 1000);
  }
};
