require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');

console.log(process.env.DISCORD_TOKEN);

if (!process.env.DISCORD_TOKEN) {
	console.error('ERROR: DISCORD_TOKEN is missing in .env file');
	process.exit(1);
}

const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);