export default class Cat_01 extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'cat_chanchi', 0);

        this.setPipeline('Light2D').setDepth(y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(1001);
        this.setScale(2);
        this.setOrigin(0.5, 1); 
        this.setImmovable(true);
        this.body.setAllowGravity(false);

        const hitWidth = this.width * 0.8;
        const hitHeight = this.height * 0.4;
        this.body.setSize(hitWidth, hitHeight);
        this.body.setOffset((this.width - hitWidth) / 2, this.height - hitHeight);

        this.isSleeping = false;
        this.isShaking = false;
        this.startX = x; 
        this.actionTimer = null;

        // Preparamos el sonido
        this.sfxMeow = scene.sound.add('cat_meow', { volume: 0.1 });

        this.scheduleNextAction();
    }

    checkInteraction() {
        const player = this.scene.player; 
        if (player) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            if (distance < 60) {
                this.interact();
            }
        }
    }

    interact() {
        this.shake();
        if (this.isSleeping) {
            this.toggleSleep();
            if (this.actionTimer) this.actionTimer.remove();
            this.scheduleNextAction();
        }
    }

    shake() {
        if (this.isShaking) return;
        this.isShaking = true;

        // Reproducir maullido al temblar
        if (this.sfxMeow) this.sfxMeow.play();

        this.scene.tweens.add({
            targets: this,
            x: this.startX + 4,
            duration: 50,
            yoyo: true,
            repeat: 5,
            onComplete: () => { 
                this.x = this.startX; 
                this.isShaking = false; 
            }
        });
    }

    scheduleNextAction() {
        const delay = Phaser.Math.Between(15000, 20000);
        this.actionTimer = this.scene.time.delayedCall(delay, () => {
            if (this.active) {
                this.toggleSleep();
                this.scheduleNextAction();
            }
        });
    }

    toggleSleep() {
        this.isSleeping = !this.isSleeping;
        this.setFrame(this.isSleeping ? 6 : 0);
    }
}