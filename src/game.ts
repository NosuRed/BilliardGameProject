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
    private pockets;
    private otherBallsMoving;

    private currentPlayer = 0; // Player 0 or Player 1
    private fullBallsDesignation:number[] = [1, 2, 3, 4, 5, 6, 7]; // Full balls: 1 to 7
    private halfBallsDesignation = [9, 10, 11, 12, 13, 14, 15]; // Half balls: 9 to 15
    private eightBallDesignation = 8; // Eight's ball: 8

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


        this.otherBallsMoving = this.balls.some(ball => ball.body.velocity.length() > 0);
        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                if (this.cueBall.body.velocity.length() < 2 && !this.otherBallsMoving) {
                    let angle = Phaser.Math.Angle.Between(this.cueBall.x, this.cueBall.y, pointer.x, pointer.y);
                    this.physics.velocityFromRotation(angle, this.cueBallSpeed, this.cueBall.body.velocity);
                }
            }

        });

        this.velocityTX = this.add.text(100, 100, 'Velocity: 0', {fontSize: '32px', color: '#111'})


    }

    update() {
        const cueBallVelocity = this.cueBall.body.velocity;
        const cueBallLength = cueBallVelocity.length();
        this.velocityTX.setText('Velocity: ' + cueBallLength);
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


    ballPocketOverlapHandler(ball, pocket) {
        const ballTobeRemoved = this.balls.indexOf(ball);
        console.log("Ball " + ball.getID() + " Hit the pocket.");
        if(ball.id !== 0) {
            ball.destroy();
            this.balls.splice(ballTobeRemoved, 1);
        }else{
            this.cueBall.setVelocity(0);
            this.cueBall.setX(this.ballX);
            this.cueBall.setY(this.ballY);
        }


    }


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
