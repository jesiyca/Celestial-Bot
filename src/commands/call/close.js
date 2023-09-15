const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const channelSchema = require('../../models/channel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('close public access to your table'),

    async execute(interaction) {
        const { guild, member } = interaction;
        
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
                console.log(err);
                
                embed.setTitle('Close unsuccessful.')
                .setDescription(`You must be seated to use this command.`)
                .setColor('Blurple');

                interaction.reply({
                    embeds: [embed],
                    ephemeral: false
                });
            });
        
            let vcLeader = guild.members.cache.get(channel.userId);

            if (userId == vcLeader.id) {
                vc.permissionOverwrites.edit(guild.roles.everyone, {'Connect': false})
                embed.setTitle('Close successful.')
                    .setDescription(`You have successfully closed off public access to your table.`)
                    .setColor('Blurple');
            } else {
                embed.setTitle('Close unsuccessful.')
                .setDescription(`You are not the owner of this table.`)
                .setColor('Blurple');
            }
        } else {
            embed.setTitle('Close unsuccessful.')
                .setDescription(`You must be seated to use this command.`)
                .setColor('Blurple');
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
}