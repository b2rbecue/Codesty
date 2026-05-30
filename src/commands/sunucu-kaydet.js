const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Sunucu } = require('../models');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sunucu-kaydet')
    .setDescription('Sunucunuzu serverlist sitesine kaydedin')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) // Sadece yöneticiler
    .addStringOption(opt =>
      opt.setName('davet')
        .setDescription('Sunucu davet linki (örn: discord.gg/xyz)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('kategori')
        .setDescription('Sunucunuzun kategorisi')
        .setRequired(true)
        .addChoices(
          { name: '🎮 Oyun', value: 'oyun' },
          { name: '💬 Sohbet', value: 'sohbet' },
          { name: '🎵 Müzik', value: 'müzik' },
          { name: '📚 Eğitim', value: 'eğitim' },
          { name: '💻 Teknoloji', value: 'teknoloji' },
          { name: '🎌 Anime', value: 'anime' },
          { name: '🔹 Diğer', value: 'diğer' },
        )
    )
    .addStringOption(opt =>
      opt.setName('aciklama')
        .setDescription('Sunucunuzu tanıtan kısa açıklama (max 300 karakter)')
        .setRequired(false)
        .setMaxLength(300)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const davet = interaction.options.getString('davet');
    const kategori = interaction.options.getString('kategori');
    const aciklama = interaction.options.getString('aciklama') || '';

    // Davet linkini temizle
    const temizDavet = davet.replace('https://', '').replace('http://', '').replace('discord.gg/', '').trim();
    const davetLink = `https://discord.gg/${temizDavet}`;

    try {
      // Zaten kayıtlı mı?
      const mevcutSunucu = await Sunucu.findOne({ guildId: guild.id });

      if (mevcutSunucu) {
        // Güncelle
        await Sunucu.updateOne({ guildId: guild.id }, {
          isim: guild.name,
          aciklama,
          davetLink,
          kategori,
          ikonUrl: guild.iconURL({ size: 256 }) || '',
          bannerUrl: guild.bannerURL({ size: 1024 }) || '',
          sahipId: interaction.user.id,
        });

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#3498DB')
              .setTitle('🔄 Sunucu Bilgileri Güncellendi')
              .setDescription(`**${guild.name}** bilgileri başarıyla güncellendi!`)
              .addFields(
                { name: 'Kategori', value: kategori, inline: true },
                { name: 'Davet', value: davetLink, inline: true },
              )
              .setThumbnail(guild.iconURL({ size: 256 }))
          ]
        });
      }

      // Yeni kayıt oluştur
      await Sunucu.create({
        guildId: guild.id,
        isim: guild.name,
        aciklama,
        davetLink,
        kategori,
        ikonUrl: guild.iconURL({ size: 256 }) || '',
        bannerUrl: guild.bannerURL({ size: 1024 }) || '',
        sahipId: interaction.user.id,
        onaylandi: false, // Admin onayı bekliyor
      });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00CC66')
            .setTitle('✅ Sunucu Kaydedildi!')
            .setDescription(
              `**${guild.name}** serverlist sitesine kaydedildi.\n\n` +
              `⏳ **Admin onayından sonra** listede görünecek.\n\n` +
              `Kullanıcılar **/vote** komutuyla oy verebilir!`
            )
            .addFields(
              { name: '📂 Kategori', value: kategori, inline: true },
              { name: '🔗 Davet', value: davetLink, inline: true },
              { name: '📝 Açıklama', value: aciklama || 'Yok', inline: false },
            )
            .setThumbnail(guild.iconURL({ size: 256 }))
            .setFooter({ text: `Kayıt eden: ${interaction.user.tag}` })
            .setTimestamp()
        ]
      });

    } catch (err) {
      console.error('[SUNUCU-KAYDET] Hata:', err);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4444')
            .setTitle('❌ Bir Hata Oluştu')
            .setDescription('Lütfen daha sonra tekrar dene veya destek al.')
        ]
      });
    }
  }
};
