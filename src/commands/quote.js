const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Creates a quote from the message replied to or last message sent if no reply made.')
		.addIntegerOption(option => option.setName('number').setDescription('Number of previous messages to quote (max 10).').setRequired(false)),
	async execute(interaction) {

		const guildId = interaction.guildId;
		const row = interaction.client.db.prepare('SELECT quote_channel_id FROM guild_settings WHERE guild_id = ?').get(guildId);
		if (!row || !row.quote_channel_id) {
			return interaction.reply({ content: 'Quote channel not set. Please ask an administrator to set it using /setchannel.', ephemeral: true });
		}

		const channel = interaction.channel;
		const numMessages = interaction.options.getInteger('number') || 1;

		const messages = await channel.messages.fetch({ limit: numMessages });
		const targetMsg = messages.first();

		const quoteContent = [...messages.values()].map(msg => `**${msg.author.username}:** ${msg.content}`).join('\n');

		if (!targetMsg) {
			return interaction.reply({ content: 'No message found to quote.', ephemeral: true });
		}

		if (targetMsg.author.id === interaction.client.user.id) {
			return interaction.reply({ content: 'You can\'t quote me!', ephemeral: true });
		}

		const quoteChannelId = row.quote_channel_id;
		const quoteChannel = await interaction.guild.channels.fetch(quoteChannelId);

		const colour = row.embed_color || '#F1C40F';

		const quoteEmbed = new EmbedBuilder()
			.setDescription(quoteContent || '_[Attachment/Embed]_')
			.setColor(colour)
			.setTimestamp(targetMsg.createdAt)
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
			});

		if (targetMsg.attachments.size > 0) {
			quoteEmbed.setImage(targetMsg.attachments.first().url);
		}

		await quoteChannel.send({ embeds: [quoteEmbed] });
		await interaction.reply({ content: 'Quoted!', ephemeral: true });
	},
};