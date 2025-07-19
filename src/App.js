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

        // Renderizar
        this.renderer.render(this.scene, this.mainCamera.camera);
    }
    dispose(mountRef) {
        mountRef.current.removeChild(this.renderer.domElement);
    }
}

function App() {
    const mountRef = useRef();

    useEffect(() => {
        // Renderizador
        const mainRenderer = new MainRenderer(mountRef);

        return () => mainRenderer.dispose(mountRef);
    }, []);

    return <div ref={mountRef} />;
}

export default App;
