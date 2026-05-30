require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
    console.log(`[DEPLOY] /${command.data.name} hazırlandı`);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`[DEPLOY] ${commands.length} komut Discord'a yükleniyor...`);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('[DEPLOY] ✅ Tüm komutlar başarıyla yüklendi!');
  } catch (err) {
    console.error('[DEPLOY] Hata:', err);
  }
})();
