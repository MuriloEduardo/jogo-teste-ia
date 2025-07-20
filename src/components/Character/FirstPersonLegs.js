import * as THREE from "three";

export class FirstPersonLegs {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.isWalking = false;
        this.walkCycle = 0;
        this.walkSpeed = 0.15;

        this.createLegs();
    }

    createLegs() {
        // Grupo das pernas (posicionado relativamente à câmera)
        this.legsGroup = new THREE.Group();

        // Coxa esquerda
        const thighGeometry = new THREE.BoxGeometry(0.3, 0.7, 0.3);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });

        this.leftThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.leftThigh.position.set(-0.4, -1.2, 0.5);
        this.legsGroup.add(this.leftThigh);

        // Canela esquerda
        const shinGeometry = new THREE.BoxGeometry(0.25, 0.7, 0.25);
        this.leftShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.leftShin.position.set(-0.4, -1.8, 0.7);
        this.legsGroup.add(this.leftShin);

        // Pé esquerdo
        const footGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.6);
        const footMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
        this.leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.leftFoot.position.set(-0.4, -2.2, 0.9);
        this.legsGroup.add(this.leftFoot);

        // Coxa direita
        this.rightThigh = new THREE.Mesh(thighGeometry, legMaterial);
        this.rightThigh.position.set(0.4, -1.2, 0.5);
        this.legsGroup.add(this.rightThigh);

        // Canela direita
        this.rightShin = new THREE.Mesh(shinGeometry, legMaterial);
        this.rightShin.position.set(0.4, -1.8, 0.7);
        this.legsGroup.add(this.rightShin);

        // Pé direito
        this.rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        this.rightFoot.position.set(0.4, -2.2, 0.9);
        this.legsGroup.add(this.rightFoot);

        // Adicionar as pernas como filho da câmera para seguir sua posição
        this.camera.add(this.legsGroup);
    }

    updateWalkAnimation() {
        if (this.isWalking) {
            this.walkCycle += this.walkSpeed;

            const legSwing = Math.sin(this.walkCycle) * 0.4;
            const legLift = Math.abs(Math.sin(this.walkCycle)) * 0.15;

            // Animação mais pronunciada para primeira pessoa
            this.leftThigh.rotation.x = legSwing;
            this.leftShin.rotation.x = Math.max(0, legSwing * 0.8);
            this.leftFoot.position.y = -2.2 + legLift;

            this.rightThigh.rotation.x = -legSwing;
            this.rightShin.rotation.x = Math.max(0, -legSwing * 0.8);
            this.rightFoot.position.y = -2.2 + Math.abs(Math.sin(this.walkCycle + Math.PI)) * 0.15;

        } else {
            this.resetToIdlePose();
        }
    }

    resetToIdlePose() {
        const ease = 0.08;

        this.leftThigh.rotation.x *= (1 - ease);
        this.rightThigh.rotation.x *= (1 - ease);
        this.leftShin.rotation.x *= (1 - ease);
        this.rightShin.rotation.x *= (1 - ease);

        this.leftFoot.position.y = THREE.MathUtils.lerp(this.leftFoot.position.y, -2.2, ease);
        this.rightFoot.position.y = THREE.MathUtils.lerp(this.rightFoot.position.y, -2.2, ease);
    }

    setWalking(walking) {
        this.isWalking = walking;
    }

    setVisible(visible) {
        this.legsGroup.visible = visible;
    }

    dispose() {
        this.camera.remove(this.legsGroup);
        this.legsGroup.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}
