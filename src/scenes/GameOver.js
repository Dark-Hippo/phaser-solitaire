import { Game } from "./Game";
import { LocalScaleManager } from '../LocalScaleManager';


let localScaleManager = new LocalScaleManager();

export class GameOver extends Phaser.Scene {
 
    constructor() {
        super("GameOver");
    }

    preload() {
        this.load.image("restart", "assets/restart.png");
    }
 
    create() {
        let gamedata = this.registry.get('gamedata');

        this.messageText = this.add.text(-900, -900, 'Game Over', { fontFamily: "Arial Black", fontSize: 40, color: "#fff" });
        this.movesText = this.add.text(-900, -900, 'Moves: ' + gamedata.movesCount, { fontFamily: "Arial Black", fontSize: 40, color: "#fff" });
        if (gamedata.remainingPegs > 1) {
            this.remainingPegsText = this.add.text(-900, -900, 'Remaining Pegs: ' + gamedata.remainingPegs, { fontFamily: "Arial Black", fontSize: 40, color: "#ffff00" });
        }

        let btn = this.add.image(-900, -900, 'restart');
        btn.setInteractive();
        btn.on('pointerup', this.startGame, this);
        this.restartButton = btn;

        let gameWidth = this.cameras.main.width;
        let gameHeight = this.cameras.main.height;
        this.positionControls(gameWidth, gameHeight);
    }

    positionControls(width, height) {
        // 20% height for messageText
        // 20% for movesText
        // 20% for remainingPegsText
        // 25% for restartButton
        localScaleManager.scaleText(this.messageText, width, height * 0.20, Math.min(width, height * 0.20) * 0.1, 1, false);
        this.messageText.setPosition(width / 2 - this.messageText.displayWidth / 2, height * 0.15);

        localScaleManager.scaleText(this.movesText, width, height * 0.20, Math.min(width, height * 0.20) * 0.1, 1, false);
        this.movesText.setPosition(width / 2 - this.movesText.displayWidth / 2, height * 0.35);

        if (this.remainingPegsText) {
            localScaleManager.scaleText(this.remainingPegsText, width, height * 0.20, Math.min(width, height * 0.20) * 0.1, 1, false);
            this.remainingPegsText.setPosition(width / 2 - this.remainingPegsText.displayWidth / 2, height * 0.55);
        }

        localScaleManager.scaleSprite(this.restartButton, width, height * 0.25, Math.min(width, height * 0.20) * 0.1, 1, true);
        this.restartButton.setPosition(width / 2, height * 0.825);
    }

    startGame() {
        this.time.delayedCall(100, function () {
            let theGame = new Game('Game');
            this.scene.add('Game', theGame, true);
            this.scene.remove('GameOver');
        }, [], this)
    }
}