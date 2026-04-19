require('dotenv').config();

const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const Database = require('better-sqlite3');
const db = new Database('database.sqlite');


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

// Create table for guild settings if it doesn't exist

db.prepare(`
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        quote_channel_id TEXT,
		embed_color TEXT DEFAULT '#34495E'
    )
`).run();

client.db = db;

// Load commands

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

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


client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	const rest = new REST().setToken(process.env.DISCORD_TOKEN);
	const cmdData = client.commands.map(cmd => cmd.data.toJSON());

	try {
		await rest.put(
			Routes.applicationCommands(readyClient.user.id),
			{ body: cmdData },
		);
		console.log('Successfully reloaded application (/) commands.');
	}
	catch (e) {
		console.error(e);
	}
});


// Log in to Discord with your client's token
client.login(token);
