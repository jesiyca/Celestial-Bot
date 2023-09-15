const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const channelSchema = require('../../models/channel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('invite user to your table')
        .addUserOption(option => 
            option.setName("target")
            .setDescription("user to be invited")
            .setRequired(true)
            ),

    async execute(interaction) {
        const { options, guild, member } = interaction;
        
        const target = options.getUser("target");
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

                embed.setTitle('Invite unsuccessful.')
                .setDescription(`You must be seated to use this command.`)
                .setColor('Blurple');

                interaction.reply({
                    embeds: [embed],
                    ephemeral: false
                });
            });
        
            let vcLeader = guild.members.cache.get(channel.userId);

            if (userId == vcLeader.id) {
                vc.permissionOverwrites.edit(target, {'Connect': true})
                embed.setTitle('Invite successful.')
                    .setDescription(`You have successfully invited <@${target.id}> to your table.`)
                    .setColor('Blurple');
            } else {
                embed.setTitle('Invite unsuccessful.')
                .setDescription(`You are not the owner of this table.`)
                .setColor('Blurple');
            }
        } else {
            embed.setTitle('Invite unsuccessful.')
                .setDescription(`You must be seated to use this command.`)
                .setColor('Blurple');
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
}