import * as Phaser from 'phaser';
import {Ball} from './Ball';
// rules used: https://www.billardpro.de/pool-billard-regeln#achtball #Last date visited: 05/07/2023

export default class Billiard extends Phaser.Scene {
    private cueBallSpeed = 1000;
    private ballX = 200;
    private ballY: number = 300;
    private balls = [];
    private cueBall;
    private velocityTX;
    private playersTurnTX;
    private pockets;
    private otherBallsMoving;
    private eightGame;
    private gameWinner: number = -1;

    private currentPlayer: number = 0; // Player1 = 0; Player2 = 1;
    private fullBallsDesignation:number[] = [1, 2, 3, 4, 5, 6, 7]; // Full balls: 1 to 7
    private halfBallsDesignation: number[] = [9, 10, 11, 12, 13, 14, 15]; // Half balls: 9 to 15
    private eightBallDesignation: number = 8; // Ball with the #8
    private playerOnePlays: string;
    private playerTwoPlays: string;
    private playerOneBallList: any[] = [];
    private playerTwoBallList: any[] = [];

    constructor() {
        super('Billiard');
    }

    preload() {
        this.load.image('table', 'assets/PlaceHolderBilliardTable.png');
        this.load.image('cueBall', 'assets/whiteCueBallPlaceholder.png');
        this.load.image('purpleBall', 'assets/PurpleBallPlaceholder.png');
        this.load.image('cueStick', 'assets/cueStickPlaceholder.png');
    }

    create() {

        let ballScale = 0.3;
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

        //array of balls
        this.balls.push(this.cueBall);
        this.createEightBallGame(ballScale);

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


        const allBallsStopped = this.balls.every((ball) => {
            return ball.body.velocity.x < 2 && ball.body.velocity.y < 2;
        });

        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                if (this.cueBall.body.velocity.length() < 2 && allBallsStopped) {
                    let angle = Phaser.Math.Angle.Between(this.cueBall.x, this.cueBall.y, pointer.x, pointer.y);
                    this.physics.velocityFromRotation(angle, this.cueBallSpeed, this.cueBall.body.velocity);
                }
            }

        });

        this.velocityTX = this.add.text(100, 100, 'Velocity: 0', {fontSize: '32px', color: '#111'});
        this.playersTurnTX = this.add.text(200,200, 'Player: 0', {fontSize: '32px', color: '#111'});


    }

    update() {
        const cueBallVelocity = this.cueBall.body.velocity;
        const cueBallLength = cueBallVelocity.length();
        this.velocityTX.setText('Velocity: ' + cueBallLength);
        this.playersTurnTX.setText("Player: " + this.currentPlayer);
        this.balls.forEach((ball) => {
            ball.update();

        });
        this.cueBall.update();


    }





    drawPockets(table) {
        const graphics = this.add.graphics();
        const pocketSize: number = 20;
        const alphaChannel: number = 0.9;

        this.pockets = [
            //Upper Left Corner
            {x: table.x - table.width / 2 + 20, y: (table.y + 5) - table.height / 2 + 10, id: 0},
            //Upper Right Corner
            {x: table.x + table.width / 2 - 20, y: (table.y + 5) - table.height / 2 + 10, id: 2},
            //Lower Left Corner
            {x: table.x - table.width / 2 + 20, y: (table.y - 5) + table.height / 2 - 10, id: 3 },
            //Lower Right Corner
            {x: table.x + table.width / 2 - 20, y: (table.y - 5) + table.height / 2 - 10, id: 5},
            //Upper Middle Corner
            {x: (table.x - 20) + pocketSize, y: table.y - 190, id: 1},
            // Lower Middle Corner
            {x: (table.x - 20) + pocketSize, y: table.y + 190, id: 4}
        ];


        this.pockets.forEach((pocket) => {
            const pocketCollider = this.physics.add.sprite(pocket.x, pocket.y, 'cueBall');
            pocketCollider.setScale(0.4);
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

    /*
    winConditionCheckEightBall(ball, pocket, ballToBeRemoved  ){
        /**
         * Check whose turn it is.
         * Is it p1 turn?
         * Has he already sunk a ball?
         * Is it a ball of his type?
         * If yes, add it to his "Balls"
         * if not, reset the white ball and the sunk ball.
         * turn order change

        if (this.currentPlayer === 0){
            if((!(Array.isArray(this.playerOneBallList)) || this.playerOneBallList.length <= 0) && (!(Array.isArray(this.playerTwoBallList)) || this.playerTwoBallList.length <= 0)){
                this.playerOneBallList.push(ball);
                //set what balls to play
                if(ball.getID() >= 9){
                    this.playerOnePlays = "half";
                    this.playerTwoPlays = "full";
                }else{
                    this.playerOnePlays = "full"
                    this.playerTwoPlays = "half"
                }
             //A player already has sunk a ball.
            }else{
                //check if the ball can be played by the player
                //p1[]; p2[9]
                if(this.playerOnePlays === "half"){
                    //Ball is indeed a half ball, so add it and continue playing
                    if(ball.getID() >= 9){
                        this.playerOneBallList.push(ball);
                        ball.destroy();
                        this.balls.splice(ballToBeRemoved, 1);
                        //ball is full, so reset the ball position and change the turn
                    }else{
                        this.currentPlayer = 1;
                    }
                    //full ball case for player 1 :)
                }else{
                    if(ball.getID() <= 7){
                        this.playerOneBallList.push(ball)
                        this.playerOneBallList.push(ball);
                        ball.destroy();
                        this.balls.splice(ballToBeRemoved, 1);
                    }
                }
            }
        }
        else if(this.currentPlayer === 1){

        }

    } */

    processBallSinking(ball) {
        const ballToBeRemoved = this.balls.indexOf(ball);

        if (this.currentPlayer === 0) {
            if (!this.playerOneBallList || this.playerOneBallList.length === 0) {
                this.playerOneBallList = [ball];
                this.assignBallDesignations(ball);
            } else {
                if (this.playerOnePlays === "half" && ball.getID() >= 9) {
                    this.playerOneBallList.push(ball);
                    ball.destroy();
                    this.balls.splice(ballToBeRemoved, 1);
                } else if (this.playerOnePlays === "full" && ball.getID() <= 7) {
                    this.playerOneBallList.push(ball);
                    ball.destroy();
                    this.balls.splice(ballToBeRemoved, 1);
                } else {
                    this.checkTurnChange();
                }
            }
        } else if (this.currentPlayer === 1) {
            if (!this.playerTwoBallList || this.playerTwoBallList.length === 0) {
                this.playerTwoBallList = [ball];
                this.assignBallDesignations(ball);
            } else {
                if (this.playerTwoPlays === "half" && ball.getID() >= 9) {
                    this.playerTwoBallList.push(ball);
                    ball.destroy();
                    this.balls.splice(ballToBeRemoved, 1);
                } else if (this.playerTwoPlays === "full" && ball.getID() <= 7) {
                    this.playerTwoBallList.push(ball);
                    ball.destroy();
                    this.balls.splice(ballToBeRemoved, 1);
                } else {
                    this.checkTurnChange();
                }
            }
        }
    }

    assignBallDesignations(ball) {
        if (ball.getID() >= 9) {
            this.playerOnePlays = "half";
            this.playerTwoPlays = "full";
        } else {
            this.playerOnePlays = "full";
            this.playerTwoPlays = "half";
        }
    }

    switchPlayerTurn() {
        if (this.currentPlayer === 0) {
            this.currentPlayer = 1;
        } else {
            this.currentPlayer = 0;
        }
    }
    checkTurnChange() {
        const allBallsStopped = this.balls.every((ball) => {
            return ball.body.velocity.x === 0 && ball.body.velocity.y === 0;
        });

        if (allBallsStopped) {
            this.switchPlayerTurn();
            this.resetCueBallPosition();
        }
    }

    resetCueBallPosition() {
        this.cueBall.setVelocity(0);
        this.cueBall.setPosition(this.ballX, this.ballY);
    }



    ballPocketOverlapHandler(ball, pocket) {
        const ballToBeRemoved = this.balls.indexOf(ball);
        console.log("Ball " + ball.getID() + " Hit the pocket.");

        if (ball.getID() !== 0) {
            this.processBallSinking(ball);
        } else {
            this.switchPlayerTurn();
            this.resetCueBallPosition();
        }
    }

    /*
    ballPocketOverlapHandler(ball, pocket) {
        const ballTobeRemoved = this.balls.indexOf(ball);
        console.log("Ball " + ball.getID() + " Hit the pocket.");
        console.log("Player: " + this.currentPlayer + "")
        if(ball.id !== 0) {
            //this.winConditionCheckEightBall(ball, pocket, ballTobeRemoved);
            this.processBallSinking(ball);
        }else{

            if(this.currentPlayer == 0){
                this.currentPlayer = 1;
            }
            else{
                this.currentPlayer = 0;
            }
            this.cueBall.setVelocity(0);
            this.cueBall.setX(this.ballX);
            this.cueBall.setY(this.ballY);
        }


    }
    */


    createEightBallGame(ballScale) {
        let xStart: number = 400;
        let yStart: number = 300;
        let xValues: any[] = [];
        let yValues: any[] = [];
        let oldYValue: number = yStart;
        const xSpacing: number = 30;
        const ySpacing : number = 15;
        let i = 1;
        let idCount = 1;

        while(i < 6){
            xValues.push(xStart);
            for (let j = 6; j > i; j--) {
                yValues.push(yStart);
                yStart -= 20;
            }
            yStart = oldYValue + ySpacing;
            oldYValue = yStart;
            xStart += xSpacing;
            idCount++;
            i++;


        }
        let index = 0;
        let ballId = 1;
        while (xValues.length > 0) {
            for (let k = 0; k < xValues.length; k++) {
               // console.log(yValues[index] + " " +  xValues[k]);
                this.balls.push(new Ball({
                    scene: this,
                    x: xValues[k],
                    y: yValues[index],
                    texture: 'purpleBall',
                    id: ballId
                }).setScale(ballScale));

                index++;
                ballId++;
            }
            xValues.splice(0,1);

        }


    }


}


const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: Billiard,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    }
};

const game = new Phaser.Game(config);
