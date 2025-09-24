const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class PriceUpdater {
    constructor() {
        this.cardsPath = path.join(__dirname, 'cards.json');
        this.cards = null;
        this.loadDatabase();
    }

    loadDatabase() {
        try {
            if (fs.existsSync(this.cardsPath)) {
                const data = fs.readFileSync(this.cardsPath, 'utf8');
                this.cards = JSON.parse(data);
                console.log(`📚 Loaded ${this.cards.length} cards from database`);
            } else {
                console.log('⚠️  No card database found. Run scraper first!');
                this.cards = [];
            }
        } catch (error) {
            console.error('❌ Error loading card database:', error.message);
            this.cards = [];
        }
    }

    async updatePricesFromPokemonPriceTracker() {
        console.log('💰 Starting price updates from Pokemon Price Tracker...');
        
        if (!this.cards || this.cards.length === 0) {
            throw new Error('No cards available in database');
        }

        let updatedCount = 0;
        const batchSize = 50; // Process in batches to avoid overwhelming the API
        
        for (let i = 0; i < this.cards.length; i += batchSize) {
            const batch = this.cards.slice(i, i + batchSize);
            console.log(`📊 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(this.cards.length/batchSize)}...`);
            
            for (const card of batch) {
                try {
                    // Get updated prices for this card
                    const updatedPrices = await this.getCardPrices(card);
                    
                    if (updatedPrices) {
                        // Update the card with new pricing data
                        card.tcgplayer = updatedPrices;
                        updatedCount++;
                        
                        if (updatedCount % 10 === 0) {
                            console.log(`✅ Updated ${updatedCount} cards so far...`);
                        }
                    }
                    
                    // Small delay to be nice to the API
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    console.error(`❌ Error updating prices for ${card.name}:`, error.message);
                }
            }
            
            // Save progress every batch
            this.saveDatabase();
            console.log(`💾 Progress saved: ${updatedCount} cards updated`);
            
            // Delay between batches
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`🎉 Price update complete! Updated ${updatedCount} cards`);
        return updatedCount;
    }

    async getCardPrices(card) {
        try {
            // Use Pokemon Price Tracker API (free tier)
            const response = await axios.get(`https://api.pokemonpricetracker.com/v1/cards/${card.id}`, {
                timeout: 10000
            });

            if (response.data && response.data.prices) {
                return {
                    prices: {
                        holofoil: { market: response.data.prices.holofoil?.market || null },
                        reverseHolofoil: { market: response.data.prices.reverseHolofoil?.market || null },
                        normal: { market: response.data.prices.normal?.market || null },
                        '1stEditionHolofoil': { market: response.data.prices.firstEdition?.market || null }
                    },
                    lastUpdated: new Date().toISOString()
                };
            }
            
            return null;
            
        } catch (error) {
            // If Pokemon Price Tracker fails, try alternative method
            return await this.getCardPricesAlternative(card);
        }
    }

    async getCardPricesAlternative(card) {
        try {
            // Alternative: Use card name to search for prices
            const searchTerm = encodeURIComponent(card.name);
            const response = await axios.get(`https://api.pokemonpricetracker.com/v1/search?q=${searchTerm}`, {
                timeout: 10000
            });

            if (response.data && response.data.results && response.data.results.length > 0) {
                const matchingCard = response.data.results.find(result => 
                    result.name.toLowerCase() === card.name.toLowerCase()
                );
                
                if (matchingCard && matchingCard.prices) {
                    return {
                        prices: {
                            holofoil: { market: matchingCard.prices.holofoil?.market || null },
                            reverseHolofoil: { market: matchingCard.prices.reverseHolofoil?.market || null },
                            normal: { market: matchingCard.prices.normal?.market || null },
                            '1stEditionHolofoil': { market: matchingCard.prices.firstEdition?.market || null }
                        },
                        lastUpdated: new Date().toISOString()
                    };
                }
            }
            
            return null;
            
        } catch (error) {
            console.error(`❌ Alternative price lookup failed for ${card.name}:`, error.message);
            return null;
        }
    }

    saveDatabase() {
        try {
            fs.writeFileSync(this.cardsPath, JSON.stringify(this.cards, null, 2));
            
            // Update summary
            const summary = {
                totalCards: this.cards.length,
                lastUpdated: new Date().toISOString(),
                sets: [...new Set(this.cards.map(card => card.set?.name).filter(Boolean))].length,
                rarities: [...new Set(this.cards.map(card => card.rarity).filter(Boolean))].sort()
            };
            
            fs.writeFileSync(path.join(__dirname, 'cards-summary.json'), JSON.stringify(summary, null, 2));
            
        } catch (error) {
            console.error('❌ Error saving database:', error.message);
        }
    }

    async updatePricesDaily() {
        console.log('🔄 Starting daily price update...');
        
        try {
            const updatedCount = await this.updatePricesFromPokemonPriceTracker();
            
            console.log(`✅ Daily price update complete! Updated ${updatedCount} cards`);
            console.log(`💾 Database saved with updated prices`);
            
            return updatedCount;
            
        } catch (error) {
            console.error('❌ Daily price update failed:', error.message);
            throw error;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const updater = new PriceUpdater();
    
    updater.updatePricesDaily()
        .then((count) => {
            console.log(`🎴 Price update completed successfully! Updated ${count} cards`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Price update failed:', error);
            process.exit(1);
        });
}

module.exports = PriceUpdater;
