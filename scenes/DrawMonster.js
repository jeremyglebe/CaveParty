class DrawMonsterScene extends Phaser.Scene {
    constructor() {
        super("DrawMonster");
        this.state = QuestState.get();
        this.mp = MultiplayerService.get();
    }

    create() {
        this.mp.on('data from room', (otherID, data, isHost) => {
            if (data.type == 'sketch' && otherID == this.state.leader) {
                if (this.monImage) this.monImage.destroy();
                const name = `monster-${otherID}-progress-${Date.now()}`
                this.textures.addBase64(name, data.sketch);
                // When the texture is done being loaded, create the image!
                this.textures.on('onload', (textureKey) => {
                    if (textureKey == name) {
                        this.monImage = this.add.image(GAME_SCALE.center.x, GAME_SCALE.center.y, name);
                    }
                });
            }
            else if (data.type == 'monster complete' && otherID == this.state.leader) {
                this.state.monster.image = 'sketch';
                this.state.monster.sketch = data.sketch;
                this.scene.start('Battle');
            }
        });
        this.createSketchZone();
        if (this.state.leader == this.mp.id()) {
            this.add.text(GAME_SCALE.center.x, GAME_SCALE.center.y - 250, "Draw a " + this.state.stage.name + " as quickly as you can!", {
                color: 'white',
                fontSize: '24px'
            }).setOrigin(0.5);
            let timer = this.add.rectangle(GAME_SCALE.center.x, GAME_SCALE.center.y + 250, 800, 40, 0xFFFFFF);
            this.tweens.add({
                targets: timer,
                width: 0,
                duration: 15000,
                // duration: 3000,
                onComplete: () => {
                    this.mp.broadcast({
                        type: 'monster complete',
                        sketch: this.sketch.canvas.toDataURL()
                    });
                    this.state.monster.image = 'sketch';
                    this.state.monster.sketch = this.sketch.canvas.toDataURL();
                    this.scene.start('Battle');
                }
            });
        }
        else {
            console.log(this.state);
            this.add.text(GAME_SCALE.center.x, GAME_SCALE.center.y - 250, this.state.players[this.state.leader].username + " is drawing a " + this.state.stage.name + "!", {
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
            if (pointer.isDown && this.mp.id() == this.state.leader) {
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
            if (this.mp.id() == this.state.leader) {
                this.mp.broadcast({
                    type: 'sketch',
                    sketch: this.sketch.canvas.toDataURL()
                });
            }
        });
    }

}