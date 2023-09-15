const { client } = require('../../app');
const { ChannelType, GuildVoice, Collection } = require('discord.js');
const profileSchema = require('../../models/profile');
const config = require('../../../config.json');

module.exports = {
    name: 'call'
}

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.member.user.bot) return;
    if (newState.member.user.bot) return;

    // if user joins a call
    if (!oldState.channelId && newState.channelId) {
        var startTime = Date.now();

        await addStartTime(newState.member.id, startTime);
    }

    // if user leaves a call
    if (oldState.channelId && !newState.channelId) {
        var endTime = Date.now();
        calculateTime(oldState.member.id, endTime);
    }

    // if user swaps channels
    if (oldState.channelId && newState.channelId) {
        // do nothing
    }
});

const calculateTime = async (userId, endTime) => {
    const { hoursCount, timeJoined } = await findProfile(userId).then(profile => {
        if (!profile) {
            addNewProfile(userId);
        }

        return profile;
    });

    let additionalHours = endTime - timeJoined;
    console.log(timeJoined, endTime, additionalHours);
    
    await addStartTime(userId, null);
    await addNewTime(userId, hoursCount + additionalHours);
}

const findProfile = async (userId) => {
    return profileSchema.findOne({
        userId: userId
    }).then(function(result) {
        return result;
    }).catch(function(err) {
        console.log(err)
    });
 }

const addNewTime = async (userId, time) => {
    await profileSchema.findOneAndUpdate({
        userId
    }, {
        $set: { hoursCount: time }
    }, {
        upsert: true,
        new: true,
    }).clone();
}

const addStartTime = async (userId, time) => {
    await profileSchema.findOneAndUpdate({
        userId
    }, {
        $set: { timeJoined: time }
    }, {
        upsert: true,
        new: true,
    }).clone();
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