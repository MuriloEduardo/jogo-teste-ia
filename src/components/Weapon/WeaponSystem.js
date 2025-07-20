import * as THREE from 'three';

export class WeaponSystem {
    constructor(scene, camera, multiplayerClient = null) {
        this.scene = scene;
        this.camera = camera;
        this.multiplayerClient = multiplayerClient;
        this.weapon = null;
        this.bullets = [];
        this.maxBullets = 100;
        this.fireRate = 150; // ms entre disparos
        this.lastFireTime = 0;
        this.bulletSpeed = 50;
        this.bulletLifetime = 3000; // 3 segundos
        this.muzzleFlash = null;
        this.isReloading = false;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.totalAmmo = 120;

        this.createWeapon();
        this.createMuzzleFlash();
        this.setupEventListeners();

        // Configurar callback de hit marker para multiplayer
        if (this.multiplayerClient) {
            this.multiplayerClient.onHitMarker = () => this.showHitMarker();
        }
    }

    createWeapon() {
        // Grupo da arma
        this.weapon = new THREE.Group();

        // Cano da arma
        const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.025, 0.4, 8);
        const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.z = Math.PI / 2;
        barrel.position.set(0.2, 0, 0);

        // Corpo da arma
        const bodyGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.05);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, -0.05, 0);

        // Cabo da arma
        const gripGeometry = new THREE.BoxGeometry(0.08, 0.2, 0.05);
        const gripMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const grip = new THREE.Mesh(gripGeometry, gripMaterial);
        grip.position.set(-0.1, -0.15, 0);
        grip.rotation.z = -0.2;

        // Mira
        const sightGeometry = new THREE.BoxGeometry(0.02, 0.03, 0.02);
        const sightMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const sight = new THREE.Mesh(sightGeometry, sightMaterial);
        sight.position.set(0.15, 0.08, 0);

        this.weapon.add(barrel, body, grip, sight);

        // Posicionar arma na câmera
        this.weapon.position.set(0.3, -0.2, -0.5);
        this.weapon.rotation.y = 0.1;
        this.weapon.rotation.x = -0.05;

        this.camera.add(this.weapon);
    }

    createMuzzleFlash() {
        const flashGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0
        });
        this.muzzleFlash = new THREE.Mesh(flashGeometry, flashMaterial);
        this.muzzleFlash.position.set(0.4, 0, 0);
        this.weapon.add(this.muzzleFlash);
    }

    setupEventListeners() {
        this.isMouseDown = false;

        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Botão esquerdo
                this.isMouseDown = true;
                this.startFiring();
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.isMouseDown = false;
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'r' || event.key === 'R') {
                this.reload();
            }
        });
    }

    startFiring() {
        if (this.canFire()) {
            this.fire();

            // Disparo automático enquanto segura o botão
            setTimeout(() => {
                if (this.isMouseDown && this.canFire()) {
                    this.startFiring();
                }
            }, this.fireRate);
        }
    }

    canFire() {
        const now = Date.now();
        return !this.isReloading &&
            this.ammo > 0 &&
            (now - this.lastFireTime) >= this.fireRate;
    }

    fire() {
        if (!this.canFire()) return;

        this.lastFireTime = Date.now();
        this.ammo--;

        // Criar dados do disparo para multiplayer
        const fireData = this.createBullet();
        this.showMuzzleFlash();
        this.addWeaponRecoil();

        // Enviar evento de disparo para o servidor multiplayer
        if (this.multiplayerClient && this.multiplayerClient.isConnected()) {
            this.multiplayerClient.sendFireEvent(fireData.position, fireData.direction);
        }

        // Auto reload quando acabar munição
        if (this.ammo <= 0 && this.totalAmmo > 0) {
            setTimeout(() => this.reload(), 200);
        }
    }

    createBullet() {
        // Geometria da bala
        const bulletGeometry = new THREE.SphereGeometry(0.02, 4, 4);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        // Posição inicial (ponta da arma)
        const weaponWorldPosition = new THREE.Vector3();
        this.weapon.getWorldPosition(weaponWorldPosition);
        bullet.position.copy(weaponWorldPosition);
        bullet.position.add(new THREE.Vector3(0.4, 0, 0));

        // Direção do disparo
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        // Adicionar pequena dispersão
        direction.x += (Math.random() - 0.5) * 0.05;
        direction.y += (Math.random() - 0.5) * 0.05;

        bullet.direction = direction.normalize();
        bullet.speed = this.bulletSpeed;
        bullet.lifetime = this.bulletLifetime;
        bullet.createdAt = Date.now();

        this.bullets.push(bullet);
        this.scene.add(bullet);

        // Limpar balas antigas se exceder limite
        if (this.bullets.length > this.maxBullets) {
            const oldBullet = this.bullets.shift();
            this.scene.remove(oldBullet);
            oldBullet.geometry.dispose();
            oldBullet.material.dispose();
        }

        // Retornar dados do disparo para multiplayer
        return {
            position: bullet.position.clone(),
            direction: bullet.direction.clone()
        };
    }

    showMuzzleFlash() {
        this.muzzleFlash.material.opacity = 1;
        setTimeout(() => {
            this.muzzleFlash.material.opacity = 0;
        }, 50);
    }

    addWeaponRecoil() {
        // Animação de recuo da arma
        const originalPosition = this.weapon.position.clone();
        const originalRotation = this.weapon.rotation.clone();

        // Recuo
        this.weapon.position.z += 0.02;
        this.weapon.rotation.x -= 0.02;

        // Voltar posição original
        setTimeout(() => {
            this.weapon.position.copy(originalPosition);
            this.weapon.rotation.copy(originalRotation);
        }, 100);
    }

    reload() {
        if (this.isReloading || this.totalAmmo <= 0 || this.ammo >= this.maxAmmo) return;

        this.isReloading = true;

        // Enviar evento de recarga para servidor multiplayer
        if (this.multiplayerClient && this.multiplayerClient.isConnected()) {
            this.multiplayerClient.sendReloadEvent();
        }

        setTimeout(() => {
            // No modo multiplayer, o servidor controla a recarga
            if (!this.multiplayerClient || !this.multiplayerClient.isConnected()) {
                const ammoNeeded = this.maxAmmo - this.ammo;
                const ammoToReload = Math.min(ammoNeeded, this.totalAmmo);

                this.ammo += ammoToReload;
                this.totalAmmo -= ammoToReload;
                this.isReloading = false;
            }
        }, 2000); // 2 segundos para recarregar
    }

    update(deltaTime) {
        // Atualizar balas
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // Mover bala
            bullet.position.add(
                bullet.direction.clone().multiplyScalar(bullet.speed * deltaTime)
            );

            // Verificar tempo de vida
            if (Date.now() - bullet.createdAt > bullet.lifetime) {
                this.scene.remove(bullet);
                bullet.geometry.dispose();
                bullet.material.dispose();
                this.bullets.splice(i, 1);
                continue;
            }

            // Verificar colisão com objetos
            this.checkBulletCollisions(bullet, i);
        }
    }

    checkBulletCollisions(bullet, bulletIndex) {
        // Raycasting para detectar colisões
        const raycaster = new THREE.Raycaster(bullet.position, bullet.direction);

        // Filtrar objetos antes do raycast para evitar erros
        const validObjects = this.getValidCollisionObjects();

        if (validObjects.length === 0) return;

        const intersects = raycaster.intersectObjects(validObjects, false);

        if (intersects.length > 0 && intersects[0].distance < 0.5) {
            // Criar efeito de impacto
            this.createImpactEffect(bullet.position);

            // Remover bala
            this.scene.remove(bullet);
            bullet.geometry.dispose();
            bullet.material.dispose();
            this.bullets.splice(bulletIndex, 1);
        }
    }

    getValidCollisionObjects() {
        const validObjects = [];

        this.scene.traverse((object) => {
            // Verificações de segurança
            if (!object.isMesh || !object.visible || !object.matrixWorld) {
                return;
            }

            // Excluir objetos específicos
            if (this.isInvalidCollisionObject(object)) {
                return;
            }

            validObjects.push(object);
        });

        return validObjects;
    }

    isInvalidCollisionObject(object) {
        // Balas próprias
        if (this.bullets.includes(object)) return true;

        // Arma e seus componentes
        if (object === this.weapon || this.weapon.children.includes(object)) return true;

        // Objetos da câmera
        if (object.parent === this.camera) return true;

        // UI elements (nametags, health bars, etc.)
        if (object.userData.isNameTag ||
            object.userData.isHealthBar ||
            object.userData.isUIElement) return true;

        // Sprites (geralmente UI elements)
        if (object.isSprite) return true;

        // Objetos com materiais transparentes (provavelmente UI)
        if (object.material && object.material.transparent && object.material.opacity < 1) return true;

        // Objetos muito pequenos (provavelmente efeitos visuais)
        if (object.scale && (object.scale.x < 0.1 || object.scale.y < 0.1 || object.scale.z < 0.1)) return true;

        return false;
    }

    createImpactEffect(position) {
        // Efeito de fagulhas
        const particleCount = 10;
        const particles = new THREE.Group();

        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.005, 3, 3);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            particle.position.copy(position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );

            particles.add(particle);
        }

        this.scene.add(particles);

        // Animar partículas
        let fadeTime = 500;
        const startTime = Date.now();

        const animateParticles = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / fadeTime;

            particles.children.forEach(particle => {
                particle.position.add(particle.velocity.clone().multiplyScalar(0.02));
                particle.material.opacity = 1 - progress;
            });

            if (progress < 1) {
                requestAnimationFrame(animateParticles);
            } else {
                this.scene.remove(particles);
                particles.children.forEach(particle => {
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
            }
        };

        animateParticles();
    }

    getAmmoInfo() {
        return {
            ammo: this.ammo,
            totalAmmo: this.totalAmmo,
            isReloading: this.isReloading
        };
    }

    showHitMarker() {
        // Este método será chamado quando acertar um jogador no multiplayer
        const hitMarker = document.createElement('div');
        hitMarker.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 30px;
            height: 30px;
            margin: -15px 0 0 -15px;
            z-index: 1001;
            pointer-events: none;
            opacity: 1;
        `;

        // X do hit marker
        const line1 = document.createElement('div');
        line1.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 3px;
            background: #ff0000;
            transform: rotate(45deg);
            margin-top: -1.5px;
        `;

        const line2 = document.createElement('div');
        line2.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 3px;
            background: #ff0000;
            transform: rotate(-45deg);
            margin-top: -1.5px;
        `;

        hitMarker.appendChild(line1);
        hitMarker.appendChild(line2);
        document.body.appendChild(hitMarker);

        // Animar fade out
        setTimeout(() => {
            hitMarker.style.transition = 'opacity 0.5s';
            hitMarker.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(hitMarker)) {
                    document.body.removeChild(hitMarker);
                }
            }, 500);
        }, 100);
    }

    dispose() {
        // Limpar todas as balas
        this.bullets.forEach(bullet => {
            this.scene.remove(bullet);
            bullet.geometry.dispose();
            bullet.material.dispose();
        });
        this.bullets = [];

        // Limpar arma
        if (this.weapon) {
            this.weapon.children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            this.camera.remove(this.weapon);
        }

        // Remover event listeners
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('keydown', this.handleKeyDown);
    }
}
