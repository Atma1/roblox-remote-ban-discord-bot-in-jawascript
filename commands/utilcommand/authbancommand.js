const DataBaseRelatedCommandClass = require('../../util/DataBaseRelatedCommandClass');

module.exports = class extends DataBaseRelatedCommandClass {
	constructor() {
		super(
			'authorizerole',
			'authorize specific role to ban command',
			{
				aliases: ['authban', 'permitban', 'authbanforrole', 'auth'],
				example: '!auth @joemama',
				cooldown: 5,
				args: true,
				guildonly: true,
				permission: true,
			});
	}

	async execute(msg, args) {
		const [ role ] = args;
		const roleId = role.match(/[0-9]\d+/g);
		const guildId = msg.guild.id;

		if (!msg.guild.roles.cache.find(guildRole => guildRole.id === `${roleId}`)) {
			return msg.channel.send('Make sure you input the correct role.');
		}
		try {
			await this.dataBase.collection(`Server: ${guildId}`).doc(`Data for server: ${guildId}`)
				.update({
					authorizedRoles: this.FieldValue.arrayUnion(`${roleId}`),
				});
			return msg.channel.send(`${role} has been authorized to use the ban command!`);
		}
		catch (error) {
			console.error(error);
			return msg.channel.send(`There was an error while adding the role!\n${error}`);
		}

	}
};