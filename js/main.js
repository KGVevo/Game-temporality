
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import InventoryScene from './scenes/InventoryScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game-container',
    // Las escenas deben estar registradas aquí
    scene: [MenuScene, GameScene, InventoryScene],
    scale: { 
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH 
    },
    physics: { 
        default: 'arcade', 
        arcade: { 
            gravity: { y: 0 },
            debug: false 
        } 
    },
    render: { 
        pixelArt: true 
    },
    loader: {
        path: './'
    }
    
    
    
};


new Phaser.Game(config);

