const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! and shows bot latency'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: 'Pinging...', 
            fetchReply: true 
        });
        
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🏓 Pong!')
            .addFields(
                { 
                    name: 'Roundtrip Latency', 
                    value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`,
                    inline: true 
                },
                { 
                    name: 'WebSocket Heartbeat', 
                    value: `${interaction.client.ws.ping}ms`,
                    inline: true 
                }
            )
            .setTimestamp()
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.editReply({ 
            content: '',
            embeds: [embed]
        });
    },
};
