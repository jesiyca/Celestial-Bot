const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('commands menu'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Help Menu')
            .setDescription('Please find the list of usable commands below.')
            .setColor('Blurple')
            .addFields(
                {
                    name: '/open',
                    value: 'opens the call to everyone in passerby role',
                    inline: false
                }, 
                {
                    name: '/close',
                    value: 'locks the call to everyone in passerby role',
                    inline: false
                }, 
                {
                    name: '/invite <user>',
                    value: 'allows <user> to enter the call, only effective on those in passerby roles',
                    inline: false
                }, 
                {
                    name: '/uninvite <user>',
                    value: 'removes ability for <user> to enter the call, only effective on those in passerby roles',
                    inline: false
                },
                {
                    name: '/limit <amount>',
                    value: 'limit the call to a specific amount of users',
                    inline: false
                },
                {
                    name: '/reset',
                    value: 'reset permissions for the call back to default',
                    inline: true
                }
            );
        
        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
}