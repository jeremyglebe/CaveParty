class QuestScene extends Phaser.Scene {
    constructor() {
        super("Quest");
        this.stage = null;
        this.div = null;
    }

    init(quest) {
        this.quest = quest;
        this.votes = [];
        console.log(this.quest);
    }

    create() {
        console.log("Quest Scene!");

        MULTI.off('player joined', this.onOtherJoined, this);
        MULTI.off('message received', this.onMessageReceived, this);

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

        MULTI.on('message received', (peerID, data) => {
            if (data.type == 'vote' && MULTI.isBoss()) {
                this.votes.push({
                    id: peerID,
                    choice: data.choice
                });
            }
            console.log(this.votes);
        });
    }

    setStage(stage) {
        console.log("Set Stage: " + JSON.stringify(stage));
        this.stage = stage;
        if (stage.type == 'choice') {
            this.choiceStage();
        }
        else if (stage.type == 'fight') {
            if (stage.image == 'sketch') {

            }
            else {

            }
        }
    }

    choiceStage() {
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
        if (MULTI.isBoss()) {
            this.votes.push({
                id: MULTI.self.id,
                choice: index
            });
        }
        else {
            MULTI.broadcast({
                type: "vote",
                choice: index
            })
        }
    }
}