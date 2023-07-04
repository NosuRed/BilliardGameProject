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