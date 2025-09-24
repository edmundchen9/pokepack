const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
    pokemonTCG: {
        apiKey: process.env.POKEMON_TCG_API_KEY,
        baseUrl: 'https://api.pokemontcg.io/v2',
    }
};

async function retryFailedPages() {
    console.log('🔄 Starting retry scraper for failed pages...');
    
    try {
        // Load existing cards
        const existingCardsPath = path.join(__dirname, 'cards.json');
        let allCards = [];
        
        if (fs.existsSync(existingCardsPath)) {
            const existingData = fs.readFileSync(existingCardsPath, 'utf8');
            allCards = JSON.parse(existingData);
            console.log(`📚 Loaded ${allCards.length} existing cards`);
        }
        
        // Failed pages from the previous run
        const failedPages = [2, 4, 5, 6, 7, 8, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 48, 50, 51, 52, 53, 55, 56, 57, 58, 61, 62, 63, 64, 65, 67, 71, 72, 73, 74, 75, 76, 77, 78];
        
        console.log(`🎯 Retrying ${failedPages.length} failed pages...`);
        
        let newCards = 0;
        const maxPageSize = 250;
        
        // Process failed pages one by one (more reliable)
        for (let i = 0; i < failedPages.length; i++) {
            const page = failedPages[i];
            let retries = 5; // More retries for failed pages
            let success = false;
            
            while (retries > 0 && !success) {
                try {
                    console.log(`📄 Retrying page ${page} (${retries} retries left)...`);
                    
                    const response = await axios.get(`${config.pokemonTCG.baseUrl}/cards`, {
                        headers: {
                            'X-Api-Key': config.pokemonTCG.apiKey
                        },
                        params: {
                            pageSize: maxPageSize,
                            page: page
                        },
                        timeout: 55000 // Longer timeout for retries
                    });

                    if (response.data && response.data.data) {
                        allCards.push(...response.data.data);
                        newCards += response.data.data.length;
                        console.log(`✅ Page ${page}: ${response.data.data.length} cards (New total: ${allCards.length})`);
                        success = true;
                    }
                    
                } catch (pageError) {
                    retries--;
                    console.error(`❌ Error on page ${page} (${retries} retries left):`, pageError.message);
                    
                    if (retries > 0) {
                        // Wait longer before retry
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }
            }
            
            if (!success) {
                console.log(`💥 Failed to scrape page ${page} after all retries`);
            }
            
            // Save progress every 5 pages
            if ((i + 1) % 5 === 0) {
                const tempPath = path.join(__dirname, `cards-retry-${i + 1}.json`);
                fs.writeFileSync(tempPath, JSON.stringify(allCards, null, 2));
                console.log(`💾 Progress saved: ${allCards.length} cards`);
            }
            
            // Longer delay between pages for retries
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Save final database
        const outputPath = path.join(__dirname, 'cards.json');
        fs.writeFileSync(outputPath, JSON.stringify(allCards, null, 2));
        
        console.log(`🎉 Retry scraping complete!`);
        console.log(`📊 Total cards: ${allCards.length} (Added ${newCards} new cards)`);
        console.log(`💾 Cards saved to: ${outputPath}`);
        console.log(`📁 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
        
        // Create updated summary
        const summary = {
            totalCards: allCards.length,
            lastUpdated: new Date().toISOString(),
            sets: [...new Set(allCards.map(card => card.set?.name).filter(Boolean))].length,
            rarities: [...new Set(allCards.map(card => card.rarity).filter(Boolean))].sort()
        };
        
        fs.writeFileSync(path.join(__dirname, 'cards-summary.json'), JSON.stringify(summary, null, 2));
        console.log('📋 Summary updated');
        
        return allCards;
        
    } catch (error) {
        console.error('❌ Retry scraping failed:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    retryFailedPages()
        .then(() => {
            console.log('🎴 Pokemon card database retry completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed to retry card database:', error);
            process.exit(1);
        });
}

module.exports = { retryFailedPages };
