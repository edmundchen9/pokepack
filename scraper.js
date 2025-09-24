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

async function scrapeAllCards() {
    console.log('🚀 Starting Pokemon TCG card scraping...');
    
    try {
        // First, get total count
        const initialResponse = await axios.get(`${config.pokemonTCG.baseUrl}/cards`, {
            headers: {
                'X-Api-Key': config.pokemonTCG.apiKey
            },
            params: {
                pageSize: 1,
                page: 1
            }
        });

        const totalCards = initialResponse.data.totalCount;
        const maxPageSize = 250; // API max
        const totalPages = Math.ceil(totalCards / maxPageSize);
        
        console.log(`📊 Found ${totalCards} total cards across ${totalPages} pages`);
        
        const allCards = [];
        let processedCards = 0;
        let failedPages = [];
        let startPage = 1;
        
        // Check for existing progress
        const progressFile = path.join(__dirname, 'scraping-progress.json');
        if (fs.existsSync(progressFile)) {
            const progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
            startPage = progress.lastCompletedPage + 1;
            console.log(`🔄 Resuming from page ${startPage}...`);
        }
        
        // Scrape all pages with retry logic
        for (let page = startPage; page <= totalPages; page++) {
            let retries = 3;
            let success = false;
            
            while (retries > 0 && !success) {
                try {
                    console.log(`📄 Scraping page ${page}/${totalPages} (${retries} retries left)...`);
                    
                    const response = await axios.get(`${config.pokemonTCG.baseUrl}/cards`, {
                        headers: {
                            'X-Api-Key': config.pokemonTCG.apiKey
                        },
                        params: {
                            pageSize: maxPageSize,
                            page: page
                        },
                        timeout: 30000 // 30 second timeout per page
                    });

                    if (response.data && response.data.data) {
                        allCards.push(...response.data.data);
                        processedCards += response.data.data.length;
                        console.log(`✅ Page ${page}: ${response.data.data.length} cards (Total: ${processedCards})`);
                        success = true;
                    }
                    
                } catch (pageError) {
                    retries--;
                    console.error(`❌ Error on page ${page} (${retries} retries left):`, pageError.message);
                    
                    if (retries === 0) {
                        failedPages.push(page);
                        console.log(`💥 Failed to scrape page ${page} after all retries`);
                    } else {
                        // Wait longer before retry
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
            
            // Save progress every 10 pages
            if (page % 10 === 0) {
                const tempPath = path.join(__dirname, `cards-temp-${page}.json`);
                fs.writeFileSync(tempPath, JSON.stringify(allCards, null, 2));
                console.log(`💾 Progress saved: ${allCards.length} cards`);
                
                // Save progress for resume capability
                const progress = {
                    lastCompletedPage: page,
                    totalCards: allCards.length,
                    failedPages: failedPages,
                    timestamp: new Date().toISOString()
                };
                fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
            }
            
            // Small delay to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Report results
        console.log(`🎉 Scraping complete! Collected ${allCards.length} cards`);
        
        if (failedPages.length > 0) {
            console.log(`⚠️  Failed pages: ${failedPages.join(', ')}`);
            console.log(`📊 Success rate: ${((totalPages - failedPages.length) / totalPages * 100).toFixed(1)}%`);
        } else {
            console.log(`✅ All ${totalPages} pages scraped successfully!`);
        }
        
        // Save to JSON file
        const outputPath = path.join(__dirname, 'cards.json');
        fs.writeFileSync(outputPath, JSON.stringify(allCards, null, 2));
        
        console.log(`💾 Cards saved to: ${outputPath}`);
        console.log(`📁 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
        
        // Create a summary
        const summary = {
            totalCards: allCards.length,
            expectedCards: totalCards,
            successRate: ((totalPages - failedPages.length) / totalPages * 100).toFixed(1),
            failedPages: failedPages,
            lastUpdated: new Date().toISOString(),
            sets: [...new Set(allCards.map(card => card.set?.name).filter(Boolean))].length,
            rarities: [...new Set(allCards.map(card => card.rarity).filter(Boolean))].sort()
        };
        
        fs.writeFileSync(path.join(__dirname, 'cards-summary.json'), JSON.stringify(summary, null, 2));
        console.log('📋 Summary saved to: cards-summary.json');
        
        // Clean up temp files
        console.log('🧹 Cleaning up temporary files...');
        for (let i = 10; i <= totalPages; i += 10) {
            const tempPath = path.join(__dirname, `cards-temp-${i}.json`);
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
        console.log('✅ Cleanup complete');
        
        // Clean up progress file
        if (fs.existsSync(progressFile)) {
            fs.unlinkSync(progressFile);
            console.log('✅ Progress file cleaned up');
        }
        
        return allCards;
        
    } catch (error) {
        console.error('❌ Scraping failed:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    scrapeAllCards()
        .then(() => {
            console.log('🎴 Pokemon card database created successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed to create card database:', error);
            process.exit(1);
        });
}

module.exports = { scrapeAllCards };
