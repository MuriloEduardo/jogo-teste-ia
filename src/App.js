import * as THREE from "three";
import { useEffect, useRef } from "react";

// Importar componentes modularizados
import { AnimatedCharacter } from "./components/Character/AnimatedCharacter";
import { FirstPersonLegs } from "./components/Character/FirstPersonLegs";
import { MainCamera } from "./components/Camera/MainCamera";
import { MainRenderer } from "./components/Renderer/MainRenderer";
import { MouseControl } from "./components/Controls/MouseControl";
import { InfiniteFloor } from "./components/World/InfiniteFloor";
import { DebugOverlay } from "./components/UI/DebugOverlay";
import { WeaponSystem } from "./components/Weapon/WeaponSystem";
import { WeaponHUD } from "./components/UI/WeaponHUD";

// Classe principal do jogo
class GameEngine {
    constructor(mountRef) {
        this.mountRef = mountRef;
        this.scene = new THREE.Scene();
        
        // Inicializar sistemas do jogo
        this.initializeRenderer();
        this.initializeLighting();
        this.initializeSkybox();
        this.initializeGameSystems();
        this.initializeEventHandlers();
        
        // Começar o game loop
        this.animate();
    }

    initializeRenderer() {
        this.rendererInstance = new MainRenderer();
        this.renderer = this.rendererInstance.renderer;
        this.mountRef.current.appendChild(this.rendererInstance.getDomElement());
    }

    initializeLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Luz direcional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
    }

    initializeSkybox() {
        // Skybox simples
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB, // Sky blue
            side: THREE.BackSide, // Renderizar apenas o interior da esfera
            fog: false // Não aplicar fog no céu
        });

        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skybox);

        // Adicionar algumas nuvens simples
        this.createClouds();

        // Adicionar fog para dar sensação de profundidade
        this.scene.fog = new THREE.Fog(0xcccccc, 100, 400);
    }

    createClouds() {
        this.cloudsGroup = new THREE.Group();

        // Criar várias nuvens em posições aleatórias
        for (let i = 0; i < 20; i++) {
            const cloudGroup = new THREE.Group();

            // Cada nuvem é feita de várias esferas pequenas
            for (let j = 0; j < 5 + Math.random() * 5; j++) {
                const cloudGeometry = new THREE.SphereGeometry(8 + Math.random() * 12, 8, 6);
                const cloudMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.7
                });

                const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);

                // Posicionar partes da nuvem
                cloudPart.position.x = (Math.random() - 0.5) * 30;
                cloudPart.position.y = (Math.random() - 0.5) * 8;
                cloudPart.position.z = (Math.random() - 0.5) * 15;

                cloudGroup.add(cloudPart);
            }

            // Posicionar nuvem no céu
            const angle = (i / 20) * Math.PI * 2;
            const distance = 200 + Math.random() * 200;
            cloudGroup.position.x = Math.cos(angle) * distance;
            cloudGroup.position.y = 40 + Math.random() * 30;
            cloudGroup.position.z = Math.sin(angle) * distance;

            this.cloudsGroup.add(cloudGroup);
        }

        this.scene.add(this.cloudsGroup);
    }

    initializeGameSystems() {
        // Inicializar sistemas de câmera
        this.mainCamera = new MainCamera();

        // Inicializar sistemas de controle
        this.mouseControl = new MouseControl();
        this.mouseControl.init(this.rendererInstance.getDomElement());

        // Inicializar personagens
        this.firstPersonLegs = new FirstPersonLegs(this.scene, this.mainCamera.firstPersonCamera);
        this.animatedCharacter = new AnimatedCharacter(this.scene);

        // Inicializar mundo
        this.infiniteFloor = new InfiniteFloor(this.scene);

        // Inicializar sistema de arma
        this.weaponSystem = new WeaponSystem(this.scene, this.mainCamera.firstPersonCamera);

        // Inicializar UI
        this.debugOverlay = new DebugOverlay();
        this.weaponHUD = new WeaponHUD();
    }

    initializeEventHandlers() {
        // Controle de teclado
        this.keys = { w: false, a: false, s: false, d: false };

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW': this.keys.w = true; break;
                case 'KeyA': this.keys.a = true; break;
                case 'KeyS': this.keys.s = true; break;
                case 'KeyD': this.keys.d = true; break;
                case 'KeyC': 
                    const isFirstPerson = this.mainCamera.toggleCameraMode();
                    console.log(`Câmera alternada para: ${isFirstPerson ? 'Primeira pessoa' : 'Terceira pessoa'}`);
                    break;
                case 'F1':
                    event.preventDefault();
                    const debugVisible = this.debugOverlay.toggle();
                    console.log(`Debug overlay: ${debugVisible ? 'ON' : 'OFF'}`);
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW': this.keys.w = false; break;
                case 'KeyA': this.keys.a = false; break;
                case 'KeyS': this.keys.s = false; break;
                case 'KeyD': this.keys.d = false; break;
            }
        });

        // Redimensionamento da janela
        window.addEventListener('resize', () => {
            this.mainCamera.firstPersonCamera.aspect = window.innerWidth / window.innerHeight;
            this.mainCamera.firstPersonCamera.updateProjectionMatrix();
            
            this.mainCamera.thirdPersonCamera.aspect = window.innerWidth / window.innerHeight;
            this.mainCamera.thirdPersonCamera.updateProjectionMatrix();

            this.rendererInstance.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Aplicar rotação do mouse à câmera
        this.mouseControl.applyRotation(this.mainCamera.firstPersonCamera);

        // Calcular movimento baseado na direção da câmera
        const moveSpeed = 0.15;
        const velocity = { x: 0, z: 0 };

        if (this.keys.w || this.keys.s || this.keys.a || this.keys.d) {
            const forward = this.mouseControl.getForwardDirection();
            const right = this.mouseControl.getRightDirection();

            if (this.keys.w) {
                velocity.x += forward.x * moveSpeed;
                velocity.z += forward.z * moveSpeed;
            }
            if (this.keys.s) {
                velocity.x -= forward.x * moveSpeed;
                velocity.z -= forward.z * moveSpeed;
            }
            if (this.keys.a) {
                velocity.x -= right.x * moveSpeed;
                velocity.z -= right.z * moveSpeed;
            }
            if (this.keys.d) {
                velocity.x += right.x * moveSpeed;
                velocity.z += right.z * moveSpeed;
            }
        }

        // Aplicar movimento à câmera
        const isMoving = velocity.x !== 0 || velocity.z !== 0;
        
        if (isMoving) {
            const newPosition = this.mainCamera.firstPersonCamera.position.clone();
            newPosition.x += velocity.x;
            newPosition.z += velocity.z;

            // Verificar colisão
            if (!this.infiniteFloor.checkCollision(newPosition, 1)) {
                this.mainCamera.firstPersonCamera.position.copy(newPosition);
            }
        }

        // Atualizar animações dos personagens
        this.firstPersonLegs.setWalking(isMoving);
        this.firstPersonLegs.updateWalkAnimation();

        this.animatedCharacter.setWalking(isMoving);
        this.animatedCharacter.updateWalkAnimation();

        // Atualizar posição do personagem de terceira pessoa
        const camera = this.mainCamera.firstPersonCamera;
        this.animatedCharacter.setPosition(camera.position.x, 0, camera.position.z);
        
        // Rotacionar personagem na direção do movimento
        if (isMoving) {
            const targetRotation = Math.atan2(velocity.x, velocity.z);
            this.animatedCharacter.setRotation(targetRotation);
        }

        // Controlar visibilidade baseada no modo da câmera
        this.firstPersonLegs.setVisible(this.mainCamera.isFirstPerson);
        this.animatedCharacter.setVisible(!this.mainCamera.isFirstPerson);

        // Atualizar câmera de terceira pessoa
        this.mainCamera.updateThirdPersonCamera();

        // Atualizar mundo
        this.infiniteFloor.updateChunks(this.mainCamera.firstPersonCamera.position);

        // Atualizar sistema de arma
        const deltaTime = 0.016; // ~60fps
        this.weaponSystem.update(deltaTime);

        // Atualizar HUD da arma
        this.weaponHUD.update(this.weaponSystem.getAmmoInfo());

        // Atualizar debug overlay
        if (this.debugOverlay.visible) {
            const debugData = {
                position: this.mainCamera.firstPersonCamera.position,
                cameraMode: this.mainCamera.isFirstPerson ? 'First Person' : 'Third Person',
                velocity: velocity,
                isMoving: isMoving,
                rotation: (this.mouseControl.rotationY * 180 / Math.PI),
                chunks: this.infiniteFloor.chunks.size,
                memoryInfo: (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 'N/A'),
                weaponInfo: this.weaponSystem.getAmmoInfo()
            };
            this.debugOverlay.update(debugData);
        }

        // Renderizar cena
        this.rendererInstance.render(this.scene, this.mainCamera.activeCamera);
    }

    dispose(mountRef) {
        // Limpar recursos
        if (this.firstPersonLegs) this.firstPersonLegs.dispose();
        if (this.animatedCharacter) this.animatedCharacter.dispose();
        if (this.infiniteFloor) this.infiniteFloor.dispose();
        if (this.debugOverlay) this.debugOverlay.dispose();
        if (this.weaponSystem) this.weaponSystem.dispose();
        if (this.weaponHUD) this.weaponHUD.dispose();

        // Remover event listeners
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        window.removeEventListener('resize', this.resizeHandler);

        // Limpar renderer
        if (this.rendererInstance && mountRef.current) {
            mountRef.current.removeChild(this.rendererInstance.getDomElement());
            this.rendererInstance.dispose();
        }

        // Limpar recursos da cena
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (object.material.map) object.material.map.dispose();
                object.material.dispose();
            }
        });
    }
}

function App() {
    const mountRef = useRef();

    useEffect(() => {
        // Renderizador
        const gameEngine = new GameEngine(mountRef);

        return () => {
            gameEngine.dispose(mountRef);
        };
    }, []);

    return <div ref={mountRef} />;
}

export default App;
