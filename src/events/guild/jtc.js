const { client } = require('../../app');
const { ChannelType, GuildVoice, Collection } = require('discord.js');
const channelSchema = require('../../models/channel');
const config = require('../../../config.json');

module.exports = {
    name: 'jtc'
}

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.member.user.bot) return;
    if (newState.member.user.bot) return;

    // if user joins jtc call without any previous call
    if (!oldState.channelId && newState.channelId === config.jtcChannel) {
        createChannel(newState);
    }

    // if user leaves a call
    if (oldState.channelId && !newState.channelId) {
        // find if channel left is in jtc category
        if (oldState.channel.parentId === config.jtcCategory) {
            findChannel(oldState.channelId).then(channel => {
                // if exists
                if (channel != undefined || channel != null) {
                    // let vc = jtc call
                    let vc = oldState.guild.channels.cache.get(channel.channelId);
                    let vcLeader = oldState.guild.members.cache.get(channel.userId);

                    // if no one in call
                    if (vc.members.size < 1) {
                        // remove nickname
                        if (vcLeader.id !== vcLeader.guild.ownerId) {
                            vcLeader.setNickname('');
                        }

                        // delete call in db
                        deleteChannel(channel.channelId);
                        return vc.delete();
                    } else {
                        // if remaining member(s) is a bot, delete call
                        let botCount = 0;
                        vc.members.each(member => {
                            if (member.user.bot) {
                                botCount++;
                            }
                        })

                        if (botCount == vc.members.size) {
                            deleteChannel(channel.channelId);
                            return vc.delete();
                        }
                    }

                    let leaderStayed = false;
                    vc.members.each(member => {
                        if (member === vcLeader) {
                            leaderStayed = true;
                            return;
                        }
                    })

                    if (!leaderStayed) {
                        let leaderAssigned = false;

                        // set new nickname
                        vc.members.each(member => {
                            if (!leaderAssigned) {
                                let newLeader = oldState.guild.members.cache.get(member.id);
                                let newLeaderName = newLeader.user.displayName;
                                if (newLeader.guild.ownerId !== newLeader.id && !newLeader.user.bot) {
                                    newLeader.setNickname(`[☕] ${newLeaderName}`)
                                    addNewUser(member.id, vc.id);
                                    leaderAssigned = true;
                                }
                            }
                        })
                        
                        // remove old nickname
                        if (vcLeader.id !== vcLeader.guild.ownerId) {
                            vcLeader.setNickname('');
                        }
                    }
                }
            })
        }
    }

    // if user swaps channels
    if (oldState.channelId && newState.channelId) {
        if (oldState.channelId !== newState.channelId) {
            if (oldState.channel.parent.id === config.jtcCategory || newState.channel.parent.id === config.jtcCategory) {
                findChannel(oldState.channelId).then(channel => {
                    if (channel != undefined || channel != null) {
                        let vc = oldState.guild.channels.cache.get(channel.channelId);
                        let vcLeader = oldState.guild.members.cache.get(channel.userId);

                        // if no members in call
                        if (vc.members.size < 1) {
                            // remove nickname
                            if (vcLeader.id !== vcLeader.guild.ownerId) {
                                vcLeader.setNickname('');
                            }

                            deleteChannel(channel.channelId);
                            return vc.delete();
                        } else {
                            // if remaining member(s) is a bot, delete call
                            let botCount = 0;
                            vc.members.each(member => {
                                if (member.user.bot) {
                                    botCount++;
                                }
                            })
    
                            if (botCount == vc.members.size) {
                                deleteChannel(channel.channelId);
                                return vc.delete();
                            }
                        }

                        let leaderStayed = false;
                        vc.members.each(member => {
                            if (member === vcLeader) {
                                leaderStayed = true;
                                return;
                            }
                        })

                        if (!leaderStayed) {
                            let leaderAssigned = false;

                            // set new nickname
                            vc.members.each(member => {
                                if (!leaderAssigned) {

                                    let newLeader = oldState.guild.members.cache.get(member.id);
                                    let newLeaderName = newLeader.user.displayName;
                                    if (newLeader.guild.ownerId !== newLeader.id && !newLeader.user.bot) {
                                        newLeader.setNickname(`[☕] ${newLeaderName}`);
                                        addNewUser(member.id, vc.id);
                                        leaderAssigned = true;
                                    }
                                }
                            })

                            // remove old nickname
                            if (vcLeader.id !== vcLeader.guild.ownerId) {
                                vcLeader.setNickname('');
                            }
                        }
                    }
                })

                // if also joins jtc channel
                if (newState.channelId === config.jtcChannel) {
                    createChannel(oldState);
                }
            }
        }
    }
});

const createChannel = async (state) => {
    const guild = state.guild;
    const member = state.member;
    const user = member.user;
    const name = user.displayName;

    const vc = await guild.channels.create({
        name: `${name.toLowerCase()}'s table`,
        type: ChannelType.GuildVoice,
        parent: state.channel.parent,
        permissionOverwrites: [
            {
                id: user.id,
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
        ]
    })

    if (member.guild.ownerId !== user.id) {
        member.setNickname(`[☕️] ${name}`)
    }

    await member.voice.setChannel(vc.id);
    addChannel(user.id, vc.id);
}

const addChannel = async (userId, channelId) => {
    await channelSchema.findOneAndUpdate({
        channelId
    }, {
        $set: { userId: userId },
        channelId
    }, {
        upsert: true,
        new: true
    })
}

const addNewUser = async (userId, channelId) => {
    await channelSchema.findOneAndUpdate({
        channelId
    }, {
        $set: { userId: userId },
        channelId
    }, {
        upsert: true,
        new: true,
    }).clone();
}

const findChannel = async (channelId) => {
    return channelSchema.findOne({
        channelId: channelId
    }).then(function(result) {
        return result;
    }).catch(function(err) {
        console.log(err)
    })
  }

  const deleteChannel = async (channelId) => {
    await channelSchema.deleteOne({
        channelId
    }, function(err, result) {
        console.log(err, result)
    }).clone();
  }
  