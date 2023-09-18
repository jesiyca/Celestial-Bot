const { Client, GatewayIntentBits, Partials, Collection, ActivityType } = require('discord.js');
const { loadEvents } = require('./handlers/eventHandler');
const { loadCommands } = require('./handlers/commandHandler');

const { Guilds, GuildMembers, GuildMessages, GuildVoiceStates } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel } = Partials;

const client = new Client({
	intents: [Guilds, GuildMembers, GuildMessages, GuildVoiceStates],
	partials: [User, Message, GuildMember, ThreadMember]
});

client.commands = new Collection();
client.config = require('../config.json');

client.login(client.config.token).then(() => {
	loadEvents(client);
	loadCommands(client);

	client.user.setActivity('n_n', {
		type: ActivityType.Listening
	})
});

module.exports = { client };