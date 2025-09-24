const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PokemonCardDatabase = require('../database');

// Helper function to format TCGPlayer prices
function getPriceString(card) {
    const prices = card.tcgplayer?.prices;
    if (!prices) return 'N/A';
    
    const priceTypes = [];
    
    if (prices.holofoil?.market) {
        priceTypes.push(`Holo: $${prices.holofoil.market}`);
    }
    if (prices.reverseHolofoil?.market) {
        priceTypes.push(`Rev Holo: $${prices.reverseHolofoil.market}`);
    }
    if (prices.normal?.market) {
        priceTypes.push(`Normal: $${prices.normal.market}`);
    }
    if (prices['1stEditionHolofoil']?.market) {
        priceTypes.push(`1st Ed: $${prices['1stEditionHolofoil'].market}`);
    }
    
    return priceTypes.length > 0 ? priceTypes.join('\n') : 'N/A';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pull')
        .setDescription('Get a random Pokemon TCG card drop!'),
    
    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Initialize database
            const cardDB = new PokemonCardDatabase();
            
            // Check if database is loaded
            if (!cardDB.isDatabaseLoaded()) {
                throw new Error('Card database not loaded. Please run scraper.js first!');
            }

            // Get random card from local database (INSTANT!)
            const randomCard = cardDB.getRandomCard();

            // Create embed with card information
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(`🎴 Card Pull: ${randomCard.name}`)
                .setDescription(`**${randomCard.name}** has been pulled!`)
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
                        name: '💰 TCGPlayer Prices', 
                        value: getPriceString(randomCard),
                        inline: false 
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
