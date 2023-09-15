const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const channelSchema = require('../../models/channel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limit')
        .setDescription('limit amount of access to your table')
        .addIntegerOption(option => 
            option.setName("amount")
            .setDescription("amount of people that can access the table")
            .setMinValue(0)
            .setMaxValue(99)
            .setRequired(true)
            ),

    async execute(interaction) {
        const { options, guild, member } = interaction;
        
        const amount = options.getInteger("amount");
        const userId = member.id;
        const vc = member.voice.channel;

        const embed = new EmbedBuilder();
        
        if (vc) {
            let vcId = vc.id;
            let channel = await channelSchema.findOne({
                channelId: vcId
            }).then(function(result) {
                return result;
            }).catch(function(err) {
                console.log(err)

                embed.setTitle('Limit unsuccessful.')
                .setDescription(`You must be seated to use this command.`)
                .setColor('Blurple');

                interaction.reply({
                    embeds: [embed],
                    ephemeral: false
                });
            });
        
            let vcLeader = guild.members.cache.get(channel.userId);

            if (userId == vcLeader.id) {
                vc.setUserLimit(amount);
                embed.setTitle('Limit successful.')
                    .setDescription(`You have successfully limited access to your table.`)
                    .setColor('Blurple');
            } else {
                embed.setTitle('Limit unsuccessful.')
                .setDescription(`You are not the owner of this table.`)
                .setColor('Blurple');
            }
        } else {
            embed.setTitle('Limit unsuccessful.')
                .setDescription(`You must be seated to use this command.`)
                .setColor('Blurple');
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
}