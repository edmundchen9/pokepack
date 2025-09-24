const fs = require('fs');
const path = require('path');

class PokemonCardDatabase {
    constructor() {
        this.cardsPath = path.join(__dirname, 'cards.json');
        this.summaryPath = path.join(__dirname, 'cards-summary.json');
        this.cards = null;
        this.summary = null;
        this.loadDatabase();
    }

    loadDatabase() {
        try {
            if (fs.existsSync(this.cardsPath)) {
                const data = fs.readFileSync(this.cardsPath, 'utf8');
                this.cards = JSON.parse(data);
                console.log(`📚 Loaded ${this.cards.length} cards from local database`);
                
                if (fs.existsSync(this.summaryPath)) {
                    const summaryData = fs.readFileSync(this.summaryPath, 'utf8');
                    this.summary = JSON.parse(summaryData);
                    console.log(`📊 Database last updated: ${this.summary.lastUpdated}`);
                }
            } else {
                console.log('⚠️  No local card database found. Run scraper.js first!');
                this.cards = [];
            }
        } catch (error) {
            console.error('❌ Error loading card database:', error.message);
            this.cards = [];
        }
    }

    getRandomCard() {
        if (!this.cards || this.cards.length === 0) {
            throw new Error('No cards available in database');
        }
        
        const randomIndex = Math.floor(Math.random() * this.cards.length);
        return this.cards[randomIndex];
    }

    getCardsByRarity(rarity) {
        if (!this.cards) return [];
        return this.cards.filter(card => 
            card.rarity && card.rarity.toLowerCase().includes(rarity.toLowerCase())
        );
    }

    getCardsBySet(setName) {
        if (!this.cards) return [];
        return this.cards.filter(card => 
            card.set && card.set.name && card.set.name.toLowerCase().includes(setName.toLowerCase())
        );
    }

    getCardsByType(type) {
        if (!this.cards) return [];
        return this.cards.filter(card => 
            card.types && card.types.some(t => t.toLowerCase().includes(type.toLowerCase()))
        );
    }

    getWeightedRandomCard() {
        if (!this.cards || this.cards.length === 0) {
            throw new Error('No cards available in database');
        }

        const rarityWeights = {
            'Common': 40,
            'Uncommon': 25,
            'Rare': 15,
            'Rare Holo': 10,
            'Rare Holo EX': 5,
            'Rare Holo GX': 3,
            'Rare Holo V': 2,
            'Rare Holo VMAX': 1,
            'Rare Holo VSTAR': 1,
            'Rare Ultra': 1,
            'Rare Secret': 0.5,
            'Rare Rainbow': 0.5,
            'Rare Shiny': 0.5,
        };

        // Create weighted pool
        const weightedPool = [];
        
        this.cards.forEach(card => {
            const rarity = card.rarity || 'Common';
            const weight = rarityWeights[rarity] || 1;
            
            // Add card multiple times based on weight
            for (let i = 0; i < weight * 10; i++) {
                weightedPool.push(card);
            }
        });

        // Pick random card from weighted pool
        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        return weightedPool[randomIndex];
    }

    getDatabaseStats() {
        if (!this.cards) return null;
        
        const stats = {
            totalCards: this.cards.length,
            sets: [...new Set(this.cards.map(card => card.set?.name).filter(Boolean))].length,
            rarities: {},
            types: {},
            lastUpdated: this.summary?.lastUpdated || 'Unknown'
        };

        // Count rarities
        this.cards.forEach(card => {
            const rarity = card.rarity || 'Unknown';
            stats.rarities[rarity] = (stats.rarities[rarity] || 0) + 1;
        });

        // Count types
        this.cards.forEach(card => {
            if (card.types) {
                card.types.forEach(type => {
                    stats.types[type] = (stats.types[type] || 0) + 1;
                });
            }
        });

        return stats;
    }

    isDatabaseLoaded() {
        return this.cards && this.cards.length > 0;
    }
}

module.exports = PokemonCardDatabase;
