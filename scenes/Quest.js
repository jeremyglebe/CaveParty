class QuestScene extends Phaser.Scene {
    constructor() {
        super("Quest");
        this.mp = MultiplayerService.get();
        this.stage = null;
        this.div = null;
    }

    init(data) {
        this.quest = data.quest;
        this.players = data.players;
        this.leader = data.leader;
        this.votes = [];
        console.log(this.quest);
    }

    create() {
        this.div = this.add.dom(GAME_SCALE.center.x, GAME_SCALE.center.y, 'div', {
            width: '600px',
            height: '600px',
            borderStyle: 'solid',
            borderWidth: '3px',
            borderColor: 'white',
            color: 'white',
            fontSize: '24px',
            paddingLeft: '20px',
            paddingRight: '20px'
        });
        this.setStage(this.quest["START"]);

        this.mp.on('data from room', (otherID, data, isHost) => {
            if (data.type == 'vote' && this.mp.isHost) {
                this.addVote(otherID, data.choice);
            }
            else if (data.type == 'change stage' && isHost) {
                this.leader = data.leader;
                this.setStage(data.stage)
            }
        });
    }

    setStage(stage) {
        console.log("Set Stage: " + JSON.stringify(stage));
        this.stage = stage;
        if (stage.type == 'dialogue') {
            this.dialogueStage();
        }
        else if (stage.type == 'fight') {
            if (stage.image == 'sketch') {
                this.scene.start('DrawMonster', {
                    stage: stage,
                    players: this.players,
                    leader: this.leader
                });
            }
            else {

            }
        }
    }

    dialogueStage() {
        this.div.node.innerHTML = `
        <p>${this.stage.text}</p>
        `
        for (let i = 0; i < this.stage.choices.length; i++) {
            const choice = this.stage.choices[i];
            let button = document.createElement('button');
            button.onclick = () => {
                this.makeChoice(i, choice);
            }
            button.innerText = choice.text;
            button.style.width = '400px';
            button.style.height = '60px';
            button.style.fontSize = '32px';
            button.style.display = "block";
            button.style.marginLeft = 'auto';
            button.style.marginRight = 'auto';
            this.div.node.appendChild(button);
        }
        this.votes = [];
    }

    makeChoice(index, choice) {
        if (this.mp.isHost) {
            this.addVote(this.mp.id(), index);
        }
        else {
            this.mp.broadcast({
                type: "vote",
                choice: index
            })
        }
    }

    addVote(id, index) {
        this.votes.push({
            id: id,
            choice: index
        });
        if (this.mp.isHost && this.votes.length == Object.keys(this.players).length + 1) {
            const decision = this.votes[Math.floor(Math.random() * this.votes.length)];
            this.leader = decision.id;
            const choice = this.stage.choices[index];
            this.mp.broadcast({
                type: 'change stage',
                stage: this.quest[choice.target],
                leader: this.leader
            });
            this.setStage(this.quest[choice.target]);
        }
    }
}