import { Game } from './scenes/Game';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    parent: 'game-container',
    backgroundColor: 0xFF0000,
    scene: [Game]
};

export default new Phaser.Game(config);
