import { Scene } from 'phaser';
import { GameOver } from './GameOver';


const PEG_SIZE = 60;
const PEG_FRAME_EMPTY = 0;
const PEG_FRAME_FULL = 1;
const PEG_FRAME_SELECTED = 2;
export class Game extends Scene
{

    constructor ()
    {
        super('Game');
    }

    preload() {
        this.load.spritesheet('pegs', 'assets/pegs.png', { frameWidth: PEG_SIZE, frameHeight: PEG_SIZE });
    }

    create ()
    {
        this.boardDef = [
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [-1, -1, 1, 1, 1, -1, -1],
            [-1, -1, 1, 1, 1, -1, -1]
        ];

        this.input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);

        this.board = [];
        this.selectedPeg = null;
        this.movesCount = 0;

        for (let i = 0, length = this.boardDef.length; i < length; i++) {
            let r = this.boardDef[i];
            let row = [];
            this.board.push(row);
            for (let j = 0, count = r.length; j < count; j++) {
                let c = r[j];
                if (c >= 0) {
                    let cell = this.add.image((i * PEG_SIZE) + (PEG_SIZE / 2), (j * PEG_SIZE) + (PEG_SIZE / 2), "pegs");
                    cell.setFrame(c > 0 ? PEG_FRAME_FULL : PEG_FRAME_EMPTY);
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

        this.movesLabel = this.add.text(0, 0, 'Moves: ' + this.movesCount, { font: '24px Courier', fill: '#000000' });

        this.tempPeg = this.add.sprite(-200, -200, 'pegs');
        this.tempPeg.setFrame(PEG_FRAME_FULL);
        this.tempPeg.setOrigin(0);
    }

    clickPeg(peg) {

        // if an empty peg has been clicked on
        if(peg.frame.name === PEG_FRAME_EMPTY) {
            
            // if we have not selected a peg to jump then no need to move any further
            if(!this.selectedPeg) {
                return;
            }

            let clickedX = peg.gridX;
            let clickedY = peg.gridY;
            let selectedX = this.selectedPeg.gridX;
            let selectedY = this.selectedPeg.gridY;

            // check to see if a horizontal jump of 2 squares
            if((clickedX + 2 === selectedX || clickedX - 2 === selectedX) && clickedY === selectedY)    {
                // move horizontally

                // peg to remove is the peg between the selected peg and the clicked empty peg
                let pegToRemove = this.board[(selectedX + clickedX) / 2][clickedY];

                // if the peg to remove is empty then no need to move any further
                if(pegToRemove.frame.name === PEG_FRAME_EMPTY) {
                    return;
                }

                this.updateMoves(++this.movesCount);
                this.removePeg(this.tempPeg, this.selectedPeg, peg, pegToRemove);
                this.selectedPeg.setFrame(PEG_FRAME_EMPTY);
                this.selectedPeg = null;

            } else if((clickedY + 2 === selectedY || clickedY - 2 === selectedY) && clickedX === selectedX) {
                // move vertically

                // peg to remove is the peg between the selected peg and the clicked empty peg
                let pegToRemove = this.board[clickedX][(selectedY + clickedY) / 2];

                // if the peg to remove is empty then no need to move any further
                if(pegToRemove.frame.name === PEG_FRAME_EMPTY) {
                    return;
                }

                this.updateMoves(++this.movesCount);
                this.removePeg(this.tempPeg, this.selectedPeg, peg, pegToRemove);
                this.selectedPeg.setFrame(PEG_FRAME_EMPTY);
                this.selectedPeg = null;
            }
        } else {    // a peg has been clicked on
            if (this.selectedPeg) { // if a peg has already been selected
                if (peg === this.selectedPeg) { // if the same peg has been clicked on again, unselect it
                    peg.setFrame(PEG_FRAME_FULL);
                    this.selectedPeg = null;
                } else { // if a different peg has been clicked on, unselect the previous one and select the new one
                    this.selectedPeg.setFrame(PEG_FRAME_FULL);
                    this.selectedPeg = peg;
                    peg.setFrame(PEG_FRAME_SELECTED);
                }
            } else {    // if no peg has been selected yet, select the peg
                this.selectedPeg = peg;
                peg.setFrame(PEG_FRAME_SELECTED);
            }
        }
    }

    updateMoves(count) {
        this.movesLabel.setText('Moves: ' + count);
    }

    checkGameOver() {
        if (!this.isAnyValidMove()) {
            this.gameOver();
        }
    }

    gameOver() {
        this.registry.set('gamedata', {movesCount: this.movesCount, remainingPegs: this.remainingPegs()});
        let gameOver = new GameOver();
        this.scene.add('GameOver', gameOver, true);
        this.scene.remove('Game');
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

        var rowsCount = this.board[0].length;
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
        var pegs = 0;
        for (let i = 0, len = this.board.length; i < len; i++) {
            let col = this.board[i];
            for (let j = 0, cnt = col.length; j < cnt; j++) {
                let cell = col[j];
                if (cell && cell.frame.name !== 0) {
                    pegs++
                }
            }
        }
        return pegs;
    }

    removePeg(tempPeg, selectedPeg, targetPeg, pegToRemove) {
        tempPeg.setPosition(selectedPeg.x, selectedPeg.y);
        tempPeg.targetPeg = targetPeg;
        tempPeg.removePeg = pegToRemove;
        tempPeg.visible = true;
        var self = this;
        this.pegTween = this.tweens.add({
            targets: tempPeg,
            x: targetPeg.x,
            y: targetPeg.y,
            duration: 200,
            delay: 50,
            onStart: function (tween) {
                var sprite = tween.targets[0];
                sprite.removePeg.setFrame(PEG_FRAME_EMPTY);
            },
            onComplete: function (tween) {
                var sprite = tween.targets[0];
                sprite.targetPeg.setFrame(PEG_FRAME_FULL);
                sprite.visible = false;
                if (!self.isAnyValidMove()) {
                    let timedEvent = self.time.addEvent({
                        delay: 3000,
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
