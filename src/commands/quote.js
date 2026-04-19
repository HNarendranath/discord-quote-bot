const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Creates a quote from the message replied to or last message sent if no reply made.'),
	async execute(interaction) {
		let targetMsg;;

		const channel = interaction.channel;

		const cmdMsg = await channel.messages.fetch(interaction.id).catch(() => null);
		const replyRef = cmdMsg?.reference;

		if (replyRef) {
			// User replied to message
			targetMsg = await channel.messages.fetch(replyRef.messageId);
		}
		else {
			// No reply, quote last message sent by user
			const lastMsg = await channel.messages.fetch({ limit: 1, before: interaction.id });
			targetMsg = lastMsg.first();
		}

		if (!targetMsg) {
			return interaction.reply({ content: 'No message found to quote.', ephemeral: true });
		}

		const quoteChannelId = '';
		const quoteChannel = interaction.guild.channels.cache.get(quoteChannelId);

		const quoteEmbed = new EmbedBuilder()
			.setAuthor({
				name: targetMsg.author.username,
				iconURL: targetMsg.author.displayAvatarURL(),
			})
			.setDescription(targetMsg.content || '_[Attachment/Embed]_')
			.setColor('Random')
			.setTimestamp(targetMsg.createdAt)
			.setFooter({
				text: `Quoted by ${interaction.user.username}`,
			});

		if (targetMsg.attachments.size > 0) {
			quoteEmbed.setImage(targetMsg.attachments.first().url);
		}

		await quoteChannel.send({ embeds: [quoteEmbed] });
		await interaction.reply({ content: 'Quoted!', ephemeral: true });
	},
};