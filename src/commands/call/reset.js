const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const channelSchema = require('../../models/channel');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('reset access permissions to your table'),

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
                console.log(err)

                embed.setTitle('Reset unsuccessful.')
                .setDescription(`You must be seated to use this command.`)
                .setColor('Blurple');

                interaction.reply({
                    embeds: [embed],
                    ephemeral: false
                });
            });
        
            let vcLeader = guild.members.cache.get(channel.userId);

            if (userId == vcLeader.id) {
                vc.permissionOverwrites.set([
                    {
                        id: userId,
                        allow: ['Connect']
                    },
                    {
                        id: guild.roles.cache.get(config.tierOneRole),
                        allow: ['Connect']
                    },
                    {
                        id: guild.roles.cache.get(config.tierTwoRole),
                        allow: ['Connect']
                    },
                    {
                        id: guild.roles.cache.get(config.botRole),
                        allow: ['Connect']
                    },
                    {
                        id: guild.id,
                        deny: ['Connect']
                    }
                ])
                embed.setTitle('Reset successful.')
                    .setDescription(`You have successfully reset the access permissions to your table.`)
                    .setColor('Blurple');
            } else {
                embed.setTitle('Reset unsuccessful.')
                .setDescription(`You are not the owner of this table.`)
                .setColor('Blurple');
            }
        } else {
            embed.setTitle('Reset unsuccessful.')
                .setDescription(`You must be seated to use this command.`)
                .setColor('Blurple');
        }

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
}