import { Scene } from 'phaser';
import { GameOver } from './GameOver';

const PEG_SIZE = 60;
const PEG_FRAME_EMPTY = 0;
const PEG_FRAME_FULL = 1;
const PEG_FRAME_SELECTED = 2;

function LocalScaleManager() {
}

LocalScaleManager.prototype = {
    scaleSprite: function (sprite, availableSpaceWidth, availableSpaceHeight, padding, scaleMultiplier, isFullScale) {
        let scale = this.getSpriteScale(sprite.frame.width, sprite.frame.height, availableSpaceWidth, availableSpaceHeight, padding, isFullScale);
        sprite.setScale(scale * scaleMultiplier);
        return scale;
    },
    scaleSpriteTo: function (sprite, scale) {
        sprite.setScale(scale);
    },
    scaleText: function (sprite, availableSpaceWidth, availableSpaceHeight, padding, scaleMultiplier, isFullScale) {
        let originalWidth = sprite.width;
        let originalHeight = sprite.height;
        let scale = this.getSpriteScale(originalWidth, originalHeight, availableSpaceWidth, availableSpaceHeight, padding, isFullScale);
        sprite.setScale(scale * scaleMultiplier);
    },
    getSpriteScale: function (spriteWidth, spriteHeight, availableSpaceWidth, availableSpaceHeight, minPadding, isFullScale) {
        let ratio = 1;
        let currentDevicePixelRatio = window.devicePixelRatio;
        // Sprite needs to fit in either width or height
        let widthRatio = (spriteWidth * currentDevicePixelRatio + 2 * minPadding) / availableSpaceWidth;
        let heightRatio = (spriteHeight * currentDevicePixelRatio + 2 * minPadding) / availableSpaceHeight;
        if (widthRatio > 1 || heightRatio > 1) {
            ratio = 1 / Math.max(widthRatio, heightRatio);
        } else {
            if (isFullScale)
                ratio = 1 / Math.max(widthRatio, heightRatio);
        }
        return ratio * currentDevicePixelRatio;
    }
};

let localScaleManager = new LocalScaleManager;

export class Game extends Scene
{

    constructor ()
    {
        super('Game');
    }

    preload() {
        this.load.spritesheet('pegs', 'assets/pegs.png', { frameWidth: PEG_SIZE, frameHeight: PEG_SIZE });
    }

    create() {
        this.boardDef = [
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1]
        ];

        //  If a Game Object is clicked on, this event is fired.
        //  We can use it to emit the 'clicked' event on the game object itself.
        this.input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);

        // add our sprites
        this.board = [];
        this.selectedPeg = null;
        this.movesCount = 0;
        this.isMoving = false;

        for (let i = 0, len = this.boardDef.length; i < len; i++) {
            let r = this.boardDef[i];
            let row = [];
            this.board.push(row);
            for (let j = 0, cnt = r.length; j < cnt; j++) {
                let c = r[j];
                if (c >= 0) {
                    let cell = this.add.image(-900, -900, "pegs");
                    cell.setFrame(c > 0 ? 1 : 0);
                    cell.setOrigin(0);

                    // enable input events
                    cell.setInteractive();
                    cell.on('clicked', this.clickPeg, this);
                    cell.gridX = i;
                    cell.gridY = j;
                    row.push(cell);
                } else {
                    row.push(null);
                }
            }
        }
        this.movesLabel = this.add.text(-900, -900, 'Moves: ' + this.movesCount, { fontFamily: "Arial Black", fontSize: 40, color: "#fff" });
        this.movesLabel.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 2);

        this.tempPeg = this.add.sprite(-200, -200, "pegs");
        this.tempPeg.setFrame(1);
        this.tempPeg.setOrigin(0);

        var gameWidth = this.cameras.main.width;
        var gameHeight = this.cameras.main.height;
        this.positionControls(gameWidth, gameHeight);
    }

    positionControls(width, height) {
        // 7 pegs + leave space equivalent for 1 peg on each side
        var pegSize = Math.min(width / 9, height / 9);
        var pegScale = localScaleManager.scaleSprite(this.tempPeg, pegSize, pegSize, 0, 1, true);
        var horizontalMargin = (width - 7 * pegSize) / 2;
        var verticalMargin = (height - 7 * pegSize) / 2;

        let colsCount = this.board.length;
        for (let i = 0; i < colsCount; i++) {
            let col = this.board[i];
            for (let j = 0, cnt = col.length; j < cnt; j++) {
                let c = col[j];
                if (c) {
                    localScaleManager.scaleSpriteTo(c, pegScale);
                    c.setPosition(horizontalMargin + i * pegSize, verticalMargin + j * pegSize);
                }
            }
        }

        localScaleManager.scaleText(this.movesLabel, width, pegSize, Math.min(width, pegSize * 0.2), 1, true);
        this.movesLabel.setPosition(width / 2 - this.movesLabel.displayWidth / 2, 0);
        this.pegSize = pegSize;
    }

    updateMoves(movesCount) {
        var width = this.cameras.main.width;
        this.movesLabel.setText('Moves: ' + movesCount);
        this.movesLabel.setPosition(width / 2 - this.movesLabel.displayWidth / 2, 0);
    }

    gameOver() {
        this.registry.set('gamedata', { movesCount: this.movesCount, remainingPegs: this.remainingPegs() });
        this.cameras.main.fade(500);
        this.time.delayedCall(500, function () {
            let gameOver = new GameOver('GameOver');
            this.scene.add('GameOver', gameOver, true);
            this.scene.remove('Game');
        }, [], this)
    }

    isAnyValidMove() {
        let colsCount = this.board.length;
        for (let i = 0; i < colsCount; i++) {
            let col = this.board[i];
            for (let j = 0, endIndex = col.length - 3; j <= endIndex; j++) {
                let c1 = col[j];
                let c2 = col[j + 1];
                let c3 = col[j + 2];

                if (c1 && c2 && c3) {
                    if (c1.frame.name !== 0 && c2.frame.name !== 0 && c3.frame.name === 0) return true;
                    if (c1.frame.name === 0 && c2.frame.name !== 0 && c3.frame.name !== 0) return true;
                }
            }
        }

        let rowsCount = this.board[0].length;
        for (let i = 0, len = colsCount - 3; i <= len; i++) {
            let r1 = this.board[i];
            let r2 = this.board[i + 1];
            let r3 = this.board[i + 2];
            for (let j = 0; j < rowsCount; j++) {
                let c1 = r1[j];
                let c2 = r2[j];
                let c3 = r3[j];

                if (c1 && c2 && c3) {
                    if (c1.frame.name !== 0 && c2.frame.name !== 0 && c3.frame.name === 0) return true;
                    if (c1.frame.name === 0 && c2.frame.name !== 0 && c3.frame.name !== 0) return true;
                }
            }
        }
        return false;
    }

    remainingPegs() {
        let pegs = 0;
        for (let i = 0, len = this.board.length; i < len; i++) {
            let row = this.board[i];
            for (let j = 0, cnt = row.length; j < cnt; j++) {
                let cell = row[j];
                if (cell && cell.frame.name !== 0) {
                    pegs++
                }
            }
        }
        return pegs;
    }

    clickPeg(peg) {
        if (this.isMoving) return;

        if (peg.frame.name === 0) {
            // if we have not selected a peg to jump then no need to move any further
            if (!this.selectedPeg)
                return;

            let clickedX = peg.gridX;
            let clickedY = peg.gridY;
            let selectedX = this.selectedPeg.gridX;
            let selectedY = this.selectedPeg.gridY;

            if ((clickedX + 2 === selectedX || clickedX - 2 === selectedX) && clickedY === selectedY) {
                // move horizontal
                let pegToRemove = this.board[(selectedX + clickedX) / 2][clickedY];
                if (pegToRemove.frame.name === 0)
                    return;

                this.updateMoves(++this.movesCount);
                this.removePeg(this.tempPeg, this.selectedPeg, peg, pegToRemove);

                this.selectedPeg.setFrame(0);
                this.selectedPeg = null;

            } else if ((clickedY + 2 === selectedY || clickedY - 2 === selectedY) && clickedX === selectedX) {
                // move vertical
                let pegToRemove = this.board[clickedX][(selectedY + clickedY) / 2];
                if (pegToRemove.frame.name === 0)
                    return;

                this.updateMoves(++this.movesCount);
                this.removePeg(this.tempPeg, this.selectedPeg, peg, pegToRemove);

                this.selectedPeg.setFrame(0);
                this.selectedPeg = null;
            }

        } else {
            if (this.selectedPeg) {
                if (peg === this.selectedPeg) {
                    peg.setFrame(1);
                    this.selectedPeg = null;
                } else {
                    this.selectedPeg.setFrame(1);
                    this.selectedPeg = peg;
                    peg.setFrame(2);
                }
            } else {
                this.selectedPeg = peg;
                peg.setFrame(2);
            }
        }
    }

    removePeg(tempPeg, selectedPeg, targetPeg, pegToRemove) {
        tempPeg.setPosition(selectedPeg.x, selectedPeg.y);
        tempPeg.targetPeg = targetPeg;
        tempPeg.removePeg = pegToRemove;
        tempPeg.visible = true;
        var self = this;
        this.isMoving = true;
        this.pegTween = this.tweens.add({
            targets: tempPeg,
            x: targetPeg.x,
            y: targetPeg.y,
            duration: 200,
            delay: 50,
            onStart: function (tween) {
                let sprite = tween.targets[0];
                sprite.removePeg.setFrame(0);
            },
            onComplete: function (tween) {
                self.isMoving = false;
                let sprite = tween.targets[0];
                sprite.targetPeg.setFrame(1);
                sprite.visible = false;
                if (!self.isAnyValidMove()) {
                    self.cameras.main.shake(2000, 0.005); // second parameter is just the shake intensity
                    let timedEvent = self.time.addEvent({
                        delay: 2000,
                        callbackScope: this,
                        callback: function () {
                            self.gameOver();
                        }
                    });
                }
            }
        });
    }
}