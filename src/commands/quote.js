const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Creates a quote from the message replied to or last message sent if no reply made.'),
	async execute(interaction) {

		const channel = interaction.channel;


		const lastMsg = await channel.messages.fetch({ limit: 1 });
		const targetMsg = lastMsg.first();


		if (!targetMsg) {
			return interaction.reply({ content: 'No message found to quote.', ephemeral: true });
		}

		if (targetMsg.author.id === interaction.client.user.id) {
			return interaction.reply({ content: 'You can\'t quote me!', ephemeral: true });
		}

		const quoteChannelId = process.env.QUOTE_CHANNEL_ID;
		const quoteChannel = await interaction.guild.channels.fetch(quoteChannelId);

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