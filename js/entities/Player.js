export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setPipeline('Light2D')
            .setCollideWorldBounds(true)
            .setDepth(y);

        // Ajuste de colisión: el cuerpo físico debe estar en los pies para estilo Pixel Art
        this.body.setSize(30, 40).setOffset(20, 25); 
        this.speed = 160;

        // Variable para que la GameScene sepa hacia donde tirar items
        this.lastDirection = 'down'; 
    }

    update(cursors, keys, joystick) {
    if (!this.body) return;
    this.body.setVelocity(0);

    let moveX = 0;
    let moveY = 0;

    // 1. Prioridad al Joystick (si se está moviendo)
    if (joystick && (joystick.x !== 0 || joystick.y !== 0)) {
        moveX = joystick.x;
        moveY = joystick.y;
    } 
    // 2. Si no hay joystick, usamos Teclado
    else {
        if (cursors.left.isDown || (keys.left && keys.left.isDown)) moveX = -1;
        else if (cursors.right.isDown || (keys.right && keys.right.isDown)) moveX = 1;

        if (cursors.up.isDown || (keys.up && keys.up.isDown)) moveY = -1;
        else if (cursors.down.isDown || (keys.down && keys.down.isDown)) moveY = 1;
    }

    if (moveX !== 0 || moveY !== 0) {
        // Normalizar velocidad (el joystick ya viene normalizado de 0 a 1)
        let currentSpeed = (moveX !== 0 && moveY !== 0 && !joystick) ? this.speed * 0.7071 : this.speed;
        
        this.body.setVelocity(moveX * currentSpeed, moveY * currentSpeed);

        // Determinar dirección y animación basada en el eje con más fuerza
        let animKey = '';
        if (Math.abs(moveY) > Math.abs(moveX)) {
            animKey = moveY > 0 ? 'down' : 'up';
        } else {
            animKey = moveX > 0 ? 'right' : 'left';
        }

        this.lastDirection = animKey;
        this.play('walk_' + animKey, true);
    } else {
        this.anims.stop();
        const idles = { 'up': 3, 'left': 6, 'right': 9, 'down': 0 };
        this.setFrame(idles[this.lastDirection] !== undefined ? idles[this.lastDirection] : 0);
    }

    this.setDepth(this.y);
}
}