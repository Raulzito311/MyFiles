let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');
let Connection = require('../Connection');
let Bullet = require('../Bullet');
let LobbyState = require('../Utility/LobbyState');

module.exports = class GameLobby extends LobbyBase {
    constructor(settings = GameLobbySettings) {
        super();
        this.settings = settings;
        this.lobbyState = new LobbyState();
        this.bullets = [];
    }

    onUpdate() {
        let lobby = this;

        lobby.updateBullets();
        lobby.updateDeadPlayers();
    }

    canEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if(currentPlayerCount + 1 > maxPlayerCount) {
            return false;
        }

        return true;
    }

    onEnterLobby(connection = Connection) {
        let lobby = this;
        let socket = connection.socket;

        super.onEnterLobby(connection);

        //lobby.addPlayer(connection);

        if(lobby.connections.length == lobby.settings.maxPlayers) {
            console.log('We have enough players, we can start the game now');
            lobby.lobbyState.currentState = lobby.lobbyState.GAME;
            lobby.onSpawnAllPlayersIntoGame();
        }

        let returnData = {
            state: lobby.lobbyState.currentState
        };

        socket.emit('loadGame');
        socket.emit('lobbyUpdate', returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnData);

        //Handle spawning any server spawned objects here
        //Example: Loot, perhaps flying bullets, etc
    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;

        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);

        //Handle unspawning any server spawned objects here
        //Example: Loot, perhaps flying bullets, etc
    }

    onSpawnAllPlayersIntoGame() {
        let lobby = this;
        let connections = lobby.connections;

        connections.forEach(connection => {
            lobby.addPlayer(connection);
        });
    }

    updateBullets() {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        bullets.forEach(bullet => {
            let isDestroyed = bullet.onUpdate();

            if(isDestroyed) {
                lobby.despawnBullet(bullet);
            } else {
                /*var returnData = {
                    id: bullet.id,
                    position: {
                        x: new Intl.NumberFormat('en-US').format(bullet.position.x),
                        y: new Intl.NumberFormat('en-US').format(bullet.position.y)
                    }
                }          
    
                connections.forEach(connection => {
                    connection.socket.emit('updatePosition', returnData);
                });*/
            }
        });
    }

    updateDeadPlayers() {
        let lobby = this;
        let connections = lobby.connections;

        connections.forEach(connection => {
            let player = connection.player;

            if(player.isDead) {
                let isRespawn = player.respawnCounter();
    
                if(isRespawn) {
                    let socket = connection.socket;

                    let returnData = {
                        id: player.id,
                        position: {
                            x: new Intl.NumberFormat('en-US').format(player.position.x),
                            y: new Intl.NumberFormat('en-US').format(player.position.y)
                        }
                    }
    
                    socket.emit('playerRespawn', returnData);
                    socket.broadcast.to(lobby.id).emit('playerRespawn', returnData); //Only broadcast to those in the same lobby as us
                }
            }
        });
    }

    onFireBullet(connection = Connection, data) {
        let lobby = this;

        var bullet = new Bullet();
        bullet.name = 'Bullet';
        bullet.activator = data.activator;
        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;
        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;

        lobby.bullets.push(bullet);

        var returnData = {
            id: bullet.id,
            name: bullet.name,
            activator: bullet.activator,
            position: {
                x: new Intl.NumberFormat('en-US').format(bullet.position.x),
                y: new Intl.NumberFormat('en-US').format(bullet.position.y)
            },
            direction: {
                x: new Intl.NumberFormat('en-US').format(bullet.direction.x),
                y: new Intl.NumberFormat('en-US').format(bullet.direction.y)
            },
            speed: new Intl.NumberFormat('en-US').format(bullet.speed)
        };

        connection.socket.emit('serverSpawn', returnData);
        connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
    }

    onCollisionDestroy(connection = Connection, data) {
        let lobby = this;

        let returnBullets = lobby.bullets.filter(bullet => {
            return bullet.id == data.id
        });

        //We will mostly only have one entry but just in case loop through all and set to destroyed
        returnBullets.forEach(bullet => {
            let playerHit = data.playerHit;
            
            /*//Check if we hit someone that is not us
            lobby.connections.forEach(c => {
                let player = c.player;

                if(bullet.activator != player.id) {
                    let distance = bullet.position.Distance(player.position);

                    if(distance < 0.65) {
                        playerHit = true;
                        let isDead = player.dealDamage(50); //Take half of their health for testing
                        if(isDead) {
                            console.log('Player with id ' + player.id + ' has died');
                            let returnData = {
                                id: player.id
                            }
                            c.socket.emit('playerDied', returnData);
                            c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        } else {
                            console.log('Player with id ' + player.id + ' has ' + player.health + ' health left');
                        }
                        lobby.despawnBullet(bullet);
                    }

                }
            });*/

            if(playerHit) {
                let hitPlayers = lobby.connections.filter(c => {
                    return c.player.id == data.playerID
                });

                hitPlayers.forEach(c => {
                    let player = c.player;

                    let isDead = player.dealDamage(50); //Take half of their health for testing
                    if(isDead) {
                        console.log('Player with id ' + player.id + ' has died');
                        let returnData = {
                            id: player.id
                        }
                        c.socket.emit('playerDied', returnData);
                        c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                    } else {
                        console.log('Player with id ' + player.id + ' has ' + player.health + ' health left');
                    }
                    lobby.despawnBullet(bullet);
                });
            } else {
                bullet.isDestroyed = true;
            }
        });
    }

    despawnBullet(bullet = Bullet) {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        console.log('Destroying bullet ' + bullet.id);
        var index = bullets.indexOf(bullet);
        if(index > -1) {
            bullets.splice(index, 1);
    
            var returnData = {
                id: bullet.id
            }
    
            //Send remove bullet command to players
            connections.forEach(connection => {
                connection.socket.emit('serverUnspawn', returnData);
            });
        }
    }

    addPlayer(connection = Connection) {
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var returnData = {
            id: connection.player.id
        }

        socket.emit('spawn', returnData);//Tell myself I have spawned
        //socket.broadcast.to(lobby.id).emit('spawn', returnData);//Tell others

        //Tell myself about everyone else already in the lobby
        connections.forEach(c => {
            if(c.player.id != connection.player.id) {
                socket.emit('spawn', {
                    id: c.player.id
                });
            }
        });
    }

    removePlayer(connection = Connection) {
        let lobby = this;

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
    }
}