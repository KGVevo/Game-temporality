export default class InventoryScene extends Phaser.Scene{
    constructor() {
        super('InventoryScene');
    }

    preload() {
        this.load.path = './game/assents/';
        this.load.path = './game/js/';
        this.load.image('button_Y', '../assets/button_Y.png');
        this.load.spritesheet('inventario_fondo', '../assets/inventario_fondo.png', { frameWidth: 368, frameHeight: 292 });
        this.load.spritesheet('slot', '../assets/slot_spritesheet.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo y UI
        this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.7 } }).fillRect(0, 0, width, height).setDepth(0);
        this.add.sprite(width / 2, height / 2, 'inventario_fondo', 0).setScale(1.3).setDepth(1);
        this.playerPreview = this.add.sprite(270, 128, 'player', 0).setScale(1.3).setDepth(2);

        // Slots
        this.slots = [];
        this.slots.push(...this.createSlots(width / 2 - 140, height / 2 - 16, 31, 10, 30, 0.55));
        this.slots.push(...this.createSlots(width / 2 - 158, height / 2 + 125, 31, 11, 11, 0.55));
        
        // Caja de descripción
        this.descBg = this.add.image(0, 0, 'desc_box').setDepth(10000).setVisible(false);


        this.descText = this.add.bitmapText(0, 0, 'pixelFont', '', 12)
            .setDepth(10001)
            .setOrigin(0, 0)
            .setLeftAlign()
            .setTint(0x111111)
            .setLetterSpacing(10) // Eje X
            .setLineSpacing(15)   // Eje Y
            .setVisible(false);

        this.displayItems();










        this.input.keyboard.on('keydown-E', this.closeInventory, this);
        this.input.keyboard.on('keydown-ESC', this.closeInventory, this);



        const btnY = this.add.image(width - 120, 50, 'button_Y')
            .setInteractive()
            .setDepth(2000)
            .setScale(1.5)
            .setAlpha(0.8);

        btnY.on('pointerdown', () => {
            btnY.setScale(0.9);
            this.closeInventory();
        });


    }

    createSlots(startX, startY, padding, columns, totalSlots, scale) {
        const tempSlots = [];
        for (let i = 0; i < totalSlots; i++) {
            const x = startX + (i % columns) * padding;
            const y = startY + Math.floor(i / columns) * padding;
            const slot = this.add.sprite(x, y, 'slot', 0)
                .setInteractive({ useHandCursor: true })
                .setScale(scale)
                .setDepth(3);

            slot.itemContainer = this.add.container(x, y).setDepth(4);
            tempSlots.push(slot);
        }
        return tempSlots;
    }

    displayItems() {
        if (!window.userInventory) window.userInventory = new Array(41).fill(null);

        // Limpiar items previos
        this.slots.forEach(slot => { if (slot.itemContainer) slot.itemContainer.removeAll(true); });
        this.children.list.filter(child => child.isMenuItem === true).forEach(child => child.destroy());

        window.userInventory.forEach((itemData, index) => {
            if (!itemData || !this.slots[index]) return;

            const itemSprite = this.add.sprite(0, 0, itemData.name);
            itemSprite.setScale(0.8);
            itemSprite.setInteractive({ draggable: true, useHandCursor: true });
            itemSprite.currentSlotIndex = index;
            itemSprite.isMenuItem = true; 
            
            this.slots[index].itemContainer.add(itemSprite);
            
            
            itemSprite.on('pointerover', () => {
                const gameScene = this.scene.get('GameScene');
                const descripciones = gameScene.cache.json.get('descripciones');
            
                if (descripciones && descripciones[itemData.name]) {
                    this.descText.setText(descripciones[itemData.name]);
                
                    // 1. ESCALA
                    this.descBg.setScale(0.8); 
                
                    // 2. POSICIÓN BASE (Caja)
                    const posX = this.slots[index].x; 
                    const posY = this.slots[index].y - 80; 
                
                    this.descBg.setPosition(posX, posY).setVisible(true);
                
                    // 3. AJUSTE FINO DEL TEXTO
                    // Usamos textoX y textoY para moverlo respecto a la esquina de la caja
                    const textoX = posX - (this.descBg.displayWidth / 2) + 20; 
                    const textoY = posY - (this.descBg.displayHeight / 2) + 19; 
                
                    // IMPORTANTE: Aquí usamos textoX y textoY, no posX y posY
                    this.descText.setPosition(textoX, textoY).setVisible(true);

                    this.descText.setMaxWidth(this.descBg.displayWidth - 30);
                }
            });            

            
            itemSprite.on('pointerout', () => {
                this.descBg.setVisible(false);
                this.descText.setVisible(false);
            });

            // Drag Logic
            itemSprite.on('dragstart', () => {
                this.descBg.setVisible(false);
                this.descText.setVisible(false);
                
                if (itemSprite.parentContainer) {
                    const worldPos = new Phaser.Math.Vector2();
                    itemSprite.getWorldTransformMatrix().transformPoint(0, 0, worldPos);
                    itemSprite.parentContainer.remove(itemSprite);
                    this.add.existing(itemSprite);
                    itemSprite.setPosition(worldPos.x, worldPos.y);
                }
                itemSprite.setDepth(1000);
            });

            itemSprite.on('drag', (pointer) => {
                itemSprite.setPosition(pointer.x, pointer.y);
            });

            itemSprite.on('dragend', (pointer) => {
                let nearestSlot = null;
                let newIndex = -1;

                this.slots.forEach((slot, idx) => {
                    const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, slot.x, slot.y);
                    if (dist < 25) { 
                        nearestSlot = slot; 
                        newIndex = idx; 
                    }
                });

                if (nearestSlot && newIndex !== -1 && newIndex !== itemSprite.currentSlotIndex) {
                    const temp = window.userInventory[newIndex];
                    window.userInventory[newIndex] = window.userInventory[itemSprite.currentSlotIndex];
                    window.userInventory[itemSprite.currentSlotIndex] = temp;
                    
                    const gameScene = this.scene.get('GameScene');
                    if (gameScene && gameScene.updateHotbar) gameScene.updateHotbar();
                }
                
                this.displayItems(); 
            });
        });
    }

    closeInventory() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}