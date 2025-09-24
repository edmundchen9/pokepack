const { scrapeAllCards } = require('./scraper');
const fs = require('fs');
const path = require('path');

async function updateDatabase() {
    console.log('🔄 Starting Pokemon card database update...');
    
    try {
        // Backup existing database if it exists
        const cardsPath = path.join(__dirname, 'cards.json');
        const backupPath = path.join(__dirname, 'cards-backup.json');
        
        if (fs.existsSync(cardsPath)) {
            console.log('💾 Creating backup of existing database...');
            fs.copyFileSync(cardsPath, backupPath);
            console.log('✅ Backup created');
        }
        
        // Scrape fresh data
        console.log('🚀 Scraping fresh card data...');
        const newCards = await scrapeAllCards();
        
        console.log('🎉 Database update completed successfully!');
        console.log(`📊 Total cards: ${newCards.length}`);
        
        return newCards;
        
    } catch (error) {
        console.error('❌ Database update failed:', error.message);
        
        // Restore backup if update failed
        const cardsPath = path.join(__dirname, 'cards.json');
        const backupPath = path.join(__dirname, 'cards-backup.json');
        
        if (fs.existsSync(backupPath)) {
            console.log('🔄 Restoring backup...');
            fs.copyFileSync(backupPath, cardsPath);
            console.log('✅ Backup restored');
        }
        
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    updateDatabase()
        .then(() => {
            console.log('🎴 Pokemon card database updated successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed to update card database:', error);
            process.exit(1);
        });
}

module.exports = { updateDatabase };
