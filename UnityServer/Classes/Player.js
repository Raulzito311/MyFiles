var shortID = require('shortid');
var Vector2 = require('./Vector2');

module.exports = class Player {
    constructor() {
        this.username = 'Default_Player';
        this.id = shortID.generate();
        this.lobby = 0;
        this.position = new Vector2();
        this.tankRotation = new Number(0);
        this.barrelRotation = new Number(0);
        this.health = new Number(100);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
    }

    displayPlayerInformation() {
        let player = this;
        return '(' + player.username + ':' + player.id + ')';
    }

    respawnCounter() {
        this.respawnTicker = this.respawnTicker + 1;

        if(this.respawnTicker >= 10) {
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;

            //Three second respond time
            if(this.respawnTime >= 3) {
                console.log('Respawning player id: ' + this.id);
                this.isDead = false;
                this.respawnTime = new Number(0);
                this.health = new Number(100);
                this.position = new Vector2(0, 0); // Change to SpawnPoint here

                return true;
            }
        }

        return false;
    }

    dealDamage(amount = Number) {
        //Adjust Health on getting hit
        this.health = this.health - amount;

        //Check if we are dead
        if(this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            this.respawnTicker = new Number(0);
            this.respawnTime = new Number(0);
        }

        return this.isDead;
    }
}