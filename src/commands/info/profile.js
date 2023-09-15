const { AttachmentBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const profileSchema = require('../../models/profile');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('display server profile'),

    async execute(interaction) {
        const { guild, member } = interaction;
        
        const userId = member.id;
        const username = member.user.username;
        findUser(userId).then(async profile => {
            if (!profile) {
                addNewProfile(userId);
            }

            const canvas = Canvas.createCanvas(700, 250);
            const context = canvas.getContext('2d');
            context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#FFFFFF';
            context.fill();

            context.strokeStyle = '#DFBAA0';
            context.strokeRect(0, 0, canvas.width, canvas.height);

            // name
            context.font = getTitleFontSize(canvas, username.toLowerCase(), 36);
            context.fillStyle = '#000000';
            context.fillText(`${username.toLowerCase()}'s profile`, canvas.width / 3, canvas.height / 3.5);

            // statistics
            context.font = `bold 20px Microsoft Sans Serif`;
            context.fillStyle = '#000000';
            context.fillText(`statistics`, canvas.width / 3, canvas.height / 2.5);

            context.font = `14px Microsoft Sans Serif`;
            context.fillStyle = '#000000';
            context.fillText(`patron points: ${profile.patronPoints}`, canvas.width / 3, canvas.height / 2.5 + 25);

            context.font = `14px Microsoft Sans Serif`;
            context.fillStyle = '#000000';
            context.fillText(`messages sent: ${profile.messageCount}`, canvas.width / 3, canvas.height  / 2.5 + 50);

            context.font = `14px Microsoft Sans Serif`;
            context.fillStyle = '#000000';
            context.fillText(`hours count: ${profile.hoursCount}`, canvas.width / 3, canvas.height  / 2.5 + 75);

            context.font = `14px Microsoft Sans Serif`;
            context.fillStyle = '#000000';
            context.fillText(`stamps collected: ${profile.stampCollected}`, canvas.width / 3, canvas.height  / 2.5 + 100);

            // stamps
            context.font = `bold 20px Microsoft Sans Serif`;
            context.fillStyle = '#000000';
            context.fillText('loyalty stamps', canvas.width / 1.48, canvas.height / 2.5);

            const background = await Canvas.loadImage('./resources/drinkbg.png');
            context.drawImage(background, 0, 0, canvas.width, canvas.height);
            
            const stamp1 = await Canvas.loadImage('./resources/day1.png');
            context.drawImage(stamp1, 0, 0, canvas.width, canvas.height);

            const stamp2 = await Canvas.loadImage('./resources/day2.png');
            context.drawImage(stamp2, 0, 0, canvas.width, canvas.height);

            const stamp3 = await Canvas.loadImage('./resources/day3.png');
            context.drawImage(stamp3, 0, 0, canvas.width, canvas.height);

            const stamp4 = await Canvas.loadImage('./resources/day4.png');
            context.drawImage(stamp4, 0, 0, canvas.width, canvas.height);

            const stamp5 = await Canvas.loadImage('./resources/day5.png');
            context.drawImage(stamp5, 0, 0, canvas.width, canvas.height);

            const stamp6 = await Canvas.loadImage('./resources/day6.png');
            context.drawImage(stamp6, 0, 0, canvas.width, canvas.height);

            const stamp7 = await Canvas.loadImage('./resources/day7.png');
            context.drawImage(stamp7, 0, 0, canvas.width, canvas.height);

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });
        
            await interaction.reply({
                files: [attachment],
                ephemeral: false
            });
        })
    }
}

const getTitleFontSize = (canvas, text, fontSize) => {
    const context = canvas.getContext('2d');

    do {
        context.font = `bold ${fontSize -= 10}px Microsoft Sans Serif`;
    } while (context.measureText(text).width > canvas.width - 300);

    return context.font;
}

const getBodyFontSize = (canvas, text, fontSize) => {
    const context = canvas.getContext('2d');

    do {
        context.font = `${fontSize -= 10}px Microsoft Sans Serif`;
    } while (context.measureText(text).width > canvas.width - 300);

    return context.font;
}

const findUser = async (userId) => {
    return profileSchema.findOne({
        userId: userId
    }).then(function(result) {
        return result;
    }).catch(function(err) {
        console.log(err)
    })
 }

 const addNewProfile = async (userId) => {
    await profileSchema.findOneAndUpdate({
        userId
    }, {
        $set: { userId: userId }
    }, {
        upsert: true,
        new: true,
    }).clone();
}
