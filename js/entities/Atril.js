export default class Atril extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'atril_madera', 0);
        scene.add.existing(this);
        
        const escala = 0.5;
        this.setScale(escala).setPipeline('Light2D').setDepth(y);
        
        if (!scene.anims.exists('atril_bucle')) {
            scene.anims.create({
                key: 'atril_bucle',
                frames: scene.anims.generateFrameNumbers('atril_madera', { start: 2, end: 9 }),
                frameRate: 10,
                repeat: -1
            });
        }

        this.estadoInteraccion = 0;
        this.bloqueado = false;

        this.colision = scene.walls.create(x + 10, y + 10, 'atril_madera');
        this.colision.setVisible(false).body.setSize(50, 50);
    }

    checkInteraction() {
        if (this.scene.isReading || this.estadoInteraccion >= 2 || this.bloqueado) return;

        if (this.scene.player) {
            const distancia = Phaser.Math.Distance.Between(this.scene.player.x, this.scene.player.y, this.x, this.y);

            if (distancia < 40) {
                if (this.estadoInteraccion === 0) {
                    this.scene.showChoiceMenu("Hay una especie de carta aquí", "Agarrar", () => this.interactuar(), "Dejarla", () => {});
                } else if (this.estadoInteraccion === 1) {
                    this.scene.showChoiceMenu("¿Qué es esto?, parece algún tipo de artefacto", "Agarrar", () => this.interactuar(), "Dejarlo", () => {});
                }
            }
        }
    }

    interactuar() {
        this.bloqueado = true;
        this.estadoInteraccion++;

        if (this.estadoInteraccion === 1) {
            this.setFrame(1);
            if (this.scene.spawnItem) this.scene.spawnItem(this.x, this.y, 'item_carta', 1000, 0); 
            this.scene.time.delayedCall(1000, () => {
                this.play('atril_bucle');
                this.bloqueado = false;
            });
        } else if (this.estadoInteraccion === 2) {
            this.anims.stop();
            this.setFrame(10);
            if (this.scene.spawnItem) this.scene.spawnItem(this.x, this.y, 'pocion_textura', 1000, 0);
        }
    }
}