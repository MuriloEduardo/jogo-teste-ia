import * as THREE from "three";
import { useEffect, useRef } from "react";

function App() {
    const mountRef = useRef();

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera();
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth, window.innerHeight);

        mountRef.current.appendChild(renderer.domElement);

        renderer.render(scene, camera); // Nenhum objeto, só o fundo

        return () => mountRef.current.removeChild(renderer.domElement);
    }, []);

    return <div ref={mountRef} />;
}

export default App;
