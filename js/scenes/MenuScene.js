export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        // No se requieren assets externos para un menú de texto simple
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo negro
        this.cameras.main.setBackgroundColor('#000000');

        // Texto Play centrado
        const playButton = this.add.text(width / 2, height / 2, 'PLAY', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Courier New' // Fuente estilo consola/pixel
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Eventos de interacción
        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Efecto visual simple al pasar el mouse
        playButton.on('pointerover', () => {
            playButton.setStyle({ fill: '#ffde00' }); // Color amarillo al pasar por encima
        });

        playButton.on('pointerout', () => {
            playButton.setStyle({ fill: '#ffffff' }); // Vuelve a blanco
        });
    }
}