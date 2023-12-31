import * as Phaser from 'phaser';
import {Ball} from './Ball';

export default class Billiard extends Phaser.Scene {
    private ballX: number = 200;
    private ballY: number = 300;
    private balls: any[] = [];
    private cueBall;
    private velocityTX;
    private playersTurnTX;
    private pockets;
    private otherBallsMoving;
    private eightGame;
    private gameWinner: number = -1;
    private distance;
    private currentPlayer: number = 0; // Player1 = 0; Player2 = 1;
    private playerOnePlays: string = '';
    private playerTwoPlays: string = '';
    private playerOneBallList: any[] = [];
    private playerTwoBallList: any[] = [];
    private pocketHasBeenHit: boolean = false;
    private allBallsStopped: Boolean;

    constructor() {
        super('Billiard');
    }

    init() {
        this.ballX = 200;
        this.ballY = 300;
        this.balls = [];
        this.cueBall;
        this.velocityTX;
        this.playersTurnTX;
        this.pockets;
        this.otherBallsMoving;
        this.eightGame;
        this.gameWinner = -1;
        this.currentPlayer = 0; // Player1 = 0; Player2 = 1;
        this.playerOnePlays = '';
        this.playerTwoPlays = '';
        this.playerOneBallList = [];
        this.playerTwoBallList = [];
        this.pocketHasBeenHit = true;
    }

    preload() {
        this.load.image('table', 'assets/PlaceHolderBilliardTable.png');
        this.load.image('cueBall', 'assets/whiteCueBallPlaceholder.png');
        this.load.image('purpleBall', 'assets/PurpleBallPlaceholder.png');
        this.load.image('cueStick', 'assets/cueStickPlaceholder.png');

        for (let i = 1; i < 16; i++) {
            this.load.image('ball' + i, 'assets/ballsPNGS/ball' + i + '.png');
        }

    }

    create() {
        let ballStrengthModifier: number = 2.5;
        let lineGraphics;
        let ballScale: number = 0.3;
        const table = this.add.image(400, 300, 'table');
        table.depth = 0;
        this.cueBall = new Ball({
            scene: this,
            x: this.ballX,
            y: this.ballY,
            texture: 'cueBall',
            id: 0
        }).setScale(ballScale);
        this.physics.world.setBounds(15, 100, 775, 400,
            true, true, true, true);


        this.createEightBallGame(ballScale);
        this.balls.push(this.cueBall);

        this.drawPockets(table);

        // Add collision between the cue ball and each ball in the array
        this.balls.forEach(ball => {
            this.physics.add.collider(this.cueBall, ball);
        });

        //collision between each pair of balls in the array
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                this.physics.add.collider(this.balls[i], this.balls[j]);
            }
        }


        this.allBallsStopped = this.balls.every((ball) => {
            return ball.body.velocity.length() < 2;
        });


        //Drawing the white line :D
        if (this.cueBall.body.velocity.length() < 2) {
            this.input.on('pointermove', (pointer) => {
                if (lineGraphics) {
                    lineGraphics.clear();
                }

                // Draw a line from the cue ball to the mouse cursor
                lineGraphics = this.add.graphics();
                lineGraphics.lineStyle(2, 0xffffff);
                lineGraphics.beginPath();
                lineGraphics.moveTo(this.cueBall.x, this.cueBall.y);
                lineGraphics.lineTo(pointer.x, pointer.y);
                lineGraphics.strokePath();
            });

        }
        this.input.on('pointerup', () => {
            if (lineGraphics) {
                lineGraphics.destroy();
                lineGraphics = null;
            }
        });


        this.input.on('pointerdown', (pointer) => {

            if (pointer.leftButtonDown() && this.gameWinner === -1) {
                if (this.cueBall.body.velocity.length() < 2 && this.allBallsStopped) {
                    this.distance = Phaser.Math.Distance.Between(this.cueBall.x, this.cueBall.y, pointer.x, pointer.y);
                    let angle = Phaser.Math.Angle.Between(this.cueBall.x, this.cueBall.y, pointer.x, pointer.y);
                    this.physics.velocityFromRotation(angle,
                        this.distance * ballStrengthModifier,
                        this.cueBall.body.velocity);
                    this.velocityTX.setText('Strength: ' + Math.floor(this.distance));
                    this.pocketHasBeenHit = false;
                }
            }
        });


        this.velocityTX = this.add.text(100, 0, 'Strength: 0', {fontSize: '32px', color: '#111111'});
        this.playersTurnTX = this.add.text(400, 0, 'Player: 0', {fontSize: '32px', color: '#111111'});
        this.add.text(50, 525, 'Player 1 Balls: ', {fontSize: "16px", color: '#111111'})
        this.add.text(450, 525, 'Player 2 Balls: ', {fontSize: "16px", color: '#111111'})

    }

    update() {
        if(this.cueBall.body.velocity > 0)
        {
            this.velocityTX.setText('Strength: ' + Math.floor(this.distance));
        }
        if (this.currentPlayer == 0) {
            this.playersTurnTX.setText("Turn: Player: 1");
        } else {
            this.playersTurnTX.setText("Turn: Player: 2");
        }

        this.balls.forEach((ball) => {
            ball.update();

        });
        this.cueBall.update();
        if (this.gameWinner !== -1) {
            this.drawRestartButton();
        }
        let ballSpeed = this.balls.every(ball => {
            return ball.body.velocity.length() < 2
        });
        if (this.cueBall.body.velocity.length() < 2 && ballSpeed) {
            if (this.pocketHasBeenHit == false) {
                this.switchPlayerTurn();
                this.pocketHasBeenHit = true;

            }
            console.log(this.pocketHasBeenHit)
        }
    }


    drawRestartButton() {
        const x: number = 325;
        const y: number = 200;
        if (this.currentPlayer == 0) {
            this.add.text(x, y - 25, 'Player: ' + 1 + " Won!");
        } else {
            this.add.text(x, y - 25, 'Player: ' + 2 + " Won!");
        }
        const button = this.add.text(x, y, 'Play Again')
        button.setInteractive();
        button.setFontSize(20);
        button.setPadding(10, 5);
        button.setBackgroundColor('#27282c');
        button.setStroke('#ffffff', 2);
        button.on('pointerdown', () => {
            this.scene.restart();
        });

    }

    drawPlayerBalls() {
        const p1StartPosX: number = 100;
        const p1StartPosY: number = 575;
        const p2StartPosX: number = 500;
        const p2StartPosY: number = 575;
        let spacer = 20;

        if (this.currentPlayer == 0) {
            if (this.playerOneBallList.length > 0) {
                for (let ball in this.playerOneBallList) {
                    this.playerOneBallList[ball].setX(p1StartPosX + spacer);
                    this.playerOneBallList[ball].setY(p1StartPosY);
                    this.playerOneBallList[ball].setVelocity(0);
                    this.playerOneBallList[ball].setBounce(0);
                    this.playerOneBallList[ball].setCollideWorldBounds(false);
                    spacer += 30;
                }
            }
        } else if (this.currentPlayer == 1) {
            if (this.playerTwoBallList.length > 0) {
                for (let ball in this.playerTwoBallList) {
                    this.playerTwoBallList[ball].setX(p2StartPosX + spacer);
                    this.playerTwoBallList[ball].setY(p2StartPosY);
                    this.playerTwoBallList[ball].setVelocity(0);
                    this.playerTwoBallList[ball].setBounce(0);
                    this.playerTwoBallList[ball].setCollideWorldBounds(false);
                    spacer += 30;
                }
            }
        }
    }


    drawPockets(table) {
        const graphics = this.add.graphics();
        const pocketSize: number = 20;

        this.pockets = [
            //Upper Left Corner
            {x: table.x - table.width / 2 + 20, y: (table.y + 5) - table.height / 2 + 10, id: 0},
            //Upper Right Corner
            {x: table.x + table.width / 2 - 20, y: (table.y + 5) - table.height / 2 + 10, id: 2},
            //Lower Left Corner
            {x: table.x - table.width / 2 + 20, y: (table.y - 5) + table.height / 2 - 10, id: 3},
            //Lower Right Corner
            {x: table.x + table.width / 2 - 20, y: (table.y - 5) + table.height / 2 - 10, id: 5},
            //Upper Middle Corner
            {x: (table.x - 20) + pocketSize, y: table.y - 190, id: 1},
            // Lower Middle Corner
            {x: (table.x - 20) + pocketSize, y: table.y + 190, id: 4}
        ];


        this.pockets.forEach((pocket) => {
            const pocketCollider = this.physics.add.sprite(pocket.x, pocket.y, 'cueBall');
            pocketCollider.setScale(0.3);
            pocketCollider.setVisible(false);
            pocketCollider.setCircle(45); // Set circular hitbox
            pocketCollider.body.setAllowGravity(false); // Make the collider unaffected by gravity

            // Overlap handler for balls and pockets
            this.physics.add.overlap(
                this.balls,
                pocketCollider,
                this.ballPocketOverlapHandler,
                null,
                this
            );
        });


        graphics.setDepth(1);
        graphics.generateTexture('pockets', pocketSize * 2, pocketSize * 2);


    }


    ballPocketColHandler(ball) {
        const ballToBeRemoved = this.balls.indexOf(ball);
        if (this.currentPlayer === 0) {
            if (this.playerOnePlays === '') {
                //Full
                if (ball.getID() <= 7 && this.playerTwoPlays !== 'full') {
                    this.playerOneBallList.push(ball);
                    this.playerOnePlays = 'full';
                    this.playerTwoPlays = 'half';
                } else if (ball.getID() >= 9 && this.playerTwoPlays !== 'half') {
                    this.playerOneBallList.push(ball);
                    this.playerOnePlays = 'half';
                    this.playerTwoPlays = 'full';

                }
            } else if (this.playerOneBallList.length == 7) {
                if (ball.getID() == 8) {
                    this.playerOneBallList.push(ball)
                    this.gameWinner = 0;
                } else if (this.playerOneBallList.length < 7) {
                    if (ball.getID() == 8) {
                        this.switchPlayerTurn();
                        this.resetCueBallPosition();
                    }
                }
            } else if (this.playerOnePlays === 'full') {
                if (ball.getID() <= 7) {
                    this.playerOneBallList.push(ball)
                } else {
                    this.switchPlayerTurn();
                }
            } else if (this.playerOnePlays === 'half') {
                if (ball.getID() >= 9) {
                    this.playerOneBallList.push(ball)
                } else {
                    this.switchPlayerTurn();
                }

            }


        }
        if (this.currentPlayer === 1) {
            if (this.playerTwoPlays === '') {
                //Full
                if (ball.getID() <= 7 && this.playerOnePlays !== 'full') {
                    this.playerTwoBallList.push(ball);
                    this.playerTwoPlays = 'full';
                    this.playerOnePlays = 'half';
                    //half
                } else if (ball.getID() >= 9 && this.playerOnePlays !== 'half') {
                    this.playerOneBallList.push(ball);
                    this.playerTwoPlays = 'half';
                    this.playerOnePlays = 'full';

                }
            } else if (this.playerTwoBallList.length == 7) {
                if (ball.getID() == 8) {
                    this.playerTwoBallList.push(ball)
                    this.gameWinner = 1;
                } else if (this.playerTwoBallList.length < 7) {
                    if (ball.getID() == 8) {
                        this.resetCueBallPosition();
                       this.switchPlayerTurn();
                    }
                }
            } else if (this.playerTwoPlays === 'full') {
                if (ball.getID() <= 7) {
                    this.playerTwoBallList.push(ball);
                } else {
                    this.switchPlayerTurn();
                }
            } else if (this.playerTwoPlays === 'half') {
                if (ball.getID() >= 9) {
                    this.playerTwoBallList.push(ball);
                } else {
                    this.switchPlayerTurn();
                }


            }
        }
        this.drawPlayerBalls();

    }


    switchPlayerTurn() {
        if (this.currentPlayer === 0) {
            this.currentPlayer = 1;
        } else {
            this.currentPlayer = 0;
        }
        this.pocketHasBeenHit = false;
    }


    resetCueBallPosition() {
        this.cueBall.setVelocity(0);
        this.cueBall.setPosition(this.ballX, this.ballY);
        this.switchPlayerTurn();
    }


    ballPocketOverlapHandler(ball, pocket) {
        this.pocketHasBeenHit = true;
        // console.log("Ball " + ball.getID() + " Hit the pocket.");
        if (ball.getID() !== 0) {
            this.ballPocketColHandler(ball);
        } else {
            this.switchPlayerTurn();
            this.resetCueBallPosition();
        }
    }


    createEightBallGame(ballScale) {
        //Declaring the starting position of the first ball.
        let xStart: number = 400;
        let yStart: number = 300;
        //Declaring two lists, one for the x values and one for the y values
        let xValues: any[] = [];
        let yValues: any[] = [];
        //We need to keep track of the y value of the balls that came before
        let oldYValue: number = yStart;
        //spacing between the balls, can be easily adjusted here
        const xSpacing: number = 30;
        const ySpacing: number = 15;
        let i = 1;

            //This creates the coordinates for, x and y for the ball positions
         //We start with i = 1. As long as it is smaller than 6 we loop through it
        // This is done because we 5 rows
        while (i < 6) {
            //we add the x values to the list
            xValues.push(xStart);
            // each time we iterate we decrase j by one. j = 6 here.
            // this is done since we have 5 balls in the first row, then 4 in the next etc.
            for (let j = 6; j > i; j--) {
                yValues.push(yStart);
                //yStart - 20, since that is the y position each ball in the same row is lower than the one before it!
                yStart -= 20;
            }
            //The new starting value for the next row of balls.
            yStart = oldYValue + ySpacing;
            // the old value saved since we need this later to be able to repeat our pattern
            // ex: y = 300 for the first row, y = 320 for the second row, 340 for the third etc.
            oldYValue = yStart;
            //Since the balls need to move along the x axis
            xStart += xSpacing;
            i++;


        }


        //now we want to add our Balls with their position to a list
        //index
        let index = 0;
        // id will be given to a ball
        let ballId = 1;
        //while the xValues list is bigger than 0
        while (xValues.length > 0) {
            //while k is smaller than x.values
            for (let k = 0; k < xValues.length; k++) {
                //Add a ball with its given x and y values
                this.balls.push(new Ball({
                    scene: this,
                    //the value from the xValues list based in k
                    x: xValues[k],
                    //using the index here, since some y values share the same x values
                    y: yValues[index],
                    texture: 'ball' + ballId,
                    id: ballId
                }).setScale(ballScale));

                //while k goes back to 0 after it is bigger than the length of xValues
                //index keeps increasing up to 14
                index++;
                //ball id given to each ball from 1-15
                ballId++;
            }
            //Remove the first element of my xValues array. Reducing the balls to be added by 1
            xValues.splice(0, 1);

        }


        this.shuffleBallList();
    }


    shuffleBallList() {
        //https://javascript.info/task/shuffle
        const eightBallFutureXPos = this.balls[6].x;
        const eightBallFutureYPos = this.balls[6].y;
        let eightBallXPos = 0;
        let eightBallYPos = 0;


        let shuffledBallPositions = [];

        for (let i = 0; i < this.balls.length; i++) {
            let ballsPos = [this.balls[i].x, this.balls[i].y];
            shuffledBallPositions.push(ballsPos);

        }
        for (let i = shuffledBallPositions.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

            // swap elements array[i] and array[j]
            // we use "destructuring assignment" syntax to achieve that
            // you'll find more details about that syntax in later chapters
            // same can be written as:
            // let t = array[i]; array[i] = array[j]; array[j] = t
            [shuffledBallPositions[i], shuffledBallPositions[j]] = [shuffledBallPositions[j], shuffledBallPositions[i]];
        }


        for (const BallPos in this.balls) {
            let x = shuffledBallPositions[BallPos][0];
            let y = shuffledBallPositions[BallPos][1];
            this.balls[BallPos].setX(x);
            this.balls[BallPos].setY(y);
        }

        let tempX = 0;
        let tempY = 0;
        let tempEightPos = "";
        let tempPos = "";

        /**
         * The Eight Ball has a fixed position on the board:
         * Middle of the third row.
         * To achieve this, we check at what position the 8-ball currently is and save that
         * we also check which ball is currently occupying the 8-ball position
         * then we save those positions
         * we can now use these positions to swap the balls!
         */
        for (const ball in this.balls) {
            if (this.balls[ball].getID() == 8) {
                eightBallXPos = this.balls[ball].x;
                eightBallYPos = this.balls[ball].y;
                tempEightPos = ball;
            }
            if (this.balls[ball].x === eightBallFutureXPos && this.balls[ball].y === eightBallFutureYPos) {
                tempX = this.balls[ball].x;
                tempY = this.balls[ball].y;
                tempPos = ball;
            }
        }

        // Now that we have both balls positions we can switch them!
        this.balls[tempEightPos].x = tempX;
        this.balls[tempEightPos].y = tempY;

        this.balls[tempPos].x = eightBallXPos;
        this.balls[tempPos].y = eightBallYPos;


    }


}


const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: Billiard,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
