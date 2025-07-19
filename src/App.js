import * as THREE from "three";
import { useEffect, useRef } from "react";

// Classe para personagem animado
class AnimatedCharacter {
    constructor(scene) {
        this.scene = scene;
        this.isWalking = false;
        this.walkCycle = 0;
        this.walkSpeed = 0.1;

        // Variáveis para piscada
        this.blinkTimer = 0;
        this.blinkDuration = 0;
        this.isBlinking = false;
        this.nextBlinkTime = Math.random() * 3 + 2; // Piscar a cada 2-5 segundos

        this.createCharacter();
    }

    createCharacter() {
        // Grupo principal do personagem
        this.characterGroup = new THREE.Group();

        // Corpo (torso)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0066cc });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.6 + 1.8; // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.body);

        // Cabeça
        const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.5 + 1.8; // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.head);

        // Adicionar rosto à cabeça
        this.createFace();

        // Braços
        this.createArms();

        // Pernas (mais detalhadas)
        this.createLegs();

        this.scene.add(this.characterGroup);
    }

    createFace() {
        // Grupo para o rosto
        this.faceGroup = new THREE.Group();

        // Olho esquerdo
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 6);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(-0.15, 0.1, 0.28);
        this.faceGroup.add(this.leftEye);

        // Olho direito
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(0.15, 0.1, 0.28);
        this.faceGroup.add(this.rightEye);

        // Pupilas (brancas para contraste)
        const pupilGeometry = new THREE.SphereGeometry(0.04, 6, 4);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        this.leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.leftPupil.position.set(-0.15, 0.1, 0.32);
        this.faceGroup.add(this.leftPupil);

        this.rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.rightPupil.position.set(0.15, 0.1, 0.32);
        this.faceGroup.add(this.rightPupil);

        // Nariz
        const noseGeometry = new THREE.ConeGeometry(0.05, 0.15, 6);
        const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
        this.nose = new THREE.Mesh(noseGeometry, noseMaterial);
        this.nose.position.set(0, -0.05, 0.28);
        this.nose.rotation.x = Math.PI / 2;
        this.faceGroup.add(this.nose);

        // Boca
        const mouthGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05);
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        this.mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        this.mouth.position.set(0, -0.2, 0.28);
        this.faceGroup.add(this.mouth);

        // Posicionar o rosto na cabeça
        this.faceGroup.position.y = 1.5 + 1.8;
        this.characterGroup.add(this.faceGroup);
    }

    updateBlinking() {
        const deltaTime = 0.016; // Aproximadamente 60 FPS
        this.blinkTimer += deltaTime;

        if (!this.isBlinking && this.blinkTimer >= this.nextBlinkTime) {
            // Iniciar piscada
            this.isBlinking = true;
            this.blinkDuration = 0.15; // Duração da piscada em segundos
            this.blinkTimer = 0;
        }

        if (this.isBlinking) {
            // Durante a piscada, achatar os olhos
            const blinkProgress = this.blinkTimer / this.blinkDuration;

            if (blinkProgress < 0.5) {
                // Primeira metade da piscada - fechar olhos
                const scale = 1 - (blinkProgress * 2);
                if (this.leftEye) this.leftEye.scale.y = scale;
                if (this.rightEye) this.rightEye.scale.y = scale;
            } else if (blinkProgress < 1) {
                // Segunda metade da piscada - abrir olhos
                const scale = (blinkProgress - 0.5) * 2;
                if (this.leftEye) this.leftEye.scale.y = scale;
                if (this.rightEye) this.rightEye.scale.y = scale;
            } else {
                // Fim da piscada
                this.isBlinking = false;
                if (this.leftEye) this.leftEye.scale.y = 1;
                if (this.rightEye) this.rightEye.scale.y = 1;
                this.blinkTimer = 0;
                this.nextBlinkTime = Math.random() * 4 + 1.5; // Próxima piscada em 1.5-5.5 segundos
            }
        }
    }

    createArms() {
        // Braço esquerdo
        const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        const armMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });

        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.65, 0.6 + 1.8, 0); // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.leftArm);

        // Braço direito
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.65, 0.6 + 1.8, 0); // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.rightArm);
    }

    createLegs() {
        // Coxa esquerda
        const thighGeometry = new THREE.BoxGeometry(0.35, 0.8, 0.35);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

        this.leftThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.leftThigh.position.set(-0.3, -0.4 + 1.8, 0); // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.leftThigh);

        // Canela esquerda
        const shinGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        this.leftShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.leftShin.position.set(-0.3, -1.2 + 1.8, 0); // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.leftShin);

        // Pé esquerdo
        const footGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
        const footMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
        this.leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.leftFoot.position.set(-0.3, -1.7 + 1.8, 0.2); // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.leftFoot);

        // Coxa direita
        this.rightThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.rightThigh.position.set(0.3, -0.4 + 1.8, 0); // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.rightThigh);

        // Canela direita
        this.rightShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.rightShin.position.set(0.3, -1.2 + 1.8, 0); // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.rightShin);

        // Pé direito
        this.rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.rightFoot.position.set(0.3, -1.7 + 1.8, 0.2); // Ajustar para que os pés fiquem no chão
        this.characterGroup.add(this.rightFoot);
    }

    // Animar caminhada
    updateWalkAnimation() {
        // Atualizar temporizador de piscada
        this.updateBlinking();

        if (this.isWalking) {
            this.walkCycle += this.walkSpeed;

            // Animação das pernas (movimento alternado)
            const legSwing = Math.sin(this.walkCycle) * 0.3;
            const legLift = Math.abs(Math.sin(this.walkCycle)) * 0.1;

            // Perna esquerda
            this.leftThigh.rotation.x = legSwing;
            this.leftShin.rotation.x = Math.max(0, legSwing * 0.5);
            this.leftFoot.position.y = (-1.7 + 1.8) + legLift; // Ajustar posição base

            // Perna direita (oposta)
            this.rightThigh.rotation.x = -legSwing;
            this.rightShin.rotation.x = Math.max(0, -legSwing * 0.5);
            this.rightFoot.position.y = (-1.7 + 1.8) + Math.abs(Math.sin(this.walkCycle + Math.PI)) * 0.1; // Ajustar posição base

            // Movimento sutil dos braços
            this.leftArm.rotation.x = legSwing * 0.5;
            this.rightArm.rotation.x = -legSwing * 0.5;

            // Balanceio do corpo
            this.body.rotation.z = Math.sin(this.walkCycle * 2) * 0.05;
            this.head.rotation.z = Math.sin(this.walkCycle * 2) * 0.03;

            // Balanceio sutil do rosto junto com a cabeça
            if (this.faceGroup) {
                this.faceGroup.rotation.z = Math.sin(this.walkCycle * 2) * 0.03;
            }
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

        // Resetar rotação do rosto também
        if (this.faceGroup) {
            this.faceGroup.rotation.z *= (1 - ease);
        }

        // Resetar altura dos pés
        this.leftFoot.position.y = THREE.MathUtils.lerp(this.leftFoot.position.y, -1.7 + 1.8, ease); // Ajustar posição base
        this.rightFoot.position.y = THREE.MathUtils.lerp(this.rightFoot.position.y, -1.7 + 1.8, ease); // Ajustar posição base
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

// Classe para chão infinito com objetos
class InfiniteFloor {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.chunkSize = 50; // Tamanho de cada chunk REDUZIDO
        this.renderDistance = 2; // Quantos chunks ao redor carregar REDUZIDO
        this.chunks = new Map(); // Armazena chunks ativos
        this.chunkObjects = new Map(); // Armazena objetos de cada chunk
        this.chunkColliders = new Map(); // NOVO: Armazena colidores de cada chunk
        this.lastPlayerChunk = { x: 0, z: 0 };

        // Configurações para geração de objetos
        this.objectDensity = 0.008; // Densidade REDUZIDA drasticamente
        this.randomSeed = 12345; // Seed para geração consistente
        this.renderDistance = 2; // REDUZIDO de 3 para 2 chunks

        // OTIMIZAÇÃO: Geometrias compartilhadas para economizar memória
        this.sharedGeometries = this.createSharedGeometries();
        this.sharedMaterials = this.createSharedMaterials();

        // Gerar chunks iniciais
        this.updateChunks();
    }

    // NOVA: Criar geometrias compartilhadas
    createSharedGeometries() {
        return {
            trunk: new THREE.CylinderGeometry(0.3, 0.4, 3, 6), // Reduzido segments
            foliage: new THREE.SphereGeometry(2, 6, 4), // Reduzido segments
            rock: new THREE.DodecahedronGeometry(1.5, 0),
            bush: new THREE.SphereGeometry(0.8, 6, 4),
            floor: new THREE.PlaneGeometry(this.chunkSize, this.chunkSize)
        };
    }

    // NOVA: Criar materiais compartilhados
    createSharedMaterials() {
        return {
            trunk: new THREE.MeshBasicMaterial({ color: 0x8B4513 }),
            foliage: new THREE.MeshBasicMaterial({ color: 0x228B22 }),
            rock: new THREE.MeshBasicMaterial({ color: 0x696969 }),
            bush: new THREE.MeshBasicMaterial({ color: 0x32CD32 })
        };
    }

    // Gerador de números pseudo-aleatórios baseado em seed
    seededRandom(chunkX, chunkZ, objectIndex = 0) {
        const seed = this.randomSeed + chunkX * 73856093 + chunkZ * 19349663 + objectIndex * 83492791;
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // Criar objetos para um chunk
    createChunkObjects(chunkX, chunkZ) {
        const objects = [];
        const colliders = []; // NOVO: Array para colidores
        const chunkWorldX = chunkX * this.chunkSize;
        const chunkWorldZ = chunkZ * this.chunkSize;

        // Calcular número de objetos baseado na densidade
        const numObjects = Math.floor(this.chunkSize * this.chunkSize * this.objectDensity);

        for (let i = 0; i < numObjects; i++) {
            const rand1 = this.seededRandom(chunkX, chunkZ, i * 3);
            const rand2 = this.seededRandom(chunkX, chunkZ, i * 3 + 1);
            const rand3 = this.seededRandom(chunkX, chunkZ, i * 3 + 2);

            // Posição aleatória dentro do chunk
            const x = chunkWorldX + rand1 * this.chunkSize;
            const z = chunkWorldZ + rand2 * this.chunkSize;

            // Tipo de objeto baseado no terceiro número aleatório
            let object;
            let collider;

            if (rand3 < 0.45) {
                object = this.createTree(x, z);
                collider = this.createTreeCollider(x, z);
            } else if (rand3 < 0.8) {
                object = this.createRock(x, z);
                collider = this.createRockCollider(x, z);
            } else {
                object = this.createBush(x, z);
                collider = this.createBushCollider(x, z);
            }

            if (object) {
                objects.push(object);
                this.scene.add(object);

                if (collider) {
                    colliders.push(collider);
                }
            }
        }

        return { objects, colliders };
    }

    // Criar uma árvore OTIMIZADA
    createTree(x, z) {
        const treeGroup = new THREE.Group();

        // Tronco usando geometria compartilhada
        const trunk = new THREE.Mesh(this.sharedGeometries.trunk, this.sharedMaterials.trunk);
        trunk.position.set(0, 1.5, 0);
        treeGroup.add(trunk);

        // Copa da árvore usando geometria compartilhada
        const foliage = new THREE.Mesh(this.sharedGeometries.foliage, this.sharedMaterials.foliage);
        foliage.position.set(0, 4, 0);
        treeGroup.add(foliage);

        treeGroup.position.set(x, 0, z);
        return treeGroup;
    }

    // Criar uma rocha OTIMIZADA
    createRock(x, z) {
        const rock = new THREE.Mesh(this.sharedGeometries.rock, this.sharedMaterials.rock);

        rock.position.set(x, 0.75, z);
        // Simplificar rotação aleatória
        rock.rotation.y = this.seededRandom(x, z, 999) * Math.PI * 2;
        rock.scale.setScalar(0.8 + this.seededRandom(x, z, 998) * 0.4);

        return rock;
    }

    // Criar um arbusto OTIMIZADO
    createBush(x, z) {
        const bush = new THREE.Mesh(this.sharedGeometries.bush, this.sharedMaterials.bush);

        bush.position.set(x, 0.4, z);
        bush.scale.y = 0.6;

        return bush;
    }

    // NOVO: Criar colisor para árvore
    createTreeCollider(x, z) {
        return {
            type: 'tree',
            x: x,
            z: z,
            radius: 1.5, // Raio do colisor circular
            height: 6
        };
    }

    // NOVO: Criar colisor para rocha
    createRockCollider(x, z) {
        return {
            type: 'rock',
            x: x,
            z: z,
            radius: 1.8, // Raio do colisor circular
            height: 1.5
        };
    }

    // NOVO: Criar colisor para arbusto
    createBushCollider(x, z) {
        return {
            type: 'bush',
            x: x,
            z: z,
            radius: 1.0, // Raio do colisor circular
            height: 0.8
        };
    }

    // NOVO: Verificar colisão circular com suavização
    checkCollision(playerX, playerZ, playerRadius = 0.8) {
        const currentChunk = this.worldToChunk({ x: playerX, z: playerZ });
        let closestCollision = null;
        let minDistance = Infinity;

        // Verificar colisões nos chunks próximos
        for (let x = currentChunk.x - 1; x <= currentChunk.x + 1; x++) {
            for (let z = currentChunk.z - 1; z <= currentChunk.z + 1; z++) {
                const key = this.chunkKey(x, z);
                const colliders = this.chunkColliders.get(key);

                if (colliders) {
                    for (const collider of colliders) {
                        const dx = playerX - collider.x;
                        const dz = playerZ - collider.z;
                        const distance = Math.sqrt(dx * dx + dz * dz);
                        const totalRadius = playerRadius + collider.radius;

                        // Se a distância é menor que a soma dos raios, há colisão
                        if (distance < totalRadius && distance < minDistance) {
                            // Calcular penetração (quão profundo o jogador está dentro do colisor)
                            const penetration = totalRadius - distance;
                            const normalizedDistance = Math.max(distance, 0.001); // Evitar divisão por zero

                            // Força de empurrão mais suave baseada na penetração
                            const pushStrength = Math.min(penetration * 0.3, 0.15); // Limitado e mais suave

                            minDistance = distance;
                            closestCollision = {
                                collision: true,
                                type: collider.type,
                                pushX: (dx / normalizedDistance) * pushStrength,
                                pushZ: (dz / normalizedDistance) * pushStrength,
                                distance: distance,
                                penetration: penetration
                            };
                        }
                    }
                }
            }
        }

        return closestCollision || { collision: false };
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

    // Cria um chunk de chão OTIMIZADO
    createChunk(chunkX, chunkZ) {
        // Variar cor do chão baseado na posição para dar sensação de movimento
        const colorVariation = (this.seededRandom(chunkX, chunkZ) - 0.5) * 0.2; // Reduzido variação
        const baseColor = new THREE.Color(0x228b22);
        baseColor.offsetHSL(0, 0, colorVariation);

        const material = new THREE.MeshBasicMaterial({
            color: baseColor,
            wireframe: false,
            side: THREE.DoubleSide
        });

        // Usar geometria compartilhada
        const chunk = new THREE.Mesh(this.sharedGeometries.floor, material);

        // Posicionar chunk no mundo (ajustado para centralizar)
        chunk.position.set(
            chunkX * this.chunkSize + this.chunkSize / 2,
            0,
            chunkZ * this.chunkSize + this.chunkSize / 2
        );
        chunk.rotation.x = -Math.PI / 2;

        return chunk;
    }

    // Atualiza chunks baseado na posição do jogador OTIMIZADO
    updateChunks() {
        const playerPos = this.camera.position;
        const currentChunk = this.worldToChunk(playerPos);

        // Se o jogador mudou de chunk OU é a primeira vez
        if (currentChunk.x !== this.lastPlayerChunk.x ||
            currentChunk.z !== this.lastPlayerChunk.z ||
            this.chunks.size === 0) {

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

                        // Criar objetos e colidores do chunk
                        const { objects, colliders } = this.createChunkObjects(x, z);
                        this.chunkObjects.set(key, objects);
                        this.chunkColliders.set(key, colliders); // NOVO: Armazenar colidores
                    }
                }
            }

            // Remover chunks muito longe
            for (const [key, chunk] of this.chunks.entries()) {
                if (!neededChunks.has(key)) {
                    // Remover chunk do chão
                    this.scene.remove(chunk);
                    if (chunk.material) chunk.material.dispose();
                    this.chunks.delete(key);

                    // Remover objetos do chunk
                    const objects = this.chunkObjects.get(key);
                    if (objects) {
                        objects.forEach(obj => {
                            this.scene.remove(obj);
                        });
                        this.chunkObjects.delete(key);
                    }

                    // NOVO: Remover colidores do chunk
                    this.chunkColliders.delete(key);
                }
            }

            this.lastPlayerChunk = currentChunk;
        }
    }

    // Chamado a cada frame
    update() {
        this.updateChunks();

        // OTIMIZAÇÃO: Animar objetos apenas a cada 3 frames
        if (!this.animationFrameCount) this.animationFrameCount = 0;
        this.animationFrameCount++;

        if (this.animationFrameCount % 3 === 0) {
            this.animateObjects();
        }
    }

    // Animar objetos do cenário OTIMIZADO
    animateObjects() {
        // Removido: animação de cristais já que foram removidos do jogo
        // Função mantida para futuras animações se necessário
    }

    // Limpeza OTIMIZADA
    dispose() {
        // Limpar chunks do chão
        for (const [key, chunk] of this.chunks.entries()) {
            this.scene.remove(chunk);
            // Não dispose da geometria compartilhada, apenas do material específico
            if (chunk.material) chunk.material.dispose();
        }
        this.chunks.clear();

        // Limpar objetos dos chunks
        for (const [key, objects] of this.chunkObjects.entries()) {
            objects.forEach(obj => {
                this.scene.remove(obj);
                // Para grupos (árvores), percorrer filhos
                if (obj.children) {
                    obj.children.forEach(child => {
                        if (child.material && child.material !== this.sharedMaterials.trunk &&
                            child.material !== this.sharedMaterials.foliage) {
                            child.material.dispose();
                        }
                    });
                }
            });
        }
        this.chunkObjects.clear();

        // NOVO: Limpar colidores
        this.chunkColliders.clear();

        // Limpar geometrias e materiais compartilhados
        Object.values(this.sharedGeometries).forEach(geo => geo.dispose());
        Object.values(this.sharedMaterials).forEach(mat => mat.dispose());
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

        // Controle de mouse (NOVO: Passando referência do InfiniteFloor)
        this.mouseControl = new MouseControl(this.renderer, this.mainCamera, this.infiniteFloor);

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
            // Colocar o personagem no chão (y = 0) na mesma posição X e Z da câmera
            this.animatedCharacter.setPosition(camera.position.x, 0, camera.position.z);
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

        // Atualizar debug com informações do cenário (OTIMIZADO: menos frequente)
        if (this.mouseControl && this.infiniteFloor && this.debugUpdateCounter % 30 === 0) {
            const totalObjects = Array.from(this.infiniteFloor.chunkObjects.values())
                .reduce((sum, objects) => sum + objects.length, 0);

            this.mouseControl.updateDebugDisplay({
                chunkCount: this.infiniteFloor.chunks.size,
                objectCount: totalObjects
            });
        }

        if (!this.debugUpdateCounter) this.debugUpdateCounter = 0;
        this.debugUpdateCounter++;

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
    constructor(renderer, cameraManager, infiniteFloor = null) { // NOVO: Receber referência do InfiniteFloor
        this.renderer = renderer;
        this.cameraManager = cameraManager;
        this.infiniteFloor = infiniteFloor; // NOVO: Para verificar colisões
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

    updateDebugDisplay(sceneInfo = {}) {
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

        // NOVO: Verificar se há colisão na posição atual
        let collisionInfo = '';
        if (this.infiniteFloor) {
            const collision = this.infiniteFloor.checkCollision(camera.position.x, camera.position.z);
            if (collision.collision) {
                const penetrationText = collision.penetration ? ` (${collision.penetration.toFixed(2)}m)` : '';
                collisionInfo = `<div style="color: orange;">⚠️ COLISÃO SUAVE COM ${collision.type.toUpperCase()}${penetrationText}</div>`;
            } else {
                collisionInfo = `<div style="color: lightgreen;">✓ Movimento livre</div>`;
            }
        }

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
            ${sceneInfo.chunkCount ? `<div style="color: lightgreen;">Chunks Ativos: ${sceneInfo.chunkCount}</div>` : ''}
            ${sceneInfo.objectCount ? `<div style="color: lightblue;">Objetos no Cenário: ${sceneInfo.objectCount}</div>` : ''}
            ${collisionInfo}
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

                // OTIMIZADO: Atualizar debug menos frequentemente
                if (!this.mouseMoveCounter) this.mouseMoveCounter = 0;
                this.mouseMoveCounter++;
                if (this.mouseMoveCounter % 10 === 0) {
                    this.updateDebugDisplay();
                }
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

    // Método para atualizar movimento OTIMIZADO com COLISÃO SUAVE
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

            // NOVO: Calcular nova posição com movimento mais suave
            const moveVector = direction.multiplyScalar(this.moveSpeed);
            const newPosition = camera.position.clone().add(moveVector);

            // NOVO: Verificar colisão se o InfiniteFloor está disponível
            if (this.infiniteFloor) {
                const collision = this.infiniteFloor.checkCollision(newPosition.x, newPosition.z);

                if (collision.collision) {
                    // Movimento suave com deslizamento ao longo das superfícies
                    const adjustedPosition = camera.position.clone();

                    // Aplicar empurrão gradual
                    adjustedPosition.x += collision.pushX;
                    adjustedPosition.z += collision.pushZ;

                    // Tentar movimento parcial em cada eixo separadamente (deslizar)
                    const testX = camera.position.clone();
                    testX.x += moveVector.x;
                    const collisionX = this.infiniteFloor.checkCollision(testX.x, testX.z);

                    const testZ = camera.position.clone();
                    testZ.z += moveVector.z;
                    const collisionZ = this.infiniteFloor.checkCollision(testZ.x, testZ.z);

                    // Permitir movimento no eixo que não tem colisão (deslizamento)
                    if (!collisionX.collision) {
                        adjustedPosition.x = testX.x;
                    }
                    if (!collisionZ.collision) {
                        adjustedPosition.z = testZ.z;
                    }

                    // Aplicar posição ajustada suavemente
                    camera.position.lerp(adjustedPosition, 0.8);

                } else {
                    // Sem colisão, mover normalmente
                    camera.position.copy(newPosition);
                }
            } else {
                // Fallback: movimento sem colisão
                camera.position.add(moveVector);
            }

            // OTIMIZADO: Atualizar debug menos frequentemente durante movimento
            if (!this.movementCounter) this.movementCounter = 0;
            this.movementCounter++;
            if (this.movementCounter % 20 === 0) {
                this.updateDebugDisplay();
            }
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
