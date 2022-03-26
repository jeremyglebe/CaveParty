class QuestScene extends Phaser.Scene {
    constructor() {
        super("Quest");
    }

    init(quest) {
        this.quest = quest;
        console.log(this.quest);
    }

    create() {
        console.log("Quest Scene!");
    }
}