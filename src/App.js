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
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(this.renderer.domElement);
    }
    dispose(mountRef) {
        mountRef.current.removeChild(this.renderer.domElement);
    }
}

function App() {
    const mountRef = useRef();

    useEffect(() => {
        // Cena
        const scene = new THREE.Scene();
        // Câmera
        const mainCamera = new MainCamera();
        // Renderizador
        const mainRenderer = new MainRenderer(mountRef);
        // Chão
        const floor = new Floor();
        scene.add(floor.mesh);

        // Renderizar
        mainRenderer.renderer.render(scene, mainCamera.camera);

        return () => mainRenderer.dispose(mountRef);
    }, []);

    return <div ref={mountRef} />;
}

export default App;
