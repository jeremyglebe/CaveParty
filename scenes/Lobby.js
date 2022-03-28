class LobbyScene extends Phaser.Scene {
    constructor() {
        super("Lobby");
        this.state = QuestState.get();
        this.mp = MultiplayerService.get();
        this.players = {};
        this.quests = null;
        this.gameIDText = null;
        this.playerListDiv = null;
        this.panel = null;
        this.sketch = null;
        this.ready = false;
        this.startButton = null;
    }

    preload() {
        this.load.image('brush', 'assets/images/tiny.png');
        this.load.json('quests', 'assets/encounters.json');
    }

    create() {
        this.quests = this.cache.json.get('quests');
        this.gameIDText = this.add.text(GAME_SCALE.center.x, 40, `Game ID: ${this.mp.room}`, {
            color: 'white',
            fontSize: '36px'
        }).setOrigin(0.5);
        console.log(this.gameIDText.text);
        this.playerListDiv = this.add.dom(GAME_SCALE.width, GAME_SCALE.center.y, 'div', {
            overflow: 'auto',
            width: '130px',
            height: `400px`,
            backgroundColor: 'darkgray',
            fontSize: '24px',
            color: 'white',
            padding: '15px'
        }, "").setOrigin(1, 0.5);

        this.createSketchZone();
        this.createConfirmButton();

        this.mp.on('other joined', this.onOtherJoined, this);
        this.mp.on('data from room', this.onMessageReceived, this);
    }

    update() {
        this.positionSketches();
        this.gameIDText.setText(`Game ID: ${this.mp.room}`);
        let str = "";
        for (let ply of Object.values(this.players)) str += ply.username + '\n\n';
        this.playerListDiv.setText("[Player List]\n\n" + str);
        this.tryCreateStartButton();
    }

    onOtherJoined(otherID, data) {
        this.players[otherID] = {
            username: data.username
        }
        this.mp.broadcast({
            type: 'username',
            username: this.state.username
        });
    }

    onMessageReceived(otherID, data, isHost) {
        if (data.type == "username") {
            // Add the peer's username
            this.players[otherID] = {
                username: data.username
            }
        }
        else if (data.type == 'sketch') {
            this.textures.addBase64(`sketch-${otherID}`, data.sketch);
            // When the texture is done being loaded, create the image!
            this.textures.on('onload', (textureKey) => {
                if (textureKey == `sketch-${otherID}`) {
                    this.players[otherID].sketch = this.add.image(0, 0, `sketch-${otherID}`);
                    this.players[otherID].text = this.add.text(0, 0, this.players[otherID].username, {
                        color: 'white',
                        fontSize: '16px'
                    }).setOrigin(0.5);
                }
            });
        }
        else if (data.type == 'start game' && isHost) {
            this.state.quest = data.quest;
            this.state.stage = data.quest["START"]
            this.state.players = this.players;
            this.state.leader = otherID;
            this.scene.start("Quest");
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
            if (pointer.isDown) {
                // Get the brush's frame, so we can position the drawn brush texture to center on the input
                let brushTexture = this.textures.getFrame('brush', 0);
                // X and Y of pointer, relative to the start position of the render texture, and centered on the pointer.
                let x = pointer.x - this.sketch.x - brushTexture.centerX;
                let y = pointer.y - this.sketch.y - brushTexture.centerY;
                // Draw the brush's texture
                this.sketch.draw('brush', x, y, 1.0);
            }
        });
    }

    createConfirmButton() {
        let circle = this.add.circle(GAME_SCALE.center.x, GAME_SCALE.center.y + 265, 40, 0xFFFFFF)
            .setInteractive();
        let check = this.add.text(GAME_SCALE.center.x, GAME_SCALE.center.y + 265, "✓", {
            color: 'black',
            fontSize: '36px'
        }).setOrigin(0.5);
        circle.on('pointerdown', () => {
            this.readyUp(circle, check);
        });
    }

    readyUp(circle, check) {
        this.mp.broadcast({
            type: 'sketch',
            sketch: this.sketch.canvas.toDataURL()
        });
        circle.disableInteractive();
        this.tweens.add({
            targets: [circle, check],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                circle.destroy();
                check.destroy();
                this.ready = true;
            }
        });
    }

    everyoneReady() {
        if (!this.ready) {
            return false;
        }
        for (let ply of Object.values(this.players)) {
            if (!ply.sketch) {
                return false;
            }
        }
        return true;
    }

    positionSketches() {
        const players = Object.values(this.players);
        const num = players.length;
        const width = 600
        const startX = GAME_SCALE.center.x - width / 2;
        const segWid = 600 / num;
        for (let i = 0; i < num; i++) {
            if (players[i].sketch) {
                players[i].sketch.setScale(.25);
                players[i].sketch.setPosition(startX + segWid * i, 100);
                players[i].text.setPosition(startX + segWid * i, 150);
            }
        }
    }

    tryCreateStartButton() {
        if (this.mp.isHost && this.everyoneReady() && !this.startButton) {
            this.startButton = this.add.dom(GAME_SCALE.center.x, 700, 'button', {
                height: '100px',
                width: '400px',
                fontSize: '48px'
            }, "Start Game")
                .addListener('click')
                .on('click', () => {
                    const questList = Object.values(this.quests)
                    const quest = questList[Math.floor(Math.random() * questList.length)]
                    console.log(quest);
                    this.mp.broadcast({
                        type: 'start game',
                        quest: quest
                    });
                    this.state.quest = quest;
                    this.state.stage = quest["START"];
                    this.state.players = this.players;
                    this.state.leader = this.mp.id();
                    this.scene.start('Quest');
                });
        }
    }
}