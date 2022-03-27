class DrawMonsterScene extends Phaser.Scene {
    constructor() {
        super("DrawMonster");
        this.stage = null;
        this.players = null;
        this.leader = null;
    }

    init(data) {
        this.stage = data.stage;
        this.players = data.players;
        this.leader = data.leader;
    }

    create() {
        MULTI.off('message received');
        MULTI.on('message received', (peerID, data) => {
            if (data.type == 'sketch' && peerID == this.leader) {
                if (this.monImage) this.monImage.destroy();
                const name = `monster-${peerID}-progress-${Date.now()}`
                this.textures.addBase64(name, data.sketch);
                // When the texture is done being loaded, create the image!
                this.textures.on('onload', (textureKey) => {
                    if (textureKey == name) {
                        this.monImage = this.add.image(GAME_SCALE.center.x, GAME_SCALE.center.y, name);
                    }
                });
            }
            else if (data.type == 'monster complete' && peerID == this.leader) {
                this.scene.start('Battle', {
                    stage: this.stage,
                    players: this.players,
                    sketch: data.sketch,
                    image: 'sketch'
                });
            }
        });
        this.createSketchZone();
        if (this.leader == MULTI.self.id) {
            this.add.text(GAME_SCALE.center.x, GAME_SCALE.center.y - 250, "Draw a " + this.stage.name + " as quickly as you can!", {
                color: 'white',
                fontSize: '24px'
            }).setOrigin(0.5);
            let timer = this.add.rectangle(GAME_SCALE.center.x, GAME_SCALE.center.y + 250, 800, 40, 0xFFFFFF);
            this.tweens.add({
                targets: timer,
                width: 0,
                duration: 20000,
                // duration: 2000,
                onComplete: () => {
                    MULTI.broadcast({
                        type: 'monster complete',
                        sketch: this.sketch.canvas.toDataURL()
                    });
                    this.scene.start('Battle', {
                        stage: this.stage,
                        players: this.players,
                        sketch: this.sketch.canvas.toDataURL(),
                        image: 'sketch'
                    });
                }
            });
        }
        else {
            this.add.text(GAME_SCALE.center.x, GAME_SCALE.center.y - 250, this.players[this.leader].username + " is drawing a " + this.stage.name + "!", {
                color: 'white',
                fontSize: '24px'
            }).setOrigin(0.5);
        }
    }

    createSketchZone() {
        this.panel = this.add.rectangle(GAME_SCALE.center.x, GAME_SCALE.center.y, 400, 400, 0x555555);
        // Create a render texture on which to draw
        this.sketch = this.add.renderTexture(GAME_SCALE.center.x - 200, GAME_SCALE.center.y - 200, 400, 400);
        // Enable input on the drawing
        this.sketch.setInteractive();
        // Callback to draw when the brush is moved (assuming the pointer is also being pressed)
        this.sketch.on('pointermove', (pointer) => {
            if (pointer.isDown && MULTI.self.id == this.leader) {
                // Get the brush's frame, so we can position the drawn brush texture to center on the input
                let brushTexture = this.textures.getFrame('brush', 0);
                // X and Y of pointer, relative to the start position of the render texture, and centered on the pointer.
                let x = pointer.x - this.sketch.x - brushTexture.centerX;
                let y = pointer.y - this.sketch.y - brushTexture.centerY;
                // Draw the brush's texture
                this.sketch.draw('brush', x, y, 1.0);
            }
        });
        this.sketch.on('pointerup', () => {
            if (MULTI.self.id == this.leader) {
                MULTI.broadcast({
                    type: 'sketch',
                    sketch: this.sketch.canvas.toDataURL()
                });
            }
        });
    }

}