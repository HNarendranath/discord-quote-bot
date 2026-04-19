const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embedcolour')
		.setDescription('Set the colour of the embed for quoted messages')
		.addStringOption(option =>
			option.setName('hex')
				.setDescription('The hex colour code for the embed')
				.setRequired(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const hex = interaction.options.getString('hex');
		const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

		if (!hexRegex.test(hex)) {
			return interaction.reply({ content: 'Invalid hex colour code, use format like #FFFFFF', ephemeral: true });
		}

		const stmt = interaction.client.db.prepare(`
            INSERT INTO guild_settings (guild_id, embed_color) 
            VALUES (?, ?) 
            ON CONFLICT(guild_id) DO UPDATE SET embed_color = excluded.embed_color
		`);

		stmt.run(interaction.guildId, hex);

		await interaction.reply({ content: `Embed colour set to **${hex}**.`, ephemeral: true });
	},
};