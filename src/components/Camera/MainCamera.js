import * as THREE from "three";

export class MainCamera {
    constructor() {
        // Câmera principal (primeira pessoa)
        this.firstPersonCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.firstPersonCamera.position.set(0, 2, 5);

        // Câmera de terceira pessoa
        this.thirdPersonCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Propriedades para terceira pessoa
        this.thirdPersonDistance = 8;
        this.thirdPersonHeight = 4;

        // Modo atual (true = primeira pessoa, false = terceira pessoa)
        this.isFirstPerson = true;
    }

    // Retorna a câmera ativa
    get activeCamera() {
        return this.isFirstPerson ? this.firstPersonCamera : this.thirdPersonCamera;
    }

    // Alterna entre primeira e terceira pessoa
    toggleCameraMode() {
        this.isFirstPerson = !this.isFirstPerson;
        return this.isFirstPerson;
    }

    // Atualiza posição da câmera de terceira pessoa
    updateThirdPersonCamera() {
        if (!this.isFirstPerson) {
            // Calcular posição atrás e ligeiramente à direita da câmera de primeira pessoa
            const direction = new THREE.Vector3(0, 0, 1);
            direction.applyQuaternion(this.firstPersonCamera.quaternion);

            // Calcular posição lateral (ligeiramente à direita)
            const rightDirection = new THREE.Vector3(1, 0, 0);
            rightDirection.applyQuaternion(this.firstPersonCamera.quaternion);

            // Posicionar câmera atrás, acima e ligeiramente à direita
            this.thirdPersonCamera.position.copy(this.firstPersonCamera.position);
            this.thirdPersonCamera.position.add(direction.multiplyScalar(-this.thirdPersonDistance));
            this.thirdPersonCamera.position.add(rightDirection.multiplyScalar(2)); // Offset lateral
            this.thirdPersonCamera.position.y += this.thirdPersonHeight;

            // Limitar altura mínima da câmera (não pode ir abaixo de 1.5 unidades do chão)
            this.thirdPersonCamera.position.y = Math.max(this.thirdPersonCamera.position.y, 1.5);

            // Fazer a câmera olhar para a câmera de primeira pessoa (centro do personagem)
            const lookAtTarget = this.firstPersonCamera.position.clone();
            lookAtTarget.y += 1; // Olhar ligeiramente acima dos pés
            this.thirdPersonCamera.lookAt(lookAtTarget);
        }
    }
}
