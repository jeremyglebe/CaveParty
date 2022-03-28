class QuestState extends Phaser.Events.EventEmitter {
    constructor() {
        super();
        this.username = null;
        this.players = {};
        this.quest = null;
        this.stage = null;
        this.leader = null;
        this.monster = {};
    }

    /**
     * 
     * @returns {QuestState}
     */
    static get() {
        if (!QUEST_STATE_INSTANCE)
            QUEST_STATE_INSTANCE = new QuestState();
        return QUEST_STATE_INSTANCE;
    }
}

let QUEST_STATE_INSTANCE = null;