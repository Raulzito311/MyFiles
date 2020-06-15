module.exports = class GameLobbySettings {
    constructor(gameMode = 'No Gamemode Defined', maxPlayers) {
        this.gameMode = gameMode;
        this.maxPlayers = maxPlayers;
    }
}