import * as Phaser from 'phaser';

export class Ball extends Phaser.Physics.Arcade.Sprite {
    private id: number = 0;
    private isPicked: boolean = false;
    private pointer: Phaser.Input.Pointer;

    constructor(config) {
        super(config.scene, config.x, config.y, config.texture);
        config.scene.add.existing(this);
        this.id = config.id;


        // Add the ball to the scene and enable physics
        config.scene.physics.add.existing(this);

        // Set the bounce property for the ball
        this.setBounce(0.90,0.90);
        this.setCollideWorldBounds(true);
        this.body.setMass(1);
        this.setDrag(85, 85);


        this.setInteractive();
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);
        this.setCircle(40);

    }

    update() {
        if (this.isPicked) {
            // Move the ball with the mouse pointer when it's picked up
            this.x = this.pointer.worldX;
            this.y = this.pointer.worldY;
        }
        if (Math.abs(this.body.velocity.x) <= 5) {
            this.body.velocity.x = 0;
        }
        if (Math.abs(this.body.velocity.y) <= 5) {
            this.body.velocity.y = 0;
        }
    }



    onPointerDown(pointer) {
        if (pointer.rightButtonDown()) {
            this.isPicked = true;
            this.pointer = pointer;
            // Disable physics for the ball when picked up
            this.body.enable = false;
        }
    }

    onPointerUp(pointer) {
        if (this.isPicked && pointer.rightButtonReleased()) {
            this.isPicked = false;
            // Enable physics for the ball when released
            this.body.enable = true;
        }
    }

    getID() {
        return this.id;
    }


}