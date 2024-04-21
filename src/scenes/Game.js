import { Scene } from 'phaser';


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

                pegToRemove.setFrame(PEG_FRAME_EMPTY);
                peg.setFrame(PEG_FRAME_FULL);
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

                pegToRemove.setFrame(PEG_FRAME_EMPTY);
                peg.setFrame(PEG_FRAME_FULL);
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
}
