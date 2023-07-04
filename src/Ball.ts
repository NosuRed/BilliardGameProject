import * as Phaser from 'phaser';

export class Ball extends Phaser.Physics.Arcade.Sprite {
    private id: number = 0;

    constructor(config) {
        super(config.scene, config.x, config.y, config.texture);
        config.scene.add.existing(this);
        this.id = config.id;


        // Add the ball to the scene and enable physics
        config.scene.physics.add.existing(this);

        // Set the bounce property for the ball
        this.setBounce(0.3,0.3);
        this.setCollideWorldBounds(true);
        this.body.setMass(0.5);
        this.setDrag(80, 80);

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