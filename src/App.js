import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const App = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const playerRef = useRef(null);
    const keysRef = useRef({ w: false, a: false, s: false, d: false });
    const mouseRef = useRef({ x: 0, y: 0, sensitivity: 0.002 });
    const bulletsRef = useRef([]);
    const targetsRef = useRef([]);
    const raycasterRef = useRef(new THREE.Raycaster());

    const [score, setScore] = useState(0);
    const [isPointerLocked, setIsPointerLocked] = useState(false);

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

        // Criar algumas caixas como referência e alvos
        for (let i = 0; i < 10; i++) {
            const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
            const isTarget = i < 5; // Primeiras 5 caixas são alvos
            const boxMaterial = new THREE.MeshBasicMaterial({
                color: isTarget ? 0xff0000 : Math.random() * 0xffffff
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);

            box.position.x = (Math.random() - 0.5) * 50;
            box.position.y = 1;
            box.position.z = (Math.random() - 0.5) * 50;

            box.userData = { isTarget, originalColor: box.material.color.getHex() };

            scene.add(box);

            if (isTarget) {
                targetsRef.current.push(box);
            }
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

        // Pointer Lock API para controle do mouse
        const handlePointerLockChange = () => {
            setIsPointerLocked(document.pointerLockElement === renderer.domElement);
        };

        const handleMouseMove = (event) => {
            if (document.pointerLockElement === renderer.domElement) {
                const movementX = event.movementX || 0;
                const movementY = event.movementY || 0;

                // Rotação horizontal (eixo Y)
                camera.rotation.y -= movementX * mouseRef.current.sensitivity;

                // Rotação vertical (eixo X) com limites
                camera.rotation.x -= movementY * mouseRef.current.sensitivity;
                camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
            }
        };

        const handleClick = () => {
            if (document.pointerLockElement === renderer.domElement) {
                shoot();
            } else {
                // Solicitar pointer lock
                renderer.domElement.requestPointerLock();
            }
        };

        document.addEventListener('pointerlockchange', handlePointerLockChange);
        document.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('click', handleClick);

        // Função de tiro
        const shoot = () => {
            // Criar bala
            const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

            // Posicionar bala na frente da câmera
            bullet.position.copy(camera.position);

            // Direção do tiro baseada na rotação da câmera
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);

            bullet.userData = {
                velocity: direction.clone().multiplyScalar(50), // velocidade da bala
                life: 3.0 // tempo de vida em segundos
            };

            scene.add(bullet);
            bulletsRef.current.push(bullet);
        };

        // Função de movimento
        const movePlayer = () => {
            const moveSpeed = 0.1;
            const moveVector = new THREE.Vector3();

            if (keysRef.current.w) moveVector.z -= moveSpeed;
            if (keysRef.current.s) moveVector.z += moveSpeed;
            if (keysRef.current.a) moveVector.x -= moveSpeed;
            if (keysRef.current.d) moveVector.x += moveSpeed;

            // Aplicar movimento baseado na rotação da câmera
            moveVector.applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
            camera.position.add(moveVector);

            // Atualizar posição do jogador
            playerRef.current.x = camera.position.x;
            playerRef.current.z = camera.position.z;
        };

        // Função para atualizar balas
        const updateBullets = (deltaTime) => {
            for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
                const bullet = bulletsRef.current[i];
                const bulletData = bullet.userData;

                // Mover bala
                const moveDistance = bulletData.velocity.clone().multiplyScalar(deltaTime);
                bullet.position.add(moveDistance);

                // Reduzir tempo de vida
                bulletData.life -= deltaTime;

                // Verificar colisões com alvos
                raycasterRef.current.set(bullet.position, bulletData.velocity.normalize());
                const intersections = raycasterRef.current.intersectObjects(targetsRef.current);

                if (intersections.length > 0 && intersections[0].distance < 1) {
                    const hitTarget = intersections[0].object;
                    if (hitTarget.userData.isTarget) {
                        // Acertou um alvo
                        setScore(prev => prev + 10);

                        // Efeito visual no alvo
                        hitTarget.material.color.setHex(0x00ff00);
                        setTimeout(() => {
                            hitTarget.material.color.setHex(hitTarget.userData.originalColor);
                        }, 200);
                    }

                    // Remover bala
                    scene.remove(bullet);
                    bulletsRef.current.splice(i, 1);
                } else if (bulletData.life <= 0) {
                    // Remover bala quando acabar o tempo
                    scene.remove(bullet);
                    bulletsRef.current.splice(i, 1);
                }
            }
        };

        // Loop de animação
        let lastTime = 0;
        const animate = (time) => {
            requestAnimationFrame(animate);

            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            movePlayer();
            updateBullets(deltaTime);
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
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);

            if (renderer.domElement) {
                renderer.domElement.removeEventListener('click', handleClick);
            }

            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }

            // Limpar balas
            bulletsRef.current.forEach(bullet => scene.remove(bullet));
            bulletsRef.current.length = 0;
            targetsRef.current.length = 0;

            renderer.dispose();
        };
    }, []);

    return (
        <div>
            <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />

            {/* HUD - Pontuação */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                fontSize: '24px',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '10px',
                borderRadius: '5px'
            }}>
                Pontuação: {score}
            </div>

            {/* Instruções */}
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
                <div>WASD - Mover</div>
                <div>Mouse - Olhar</div>
                <div>Click - Atirar</div>
                <div>Alvos vermelhos = +10 pontos</div>
                {!isPointerLocked && <div style={{ color: 'yellow' }}>Clique para capturar o mouse</div>}
            </div>

            {/* Mira */}
            {isPointerLocked && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '20px',
                    height: '20px',
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: '20px',
                        height: '2px',
                        backgroundColor: 'white',
                        top: '9px'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        width: '2px',
                        height: '20px',
                        backgroundColor: 'white',
                        left: '9px'
                    }}></div>
                </div>
            )}
        </div>
    );
};

export default App;
