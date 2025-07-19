import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const App = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const playerRef = useRef(null);
    const keysRef = useRef({ w: false, a: false, s: false, d: false });

    useEffect(() => {
        // Configuração inicial do Three.js
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Salvar nas refs
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;

        // Criar um chão simples
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        // Criar algumas caixas como referência
        for (let i = 0; i < 10; i++) {
            const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
            const boxMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);

            box.position.x = (Math.random() - 0.5) * 50;
            box.position.y = 1;
            box.position.z = (Math.random() - 0.5) * 50;

            scene.add(box);
        }

        // Posição inicial da câmera (jogador)
        camera.position.set(0, 2, 5);
        playerRef.current = { x: 0, z: 5 };

        // Event listeners para teclado
        const handleKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW':
                    keysRef.current.w = true;
                    break;
                case 'KeyA':
                    keysRef.current.a = true;
                    break;
                case 'KeyS':
                    keysRef.current.s = true;
                    break;
                case 'KeyD':
                    keysRef.current.d = true;
                    break;
            }
        };

        const handleKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW':
                    keysRef.current.w = false;
                    break;
                case 'KeyA':
                    keysRef.current.a = false;
                    break;
                case 'KeyS':
                    keysRef.current.s = false;
                    break;
                case 'KeyD':
                    keysRef.current.d = false;
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Função de movimento
        const movePlayer = () => {
            const moveSpeed = 0.1;

            if (keysRef.current.w) {
                playerRef.current.z -= moveSpeed;
                camera.position.z -= moveSpeed;
            }
            if (keysRef.current.s) {
                playerRef.current.z += moveSpeed;
                camera.position.z += moveSpeed;
            }
            if (keysRef.current.a) {
                playerRef.current.x -= moveSpeed;
                camera.position.x -= moveSpeed;
            }
            if (keysRef.current.d) {
                playerRef.current.x += moveSpeed;
                camera.position.x += moveSpeed;
            }
        };

        // Loop de animação
        const animate = () => {
            requestAnimationFrame(animate);

            movePlayer();
            renderer.render(scene, camera);
        };

        animate();

        // Redimensionamento da janela
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);

            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }

            renderer.dispose();
        };
    }, []);

    return (
        <div>
            <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '10px',
                borderRadius: '5px'
            }}>
                Use WASD para se mover
            </div>
        </div>
    );
};

export default App;
