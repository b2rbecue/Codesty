const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Sunucu } = require('../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sunucu-bilgi')
    .setDescription('Bu sunucunun oy istatistiklerini görüntüle'),

  async execute(interaction) {
    await interaction.deferReply();

    const guildId = interaction.guild.id;

    try {
      const sunucu = await Sunucu.findOne({ guildId });

      if (!sunucu) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF4444')
              .setTitle('❌ Sunucu Kayıtlı Değil')
              .setDescription('Bu sunucu henüz listeye eklenmemiş.\n`/sunucu-kaydet` ile ekleyebilirsiniz.')
          ]
        });
      }

      // Sıralamayı hesapla
      const siralama = await Sunucu.countDocuments({
        toplamOy: { $gt: sunucu.toplamOy },
        aktif: true,
        onaylandi: true
      }) + 1;

      const aylikSiralama = await Sunucu.countDocuments({
        aylikOy: { $gt: sunucu.aylikOy },
        aktif: true,
        onaylandi: true
      }) + 1;

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${sunucu.isim} — İstatistikler`)
        .setThumbnail(sunucu.ikonUrl || null)
        .addFields(
          { name: '🗳️ Toplam Oy', value: `**${sunucu.toplamOy}**`, inline: true },
          { name: '📅 Bu Ayki Oy', value: `**${sunucu.aylikOy}**`, inline: true },
          { name: '\u200B', value: '\u200B', inline: true },
          { name: '🏆 Genel Sıra', value: `**#${siralama}**`, inline: true },
          { name: '📆 Aylık Sıra', value: `**#${aylikSiralama}**`, inline: true },
          { name: '\u200B', value: '\u200B', inline: true },
          { name: '📂 Kategori', value: sunucu.kategori, inline: true },
          { name: '✅ Onay', value: sunucu.onaylandi ? 'Onaylı' : 'Bekliyor', inline: true },
        )
        .setDescription(sunucu.aciklama || '')
        .setFooter({ text: `Oy vermek için /vote yaz!` })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error('[SUNUCU-BILGI] Hata:', err);
      return interaction.editReply('Bir hata oluştu.');
    }
  }
};
