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

async function scrapeAllCardsParallel() {
    console.log('🚀 Starting FAST Pokemon TCG card scraping with parallel requests...');
    
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
        const maxPageSize = 250;
        const totalPages = Math.ceil(totalCards / maxPageSize);
        
        console.log(`📊 Found ${totalCards} total cards across ${totalPages} pages`);
        
        const allCards = [];
        const failedPages = [];
        const concurrency = 5; // Process 5 pages at once
        
        // Process pages in batches
        for (let batchStart = 1; batchStart <= totalPages; batchStart += concurrency) {
            const batchEnd = Math.min(batchStart + concurrency - 1, totalPages);
            console.log(`📄 Processing batch: pages ${batchStart}-${batchEnd}`);
            
            // Create promises for this batch
            const batchPromises = [];
            for (let page = batchStart; page <= batchEnd; page++) {
                batchPromises.push(scrapePage(page, maxPageSize));
            }
            
            // Wait for all pages in this batch
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Process results
            batchResults.forEach((result, index) => {
                const page = batchStart + index;
                if (result.status === 'fulfilled' && result.value) {
                    allCards.push(...result.value);
                    console.log(`✅ Page ${page}: ${result.value.length} cards`);
                } else {
                    failedPages.push(page);
                    console.log(`❌ Page ${page}: Failed`);
                }
            });
            
            console.log(`📊 Batch complete: ${allCards.length} total cards`);
            
            // Save progress every batch
            const tempPath = path.join(__dirname, `cards-temp-batch-${batchEnd}.json`);
            fs.writeFileSync(tempPath, JSON.stringify(allCards, null, 2));
            console.log(`💾 Progress saved: ${allCards.length} cards`);
            
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Save final database
        const outputPath = path.join(__dirname, 'cards.json');
        fs.writeFileSync(outputPath, JSON.stringify(allCards, null, 2));
        
        console.log(`🎉 FAST scraping complete! Collected ${allCards.length} cards`);
        console.log(`💾 Cards saved to: ${outputPath}`);
        console.log(`📁 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
        
        if (failedPages.length > 0) {
            console.log(`⚠️  Failed pages: ${failedPages.join(', ')}`);
        }
        
        return allCards;
        
    } catch (error) {
        console.error('❌ Fast scraping failed:', error.message);
        throw error;
    }
}

async function scrapePage(page, pageSize) {
    try {
        const response = await axios.get(`${config.pokemonTCG.baseUrl}/cards`, {
            headers: {
                'X-Api-Key': config.pokemonTCG.apiKey
            },
            params: {
                pageSize: pageSize,
                page: page
            },
            timeout: 50000 // 20 second timeout
        });

        return response.data?.data || [];
    } catch (error) {
        console.error(`❌ Error on page ${page}:`, error.message);
        return null;
    }
}

// Run if called directly
if (require.main === module) {
    scrapeAllCardsParallel()
        .then(() => {
            console.log('🎴 FAST Pokemon card database created successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed to create fast card database:', error);
            process.exit(1);
        });
}

module.exports = { scrapeAllCardsParallel };
