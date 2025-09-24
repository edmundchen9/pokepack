# Pokepack Discord Bot

A Discord bot built with Discord.js for Pokemon TCG card drops and collection management using the Pokemon TCG API.

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- A Discord application and bot token
- Pokemon TCG API key (included in setup)
- Git (optional, for version control)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd pokepack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `env.example` to `.env`
   - Your Pokemon TCG API key is already included in the example file
   ```bash
   cp env.example .env
   ```

4. **Configure your bot**
   - Edit the `.env` file with your Discord bot credentials
   - See [Discord Bot Setup](#discord-bot-setup) for detailed instructions

5. **Run the bot**
   ```bash
   npm start
   ```

## 🤖 Discord Bot Setup

### Creating a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your bot a name and click "Create"

### Creating a Bot

1. In your application, go to the "Bot" section
2. Click "Add Bot"
3. Copy the bot token (keep this secret!)
4. Paste it in your `.env` file as `DISCORD_TOKEN`

### Getting Client ID

1. In the "General Information" section
2. Copy the "Application ID"
3. Paste it in your `.env` file as `DISCORD_CLIENT_ID`

### Getting Your User ID

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click your username and select "Copy ID"
3. Paste it in your `.env` file as `BOT_OWNER_ID`

### Inviting Your Bot

1. Go to the "OAuth2" > "URL Generator" section
2. Select scopes: `bot` and `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Attach Files
   - Read Message History
   - Add Reactions
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

## 📁 Project Structure

```
pokepack/
├── index.js          # Main bot file
├── config.js         # Bot configuration with TCG API settings
├── package.json      # Dependencies and scripts
├── .env              # Environment variables (create from env.example)
├── .gitignore        # Git ignore rules
├── env.example       # Environment variables template
├── README.md         # This file
└── commands/         # Slash command files
    ├── ping.js       # Basic ping command
    └── drop.js       # Pokemon TCG card drop command
```

## 🎴 Features

### Card Drop System

- **`/drop`** - Get a random Pokemon TCG card
  - Shows card name, set, set number, rarity, type, HP, and market price
  - Displays high-quality card image
  - Color-coded embeds based on rarity
  - Uses Pokemon TCG API for authentic card data

### Card Information Displayed

- **Card Name** - The Pokemon's name
- **Set** - Which TCG set the card is from
- **Set Number** - The card's number in the set
- **Rarity** - Card rarity (Common, Uncommon, Rare, etc.)
- **Type** - Pokemon type(s)
- **HP** - Hit Points
- **Market Price** - Current market value from TCGPlayer
- **Card Image** - High-resolution card artwork

## 🛠️ Development

### Available Scripts

- `npm start` - Start the bot
- `npm run dev` - Start the bot with auto-restart (requires nodemon)

### Adding Commands

1. Create a new file in the `commands/` folder
2. Follow this structure:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description'),
    async execute(interaction) {
        await interaction.reply('Response!');
    },
};
```

3. The bot will automatically load your command on restart

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your bot's token | Yes |
| `DISCORD_CLIENT_ID` | Your bot's client ID | Yes |
| `POKEMON_TCG_API_KEY` | Pokemon TCG API key | Yes |
| `BOT_OWNER_ID` | Your Discord user ID | No |
| `DISCORD_GUILD_ID` | Specific guild ID for testing | No |
| `LOG_LEVEL` | Logging level (info, debug, etc.) | No |
| `LOG_TO_FILE` | Whether to log to file | No |

## 🔧 Configuration

The `config.js` file contains various bot settings you can customize:

- **Pokemon TCG API settings** - API endpoint and rate limiting
- **Rarity weights** - Control drop rates for different card rarities
- **Drop system settings** - Cooldowns and limits
- **Feature flags** - Enable/disable specific features

### Rarity System

The bot uses weighted rarity drops:
- **Common**: 40% chance
- **Uncommon**: 25% chance  
- **Rare**: 15% chance
- **Rare Holo**: 10% chance
- **Rare Holo EX/GX/V**: 2-5% chance
- **Ultra Rare**: 0.5-1% chance

## 📝 Commands

### `/ping`
- Replies with "Pong!" and shows bot latency
- Useful for testing if the bot is responsive

### `/drop`
- Fetches a random Pokemon TCG card
- Shows detailed card information and image
- Uses Pokemon TCG API for authentic data

## 🐛 Troubleshooting

### Common Issues

1. **Bot doesn't respond to commands**
   - Check if the bot token is correct
   - Ensure the bot has proper permissions
   - Verify the bot is online in your server

2. **Card drops not working**
   - Verify your Pokemon TCG API key is correct
   - Check if the API is accessible
   - Ensure you have internet connection

3. **Commands not registering**
   - Make sure command files are in the `commands/` folder
   - Check the command file structure
   - Restart the bot after adding new commands

### Getting Help

- Check the [Discord.js Documentation](https://discord.js.org/#/docs)
- Check the [Pokemon TCG API Documentation](https://docs.pokemontcg.io/)
- Join the [Discord.js Discord Server](https://discord.gg/djs)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you need help setting up or using this bot, feel free to:
- Open an issue on GitHub
- Contact the developer
- Check the documentation

---

**Happy card collecting! 🎴✨**
