const fs = require('fs');
const path = require('path');

class DatabaseMerger {
    constructor() {
        this.projectDir = __dirname;
        this.allCards = [];
        this.duplicateIds = new Set();
        this.processedFiles = [];
    }

    async mergeAllDatabases() {
        console.log('🔄 Starting database merger...');
        
        try {
            // Find all card database files
            const cardFiles = this.findCardFiles();
            console.log(`📁 Found ${cardFiles.length} card database files`);
            
            // Process each file
            for (const file of cardFiles) {
                await this.processFile(file);
            }
            
            // Remove duplicates and clean data
            this.removeDuplicates();
            
            // Sort cards by ID for consistency
            this.sortCards();
            
            // Save merged database
            this.saveMergedDatabase();
            
            // Clean up temporary files
            this.cleanupTempFiles();
            
            console.log('🎉 Database merger completed successfully!');
            
        } catch (error) {
            console.error('❌ Database merger failed:', error.message);
            throw error;
        }
    }

    findCardFiles() {
        const files = fs.readdirSync(this.projectDir);
        const cardFiles = [];
        
        // Look for various card database file patterns
        const patterns = [
            'cards.json',
            'cards-retry-*.json',
            'cards-temp-batch-*.json',
            'cards-temp-*.json'
        ];
        
        for (const file of files) {
            if (file.endsWith('.json') && (
                file.startsWith('cards') || 
                file.includes('card')
            )) {
                cardFiles.push(path.join(this.projectDir, file));
            }
        }
        
        return cardFiles;
    }

    async processFile(filePath) {
        try {
            const fileName = path.basename(filePath);
            console.log(`📄 Processing ${fileName}...`);
            
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const cards = JSON.parse(fileContent);
            
            if (Array.isArray(cards)) {
                this.allCards.push(...cards);
                console.log(`✅ ${fileName}: ${cards.length} cards`);
                this.processedFiles.push(fileName);
            } else {
                console.log(`⚠️  ${fileName}: Not a valid card array`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
        }
    }

    removeDuplicates() {
        console.log('🔍 Removing duplicates...');
        
        const uniqueCards = [];
        const seenIds = new Set();
        
        for (const card of this.allCards) {
            if (card && card.id) {
                if (!seenIds.has(card.id)) {
                    seenIds.add(card.id);
                    uniqueCards.push(card);
                } else {
                    this.duplicateIds.add(card.id);
                }
            }
        }
        
        this.allCards = uniqueCards;
        console.log(`✅ Removed ${this.duplicateIds.size} duplicate cards`);
        console.log(`📊 Final unique cards: ${this.allCards.length}`);
    }

    sortCards() {
        console.log('📊 Sorting cards by ID...');
        
        this.allCards.sort((a, b) => {
            if (a.id && b.id) {
                return a.id.localeCompare(b.id);
            }
            return 0;
        });
        
        console.log('✅ Cards sorted by ID');
    }

    saveMergedDatabase() {
        console.log('💾 Saving merged database...');
        
        const outputPath = path.join(this.projectDir, 'cards.json');
        fs.writeFileSync(outputPath, JSON.stringify(this.allCards, null, 2));
        
        console.log(`✅ Merged database saved: ${outputPath}`);
        console.log(`📁 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
        
        // Create comprehensive summary
        const summary = {
            totalCards: this.allCards.length,
            lastMerged: new Date().toISOString(),
            processedFiles: this.processedFiles,
            duplicateCount: this.duplicateIds.size,
            duplicateIds: Array.from(this.duplicateIds).slice(0, 10), // Show first 10 duplicates
            sets: [...new Set(this.allCards.map(card => card.set?.name).filter(Boolean))].length,
            rarities: [...new Set(this.allCards.map(card => card.rarity).filter(Boolean))].sort(),
            types: [...new Set(this.allCards.flatMap(card => card.types || []))].sort(),
            cardsWithImages: this.allCards.filter(card => card.images?.large || card.images?.small).length,
            cardsWithPrices: this.allCards.filter(card => card.tcgplayer?.prices).length
        };
        
        fs.writeFileSync(path.join(this.projectDir, 'cards-summary.json'), JSON.stringify(summary, null, 2));
        console.log('📋 Comprehensive summary saved');
        
        // Log summary stats
        console.log('\n📊 Database Summary:');
        console.log(`   Total Cards: ${summary.totalCards}`);
        console.log(`   Sets: ${summary.sets}`);
        console.log(`   Rarities: ${summary.rarities.length}`);
        console.log(`   Types: ${summary.types.length}`);
        console.log(`   Cards with Images: ${summary.cardsWithImages}`);
        console.log(`   Cards with Prices: ${summary.cardsWithPrices}`);
        console.log(`   Duplicates Removed: ${summary.duplicateCount}`);
    }

    cleanupTempFiles() {
        console.log('🧹 Cleaning up temporary files...');
        
        const filesToCleanup = [
            'cards-retry-*.json',
            'cards-temp-batch-*.json',
            'cards-temp-*.json'
        ];
        
        let cleanedCount = 0;
        
        for (const file of this.processedFiles) {
            if (file !== 'cards.json' && file !== 'cards-summary.json') {
                try {
                    const filePath = path.join(this.projectDir, file);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        cleanedCount++;
                    }
                } catch (error) {
                    console.error(`❌ Error cleaning up ${file}:`, error.message);
                }
            }
        }
        
        console.log(`✅ Cleaned up ${cleanedCount} temporary files`);
    }

    validateDatabase() {
        console.log('🔍 Validating merged database...');
        
        const issues = [];
        
        // Check for required fields
        for (let i = 0; i < Math.min(100, this.allCards.length); i++) {
            const card = this.allCards[i];
            
            if (!card.id) issues.push(`Card ${i}: Missing ID`);
            if (!card.name) issues.push(`Card ${i}: Missing name`);
            if (!card.set) issues.push(`Card ${i}: Missing set`);
        }
        
        if (issues.length > 0) {
            console.log(`⚠️  Found ${issues.length} validation issues:`);
            issues.slice(0, 5).forEach(issue => console.log(`   ${issue}`));
        } else {
            console.log('✅ Database validation passed');
        }
        
        return issues.length === 0;
    }
}

// Run if called directly
if (require.main === module) {
    const merger = new DatabaseMerger();
    
    merger.mergeAllDatabases()
        .then(() => {
            console.log('🎴 Database merger completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Database merger failed:', error);
            process.exit(1);
        });
}

module.exports = DatabaseMerger;
