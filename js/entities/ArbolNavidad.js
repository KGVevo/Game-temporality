export default class ArbolNavidad extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'arbol_navidad');

        scene.add.existing(this);
        this.setPipeline('Light2D').setDepth(y);

        // Luz del árbol
        this.luz = scene.lights.addLight(x, y, 1000, 0xff0000, 3);
        


        
        // Evento de parpadeo
        scene.time.addEvent({
            delay: 1000,
            callback: () => {
                const colores = [0xff0000, 0x1100FF, 0xFF6F00, 0x04FF00];
                this.luz.setColor(Phaser.Utils.Array.GetRandom(colores));
            },
            loop: true
        });
        



        // Colisión física (usando el grupo de muros de la escena)
        this.colision = scene.walls.create(x, y + 40, 'arbol_navidad');
        this.colision.setVisible(false).body.setSize(30, 40);

        this.setDepth(999);
    }
}