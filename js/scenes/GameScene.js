
import Player from '../entities/Player.js';
import ArbolNavidad from '../entities/ArbolNavidad.js';
import Atril from '../entities/Atril.js';
import Cat_01 from '../entities/Cat_01.js';



export default class GameScene extends Phaser.Scene {
    
    constructor() {
        super('GameScene');
        this.playerSpeed = 160;
        this.selectedSlotIndex = 0;
        this.isReading = false;
        this.joyVelocityX = 0;
        this.joyVelocityY = 0;
    }
    
    
    preload() {
        this.load.setBaseURL(window.location.origin + window.location.pathname);
        
        // Mundo
        this.load.image('mapa_juego', '../assets/mapa_juego.png');
        this.load.image('arbol_navidad', '../assets/arbol_navidad.png');
        this.load.spritesheet('atril_madera', '../assets/atril.png', { frameWidth: 200, frameHeight: 200 });
        this.load.image('lampara01', '../assets/lampara01.png');

        // UI
        this.load.image('hotbar_sprite', '../assets/tu_sprite_hotbar.png');
        this.load.image('desc_box', '../assets/tu_caja_descripcion.png');
        this.load.image('carta_abierta', '../assets/carta_abierta.png');
        this.load.image('text_option','../assets/text_option.png');
        
        // Telefono Buttons
        this.load.image('joy_base', '../assets/base.png');
        this.load.image('joy_stick', '../assets/stick.png');
        this.load.image('button_A', '../assets/button_A.png');
        this.load.image('button_B', '../assets/button_B.png');
        this.load.image('button_Y', '../assets/button_Y.png');

        // Items
        this.load.image('item_carta', '../assets/item_carta.png'); 
        this.load.image('pocion_textura', '../assets/pocion.png');
        
        
        // Datos y Audio
        this.load.json('descripciones', '../texts/descripciones.json');
        this.load.json('textos_juego', '../texts/dialogos.json');
        this.load.bitmapFont('pixelFont', '../lol.png', '../lol.xml');


        // Entidades
        this.load.spritesheet('player', '../assets/player.png', { frameWidth: 70, frameHeight: 70 });
        this.load.spritesheet('cat_chanchi', '../assets/cat_chanchi.png', { frameWidth: 32, frameHeight: 32 });

        // Sonidos y Musica
        this.load.audio('item_pickup', '../assets/sounds/pickup.mp3');
        this.load.audio('page_flip', '../assets/sounds/page-flip.mp3');
        this.load.audio('text_beep', '../assets/sounds/text_beep.mp3');
        this.load.audio('cat_meow', '../assets/sounds/cat_meow.mp3');
        this.load.audio('thema_1', '../assets/sounds/thema_1.mp3');
    }   
    

    create() {
            // Creamos la instancia de la música
        this.bgMusic = this.sound.add('thema_1', { 
            volume: 0.3, // Volumen de 0 a 1
            loop: true   // Para que se repita siempre
        });

        // Empezamos la reproducción
        this.bgMusic.play();


        const { width, height } = this.cameras.main;

        // 1. SISTEMA DE LUCES AMBIENTE
        this.setupLighting();

        // 2. MUNDO Y FÍSICAS
        this.map = this.add.image(width / 2, height / 2, 'mapa_juego').setPipeline('Light2D');
        this.physics.world.setBounds(0, 0, 800, 448);
        this.walls = this.physics.add.staticGroup();
        this.itemsOnGround = this.physics.add.group();

        // 1. PRIMERO CONFIGURAMOS LOS INPUTS (Para que existan las teclas antes de crear las entidades)
        this.setupInputs();

        // 3. ENTIDADES (Acomodado con las nuevas clases)
        this.arbol = new ArbolNavidad(this, 250, 300);
        this.atril = new Atril(this, 590, 150);
        this.player = new Player(this, width / 2, height / 2);
        this.Cat_01 = new Cat_01(this, 620, 275);
        this.physics.add.collider(this.player, this.Cat_01);
        

        this.lampara = this.physics.add.staticImage(615, 180, 'lampara01').setPipeline('Light2D').setDepth(1000).setScale(0.5);
        
        this.lights.addLight(610, 190   ,200, 0xffffff, 2); // Luz cálida para la lámpara
        
        this.lampara.body.setSize(35, 20);
        this.lampara.body.setOffset(10, 80);

        this.physics.add.collider(this.player, this.lampara);


        /*TELEFONO BOTONES Y STICK*/ 


        // Posición inicial del joystick

        // Crear imágenes usando tus sprites
        this.joyBase = this.add.image(110,330 , 'joy_base').setScrollFactor(0).setAlpha(0.6);
        this.joyStick = this.add.image(110,330, 'joy_stick').setScrollFactor(0).setInteractive({ draggable: true });


        this.joyBase.setDisplaySize(128, 128);
        this.joyStick.setDisplaySize(64, 64);

        // Radio máximo de movimiento (ajusta según el tamaño de tu sprite de base)
        const dragRadius = 60; 

        this.input.setDraggable(this.joyStick);

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            let distance = Phaser.Math.Distance.Between(this.joyBase.x, this.joyBase.y, dragX, dragY);
            let angle = Phaser.Math.Angle.Between(this.joyBase.x, this.joyBase.y, dragX, dragY);

            if (distance > dragRadius) {
                gameObject.x = this.joyBase.x + Math.cos(angle) * dragRadius;
                gameObject.y = this.joyBase.y + Math.sin(angle) * dragRadius;
            } else {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }

            // Cálculo de intensidad para el movimiento
            this.joyVelocityX = (gameObject.x - this.joyBase.x) / dragRadius;
            this.joyVelocityY = (gameObject.y - this.joyBase.y) / dragRadius;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.x = this.joyBase.x;
            gameObject.y = this.joyBase.y;
            this.joyVelocityX = 0;
            this.joyVelocityY = 0;
        });


        // --- BOTÓN DE ACCIÓN "A" ---
        const actionX = width - 100;
        const actionY = 330;

        this.btnAction = this.add.image(700, 400, 'button_A')
            .setScale(2)
            .setScrollFactor(0)
            .setInteractive()
            .setDepth(1000)
            .setAlpha(0.8);

        this.btnAction.on('pointerdown', () => {
        this.btnAction.setScale(1.9);
                
        if (this.isReading) {
            // En lugar de emitir un evento de teclado que no funcionará, 
            // llamamos a una función global de cierre o ejecutamos la lógica directamente.
            this.handleActionClose(); 
        } else {
            this.useSelectedItem();
        }
        });

        this.btnAction.on('pointerup', () => {
            this.btnAction.setScale(2);
            this.btnAction.setAlpha(0.8);
        });

        // --- BOTÓN DE INTERACCIÓN "B" (Misma función que F) ---
        const btnBX = width - 180; // Posicionado a la izquierda del botón A
        const btnBY = 330;
            
        this.btnActionB = this.add.image(btnBX, btnBY, 'button_B')
            .setScrollFactor(0)
            .setScale(2)
            .setInteractive()
            .setDepth(1000)
            .setAlpha(0.8);
            
        this.btnActionB.on('pointerdown', () => {
            this.btnActionB.setScale(1.85);
            this.btnActionB.setTint(0xbbbbbb);
            
            // Ejecuta la misma lógica que la tecla F
            if (this.atril) this.atril.checkInteraction();
            if (this.Cat_01) this.Cat_01.checkInteraction();
        });
        
        this.btnActionB.on('pointerup', () => {
            this.tweens.add({ targets: this.btnActionB, scale: 2, duration: 100, ease: 'Back.easeOut' });
            this.btnActionB.clearTint();
            this.btnActionB.setAlpha(0.8);
        });
        
        this.btnActionB.on('pointerout', () => {
            this.btnActionB.setScale(2);
            this.btnActionB.clearTint();
        });


        // --- BOTÓN DE INVENTARIO "Y" ---
        const btnYX = width - 140; 
        const btnYY = 250; // Un poco más arriba que los botones A y B
            
        this.btnInventory = this.add.image(730, 300, 'button_Y')
            .setScrollFactor(0)
            .setScale(2)
            .setInteractive()
            .setDepth(1000)
            .setAlpha(0.8);
            
        this.btnInventory.on('pointerdown', () => {
            this.btnInventory.setScale(1.9);
            this.toggleInventory(); // Llama a la misma función que la tecla E
        });
        
        this.btnInventory.on('pointerup', () => {
            this.btnInventory.setScale(2);
        });


        // 4. LUCES DECORATIVAS Y COLISIONES
        this.setupSkyLights();
        this.setupStaticWalls(); // Crea los muros invisibles de los bordes
        
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.overlap(this.player, this.itemsOnGround, this.collectItem, null, this);

        // 5. INTERFAZ Y DESCRIPCIONES
        this.itemData = this.cache.json.get('descripciones');
        this.setupGUI(width, height);
        this.setupDescriptionBox(width, height);

        // 6. INPUTS Y ANIMACIONES
        this.setupAnimations(); // Solo si las animaciones no están dentro de Player.js

        // 7. SONIDOS E ITEMS INICIALES
        this.soundPageFlip = this.sound.add('page_flip', { volume: 0.5 });
    }

update() {
        if (this.isReading || this.scene.isActive('InventoryScene')) {
            if (this.player.body) this.player.body.setVelocity(0);
            this.player.anims.stop();
            return; 
        }

        const joystickData = {
            x: this.joyVelocityX || 0,
            y: this.joyVelocityY || 0
        };

        this.player.update(this.cursors, this.keys, joystickData);
        
        // --- DETECCIÓN DE TECLAS DE ACCIÓN ---
        if (Phaser.Input.Keyboard.JustDown(this.keys.q)) this.dropItem();
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) this.useSelectedItem();
    
        // INTERACCIÓN (Tecla F) - Verifica que el nombre coincida con setupInputs
        if (Phaser.Input.Keyboard.JustDown(this.keys.f)) {
        // Importante: console.log para debuguear si entra aquí
        console.log("Tecla F presionada"); 
        
        if (this.atril) this.atril.checkInteraction();
        if (this.Cat_01) this.Cat_01.checkInteraction();
        }
    }
    
    
    

    // --- CONFIGURACIÓN ---

    setupStaticWalls() {
        const wallData = [
            {x: 155, y: 200, w: 50, h: 300}, {x: 665, y: 225, w: 50, h: 300},
            {x: 400, y: 405, w: 500, h: 50}, {x: 400, y: 115, w: 500, h: 50}
        ];
        wallData.forEach(w => this.walls.create(w.x, w.y, null).setSize(w.w, w.h).setImmovable(true).setVisible(false));
    }

    setupSkyLights() {
        this.lucesNavidad = [];

        this.lucesNavidad.push(this.crearLuzNavideña(190, 68, 0xff0000, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(270, 68, 0xff0000, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(345, 68, 0xff0000, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(425, 68, 0xff0000, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(505, 68, 0xff0000, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(580, 68, 0xff0000, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(200, 68, 0x0000ff, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(280, 68, 0x0000ff, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(360, 68, 0x0000ff, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(440, 68, 0x0000ff, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(520, 68, 0x0000ff, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(600, 68, 0x0000ff, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(225, 65, 0x00ff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(305, 65, 0x00ff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(385, 65, 0x00ff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(465, 65, 0x00ff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(545, 65, 0x00ff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(625, 65, 0x00ff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(248, 70, 0xffff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(328, 70, 0xffff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(408, 70, 0xffff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(488, 70, 0xffff00, 40));
        this.lucesNavidad.push(this.crearLuzNavideña(568, 70, 0xffff00, 40));
        
        let grupoActual = 0;

        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.lucesNavidad.forEach(luz => luz.visible = false);
                for (let i = grupoActual * 6; i < (grupoActual * 6) + 6; i++) {
                    if (this.lucesNavidad[i]) this.lucesNavidad[i].visible = true;
                }
                grupoActual = (grupoActual + 1) % Math.ceil(this.lucesNavidad.length / 6);
            },
            loop: true
        });


    }

   
   crearLuzNavideña(x, y, color, radio) {
        let luz = this.lights.addLight(x, y, radio, color, 2);
        this.tweens.add({
            targets: luz,
            intensity: { from: 0.5, to: 2 },
            duration: Phaser.Math.Between(500, 1000),
            yoyo: true, repeat: -1
        });
        return luz;
    }
   

    setupLighting() {
        this.lights.enable().setAmbientColor(0x222255);
        
    }




    setupCollisions() {
        // Muros invisibles
        const wallData = [
            {x: 155, y: 200, w: 50, h: 300}, {x: 665, y: 225, w: 50, h: 300},
            {x: 400, y: 405, w: 500, h: 50}, {x: 400, y: 115, w: 500, h: 50}
        ];
        wallData.forEach(w => this.walls.create(w.x, w.y, null).setSize(w.w, w.h).setImmovable(true).setVisible(false));

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.overlap(this.player, this.itemsOnGround, this.collectItem, null, this);
    }

    setupGUI(width, height) {
        const guiX = width / 2;
        const guiY = height - 40;
        this.hotbarBg = this.add.image(guiX, guiY, 'hotbar_sprite').setScrollFactor(0).setScale(1.3);
        this.hotbarIcons = this.add.group();
        this.hotbarSlots = this.add.group();
        this.selector = this.add.graphics().lineStyle(3, 0xffff00).strokeRect(-13, -16, 27, 29).setScrollFactor(0);
        
        this.initHotbarSlots(guiX, guiY);
        this.updateHotbar();
    }


    setupDescriptionBox(width, height) {
        // POSICIÓN INICIAL DEL CONTENEDOR (X, Y)
        this.descContainer = this.add.container(width / 2, height - 120)
            .setScrollFactor(0)
            .setDepth(5000)
            .setVisible(false);
            
    
        const bg = this.add.image(0, 0, 'desc_box');
        
        bg.setScale(0.4);
    
        this.descText = this.add.bitmapText(0, 0, 'pixelFont', '', 13)
            .setOrigin(0.5)
            .setLeftAlign()
            .setTint(0x8d5824);
    
        // --- LÓGICA PARA MOSTRAR SOLO LA PRIMERA LÍNEA ---
        const originalSetText = this.descText.setText;
        
        // Sobreescribimos setText para que siempre corte el string antes de mostrarlo
        this.descText.setText = (value) => {
            const primeraLinea = value ? value.toString().split('\n')[0] : '';
            return originalSetText.call(this.descText, primeraLinea);
        };
        // -------------------------------------------------
    
        this.descText.setMaxWidth(bg.displayWidth - 20);
        this.descContainer.add([bg, this.descText]);
    }


    
    handleActionClose() {
    // Si existe la función de cerrar carta, la ejecutamos
        if (this.closeLetterCallback) {
        this.closeLetterCallback();
        }
    }
    
    setupInputs() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({ 
            up: 'W', down: 'S', left: 'A', right: 'D', e: 'E', f: 'F', q: 'Q' 
        });
        
        this.input.keyboard.on('keydown', (event) => {
            const num = parseInt(event.key);
            if (num >= 1 && num <= 9) {
                this.selectSlot(num - 1);
                this.showItemDescription(num - 1);
            }
            if (event.key.toLowerCase() === 'e') this.toggleInventory();

        });
    }

    // --- LÓGICA DE JUEGO ---


    handleMovement() {
        this.player.body.setVelocity(0);
        let moveX = 0, moveY = 0;

        if (this.cursors.left.isDown || this.keys.left.isDown) moveX = -1;
        else if (this.cursors.right.isDown || this.keys.right.isDown) moveX = 1;
        if (this.cursors.up.isDown || this.keys.up.isDown) moveY = -1;
        else if (this.cursors.down.isDown || this.keys.down.isDown) moveY = 1;

        if (moveX !== 0 || moveY !== 0) {
            let speed = (moveX !== 0 && moveY !== 0) ? this.playerSpeed * 0.7071 : this.playerSpeed;
            this.player.body.setVelocity(moveX * speed, moveY * speed);
            
            // ACTUALIZACIÓN CLAVE: Guardamos la dirección
            this.lastAnimKey = moveY > 0 ? 'down' : moveY < 0 ? 'up' : moveX < 0 ? 'left' : 'right';
            this.player.anims.play('walk_' + this.lastAnimKey, true);
        } else {
            this.player.anims.stop();
        }
    }
        

    toggleInventory() {
        if (this.scene.isActive('InventoryScene')) {
            this.scene.stop('InventoryScene');
            this.scene.resume('GameScene');
            this.updateHotbar(); 
        } else {
            this.scene.pause();
            this.scene.launch('InventoryScene');
        }
    }

    spawnItem(x, y, texture, velX = 0, velY = 0) {
    const item = this.itemsOnGround.create(x, y, texture).setPipeline('Light2D').setDepth(5);
    item.itemName = texture;
    item.canBeCollected = false;

    if (item.body) {
        item.body.setCollideWorldBounds(true);
        item.body.setVelocity(velX, velY);
        item.body.setDrag(600); 
        item.body.setBounce(0.3);
        
        // COLISIONES: Aquí hacemos que el item choque con todo lo sólido
        this.physics.add.collider(item, this.walls);
        this.physics.add.collider(item, this.lampara); // Añadido para que no atraviese la lámpara
    }

    this.time.delayedCall(500, () => {
        if (item.active) item.canBeCollected = true;
    });
}

    collectItem(player, item) {
        if (!item.canBeCollected) return;
        if (!window.userInventory) window.userInventory = new Array(41).fill(null);
        
        const hotbarRange = Array.from({length: 11}, (_, i) => i + 30);
        let targetSlot = hotbarRange.find(idx => window.userInventory[idx] === null) ?? 
                         window.userInventory.findIndex((val, i) => i < 30 && val === null);

        if (targetSlot !== -1) {
            this.sound.play('item_pickup', { volume: 0.5 });
            window.userInventory[targetSlot] = { name: item.itemName };
            item.destroy(); 
            this.updateHotbar(); 
        }
    }

    // --- MÉTODOS DE UI ---

    initHotbarSlots(guiX, guiY) {
        const spacing = 31;
        const startX = (this.cameras.main.width / 2) - 158;
        
        for (let i = 0; i < 11; i++) {
            const x = startX + (i * spacing);
            const slotZone = this.add.rectangle(x, guiY, 30, 30, 0, 0)
                .setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(102);

            slotZone.on('pointerdown', () => { this.selectSlot(i); this.showItemDescription(i); });
            slotZone.on('pointerover', (p) => this.showItemDescription(i, null, p.x, p.y));
            slotZone.on('pointerout', () => this.descContainer.setVisible(false));
            this.hotbarSlots.add(slotZone);
        }
        this.selectSlot(0);
    }

    updateHotbar() {
        this.hotbarIcons.clear(true, true);
        const startX = (this.cameras.main.width / 2) - 158;
        const hotbarData = (window.userInventory || []).slice(30, 41);
        
        hotbarData.forEach((item, index) => {
            if (item) {
                const x = startX + (index * 31);
                this.hotbarIcons.add(this.add.sprite(x, this.cameras.main.height - 40, item.name).setScale(0.6).setScrollFactor(0).setDepth(101));
            }
        });
    }

    selectSlot(index) {
        this.selectedSlotIndex = index;
        this.selector.x = ((this.cameras.main.width / 2) - 158) + (index * 31);
        this.selector.y = this.cameras.main.height - 40;
    }

    
    showItemDescription(index, absoluteIndex = null, x = null, y = null) {
        const realIndex = absoluteIndex ?? (30 + index);
        const item = window.userInventory?.[realIndex];

        if (item && this.itemData?.[item.name]) {
            this.descText.setText(this.itemData[item.name]);

            // POSICIÓN FIJA SOBRE EL SLOT
            // Calculamos la X base del inventario y le sumamos el desplazamiento por índice
            const posX = ((this.cameras.main.width / 2) + 0);

            // Posición Y fija (ajusta el -110 según necesites que esté más arriba o abajo)
            const posY = this.cameras.main.height - 110;

            this.descContainer.setPosition(posX, posY).setVisible(true);
        } else {
            this.descContainer.setVisible(false);
        }
    }

    

    // --- ANIMACIONES ---
    setupAnimations() {
        const anims = [
            { key: 'walk_down', start: 1, end: 2 }, { key: 'walk_up', start: 4, end: 5 },
            { key: 'walk_left', start: 7, end: 8 }, { key: 'walk_right', start: 10, end: 11 }
        ];
        anims.forEach(a => {
            this.anims.create({
                key: a.key,
                frames: this.anims.generateFrameNumbers('player', { start: a.start, end: a.end }),
                frameRate: 5, repeat: -1
            });
        });
    }

    // --- ACCIONES ITEMS ---
    useSelectedItem() {
        const item = window.userInventory?.[30 + this.selectedSlotIndex];
        if (item?.name === 'item_carta') this.showLetterUI();
    }


    dropItem() {
        const realIndex = 30 + this.selectedSlotIndex;
        const item = window.userInventory?.[realIndex];
        if (!item) return;

        let vx = 0, vy = 0;
        const force = 400; 

        // Accedemos a la dirección guardada en la instancia del player
        // Si en tu Player.js la variable se llama distinto, cámbiala aquí
        const direction = this.player.lastDirection || 'down';

        if (direction === 'left') vx = -force;
        else if (direction === 'right') vx = force;
        else if (direction === 'up') vy = -force;
        else if (direction === 'down') vy = force;

        window.userInventory[realIndex] = null;
        this.spawnItem(this.player.x, this.player.y, item.name, vx, vy);
        this.updateHotbar();
    }


    
    
 showLetterUI() {
    const { width, height } = this.cameras.main;
    this.isReading = true; 
    this.currentPage = 0;
    this.paginas = this.cache.json.get('textos_juego').carta_navidad;

    // Elementos visuales
    this.overlay = this.add.graphics({ fillStyle: { color: 0, alpha: 0.7 } }).fillRect(0, 0, width, height).setDepth(1000);
    this.letterSprite = this.add.image(width / 2, height / 2, 'carta_abierta').setScale(0.95).setDepth(1001);
    this.letterText = this.add.bitmapText(50, height / 2 - 190, 'pixelFont', '', 19).setDepth(1002).setTint(0x8d5824).setMaxWidth(700).setLineSpacing(15);

    // Botones
    this.btnNext = this.add.text(width / 2 + 80, height / 2 + 160, ">", { fontSize: '30px', color: '#c96c0f' }).setInteractive().setDepth(1002);
    this.btnPrev = this.add.text(width / 2 - 90, height / 2 + 160, "<", { fontSize: '30px', color: '#c96c0f' }).setInteractive().setDepth(1002);

    const closeLetter = () => {
        [this.overlay, this.letterSprite, this.letterText, this.btnNext, this.btnPrev].forEach(obj => obj.destroy());
        this.time.delayedCall(150, () => this.isReading = false);
    };

    const updatePage = () => {
        this.letterText.setText(this.paginas[this.currentPage]);
        this.btnPrev.setVisible(this.currentPage > 0);
        
        // Si es la última página, cambiamos ">" por "X"
        if (this.currentPage === this.paginas.length - 1) {
            this.btnNext.setText("X");
        } else {
            this.btnNext.setText(">");
        }
    };

    this.btnNext.on('pointerdown', () => {
        if (this.currentPage < this.paginas.length - 1) {
            this.currentPage++;
            this.soundPageFlip.play();
            updatePage();
        } else {
            // Si ya es la X, cerramos
            closeLetter();
        }
    });

    this.btnPrev.on('pointerdown', () => {
        this.currentPage--;
        this.soundPageFlip.play();
        updatePage();
    });

    updatePage();
}



    // Dentro de tu clase GameScene en GameScene.js

    /**
     * Muestra un menú de opciones reutilizable con el sprite 'text_option'.
     * @param {string} pregunta - El texto principal.
     * @param {string} textoOpt1 - Texto del botón izquierdo.
     * @param {function} callback1 - Función a ejecutar si elige opción 1.
     * @param {string} textoOpt2 - Texto del botón derecho.
     * @param {function} callback2 - Función a ejecutar si elige opción 2.
     */


    /**
     * Muestra un menú de opciones con efecto de escritura progresiva.
     */
    showChoiceMenu(pregunta, textoOpt1, callback1, textoOpt2, callback2) {
        const { width, height } = this.cameras.main;
        
        this.isReading = true;
        if (this.player.body) this.player.body.setVelocity(0);
        this.player.anims.stop();
    
        const menuContainer = this.add.container(width / 2, height / 2).setDepth(5000);
        const bg = this.add.image(0, 130, 'text_option').setScale(1.3);
    




        // Texto de la pregunta (inicia vacío)
        const title = this.add.bitmapText(-200, 70, 'pixelFont', '', 16)
            .setLetterSpacing(5)
            .setLineSpacing(10)
            .setOrigin(0, 0)
            .setMaxWidth(380)
            .setTint(0x8d5824);
        // --- EFECTO MÁQUINA DE ESCRIBIR ---
        let i = 0;
        const timer = this.time.addEvent({
            delay: 75, // Velocidad de cada letra (ms)
            callback: () => {
                title.text += pregunta[i];
                // Reproducir sonido si el carácter no es un espacio
                if (pregunta[i] !== ' ') {
                    this.sound.play('text_beep', { volume: 0.2 });
                }

                i++;
                // Cuando termina de escribir, mostramos los botones
                if (i === pregunta.length) {
                    this.aparecerBotones(menuContainer, textoOpt1, callback1, textoOpt2, callback2);
                }
            },
            repeat: pregunta.length - 1
        });
    
        menuContainer.add([bg, title]);
    }
    
    /**
     * Método auxiliar para mostrar los botones al finalizar el texto.
     */
    aparecerBotones(container, txt1, cb1, txt2, cb2) {
    const createBtn = (x, y, label, callback) => {
        // Crear el recuadro (invisible al inicio)
        const outline = this.add.graphics()
            .lineStyle(1, 0x003B06)
            .strokeRect(x - 50, y - 5, 100, 20) // Ajusta el tamaño según tu botón
            .setAlpha(0);

        const btn = this.add.bitmapText(x, y, 'pixelFont', label, 16)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setTint(0x8d5824)
            .setLetterSpacing(10)
            .setAlpha(0);

        btn.on('pointerover', () => {
            outline.setAlpha(1); // Muestra el recuadro
        });

        btn.on('pointerout', () => {
            outline.setAlpha(0); // Oculta el recuadro
        });

        btn.on('pointerdown', () => {
            container.destroy();
            this.isReading = false;
            if (callback) callback();
        });

        this.tweens.add({
            targets: btn,
            alpha: 1,
            duration: 300
        });

        container.add(outline); // Añadimos el recuadro al contenedor
        return btn;
    };

    const btn1 = createBtn(-120, 180, txt1, cb1);
    const btn2 = createBtn(70, 180, txt2, cb2);
    container.add([btn1, btn2]);
    }










}


