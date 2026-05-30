const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[KOMUT HATASI] /${interaction.commandName}:`, err);

      const hataEmbed = new EmbedBuilder()
        .setColor('#FF4444')
        .setTitle('❌ Komut Hatası')
        .setDescription('Bu komutu çalıştırırken bir hata oluştu. Lütfen tekrar dene.');

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [hataEmbed] }).catch(() => {});
      } else {
        await interaction.reply({ embeds: [hataEmbed], ephemeral: true }).catch(() => {});
      }
    }
  }
};
