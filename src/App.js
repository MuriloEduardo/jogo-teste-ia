import * as THREE from "three";
import { useEffect, useRef } from "react";

// Classe para personagem animado
class AnimatedCharacter {
    constructor(scene) {
        this.scene = scene;
        this.isWalking = false;
        this.walkCycle = 0;
        this.walkSpeed = 0.1;

        this.createCharacter();
    }

    createCharacter() {
        // Grupo principal do personagem
        this.characterGroup = new THREE.Group();

        // Corpo (torso)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0066cc });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.6;
        this.characterGroup.add(this.body);

        // Cabeça
        const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.5;
        this.characterGroup.add(this.head);

        // Braços
        this.createArms();

        // Pernas (mais detalhadas)
        this.createLegs();

        this.scene.add(this.characterGroup);
    }

    createArms() {
        // Braço esquerdo
        const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        const armMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });

        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.65, 0.6, 0);
        this.characterGroup.add(this.leftArm);

        // Braço direito
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.65, 0.6, 0);
        this.characterGroup.add(this.rightArm);
    }

    createLegs() {
        // Coxa esquerda
        const thighGeometry = new THREE.BoxGeometry(0.35, 0.8, 0.35);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

        this.leftThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.leftThigh.position.set(-0.3, -0.4, 0);
        this.characterGroup.add(this.leftThigh);

        // Canela esquerda
        const shinGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        this.leftShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.leftShin.position.set(-0.3, -1.2, 0);
        this.characterGroup.add(this.leftShin);

        // Pé esquerdo
        const footGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
        const footMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
        this.leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.leftFoot.position.set(-0.3, -1.7, 0.2);
        this.characterGroup.add(this.leftFoot);

        // Coxa direita
        this.rightThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.rightThigh.position.set(0.3, -0.4, 0);
        this.characterGroup.add(this.rightThigh);

        // Canela direita
        this.rightShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.rightShin.position.set(0.3, -1.2, 0);
        this.characterGroup.add(this.rightShin);

        // Pé direito
        this.rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.rightFoot.position.set(0.3, -1.7, 0.2);
        this.characterGroup.add(this.rightFoot);
    }

    // Animar caminhada
    updateWalkAnimation() {
        if (this.isWalking) {
            this.walkCycle += this.walkSpeed;

            // Animação das pernas (movimento alternado)
            const legSwing = Math.sin(this.walkCycle) * 0.3;
            const legLift = Math.abs(Math.sin(this.walkCycle)) * 0.1;

            // Perna esquerda
            this.leftThigh.rotation.x = legSwing;
            this.leftShin.rotation.x = Math.max(0, legSwing * 0.5);
            this.leftFoot.position.y = -1.7 + legLift;

            // Perna direita (oposta)
            this.rightThigh.rotation.x = -legSwing;
            this.rightShin.rotation.x = Math.max(0, -legSwing * 0.5);
            this.rightFoot.position.y = -1.7 + Math.abs(Math.sin(this.walkCycle + Math.PI)) * 0.1;

            // Movimento sutil dos braços
            this.leftArm.rotation.x = legSwing * 0.5;
            this.rightArm.rotation.x = -legSwing * 0.5;

            // Balanceio do corpo
            this.body.rotation.z = Math.sin(this.walkCycle * 2) * 0.05;
            this.head.rotation.z = Math.sin(this.walkCycle * 2) * 0.03;
        } else {
            // Resetar posições quando parado
            this.resetToIdlePose();
        }
    }

    resetToIdlePose() {
        // Suavemente retornar à pose inicial
        const ease = 0.1;

        this.leftThigh.rotation.x *= (1 - ease);
        this.rightThigh.rotation.x *= (1 - ease);
        this.leftShin.rotation.x *= (1 - ease);
        this.rightShin.rotation.x *= (1 - ease);

        this.leftArm.rotation.x *= (1 - ease);
        this.rightArm.rotation.x *= (1 - ease);

        this.body.rotation.z *= (1 - ease);
        this.head.rotation.z *= (1 - ease);

        // Resetar altura dos pés
        this.leftFoot.position.y = THREE.MathUtils.lerp(this.leftFoot.position.y, -1.7, ease);
        this.rightFoot.position.y = THREE.MathUtils.lerp(this.rightFoot.position.y, -1.7, ease);
    }

    setPosition(x, y, z) {
        this.characterGroup.position.set(x, y, z);
    }

    setRotation(y) {
        this.characterGroup.rotation.y = y;
    }

    setWalking(walking) {
        this.isWalking = walking;
    }

    setVisible(visible) {
        this.characterGroup.visible = visible;
    }

    dispose() {
        this.scene.remove(this.characterGroup);
        // Dispose geometries and materials
        this.characterGroup.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

// Classe para chão infinito
class InfiniteFloor {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.chunkSize = 100; // Tamanho de cada chunk
        this.renderDistance = 3; // Quantos chunks ao redor carregar
        this.chunks = new Map(); // Armazena chunks ativos
        this.lastPlayerChunk = { x: 0, z: 0 };

        // Gerar chunks iniciais
        this.updateChunks();
    }

    // Converte posição do mundo para coordenada de chunk
    worldToChunk(worldPos) {
        return {
            x: Math.floor(worldPos.x / this.chunkSize),
            z: Math.floor(worldPos.z / this.chunkSize)
        };
    }

    // Cria uma chave única para o chunk
    chunkKey(chunkX, chunkZ) {
        return `${chunkX}_${chunkZ}`;
    }

    // Cria um chunk de chão
    createChunk(chunkX, chunkZ) {
        const geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize);
        const material = new THREE.MeshBasicMaterial({
            color: 0x228b22,
            wireframe: false, // Mude para true para ver os chunks
            side: THREE.DoubleSide // Garantir que seja visível dos dois lados
        });
        const chunk = new THREE.Mesh(geometry, material);

        // Posicionar chunk no mundo (ajustado para centralizar)
        chunk.position.set(
            chunkX * this.chunkSize + this.chunkSize / 2,
            0,
            chunkZ * this.chunkSize + this.chunkSize / 2
        );
        chunk.rotation.x = -Math.PI / 2;

        console.log(`Criando chunk em (${chunkX}, ${chunkZ}) - Posição mundo: (${chunk.position.x}, ${chunk.position.z})`);

        return chunk;
    }

    // Atualiza chunks baseado na posição do jogador
    updateChunks() {
        const playerPos = this.camera.position;
        const currentChunk = this.worldToChunk(playerPos);

        console.log(`Posição do jogador: (${playerPos.x.toFixed(2)}, ${playerPos.z.toFixed(2)}) - Chunk: (${currentChunk.x}, ${currentChunk.z})`);

        // Se o jogador mudou de chunk OU é a primeira vez
        if (currentChunk.x !== this.lastPlayerChunk.x ||
            currentChunk.z !== this.lastPlayerChunk.z ||
            this.chunks.size === 0) {

            console.log(`Atualizando chunks. Chunks ativos: ${this.chunks.size}`);

            // Chunks que devem existir
            const neededChunks = new Set();

            // Gerar chunks em um raio ao redor do jogador
            for (let x = currentChunk.x - this.renderDistance;
                x <= currentChunk.x + this.renderDistance; x++) {
                for (let z = currentChunk.z - this.renderDistance;
                    z <= currentChunk.z + this.renderDistance; z++) {
                    const key = this.chunkKey(x, z);
                    neededChunks.add(key);

                    // Criar chunk se não existe
                    if (!this.chunks.has(key)) {
                        const chunk = this.createChunk(x, z);
                        this.chunks.set(key, chunk);
                        this.scene.add(chunk);
                        console.log(`Chunk ${key} adicionado à cena`);
                    }
                }
            }

            // Remover chunks muito longe
            for (const [key, chunk] of this.chunks.entries()) {
                if (!neededChunks.has(key)) {
                    this.scene.remove(chunk);
                    chunk.geometry.dispose();
                    chunk.material.dispose();
                    this.chunks.delete(key);
                    console.log(`Chunk ${key} removido da cena`);
                }
            }

            this.lastPlayerChunk = currentChunk;
        }
    }

    // Chamado a cada frame
    update() {
        this.updateChunks();
    }

    // Limpeza
    dispose() {
        for (const [key, chunk] of this.chunks.entries()) {
            this.scene.remove(chunk);
            chunk.geometry.dispose();
            chunk.material.dispose();
        }
        this.chunks.clear();
    }
}

// Classe para pernas em primeira pessoa
class FirstPersonLegs {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.isWalking = false;
        this.walkCycle = 0;
        this.walkSpeed = 0.15;

        this.createLegs();
    }

    createLegs() {
        // Grupo das pernas (posicionado relativamente à câmera)
        this.legsGroup = new THREE.Group();

        // Coxa esquerda
        const thighGeometry = new THREE.BoxGeometry(0.3, 0.7, 0.3);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

        this.leftThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.leftThigh.position.set(-0.4, -1.2, 0.5);
        this.legsGroup.add(this.leftThigh);

        // Canela esquerda
        const shinGeometry = new THREE.BoxGeometry(0.25, 0.7, 0.25);
        this.leftShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.leftShin.position.set(-0.4, -1.8, 0.7);
        this.legsGroup.add(this.leftShin);

        // Pé esquerdo
        const footGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.6);
        const footMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
        this.leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.leftFoot.position.set(-0.4, -2.2, 0.9);
        this.legsGroup.add(this.leftFoot);

        // Coxa direita
        this.rightThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.rightThigh.position.set(0.4, -1.2, 0.5);
        this.legsGroup.add(this.rightThigh);

        // Canela direita
        this.rightShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.rightShin.position.set(0.4, -1.8, 0.7);
        this.legsGroup.add(this.rightShin);

        // Pé direito
        this.rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.rightFoot.position.set(0.4, -2.2, 0.9);
        this.legsGroup.add(this.rightFoot);

        // Adicionar as pernas como filho da câmera para seguir sua posição
        this.camera.add(this.legsGroup);
    }

    updateWalkAnimation() {
        if (this.isWalking) {
            this.walkCycle += this.walkSpeed;

            const legSwing = Math.sin(this.walkCycle) * 0.4;
            const legLift = Math.abs(Math.sin(this.walkCycle)) * 0.15;

            // Animação mais pronunciada para primeira pessoa
            this.leftThigh.rotation.x = legSwing;
            this.leftShin.rotation.x = Math.max(0, legSwing * 0.8);
            this.leftFoot.position.y = -2.2 + legLift;

            this.rightThigh.rotation.x = -legSwing;
            this.rightShin.rotation.x = Math.max(0, -legSwing * 0.8);
            this.rightFoot.position.y = -2.2 + Math.abs(Math.sin(this.walkCycle + Math.PI)) * 0.15;

        } else {
            this.resetToIdlePose();
        }
    }

    resetToIdlePose() {
        const ease = 0.08;

        this.leftThigh.rotation.x *= (1 - ease);
        this.rightThigh.rotation.x *= (1 - ease);
        this.leftShin.rotation.x *= (1 - ease);
        this.rightShin.rotation.x *= (1 - ease);

        this.leftFoot.position.y = THREE.MathUtils.lerp(this.leftFoot.position.y, -2.2, ease);
        this.rightFoot.position.y = THREE.MathUtils.lerp(this.rightFoot.position.y, -2.2, ease);
    }

    setWalking(walking) {
        this.isWalking = walking;
    }

    setVisible(visible) {
        this.legsGroup.visible = visible;
    }

    dispose() {
        this.camera.remove(this.legsGroup);
        this.legsGroup.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}
class MainCamera {
    constructor() {
        // Câmera principal (primeira pessoa)
        this.firstPersonCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.firstPersonCamera.position.set(0, 2, 5);

        // Câmera de terceira pessoa
        this.thirdPersonCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Propriedades para terceira pessoa
        this.thirdPersonDistance = 10;
        this.thirdPersonHeight = 5;

        // Modo atual (true = primeira pessoa, false = terceira pessoa)
        this.isFirstPerson = true;
    }

    // Retorna a câmera ativa
    get activeCamera() {
        return this.isFirstPerson ? this.firstPersonCamera : this.thirdPersonCamera;
    }

    // Alterna entre primeira e terceira pessoa
    toggleCameraMode() {
        this.isFirstPerson = !this.isFirstPerson;
        return this.isFirstPerson;
    }

    // Atualiza posição da câmera de terceira pessoa
    updateThirdPersonCamera() {
        if (!this.isFirstPerson) {
            // Calcular posição atrás da câmera de primeira pessoa
            const direction = new THREE.Vector3(0, 0, 1);
            direction.applyQuaternion(this.firstPersonCamera.quaternion);

            // Posicionar câmera atrás e acima
            this.thirdPersonCamera.position.copy(this.firstPersonCamera.position);
            this.thirdPersonCamera.position.add(direction.multiplyScalar(-this.thirdPersonDistance));
            this.thirdPersonCamera.position.y += this.thirdPersonHeight;

            // Fazer a câmera olhar para a câmera de primeira pessoa
            this.thirdPersonCamera.lookAt(this.firstPersonCamera.position);
        }
    }
}

// Classe para o renderizador
class MainRenderer {
    constructor(mountRef) {
        // Configura o renderizador
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Adiciona o renderizador ao DOM
        mountRef.current.appendChild(this.renderer.domElement);

        // Cena
        this.scene = new THREE.Scene();

        // Câmera
        this.mainCamera = new MainCamera();

        // Pernas em primeira pessoa
        this.firstPersonLegs = new FirstPersonLegs(this.scene, this.mainCamera.firstPersonCamera);

        // Personagem animado para terceira pessoa
        this.animatedCharacter = new AnimatedCharacter(this.scene);

        // Chão infinito (substituindo o chão fixo)
        this.infiniteFloor = new InfiniteFloor(this.scene, this.mainCamera.firstPersonCamera);

        // Controle de mouse
        this.mouseControl = new MouseControl(this.renderer, this.mainCamera);

        // Iniciar loop de animação
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Verificar se todos os objetos foram inicializados
        if (!this.mouseControl || !this.firstPersonLegs || !this.animatedCharacter || !this.mainCamera) {
            return;
        }

        // Verificar se o jogador está se movendo
        const isMoving = this.mouseControl.isMoving();

        // Atualizar movimento do jogador
        this.mouseControl.updateMovement();

        // Atualizar animações dos personagens
        if (this.firstPersonLegs) {
            this.firstPersonLegs.setWalking(isMoving);
            this.firstPersonLegs.updateWalkAnimation();
        }

        if (this.animatedCharacter) {
            this.animatedCharacter.setWalking(isMoving);
            this.animatedCharacter.updateWalkAnimation();
        }

        // Atualizar posição e rotação do personagem de terceira pessoa
        const camera = this.mainCamera.firstPersonCamera;
        if (camera && this.animatedCharacter) {
            this.animatedCharacter.setPosition(camera.position.x, camera.position.y - 2, camera.position.z);
            this.animatedCharacter.setRotation(camera.rotation.y);
        }

        // Controlar visibilidade baseada no modo da câmera
        if (this.firstPersonLegs) {
            this.firstPersonLegs.setVisible(this.mainCamera.isFirstPerson);
        }
        if (this.animatedCharacter) {
            this.animatedCharacter.setVisible(!this.mainCamera.isFirstPerson);
        }

        // Atualizar câmera de terceira pessoa se necessário
        this.mainCamera.updateThirdPersonCamera();

        // Atualizar chão infinito
        if (this.infiniteFloor) {
            this.infiniteFloor.update();
        }

        this.renderer.render(this.scene, this.mainCamera.activeCamera);
    }

    dispose(mountRef) {
        this.mouseControl.dispose();
        this.infiniteFloor.dispose();
        this.firstPersonLegs.dispose();
        this.animatedCharacter.dispose();
        mountRef.current.removeChild(this.renderer.domElement);
    }
}

// Classe para controle de mouse e movimento
class MouseControl {
    constructor(renderer, cameraManager) {
        this.renderer = renderer;
        this.cameraManager = cameraManager;
        this.isPointerLocked = false;
        this.sensitivity = 0.002;

        // Controles de movimento
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        this.moveSpeed = 0.2;

        // Criar elemento para logs visuais
        this.createDebugDisplay();
        this.init();
    }

    createDebugDisplay() {
        this.debugDiv = document.createElement('div');
        this.debugDiv.style.position = 'absolute';
        this.debugDiv.style.top = '10px';
        this.debugDiv.style.left = '10px';
        this.debugDiv.style.color = 'white';
        this.debugDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.debugDiv.style.padding = '10px';
        this.debugDiv.style.fontFamily = 'monospace';
        this.debugDiv.style.fontSize = '14px';
        this.debugDiv.style.borderRadius = '5px';
        this.debugDiv.style.zIndex = '1000';
        document.body.appendChild(this.debugDiv);

        this.updateDebugDisplay();
    }

    updateDebugDisplay() {
        const camera = this.cameraManager.firstPersonCamera;
        const rotationX = (camera.rotation.x * 180 / Math.PI).toFixed(2);
        const rotationY = (camera.rotation.y * 180 / Math.PI).toFixed(2);
        const posX = camera.position.x.toFixed(2);
        const posZ = camera.position.z.toFixed(2);

        // Status das teclas
        const keysStatus = Object.keys(this.keys)
            .filter(key => this.keys[key])
            .join(', ').toUpperCase() || 'Nenhuma';

        const isMovingText = this.isMoving() ? 'ANDANDO' : 'PARADO';

        this.debugDiv.innerHTML = `
            <div>Pointer Lock: ${this.isPointerLocked ? 'ON' : 'OFF'}</div>
            <div>Camera Mode: ${this.cameraManager.isFirstPerson ? 'PRIMEIRA PESSOA' : 'TERCEIRA PESSOA'}</div>
            <div>Status: ${isMovingText}</div>
            <div>Camera Rotation X (Vertical): ${rotationX}°</div>
            <div>Camera Rotation Y (Horizontal): ${rotationY}°</div>
            <div>Camera Position: (${posX}, ${posZ})</div>
            <div>Teclas Pressionadas: ${keysStatus}</div>
            <div>Move Speed: ${this.moveSpeed}</div>
            <div>Sensitivity: ${this.sensitivity}</div>
            <div style="color: yellow;">Clique para capturar o mouse | WASD para mover</div>
            <div style="color: cyan;">Pressione C para alternar câmera</div>
        `;
    }

    init() {
        this.handlePointerLockChange = () => {
            this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
            this.updateDebugDisplay();
        };

        this.handleMouseMove = (event) => {
            if (this.isPointerLocked) {
                const movementX = event.movementX || 0;
                const movementY = event.movementY || 0;

                const camera = this.cameraManager.firstPersonCamera;

                // Rotação horizontal (Y) - movimento do mouse para esquerda/direita
                camera.rotation.y -= movementX * this.sensitivity;

                // Rotação vertical (X) - movimento do mouse para cima/baixo
                camera.rotation.x -= movementY * this.sensitivity;

                // Limitar rotação vertical para não dar voltas completas
                camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

                this.updateDebugDisplay();
            }
        };

        // Controles de teclado
        this.handleKeyDown = (event) => {
            const key = event.key.toLowerCase();

            // Alternar modo de câmera com tecla C
            if (key === 'c') {
                this.cameraManager.toggleCameraMode();
                this.updateDebugDisplay();
                return;
            }

            if (key in this.keys) {
                this.keys[key] = true;
                this.updateDebugDisplay();
            }
        };

        this.handleKeyUp = (event) => {
            const key = event.key.toLowerCase();
            if (key in this.keys) {
                this.keys[key] = false;
                this.updateDebugDisplay();
            }
        };

        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });
        document.addEventListener('pointerlockchange', this.handlePointerLockChange);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    // Método para atualizar movimento
    updateMovement() {
        if (!this.isPointerLocked) return;

        const camera = this.cameraManager.firstPersonCamera;
        const direction = new THREE.Vector3();

        // Calcular direção baseada na rotação da câmera
        if (this.keys.w) direction.z -= 1;
        if (this.keys.s) direction.z += 1;
        if (this.keys.a) direction.x -= 1;
        if (this.keys.d) direction.x += 1;

        // Normalizar direção para movimento consistente
        if (direction.length() > 0) {
            direction.normalize();

            // Aplicar rotação Y da câmera à direção
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);

            // Aplicar movimento
            camera.position.add(direction.multiplyScalar(this.moveSpeed));

            this.updateDebugDisplay();
        }
    }

    // Verificar se o jogador está se movendo
    isMoving() {
        return this.keys.w || this.keys.a || this.keys.s || this.keys.d;
    }

    dispose() {
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        if (this.debugDiv) {
            document.body.removeChild(this.debugDiv);
        }
    }
}

function App() {
    const mountRef = useRef();

    useEffect(() => {
        // Renderizador
        const mainRenderer = new MainRenderer(mountRef);

        return () => {
            mainRenderer.dispose(mountRef);
        };
    }, []);

    return <div ref={mountRef} />;
}

export default App;
