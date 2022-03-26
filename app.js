/**
 * Configuration object for the phaser game instance
 * @type {Phaser.Types.Core.GameConfig}
 */
const gameConfig = {
    parent: 'game',
    width: GAME_SCALE.width,
    height: GAME_SCALE.height,
    scale: {
        mode: Phaser.Scale.FIT
    },
    scene: [
        JoinScene,
        LobbyScene,
        QuestScene,
        DrawMonsterScene
    ],
    dom: {
        createContainer: true
    },
    type: Phaser.CANVAS
}

// Instantiate a Phaser game object
new Phaser.Game(gameConfig);
