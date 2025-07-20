export class DebugOverlay {
    constructor() {
        this.debugElement = null;
        this.visible = false;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        this.createOverlay();
    }

    createOverlay() {
        this.debugElement = document.createElement('div');
        this.debugElement.id = 'debug-overlay';
        this.debugElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            z-index: 1000;
            pointer-events: none;
            display: none;
            white-space: pre-wrap;
        `;
        document.body.appendChild(this.debugElement);
    }

    toggle() {
        this.visible = !this.visible;
        this.debugElement.style.display = this.visible ? 'block' : 'none';
        return this.visible;
    }

    update(gameData) {
        if (!this.visible) return;

        // Calcular FPS
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        // Atualizar informações de debug
        const debugInfo = this.formatDebugInfo(gameData);
        this.debugElement.textContent = debugInfo;
    }

    formatDebugInfo(data) {
        const {
            position,
            cameraMode,
            velocity,
            isMoving,
            rotation,
            chunks,
            memoryInfo,
            weaponInfo
        } = data;

        let weaponDebug = '';
        if (weaponInfo) {
            weaponDebug = `

WEAPON:
Ammo: ${weaponInfo.ammo}/${weaponInfo.totalAmmo}
Status: ${weaponInfo.isReloading ? 'Reloading...' : 'Ready'}`;
        }

        return `=== DEBUG INFO ===
FPS: ${this.fps}

PLAYER:
Position: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}
Velocity: ${velocity.x.toFixed(2)}, ${velocity.z.toFixed(2)}
Moving: ${isMoving ? 'Yes' : 'No'}
Rotation: ${rotation.toFixed(2)}°

CAMERA:
Mode: ${cameraMode}${weaponDebug}

WORLD:
Active Chunks: ${chunks}

PERFORMANCE:
Memory: ${memoryInfo}MB
Renderer: WebGL

CONTROLS:
[F1] Toggle Debug
[C] Toggle Camera
[WASD] Move
[Mouse] Look Around
[Click] Fire Weapon
[R] Reload`;
    }

    dispose() {
        if (this.debugElement) {
            document.body.removeChild(this.debugElement);
            this.debugElement = null;
        }
    }
}
