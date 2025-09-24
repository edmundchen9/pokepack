const config = {
    // Bot settings
    bot: {
        name: 'Pokepack Bot',
        version: '1.0.0',
        description: 'A Discord bot for Pokemon TCG card drops and collection',
        prefix: '!', // Default prefix for text commands
        ownerId: process.env.BOT_OWNER_ID || '', // Your Discord user ID
    },
    
    // Discord settings
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.DISCORD_CLIENT_ID,
        guildId: process.env.DISCORD_GUILD_ID, // Optional: for development/testing
    },
    
    // Bot permissions
    permissions: [
        'SendMessages',
        'UseSlashCommands',
        'EmbedLinks',
        'AttachFiles',
        'ReadMessageHistory',
        'AddReactions',
    ],
    
    // Pokemon TCG API settings
    pokemonTCG: {
        apiKey: process.env.POKEMON_TCG_API_KEY,
        baseUrl: 'https://api.pokemontcg.io/v2',
        // Card rarity weights for drops (higher = more common)
        rarityWeights: {
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
        },
        // Maximum cards to fetch per request
        maxCardsPerRequest: 250,
    },
    
    // Drop system settings
    drops: {
        cooldownMinutes: 5, // Cooldown between drops per user
        maxDropsPerDay: 50, // Maximum drops per user per day
        dropChannels: [], // Specific channels where drops are allowed (empty = all channels)
    },
    
    // Logging settings
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        logToFile: process.env.LOG_TO_FILE === 'true',
        logFile: 'bot.log',
    },
    
    // Feature flags
    features: {
        slashCommands: true,
        messageCommands: false,
        autoResponses: false,
        moderation: false,
        cardDrops: true,
        cardCollection: false, // Future feature
    }
};

module.exports = config;
