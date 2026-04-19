const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot || !message.mentions.has(message.client.user)) return;

		const refMsg = message.reference ? await message.channel.messages.fetch(message.reference.messageId) : null;

		if (!refMsg) return;

		const cleanContent = message.content.replace(/<@!?\d+>/g, '').trim();
		const args = cleanContent.match(/\d+/);
		const count = args ? Math.min(parseInt(args[0]), 10) : 1;

		let quoteContent = [];

		if (count > 1) {
			const toQuote = await message.channel.messages.fetch({ before: refMsg.id, limit: count - 1 });
			quoteContent += [...toQuote.values()].reverse().map(msg => `**${msg.author.username}:** ${msg.content}`).join('\n');
		}

		quoteContent += `\n**${refMsg.author.username}:** ${refMsg.content}`;

		const row = message.client.db.prepare('SELECT quote_channel_id FROM guild_settings WHERE guild_id = ?').get(message.guildId);
		if (!row) return;

		const quoteChannel = await message.guild.channels.fetch(row.quote_channel_id);

		const quoteEmbed = new EmbedBuilder()
			.setDescription(quoteContent || '_[Attachment/Embed]_')
			.setColor('#F1C40F')
			.setTimestamp(refMsg.createdAt)
			.setFooter({
				text: `Requested by ${message.author.username}`,
			});

		if (refMsg.attachments.size > 0) {
			quoteEmbed.setImage(refMsg.attachments.first().url);
		}

		await quoteChannel.send({ embeds: [quoteEmbed] });

	},
};

