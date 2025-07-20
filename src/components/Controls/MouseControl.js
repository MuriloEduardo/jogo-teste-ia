export class MouseControl {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseLocked = false;
        this.mouseSensitivity = 0.002;

        this.rotationX = 0; // Rotação vertical (pitch)
        this.rotationY = 0; // Rotação horizontal (yaw)

        // Limites de rotação vertical (previne que o jogador vire de cabeça para baixo)
        this.maxPitch = Math.PI / 2 - 0.1; // ~89 graus
        this.minPitch = -Math.PI / 2 + 0.1; // ~-89 graus
    }

    // Inicializar controles de mouse
    init(domElement) {
        domElement.addEventListener('click', this.requestPointerLock.bind(this));

        // Eventos de pointer lock
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
        document.addEventListener('pointerlockerror', this.onPointerLockError.bind(this));

        // Eventos de movimento do mouse
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    requestPointerLock(event) {
        event.target.requestPointerLock();
    }

    onPointerLockChange() {
        this.isMouseLocked = document.pointerLockElement !== null;
    }

    onPointerLockError() {
        console.error('Pointer lock failed');
    }

    onMouseMove(event) {
        if (!this.isMouseLocked) return;

        // Atualizar rotação baseada no movimento do mouse
        this.rotationY -= event.movementX * this.mouseSensitivity;
        this.rotationX -= event.movementY * this.mouseSensitivity;

        // Limitar rotação vertical
        this.rotationX = Math.max(this.minPitch, Math.min(this.maxPitch, this.rotationX));
    }

    // Aplicar rotação à câmera
    applyRotation(camera) {
        camera.rotation.order = 'YXZ';
        camera.rotation.x = this.rotationX;
        camera.rotation.y = this.rotationY;
    }

    // Obter direção "forward" da câmera no plano horizontal (para movimento relativo à câmera)
    getForwardDirection() {
        const forward = {
            x: Math.sin(this.rotationY),
            z: Math.cos(this.rotationY)
        };
        // Normalizar
        const length = Math.sqrt(forward.x * forward.x + forward.z * forward.z);
        forward.x /= length;
        forward.z /= length;
        return forward;
    }

    // Obter direção "right" da câmera no plano horizontal
    getRightDirection() {
        const right = {
            x: Math.cos(this.rotationY),
            z: -Math.sin(this.rotationY)
        };
        // Normalizar
        const length = Math.sqrt(right.x * right.x + right.z * right.z);
        right.x /= length;
        right.z /= length;
        return right;
    }
}
