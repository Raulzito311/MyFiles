//ws://127.0.0.1:52300/socket.io/?EIO=4&transport=websocket
//ws://raulzito-unity-nodejs-server.herokuapp.com:80/socket.io/?EIO=4&transport=websocket

let io = require('socket.io')(process.env.PORT || 52300);
let Server = require('./Classes/Server');

console.log('Server has started!!!');

let server = new Server();

setInterval(() => {
    server.onUpdate();
}, 100, 0);

io.on('connection', function(socket) {
    let connection = server.onConnected(socket);
    connection.createEvents();
    connection.socket.emit('register', {'id': connection.player.id});
});

/*//Custom Classes
var Player = require('./Classes/Player.js');
var Bullet = require('./Classes/Bullet.js');*/

/*var players = [];
var sockets = [];
var bullets = [];

//Updates
setInterval(() => {
    bullets.forEach(bullet => {
        var isDestroyed = bullet.onUpdate();

        //Remove
        if(isDestroyed) {
            despawnBullet(bullet);
        } else {
            var returnData = {
                id: bullet.id,
                position: {
                    x: new Intl.NumberFormat('en-US').format(bullet.position.x),
                    y: new Intl.NumberFormat('en-US').format(bullet.position.y)
                }
            }          

            for(var playerID in players) {
                sockets[playerID].emit('updatePosition', returnData);
            }
        }
    });

    // Handle Dead players
    for(var playerID in players) {
        let player = players[playerID];

        if(player.isDead) {
            let isRespawn = player.respawnCounter();

            if(isRespawn) {
                let returnData = {
                    id: player.id,
                    position: {
                        x: new Intl.NumberFormat('en-US').format(player.position.x),
                        y: new Intl.NumberFormat('en-US').format(player.position.y)
                    }
                }

                sockets[playerID].emit('playerRespawn', returnData);
                sockets[playerID].broadcast.emit('playerRespawn', returnData);
            }
        }
    }

}, 100, 0);

function despawnBullet(bullet = Bullet) {
    console.log('Destroying bullet ' + bullet.id);
    var index = bullets.indexOf(bullet);
    if(index > -1) {
        bullets.splice(index, 1);

        var returnData = {
            id: bullet.id
        }

        for(var playerID in players) {
            sockets[playerID].emit('serverUnspawn', returnData);
        }
    }
}

io.on('connection', function(socket) {
    console.log('Connection Made');

    var player = new Player();
    var thisPlayerID = player.id;

    players[thisPlayerID] = player;
    sockets[thisPlayerID] = socket;

    //Tell the client that this is our id for the server
    socket.emit('register', {id: thisPlayerID});
    socket.emit('spawn', player);//Tell myself I have spawned
    socket.broadcast.emit('spawn', player);//Tell other I have spawned

    //Tell myself about everyone else in the game
    for(var playerID in players) {
        if(playerID != thisPlayerID) {
            socket.emit('spawn', players[playerID]);
        }
    }

    //Positional Data from Client
    socket.on('updatePosition', function(data) {
        player.position.x = data.position.x;
        player.position.y = data.position.y;

        let returnData = {
            id: player.id,
            position: {
                x: new Intl.NumberFormat('en-US').format(player.position.x),
                y: new Intl.NumberFormat('en-US').format(player.position.y)
            }
        }

        socket.broadcast.emit('updatePosition', returnData);
    });

    socket.on('updateRotation', function(data) {
        player.tankRotation = data.tankRotation;
        player.barrelRotation = data.barrelRotation;

        let returnData = {
            id: player.id,
            tankRotation: new Intl.NumberFormat('en-US').format(player.tankRotation),
            barrelRotation: new Intl.NumberFormat('en-US').format(player.barrelRotation)
        }

        socket.broadcast.emit('updateRotation', returnData);
    });

    socket.on('fireBullet', function(data) {
        var bullet = new Bullet();
        bullet.name = 'Bullet';
        bullet.activator = data.activator;
        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;
        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;

        bullets.push(bullet);

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
            }
        };

        socket.emit('serverSpawn', returnData);
        socket.broadcast.emit('serverSpawn', returnData);
    });

    socket.on('collisionDestroy', function(data) {
        console.log('Collision with bullet id: ' + data.id);
        let returnBullets = bullets.filter(bullet => {
            return bullet.id == data.id
        });

        //We will mostly only have one entry but just in case loop through all and set to destroyed
        returnBullets.forEach(bullet => {
            let playerHit = false;
            //Check if we hit someone that is not us
            for(var playerID in players) {
                if(bullet.activator != playerID) {
                    let player = players[playerID];
                    let distance = bullet.position.Distance(player.position);

                    if(distance < 0.65) {
                        playerHit = true;
                        let isDead = player.dealDamage(50); //Take half of their health for testing
                        if(isDead) {
                            console.log('Player with id ' + player.id + ' has died');
                            let returnData = {
                                id: player.id
                            }
                            sockets[playerID].emit('playerDied', returnData);
                            sockets[playerID].broadcast.emit('playerDied', returnData);
                        } else {
                            console.log('Player with id ' + player.id + ' has ' + player.health + ' health left');
                        }
                        despawnBullet(bullet);
                    }
                }
            }
            if(!playerHit) {
                bullet.isDestroyed = true;
            }
        });
    });

    socket.on('disconnect', function() {
        console.log('A player has disconnected');
        delete players[thisPlayerID];
        delete sockets[thisPlayerID];
        socket.broadcast.emit('disconnected', player);
    });
    
});

function interval(func, wait, times) {
    var interv = function(w, t) {
        return function() {
            if(typeof t === "undefined" || t-- > 0) {
                setTimeout(interv, w);
                try {
                    func.call(null);
                } catch(e) {
                    t = 0;
                    throw e.toString();
                }
            }
        }
    }(wait, times);
    
    setTimeout(interv, wait);
}*/
