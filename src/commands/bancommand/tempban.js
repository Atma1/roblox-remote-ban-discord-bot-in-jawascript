const { EmbededTempBanInfoMessage } = require('@modules/EmbededBanMessage');
const DataBaseRelatedCommandClass = require('@class/DataBaseRelatedCommandClass');
const PlayerBanDocument = require('@class/PlayerBanDocumentClass');
const {
	seperateDurationAndBanReason,
	checkIfHasBanDuration,
} = require('@util/util');


module.exports = class TempBanCommand extends DataBaseRelatedCommandClass {
	/**
	 * @param {Class} botClient;
	 */
	constructor(botClient) {
		super(
			botClient,
			'tempban',
			'temp ban the player. to edit the ban, just rerun the command',
			'<playerName> <banDuration> <banReason>', {
				aliases: ['tban', 'temppunish', 'tb', 'tbc', 'tp'],
				example: 'tempban joemama 720y 666w 420d 42h joemama is too fat',
				cooldown: 5,
				args: true,
				permission: true,
				reqarglength: 3,
			},
		);
	}
	/**
	 * @param {Class} message
	 * @param {Array} args
	 * @returns Message Embed
	 */
	async execute(message, args) {
		const hasBanDuration = checkIfHasBanDuration(args);

		if (!hasBanDuration) {
			return message.reply('You need to specify the ban duration!');
		}

		const { id:guildId } = message.channel.guild;
		const { tag: bannedBy } = message.author;
		const playerName = args.shift();
		const [banDuration, banReason] = seperateDurationAndBanReason(args);
		const bannedAt = Date.now();
		const bannedUntil = bannedAt + banDuration;
		const formattedUnbanDate = this.dateformat(bannedUntil);
		const formattedBanDate = this.dateformat(bannedAt);

		try {
			const playerId = await this.getUserId(playerName);
			const playerBanDoc = new PlayerBanDocument(
				playerId, playerName, banReason, bannedBy, 'tempBan', bannedAt, bannedUntil,
			);
			const [playerImage] = await Promise.all([
				this.getUserImg(playerId),
				this.addPlayerToBanList(playerBanDoc, guildId),
			]);

			const banInfoEmbed = new EmbededTempBanInfoMessage(
				formattedBanDate, bannedBy, playerName, playerId, banReason, playerImage, formattedUnbanDate,
			);
			return message.channel.send(`\`Player: ${playerName} has been banned.\``, banInfoEmbed);
		}
		catch (error) {
			console.error(error);
			return message.reply(`There was an error while banning the player!\n${error}`);
		}
	}
};