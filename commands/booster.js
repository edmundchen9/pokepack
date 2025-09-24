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

// Helper function to get rarity color
function getRarityColor(rarity) {
    const rarityLower = rarity?.toLowerCase() || '';
    
    if (rarityLower.includes('secret') || rarityLower.includes('rainbow') || rarityLower.includes('shiny')) {
        return 0xffd700; // Gold for ultra rare
    } else if (rarityLower.includes('holo') || rarityLower.includes('ex') || rarityLower.includes('gx') || rarityLower.includes('v')) {
        return 0xff6b6b; // Red for rare
    } else if (rarityLower.includes('uncommon')) {
        return 0x4ecdc4; // Teal for uncommon
    } else {
        return 0x95a5a6; // Gray for common
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('booster')
        .setDescription('Open a Pokemon TCG booster pack with 5 random cards!'),
    
    async execute(interaction) {
        try {
            // Initialize database
            const cardDB = new PokemonCardDatabase();
            
            // Check if database is loaded
            if (!cardDB.isDatabaseLoaded()) {
                throw new Error('Card database not loaded. Please run scraper.js first!');
            }

            // Get 5 random cards for the booster pack
            const boosterCards = [];
            for (let i = 0; i < 5; i++) {
                boosterCards.push(cardDB.getRandomCard());
            }

            // Create a single compact embed with all 5 cards
            const boosterEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🎴 Pokemon TCG Booster Pack')
                .setDescription(`**${interaction.user.username}** opened a booster pack!`)
                .setTimestamp()
                .setFooter({ 
                    text: `Booster opened by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                });

            // Add all 5 cards as fields with thumbnails in stacked format
            for (let i = 0; i < boosterCards.length; i++) {
                const card = boosterCards[i];
                const cardNumber = i + 1;
                
                // Get the main market price (prefer holofoil, then normal)
                let mainPrice = 'N/A';
                const prices = card.tcgplayer?.prices;
                if (prices) {
                    if (prices.holofoil?.market) {
                        mainPrice = `$${prices.holofoil.market}`;
                    } else if (prices.normal?.market) {
                        mainPrice = `$${prices.normal.market}`;
                    } else if (prices.reverseHolofoil?.market) {
                        mainPrice = `$${prices.reverseHolofoil.market}`;
                    }
                }
                
                // Create stacked format: Card name, then set info, then price, then image link
                const cardImageUrl = card.images?.large || card.images?.large || '';
                const stackedInfo = `${card.name}\n${card.set?.name || 'Unknown Set'} #${card.number || 'N/A'}\n**${mainPrice}**\n[View Card](${cardImageUrl})`;
                
                boosterEmbed.addFields({
                    name: `${cardNumber}.`,
                    value: stackedInfo,
                    inline: true
                });
            }
            
            // Send just the main embed with card information and image links
            await interaction.reply({ embeds: [boosterEmbed] });

        } catch (error) {
            console.error('Error opening booster pack:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('Sorry, I couldn\'t open a booster pack right now. Please try again later!')
                .setTimestamp();

            await interaction.editReply({ 
                embeds: [errorEmbed],
                ephemeral: true 
            });
        }
    },
};
