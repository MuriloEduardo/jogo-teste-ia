import * as THREE from "three";
import { useEffect, useRef } from "react";

function App() {
    const mountRef = useRef();

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 5);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Chão básico
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x228b22 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        renderer.render(scene, camera);

        return () => mountRef.current.removeChild(renderer.domElement);
    }, []);

    return <div ref={mountRef} />;
}

export default App;
