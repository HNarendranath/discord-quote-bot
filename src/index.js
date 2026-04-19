require('dotenv').config();

const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

if (!process.env.DISCORD_TOKEN) {
	console.error('ERROR: DISCORD_TOKEN is missing in .env file');
	process.exit(1);
}

const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
	    GatewayIntentBits.GuildMessages,
	    GatewayIntentBits.MessageContent,
	],
});

// Load commands

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const commandFiles = commandFolders.filter;

for (const file of commandFiles) {
	const filePath = path.join(foldersPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
}

// Load events

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);