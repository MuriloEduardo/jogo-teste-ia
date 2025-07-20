import * as THREE from "three";

export class InfiniteFloor {
    constructor(scene) {
        this.scene = scene;
        this.chunks = new Map();
        this.chunkSize = 100;
        this.renderDistance = 3; // Quantos chunks carregar ao redor do jogador
        this.objectsPerChunk = 20; // Número de objetos por chunk
        
        // Cache de materiais para performance
        this.floorMaterial = new THREE.MeshLambertMaterial({ color: 0x4a5d23 });
        this.objectMaterials = [
            new THREE.MeshLambertMaterial({ color: 0x8B4513 }), // Marrom (troncos)
            new THREE.MeshLambertMaterial({ color: 0x228B22 }), // Verde (árvores)
            new THREE.MeshLambertMaterial({ color: 0x696969 }), // Cinza (pedras)
        ];
        
        // Cache de geometrias para performance
        this.floorGeometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize);
        this.objectGeometries = [
            new THREE.CylinderGeometry(0.5, 0.8, 3, 8), // Tronco
            new THREE.ConeGeometry(2, 4, 8),             // Árvore
            new THREE.SphereGeometry(1, 8, 6),           // Pedra
        ];
    }

    // Criar um chunk específico
    createChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        if (this.chunks.has(chunkKey)) {
            return this.chunks.get(chunkKey);
        }

        const chunkGroup = new THREE.Group();
        
        // Criar o chão do chunk
        const floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(chunkX * this.chunkSize, 0, chunkZ * this.chunkSize);
        floor.receiveShadow = true;
        chunkGroup.add(floor);

        // Adicionar objetos procedurais ao chunk
        this.addProceduralObjects(chunkGroup, chunkX, chunkZ);

        this.scene.add(chunkGroup);
        this.chunks.set(chunkKey, chunkGroup);

        return chunkGroup;
    }

    // Adicionar objetos procedurais a um chunk
    addProceduralObjects(chunkGroup, chunkX, chunkZ) {
        // Usar seed baseado na posição do chunk para consistência
        const seed = this.seededRandom(chunkX * 1000 + chunkZ);
        
        for (let i = 0; i < this.objectsPerChunk; i++) {
            const x = (seed() - 0.5) * this.chunkSize + chunkX * this.chunkSize;
            const z = (seed() - 0.5) * this.chunkSize + chunkZ * this.chunkSize;
            
            // Escolher tipo de objeto aleatoriamente
            const objectType = Math.floor(seed() * this.objectGeometries.length);
            
            const object = new THREE.Mesh(
                this.objectGeometries[objectType], 
                this.objectMaterials[objectType]
            );
            
            // Definir altura baseada no tipo de objeto
            let height = 1; // altura padrão
            switch(objectType) {
                case 0: height = 1.5; break; // Tronco
                case 1: height = 2; break;   // Árvore
                case 2: height = 1; break;   // Pedra
                default: height = 1; break;
            }
            
            object.position.set(x, height, z);
            object.castShadow = true;
            object.receiveShadow = true;
            
            // Rotação aleatória
            object.rotation.y = seed() * Math.PI * 2;
            
            // Escala aleatória (80% a 120%)
            const scale = 0.8 + seed() * 0.4;
            object.scale.setScalar(scale);
            
            chunkGroup.add(object);
        }
    }

    // Gerador de números pseudo-aleatórios com seed (para consistência)
    seededRandom(seed) {
        let current = seed;
        return function() {
            current = (current * 9301 + 49297) % 233280;
            return current / 233280;
        };
    }

    // Remover um chunk específico
    removeChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(chunkKey);
        
        if (chunk) {
            this.scene.remove(chunk);
            
            // Limpar memória
            chunk.traverse((child) => {
                if (child.geometry && child !== chunk) {
                    // Não dispose das geometrias cachadas
                }
                if (child.material && child !== chunk) {
                    // Não dispose dos materiais cachados
                }
            });
            
            this.chunks.delete(chunkKey);
        }
    }

    // Atualizar chunks baseado na posição do jogador
    updateChunks(playerPosition) {
        const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
        const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);

        // Carregar chunks próximos
        for (let x = playerChunkX - this.renderDistance; x <= playerChunkX + this.renderDistance; x++) {
            for (let z = playerChunkZ - this.renderDistance; z <= playerChunkZ + this.renderDistance; z++) {
                this.createChunk(x, z);
            }
        }

        // Remover chunks distantes
        const chunksToRemove = [];
        for (let [key, chunk] of this.chunks) {
            const [chunkX, chunkZ] = key.split(',').map(Number);
            const distance = Math.max(Math.abs(chunkX - playerChunkX), Math.abs(chunkZ - playerChunkZ));
            
            if (distance > this.renderDistance + 1) {
                chunksToRemove.push([chunkX, chunkZ]);
            }
        }

        chunksToRemove.forEach(([x, z]) => this.removeChunk(x, z));
    }

    // Verificar colisão com objetos
    checkCollision(position, radius = 1) {
        // Determinar quais chunks verificar
        const chunkX = Math.floor(position.x / this.chunkSize);
        const chunkZ = Math.floor(position.z / this.chunkSize);
        
        for (let x = chunkX - 1; x <= chunkX + 1; x++) {
            for (let z = chunkZ - 1; z <= chunkZ + 1; z++) {
                const chunkKey = `${x},${z}`;
                const chunk = this.chunks.get(chunkKey);
                
                if (chunk) {
                    for (let object of chunk.children) {
                        if (object.geometry && object !== chunk.children[0]) { // Skip floor
                            const distance = position.distanceTo(object.position);
                            if (distance < radius + 1) { // 1 é o raio aproximado dos objetos
                                return true;
                            }
                        }
                    }
                }
            }
        }
        
        return false;
    }

    // Limpar todos os recursos
    dispose() {
        // Remover todos os chunks
        for (let [key, chunk] of this.chunks) {
            this.scene.remove(chunk);
        }
        this.chunks.clear();

        // Limpar materiais e geometrias cachados
        this.floorMaterial.dispose();
        this.floorGeometry.dispose();
        
        this.objectMaterials.forEach(material => material.dispose());
        this.objectGeometries.forEach(geometry => geometry.dispose());
    }
}
