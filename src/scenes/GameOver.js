import { Scene } from 'phaser';

import { Game } from './Game';

export class GameOver extends Scene {
 
    constructor() {
        super("GameOver");
    }

    preload() {
        this.load.image("restart", "assets/restart.png");
    }
 
    create() {
        var gamedata = this.registry.get('gamedata');
        const {movesCount, remainingPegs} = gamedata || {movesCount: 0, remainingPegs: 0};

        this.add.text(140, 100, 'Game Over', { font: '42px Courier', fill: '#000000' });
        this.add.text(155, 160, 'Moves: ' + movesCount, { font: '42px Courier', fill: '#000000' });
        if (remainingPegs > 1) {
            this.remainingPegs = this.add.text(30, 220, 'Remaining Pegs: ' + remainingPegs, { font: '42px Courier', fill: '#000000' });
        }
        var btn = this.add.image(140, 200, 'restart');
        btn.setInteractive();
        btn.setScale(0.5)
        btn.setOrigin(0);
        
        btn.on('pointerup', this.startGame, this);
    }

    startGame() {
        let theGame = new Game('TheGame');
        this.scene.add('TheGame', theGame, true);
        this.scene.remove('GameOver');
    }
}