import io from 'socket.io-client';
import * as THREE from 'three';

export class MultiplayerClient {
    constructor(scene, localCamera, localWeaponSystem) {
        this.scene = scene;
        this.localCamera = localCamera;
        this.localWeaponSystem = localWeaponSystem;
        this.socket = null;
        this.connected = false;
        this.playerId = null;

        // Armazenar outros jogadores
        this.remotePlayers = new Map();
        this.remoteBullets = new Map();

        // Interpolação e predição
        this.serverTick = 0;
        this.interpolationBuffer = [];
        this.INTERPOLATION_DELAY = 100; // 100ms de atraso para suavização

        // Otimizações
        this.lastUpdateSent = 0;
        this.UPDATE_RATE = 50; // 20 FPS de envio

        // Geometrias reutilizáveis
        this.playerGeometry = new THREE.CapsuleGeometry(0.3, 1.4, 4, 8);
        this.playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0088ff });
        this.bulletGeometry = new THREE.SphereGeometry(0.02, 4, 4);
        this.bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

        this.connect();
    }

    connect() {
        console.log('🔗 Conectando ao servidor multiplayer...');

        this.socket = io(process.env.SERVER_URL, {
            transports: ['websocket'],
            upgrade: false
        });

        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.socket.on('connect', () => {
            console.log('✅ Conectado ao servidor multiplayer!');
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Desconectado do servidor');
            this.connected = false;
            this.cleanup();
        });

        this.socket.on('game-init', (data) => {
            console.log('🎮 Inicializando jogo multiplayer...');
            this.playerId = data.playerId;

            // Adicionar jogadores existentes
            data.players.forEach(player => {
                if (player.id !== this.playerId) {
                    this.addRemotePlayer(player);
                }
            });
        });

        this.socket.on('player-joined', (player) => {
            console.log(`👤 Jogador ${player.name} entrou no jogo`);
            this.addRemotePlayer(player);
            this.showNotification(`${player.name} entrou no jogo`, 'join');
        });

        this.socket.on('player-left', (data) => {
            console.log(`👋 Jogador saiu: ${data.playerId}`);
            this.removeRemotePlayer(data.playerId);
        });

        this.socket.on('game-update', (data) => {
            this.handleGameUpdate(data);
        });

        this.socket.on('player-fired', (data) => {
            if (data.playerId !== this.playerId) {
                this.handleRemoteFire(data);
            }
        });

        this.socket.on('player-hit', (data) => {
            this.handlePlayerHit(data);
        });

        this.socket.on('player-killed', (data) => {
            this.handlePlayerKilled(data);
        });

        this.socket.on('player-respawned', (data) => {
            this.handlePlayerRespawn(data);
        });

        this.socket.on('bullet-expired', (data) => {
            this.removeBullet(data.bulletId);
        });

        this.socket.on('reload-complete', (data) => {
            if (this.localWeaponSystem) {
                this.localWeaponSystem.ammo = data.ammo;
                this.localWeaponSystem.totalAmmo = data.totalAmmo;
                this.localWeaponSystem.isReloading = false;
            }
        });
    }

    addRemotePlayer(playerData) {
        if (this.remotePlayers.has(playerData.id)) return;

        // Criar representação visual do jogador
        const playerGroup = new THREE.Group();

        // Corpo do jogador
        const body = new THREE.Mesh(
            this.playerGeometry.clone(),
            this.playerMaterial.clone()
        );
        body.position.y = 0.7;
        body.castShadow = true;
        body.receiveShadow = true;

        // Nome do jogador
        const nameTag = this.createNameTag(playerData.name);
        nameTag.position.y = 2.5;
        nameTag.userData.isNameTag = true; // Marcar para exclusão da colisão

        // Barra de vida
        const healthBar = this.createHealthBar();
        healthBar.position.y = 2.2;
        healthBar.userData.isHealthBar = true; // Marcar para exclusão da colisão

        playerGroup.add(body, nameTag, healthBar);
        playerGroup.position.set(
            playerData.position.x,
            playerData.position.y - 0.9, // Ajustar para ficar no chão
            playerData.position.z
        );

        // Armazenar dados do jogador
        const remotePlayer = {
            id: playerData.id,
            group: playerGroup,
            body: body,
            nameTag: nameTag,
            healthBar: healthBar,
            data: { ...playerData },
            interpolation: {
                currentPos: { ...playerData.position },
                targetPos: { ...playerData.position },
                currentRot: { ...playerData.rotation },
                targetRot: { ...playerData.rotation }
            }
        };

        this.remotePlayers.set(playerData.id, remotePlayer);
        this.scene.add(playerGroup);

        console.log(`👤 Adicionado jogador remoto: ${playerData.name}`);
    }

    removeRemotePlayer(playerId) {
        const player = this.remotePlayers.get(playerId);
        if (player) {
            this.scene.remove(player.group);

            // Limpar geometrias
            player.group.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });

            this.remotePlayers.delete(playerId);
            console.log(`🗑️ Removido jogador remoto: ${playerId}`);
        }
    }

    createNameTag(name) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;

        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'white';
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.fillText(name, canvas.width / 2, canvas.height / 2 + 7);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 0.5, 1);

        return sprite;
    }

    createHealthBar() {
        const barGroup = new THREE.Group();

        // Fundo da barra
        const bgGeometry = new THREE.PlaneGeometry(1.2, 0.15);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const background = new THREE.Mesh(bgGeometry, bgMaterial);
        background.userData.isHealthBar = true; // Marcar para exclusão da colisão

        // Barra de vida
        const healthGeometry = new THREE.PlaneGeometry(1.2, 0.15);
        const healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
        healthBar.position.z = 0.001;
        healthBar.userData.isHealthBar = true; // Marcar para exclusão da colisão

        barGroup.add(background, healthBar);
        barGroup.userData = { healthBar: healthBar, healthMaterial: healthMaterial };

        return barGroup;
    }

    handleGameUpdate(data) {
        this.serverTick = data.tick;

        // Atualizar jogadores remotos
        data.players.forEach(playerData => {
            if (playerData.id === this.playerId) return;

            const player = this.remotePlayers.get(playerData.id);
            if (player) {
                this.updateRemotePlayer(player, playerData);
            } else {
                this.addRemotePlayer(playerData);
            }
        });

        // Atualizar balas remotas
        this.updateRemoteBullets(data.bullets);
    }

    updateRemotePlayer(player, newData) {
        // Interpolação suave de posição
        player.interpolation.targetPos = { ...newData.position };
        player.interpolation.targetRot = { ...newData.rotation };

        // Atualizar dados
        player.data = { ...newData };

        // Atualizar barra de vida
        this.updateHealthBar(player, newData.health, newData.maxHealth);
    }

    updateHealthBar(player, health, maxHealth) {
        const healthBar = player.healthBar.userData.healthBar;
        const healthMaterial = player.healthBar.userData.healthMaterial;

        const healthPercent = health / maxHealth;
        healthBar.scale.x = healthPercent;

        // Mudar cor baseada na vida
        if (healthPercent > 0.6) {
            healthMaterial.color.setHex(0x00ff00); // Verde
        } else if (healthPercent > 0.3) {
            healthMaterial.color.setHex(0xffff00); // Amarelo
        } else {
            healthMaterial.color.setHex(0xff0000); // Vermelho
        }

        // Esconder se morto
        player.healthBar.visible = health > 0;
        player.nameTag.visible = health > 0;
        player.body.visible = health > 0;
    }

    updateRemoteBullets(bulletsData) {
        // Remover balas que não existem mais
        for (const [bulletId, bullet] of this.remoteBullets.entries()) {
            const exists = bulletsData.find(b => b.id === bulletId);
            if (!exists) {
                this.removeBullet(bulletId);
            }
        }

        // Atualizar/adicionar balas existentes
        bulletsData.forEach(bulletData => {
            let bullet = this.remoteBullets.get(bulletData.id);

            if (!bullet) {
                // Criar nova bala
                const bulletMesh = new THREE.Mesh(
                    this.bulletGeometry.clone(),
                    this.bulletMaterial.clone()
                );
                bulletMesh.position.copy(bulletData.position);

                bullet = {
                    id: bulletData.id,
                    mesh: bulletMesh,
                    lastPosition: { ...bulletData.position }
                };

                this.remoteBullets.set(bulletData.id, bullet);
                this.scene.add(bulletMesh);
            } else {
                // Interpolar posição da bala
                bullet.mesh.position.lerp(
                    new THREE.Vector3(bulletData.position.x, bulletData.position.y, bulletData.position.z),
                    0.8
                );
            }
        });
    }

    removeBullet(bulletId) {
        const bullet = this.remoteBullets.get(bulletId);
        if (bullet) {
            this.scene.remove(bullet.mesh);
            bullet.mesh.geometry.dispose();
            bullet.mesh.material.dispose();
            this.remoteBullets.delete(bulletId);
        }
    }

    handleRemoteFire(data) {
        // Criar efeito de muzzle flash para jogador remoto
        const player = this.remotePlayers.get(data.playerId);
        if (player) {
            this.createMuzzleFlashEffect(player.group.position);
        }
    }

    createMuzzleFlashEffect(position) {
        const flashGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        flash.position.copy(position);
        flash.position.y += 1.5;

        this.scene.add(flash);

        // Remover após animação
        setTimeout(() => {
            this.scene.remove(flash);
            flash.geometry.dispose();
            flash.material.dispose();
        }, 100);
    }

    handlePlayerHit(data) {
        if (data.hitPlayerId === this.playerId) {
            // Efeito de dano no jogador local
            this.showDamageEffect();
        }

        // Criar efeito de hit marker para o atirador
        if (data.shooterId === this.playerId && this.onHitMarker) {
            this.onHitMarker();
        }
    }

    handlePlayerKilled(data) {
        this.showNotification(
            `${data.killerName} eliminou ${data.victimName}`,
            'kill'
        );

        // Efeito especial se foi você que matou
        if (data.killerId === this.playerId) {
            this.showNotification('ELIMINAÇÃO!', 'your-kill');
        }

        // Efeito especial se você morreu
        if (data.killedPlayerId === this.playerId) {
            this.showDeathEffect();
        }
    }

    handlePlayerRespawn(data) {
        const player = this.remotePlayers.get(data.playerId);
        if (player) {
            player.group.position.copy(data.position);
            this.updateHealthBar(player, data.health, data.health);
        }
    }

    showDamageEffect() {
        // Criar overlay vermelho temporário
        const damageOverlay = document.createElement('div');
        damageOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, transparent 30%, rgba(255, 0, 0, 0.3) 70%);
            pointer-events: none;
            z-index: 999;
            animation: damageFlash 0.5s ease-out;
        `;

        document.body.appendChild(damageOverlay);

        setTimeout(() => {
            document.body.removeChild(damageOverlay);
        }, 500);
    }

    showDeathEffect() {
        // Tela vermelha de morte
        const deathOverlay = document.createElement('div');
        deathOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 48px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        `;
        deathOverlay.textContent = 'VOCÊ MORREU';

        document.body.appendChild(deathOverlay);

        setTimeout(() => {
            document.body.removeChild(deathOverlay);
        }, 3000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        let color = '#ffffff';

        switch (type) {
            case 'kill': color = '#ff4444'; break;
            case 'your-kill': color = '#44ff44'; break;
            case 'join': color = '#4444ff'; break;
        }

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: ${color};
            padding: 10px 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    // Métodos públicos para integração com o jogo
    sendPlayerUpdate(position, rotation, velocity) {
        if (!this.connected) return;

        const now = Date.now();
        if (now - this.lastUpdateSent < this.UPDATE_RATE) return;

        this.lastUpdateSent = now;

        this.socket.emit('player-update', {
            position: position,
            rotation: rotation,
            velocity: velocity
        });
    }

    sendFireEvent(position, direction) {
        if (!this.connected) return;

        this.socket.emit('player-fire', {
            position: position,
            direction: direction
        });
    }

    sendReloadEvent() {
        if (!this.connected) return;

        this.socket.emit('player-reload');
    }

    update() {
        // Interpolar posições dos jogadores remotos
        this.remotePlayers.forEach(player => {
            const current = player.interpolation.currentPos;
            const target = player.interpolation.targetPos;

            // Lerp suave
            current.x = THREE.MathUtils.lerp(current.x, target.x, 0.15);
            current.y = THREE.MathUtils.lerp(current.y, target.y, 0.15);
            current.z = THREE.MathUtils.lerp(current.z, target.z, 0.15);

            player.group.position.copy(current);
        });
    }

    cleanup() {
        // Remover todos os jogadores remotos
        this.remotePlayers.forEach(player => {
            this.removeRemotePlayer(player.id);
        });

        // Remover todas as balas
        this.remoteBullets.forEach(bullet => {
            this.removeBullet(bullet.id);
        });

        if (this.socket) {
            this.socket.disconnect();
        }
    }

    getConnectedPlayersCount() {
        return this.remotePlayers.size + (this.connected ? 1 : 0);
    }

    isConnected() {
        return this.connected;
    }
}

// CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes damageFlash {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
