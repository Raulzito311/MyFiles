module.exports = class LobbyState {
    constructor() {
        //Predefine states
        this.GAME = 'Game';
        this.LOBBY = 'Lobby';
        this.ENDGAME = 'EndGame';

        //Current state of the lobby
        this.currentState = this.LOBBY;
    }
}