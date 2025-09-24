const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pull')
        .setDescription('Get a random Pokemon TCG card drop!'),
    
    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Fetch random cards from Pokemon TCG API
            const response = await axios.get(`${config.pokemonTCG.baseUrl}/cards`, {
                headers: {
                    'X-Api-Key': config.pokemonTCG.apiKey
                },
                params: {
                    pageSize: config.pokemonTCG.maxCardsPerRequest,
                    orderBy: 'random'
                }
            });

            if (!response.data || !response.data.data || response.data.data.length === 0) {
                throw new Error('No cards found');
            }

            // Get a random card from the response
            const cards = response.data.data;
            const randomCard = cards[Math.floor(Math.random() * cards.length)];

            // Create embed with card information
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(`🎴 Card Pull: ${randomCard.name}`)
                .setDescription(`**${randomCard.name}** has been pull!`)
                .addFields(
                    { 
                        name: '📦 Set', 
                        value: randomCard.set?.name || 'Unknown Set',
                        inline: true 
                    },
                    { 
                        name: '🔢 Set Number', 
                        value: randomCard.number || 'N/A',
                        inline: true 
                    },
                    { 
                        name: '✨ Rarity', 
                        value: randomCard.rarity || 'Unknown',
                        inline: true 
                    },
                    { 
                        name: '⚡ Type', 
                        value: randomCard.types?.join(', ') || 'Unknown',
                        inline: true 
                    },
                    { 
                        name: '💪 HP', 
                        value: randomCard.hp || 'N/A',
                        inline: true 
                    },
                    { 
                        name: '💰 Market Price', 
                        value: randomCard.tcgplayer?.prices?.holofoil?.market || 
                               randomCard.tcgplayer?.prices?.normal?.market || 
                               'N/A',
                        inline: true 
                    }
                )
                .setImage(randomCard.images?.large || randomCard.images?.small)
                .setTimestamp()
                .setFooter({ 
                    text: `Pulled for ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            // Add rarity-based color
            const rarity = randomCard.rarity?.toLowerCase() || '';
            if (rarity.includes('secret') || rarity.includes('rainbow') || rarity.includes('shiny')) {
                embed.setColor(0xffd700); // Gold for ultra rare
            } else if (rarity.includes('holo') || rarity.includes('ex') || rarity.includes('gx') || rarity.includes('v')) {
                embed.setColor(0xff6b6b); // Red for rare
            } else if (rarity.includes('uncommon')) {
                embed.setColor(0x4ecdc4); // Teal for uncommon
            } else {
                embed.setColor(0x95a5a6); // Gray for common
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching Pokemon card:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('Sorry, I couldn\'t fetch a card right now. Please try again later!')
                .setTimestamp();

            await interaction.editReply({ 
                embeds: [errorEmbed],
                ephemeral: true 
            });
        }
    },
};
