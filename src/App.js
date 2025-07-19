import * as THREE from "three";
import { useEffect, useRef } from "react";

// Classe para o chão
class Floor {
    constructor() {
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0x228b22 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
    }
}

// Classe para a câmera
class MainCamera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);
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

        // Chão
        const floor = new Floor();
        this.scene.add(floor.mesh);

        // Controle de mouse
        this.mouseControl = new MouseControl(this.renderer, this.mainCamera.camera);

        // Iniciar loop de animação
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.mainCamera.camera);
    }

    dispose(mountRef) {
        this.mouseControl.dispose();
        mountRef.current.removeChild(this.renderer.domElement);
    }
}

// Classe para controle de mouse
class MouseControl {
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.isPointerLocked = false;
        this.sensitivity = 0.005;

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
        const rotationX = (this.camera.rotation.x * 180 / Math.PI).toFixed(2);
        const rotationY = (this.camera.rotation.y * 180 / Math.PI).toFixed(2);

        this.debugDiv.innerHTML = `
            <div>Pointer Lock: ${this.isPointerLocked ? 'ON' : 'OFF'}</div>
            <div>Camera Rotation X: ${rotationX}°</div>
            <div>Camera Rotation Y: ${rotationY}°</div>
            <div>Sensitivity: ${this.sensitivity}</div>
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
                this.camera.rotation.y = movementX * this.sensitivity;
                this.camera.rotation.x = movementY * this.sensitivity;
                // this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
                this.updateDebugDisplay();
            }
        };

        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });
        document.addEventListener('pointerlockchange', this.handlePointerLockChange);
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    dispose() {
        document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
        document.removeEventListener('mousemove', this.handleMouseMove);
        if (this.debugDiv) {
            document.body.removeChild(this.debugDiv);
        }
    }
} function App() {
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
