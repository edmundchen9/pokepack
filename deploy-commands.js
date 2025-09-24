const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command: ${command.data.name}`);
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

        // Register commands to specific guild (INSTANT)
        if (process.env.DISCORD_GUILD_ID) {
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${data.length} guild commands.`);
        } else {
            // Register commands globally (SLOW - up to 1 hour)
            const data = await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${data.length} global commands.`);
            console.log('⚠️  Global commands may take up to 1 hour to appear in Discord.');
        }
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
})();
