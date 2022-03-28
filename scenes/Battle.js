class BattleScene extends Phaser.Scene {
    constructor() {
        super("Battle");
        this.state = QuestState.get();
        this.mp = MultiplayerService.get();
        this.monster = null;
        this.health = null;
        this.bar = null;
    }

    create() {
        this.health = this.state.stage.health;
        if (this.state.monster.image == 'sketch') {
            this.textures.addBase64(this.state.stage.name, this.state.monster.sketch);
            // When the texture is done being loaded, create the image!
            this.textures.on('onload', (textureKey) => {
                if (textureKey == this.state.stage.name) {
                    this.monster = this.add.image(GAME_SCALE.center.x, GAME_SCALE.center.y, this.state.stage.name)
                        .setInteractive()
                        .on('pointerdown', () => {
                            this.attackMonster(5);
                            this.mp.broadcast({
                                type: 'attack',
                                damage: 5
                            });
                        });
                }
            });
        }
        this.bar = this.add.rectangle(GAME_SCALE.center.x, GAME_SCALE.center.y + 200, 800, 40, 0xFFFFFF);
        this.mp.on('data from room', (otherID, data, isHost) => {
            console.log("another player attacked");
            if (data.type == 'attack') {
                this.attackMonster(data.damage);
            }
        });
    }

    update() {
        this.bar.setScale(this.health / this.state.stage.health, 1);
    }

    attackMonster(dmg) {
        if (this.health > 0) {
            this.health -= dmg;
            if (this.health <= 0) {
                this.killMonster();
            }
            else {
                this.tweens.add({
                    targets: this.monster,
                    scaleY: this.monster.scaleY * 1.5,
                    angle: { value: this.hitAngle },
                    duration: 80,
                    yoyo: true,
                    ease: 'Quad.easeInOut',
                });
            }
        }
    }

    killMonster() {
        this.health = 0;
        this.tweens.add({
            targets: this.monster,
            scale: 0,
            angle: 1200,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.state.stage = this.state.stage.target;
                this.scene.start('Quest');
            }
        });
    }

    hitAngle() {
        let angle = Math.trunc(Math.random() * 45);
        return Math.random() < .5 ? angle : angle * -1;
    }
}