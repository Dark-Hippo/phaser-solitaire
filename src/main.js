import { Game } from './scenes/Game';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    backgroundColor: 0xFF0000,
    scene: [Game],
    scale: {
        parent: 'game-container',
        type: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
    }
};

export default new Phaser.Game(config);
