import * as Phaser from 'phaser';
// rules used: https://www.billardpro.de/pool-billard-regeln#achtball

export default class Billiard extends Phaser.Scene {
    private cueBallSpeed = 650;
    private ballX = 200;
    private ballY: number = 300;
    private balls;
    private cueBall;
    private velocityTX;
    private pockets;
    private otherBallsMoving;

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
            if (this.cueBall.body.velocity.length() < 2 && !this.otherBallsMoving) {
                let angle = Phaser.Math.Angle.Between(this.cueBall.x, this.cueBall.y, pointer.x, pointer.y);
                this.physics.velocityFromRotation(angle, this.cueBallSpeed, this.cueBall.body.velocity);
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
            {x: table.x - table.width / 2 + 20, y: (table.y + 5) - table.height / 2 + 10},
            //Upper Right Corner
            {x: table.x + table.width / 2 - 20, y: (table.y + 5) - table.height / 2 + 10},
            //Lower Left Corner
            {x: table.x - table.width / 2 + 20, y: (table.y - 5) + table.height / 2 - 10},
            //Lower Right Corner
            {x: table.x + table.width / 2 - 20, y: (table.y - 5) + table.height / 2 - 10},
            //Upper Middle Corner
            {x: (table.x - 20) + pocketSize, y: table.y - 190},
            // Lower Middle Corner
            {x: (table.x - 20) + pocketSize, y: table.y + 190}
        ];

        /*
        this.pockets.forEach(pocket => {
            graphics.fillStyle(0x000000, alphaChannel);
            graphics.fillCircle(pocket.x, pocket.y, pocketSize);
        });
    */


        const pocketColliders = this.physics.add.staticGroup();
        this.pockets.forEach((pocket) => {
            const pocketCollider = this.add
                .circle(pocket.x, pocket.y, pocketSize)
                .setVisible(false)
                .setStrokeStyle(0)
                .setDepth(0);

            pocketColliders.add(pocketCollider);

            // Overlap handler for balls and pockets
            this.physics.add.overlap(
                this.balls,
                pocketCollider,
                this.ballPocketOverlapHandler,
                null,
                this
            );
        });

        graphics.fillStyle(0x000000, alphaChannel);
        pocketColliders.getChildren().forEach((pocketCollider) => {
            const {x, y} = pocketCollider.body.gameObject;
            graphics.fillCircle(x, y, pocketSize);
        });


        graphics.setDepth(1);
        graphics.generateTexture('pockets', pocketSize * 2, pocketSize * 2);

    }


    ballPocketOverlapHandler(ball, pocket) {
        const ballTobeRemoved = this.balls.indexOf(ball);
        console.log(`Ball ${ball.getID()} overlapped with pocket.`);
        if (ball.getID !== 0) {
            ball.destroy();
            this.balls.splice(ballTobeRemoved, 1);
        } else if (ball.getID()) {

        }
    }


    tenBallWinCondition() {

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
        this.balls = [];

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
        let y = 0;
        let index = 0;
        while (xValues.length > 0) {
            for (let k = 0; k < xValues.length; k++) {
                console.log(yValues[index] + " " +  xValues[k]);
                this.balls.push(new Ball({
                    scene: this,
                    x: xValues[k],
                    y: yValues[index],
                    texture: 'cueBall',
                    id: 0
                }).setScale(ballScale));

                index++;
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
            gravity: {y: 0}
        }
    }
};

const game = new Phaser.Game(config);


class Ball extends Phaser.Physics.Arcade.Sprite {
    private id: number = 0;

    constructor(config) {
        super(config.scene, config.x, config.y, config.texture);
        config.scene.add.existing(this);
        this.id = config.id;


        // Add the ball to the scene and enable physics
        config.scene.physics.add.existing(this);

        // Set the bounce property for the ball
        this.setBounce(1,1);
        this.setCollideWorldBounds(true);
        this.body.setMass(1);
        this.setDrag(75, 75);

    }

    update() {
        if (Math.abs(this.body.velocity.x) <= 2) {
            this.body.velocity.x = 0;
        }
        if (Math.abs(this.body.velocity.y) <= 2) {
            this.body.velocity.y = 0;
        }
    }

    getID() {
        return this.id;
    }


}
