const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('Sets the channel for quotes to be posted in.')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('The channel to post quotes in.')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		const guildId = interaction.guildId;

		const stmt = interaction.client.db.prepare(`
            INSERT INTO guild_settings (guild_id, quote_channel_id) 
            VALUES (?, ?) 
            ON CONFLICT(guild_id) DO UPDATE SET quote_channel_id = excluded.quote_channel_id`,
		);

		stmt.run(guildId, channel.id);

		await interaction.reply({ content: `Quote channel set to ${channel}.`, ephemeral: true });
	},
};
