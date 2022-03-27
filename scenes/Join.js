class JoinScene extends Phaser.Scene {
    constructor() {
        super("Join");
        this.mp = MultiplayerService.get();
        this.switch = null;
        this.isHost = null;
        this.idInput = null;
        this.usernameInput = null;
        this.play = null;
    }

    preload() {
        this.load.html('switch', 'assets/html/switch.html');
    }

    create() {
        this.add.text(0,0,"powered by socket.io", {
            color: 'white'
        });
        this.add.text(GAME_SCALE.center.x - 380, GAME_SCALE.height - 300, "Host Game?", {
            color: 'white',
            fontSize: '24px'
        }).setOrigin(0, 0.5);
        this.switch = this.add.dom(GAME_SCALE.center.x - 160, GAME_SCALE.height - 300).createFromCache('switch').setScale(1.5);
        this.add.text(GAME_SCALE.center.x - 380, GAME_SCALE.height - 230, "Enter Game ID", {
            color: 'white',
            fontSize: '24px'
        }).setOrigin(0, 0.5);
        this.idInput = this.add.dom(GAME_SCALE.center.x, GAME_SCALE.height - 180, 'input', {
            width: '800px',
            height: '40px',
            fontSize: '24px'
        });
        this.add.text(GAME_SCALE.center.x - 380, GAME_SCALE.height - 450, "Enter Your Username", {
            color: 'white',
            fontSize: '24px'
        }).setOrigin(0, 0.5);
        this.usernameInput = this.add.dom(GAME_SCALE.center.x, GAME_SCALE.height - 400, 'input', {
            width: '800px',
            height: '40px',
            fontSize: '24px'
        });
        this.play = this.add.dom(GAME_SCALE.center.x, GAME_SCALE.height - 80, 'button', {
            width: "600px",
            height: "80px",
            fontSize: "48px"
        }, "Play")
            .addListener('click')
            .on('click', this.gotoLobby, this);

    }

    update() {
        this.isHost = this.switch.getChildByID('toggle').checked;
        this.idInput.node.disabled = this.isHost;
    }

    gotoLobby() {
        if (this.isHost) {
            this.mp.createRoom();
        }
        else {
            this.mp.joinRoom(this.idInput.node.value, {
                username: this.usernameInput.node.value
            });
        }
        this.scene.start("Lobby", {
            username: this.usernameInput.node.value
        });
    }

    multiplayerError(err) {
        let etext = this.add.text(GAME_SCALE.center.x, GAME_SCALE.height, err.type, {
            color: 'red',
            fontSize: '48px',
        }).setOrigin(0.5);
        this.tweens.add({
            targets: [etext],
            duration: 5000,
            alpha: 0,
            y: GAME_SCALE.height - 300,
            onComplete: () => {
                etext.destroy();
            }
        });
    }
}