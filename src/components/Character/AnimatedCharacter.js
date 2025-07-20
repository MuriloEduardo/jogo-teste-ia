import * as THREE from "three";

export class AnimatedCharacter {
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
        this.leftEye.position.set(-0.15, 0.1, 0.31);
        this.faceGroup.add(this.leftEye);

        // Olho direito
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(0.15, 0.1, 0.31);
        this.faceGroup.add(this.rightEye);

        // Pupilas (brancas para contraste)
        const pupilGeometry = new THREE.SphereGeometry(0.04, 6, 4);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        this.leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.leftPupil.position.set(-0.15, 0.1, 0.35);
        this.faceGroup.add(this.leftPupil);

        this.rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.rightPupil.position.set(0.15, 0.1, 0.35);
        this.faceGroup.add(this.rightPupil);

        // Nariz
        const noseGeometry = new THREE.ConeGeometry(0.05, 0.15, 6);
        const noseMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
        this.nose = new THREE.Mesh(noseGeometry, noseMaterial);
        this.nose.position.set(0, -0.05, 0.31);
        this.nose.rotation.x = Math.PI / 2;
        this.faceGroup.add(this.nose);

        // Boca
        const mouthGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05);
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        this.mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        this.mouth.position.set(0, -0.2, 0.31);
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
            this.blinkDuration = 0.15;
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
                this.nextBlinkTime = Math.random() * 4 + 1.5;
            }
        }
    }

    createArms() {
        // Braço esquerdo
        const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        const armMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });

        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.65, 0.6 + 1.8, 0);
        this.characterGroup.add(this.leftArm);

        // Braço direito
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.65, 0.6 + 1.8, 0);
        this.characterGroup.add(this.rightArm);
    }

    createLegs() {
        // Coxa esquerda
        const thighGeometry = new THREE.BoxGeometry(0.35, 0.8, 0.35);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

        this.leftThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.leftThigh.position.set(-0.3, -0.4 + 1.8, 0);
        this.characterGroup.add(this.leftThigh);

        // Canela esquerda
        const shinGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        this.leftShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.leftShin.position.set(-0.3, -1.2 + 1.8, 0);
        this.characterGroup.add(this.leftShin);

        // Pé esquerdo
        const footGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
        const footMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
        this.leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.leftFoot.position.set(-0.3, -1.7 + 1.8, 0.2);
        this.characterGroup.add(this.leftFoot);

        // Coxa direita
        this.rightThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.rightThigh.position.set(0.3, -0.4 + 1.8, 0);
        this.characterGroup.add(this.rightThigh);

        // Canela direita
        this.rightShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.rightShin.position.set(0.3, -1.2 + 1.8, 0);
        this.characterGroup.add(this.rightShin);

        // Pé direito
        this.rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.rightFoot.position.set(0.3, -1.7 + 1.8, 0.2);
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
            this.leftFoot.position.y = (-1.7 + 1.8) + legLift;

            // Perna direita (oposta)
            this.rightThigh.rotation.x = -legSwing;
            this.rightShin.rotation.x = Math.max(0, -legSwing * 0.5);
            this.rightFoot.position.y = (-1.7 + 1.8) + Math.abs(Math.sin(this.walkCycle + Math.PI)) * 0.1;

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
        this.leftFoot.position.y = THREE.MathUtils.lerp(this.leftFoot.position.y, -1.7 + 1.8, ease);
        this.rightFoot.position.y = THREE.MathUtils.lerp(this.rightFoot.position.y, -1.7 + 1.8, ease);
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
