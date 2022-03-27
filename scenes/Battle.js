class BattleScene extends Phaser.Scene {
    constructor() {
        super("Battle");
        this.monster = null;
        this.health = null;
        this.bar = null;
    }

    init(data) {
        this.stage = data.stage;
        this.players = data.players;
        this.sketch = data.sketch;
        this.image = data.image;
        this.health = this.stage.health;
        this.damage = this.stage.damage;
    }

    create() {
        if (this.image == 'sketch') {
            this.textures.addBase64(this.stage.name, this.sketch);
            // When the texture is done being loaded, create the image!
            this.textures.on('onload', (textureKey) => {
                if (textureKey == this.stage.name) {
                    this.monster = this.add.image(GAME_SCALE.center.x, GAME_SCALE.center.y, this.stage.name)
                        .setInteractive()
                        .on('pointerdown', () => {
                            this.attackMonster(5);
                            MULTI.broadcast({
                                type: 'attack',
                                damage: 5
                            });
                        });
                }
            });
        }
        this.bar = this.add.rectangle(GAME_SCALE.center.x, GAME_SCALE.center.y + 200, 800, 40, 0xFFFFFF);
        MULTI.on('message received', (peerID, data) => {
            if (data.type == 'attack') {
                this.attackMonster(data.damage);
            }
        });
    }

    update() {
        this.bar.setScale(this.health / this.stage.health, 1);
    }

    attackMonster(dmg) {
        if (this.health > 0) {
            this.health -= dmg;
            if (this.health <= 0) {
                this.health = 0;
                this.tweens.add({
                    targets: this.monster,
                    scale: 0,
                    angle: 1200,
                    alpha: 0,
                    duration: 1000
                });
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

    hitAngle() {
        let angle = Math.trunc(Math.random() * 45);
        return Math.random() < .5 ? angle : angle * -1;
    }
}