const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Sunucu, Oy } = require('../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Bu sunucuya oy ver ve sıralamasını yükselt!'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guildId = interaction.guild.id;
    const kullaniciId = interaction.user.id;

    try {
      // Sunucu kayıtlı mı?
      const sunucu = await Sunucu.findOne({ guildId, aktif: true });
      if (!sunucu) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF4444')
              .setTitle('❌ Sunucu Kayıtlı Değil')
              .setDescription(
                `Bu sunucu henüz listeye eklenmemiş.\n\n` +
                `Sunucu sahibiyseniz **/sunucu-kaydet** komutunu kullanın.`
              )
          ]
        });
      }

      // Daha önce oy kullandı mı? (24 saat kontrolü)
      const birGunOnce = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const mevcutOy = await Oy.findOne({
        kullaniciId,
        guildId,
        tarih: { $gte: birGunOnce }
      });

      if (mevcutOy) {
        const kalanSure = mevcutOy.tarih.getTime() + 24 * 60 * 60 * 1000 - Date.now();
        const kalanSaat = Math.floor(kalanSure / (1000 * 60 * 60));
        const kalanDakika = Math.floor((kalanSure % (1000 * 60 * 60)) / (1000 * 60));

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('⏰ Zaten Oy Kullandın!')
              .setDescription(
                `Bu sunucu için son oyunu kullandın.\n\n` +
                `⏳ Tekrar oy kullanmak için: **${kalanSaat} saat ${kalanDakika} dakika** bekle`
              )
              .setFooter({ text: 'Her 24 saatte bir oy kullanabilirsin' })
          ]
        });
      }

      // Oyu kaydet
      await Oy.create({ kullaniciId, guildId });
      await Sunucu.updateOne(
        { guildId },
        { $inc: { toplamOy: 1, aylikOy: 1 } }
      );

      // Başarı mesajı
      const butonSatiri = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('🌐 Siteyi Ziyaret Et')
          .setStyle(ButtonStyle.Link)
          .setURL(`${process.env.WEBSITE_URL}/sunucu/${guildId}`)
      );

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00CC66')
            .setTitle('✅ Oy Kullandın!')
            .setDescription(
              `**${sunucu.isim}** sunucusuna oy verdin, teşekkürler!\n\n` +
              `📊 Toplam oy: **${sunucu.toplamOy + 1}**\n` +
              `📅 Bu ayki oy: **${sunucu.aylikOy + 1}**`
            )
            .setThumbnail(sunucu.ikonUrl || null)
            .setFooter({ text: '24 saat sonra tekrar oy verebilirsin!' })
            .setTimestamp()
        ],
        components: [butonSatiri]
      });

    } catch (err) {
      console.error('[VOTE] Hata:', err);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4444')
            .setTitle('❌ Bir Hata Oluştu')
            .setDescription('Lütfen daha sonra tekrar dene.')
        ]
      });
    }
  }
};
