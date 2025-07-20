export class WeaponHUD {
    constructor() {
        this.hudElement = null;
        this.createHUD();
    }

    createHUD() {
        this.hudElement = document.createElement('div');
        this.hudElement.id = 'weapon-hud';
        this.hudElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: 'Arial', sans-serif;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            pointer-events: none;
            border: 2px solid #444;
            min-width: 120px;
            text-align: center;
        `;

        // Criar crosshair
        this.createCrosshair();

        document.body.appendChild(this.hudElement);
    }

    createCrosshair() {
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            z-index: 1000;
            pointer-events: none;
        `;

        // Crosshair horizontal
        const horizontal = document.createElement('div');
        horizontal.style.cssText = `
            position: absolute;
            top: 50%;
            left: 20%;
            width: 60%;
            height: 2px;
            background: rgba(255, 255, 255, 0.8);
            margin-top: -1px;
        `;

        // Crosshair vertical
        const vertical = document.createElement('div');
        vertical.style.cssText = `
            position: absolute;
            left: 50%;
            top: 20%;
            width: 2px;
            height: 60%;
            background: rgba(255, 255, 255, 0.8);
            margin-left: -1px;
        `;

        // Ponto central
        const center = document.createElement('div');
        center.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 2px;
            height: 2px;
            background: rgba(255, 0, 0, 0.9);
            margin: -1px 0 0 -1px;
        `;

        crosshair.appendChild(horizontal);
        crosshair.appendChild(vertical);
        crosshair.appendChild(center);

        document.body.appendChild(crosshair);
    }

    update(weaponInfo) {
        if (!weaponInfo) return;

        let statusColor = '#ffffff';
        let statusText = '';

        if (weaponInfo.isReloading) {
            statusColor = '#ffaa00';
            statusText = '<div style="color: #ffaa00; font-size: 14px; margin-top: 5px;">RECARREGANDO...</div>';
        } else if (weaponInfo.ammo === 0) {
            statusColor = '#ff4444';
            statusText = '<div style="color: #ff4444; font-size: 14px; margin-top: 5px;">SEM MUNIÇÃO</div>';
        }

        this.hudElement.innerHTML = `
            <div style="color: ${statusColor}">
                MUNIÇÃO
            </div>
            <div style="font-size: 24px; margin: 5px 0;">
                ${weaponInfo.ammo} / ${weaponInfo.totalAmmo}
            </div>
            ${statusText}
        `;

        // Animação de baixa munição
        if (weaponInfo.ammo <= 5 && weaponInfo.ammo > 0 && !weaponInfo.isReloading) {
            this.hudElement.style.animation = 'pulse 1s infinite';
            this.hudElement.style.borderColor = '#ff4444';
        } else {
            this.hudElement.style.animation = 'none';
            this.hudElement.style.borderColor = '#444';
        }
    }

    showHitMarker() {
        const hitMarker = document.createElement('div');
        hitMarker.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 30px;
            height: 30px;
            margin: -15px 0 0 -15px;
            z-index: 1001;
            pointer-events: none;
            opacity: 1;
        `;

        // X do hit marker
        const line1 = document.createElement('div');
        line1.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 3px;
            background: #ff0000;
            transform: rotate(45deg);
            margin-top: -1.5px;
        `;

        const line2 = document.createElement('div');
        line2.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 3px;
            background: #ff0000;
            transform: rotate(-45deg);
            margin-top: -1.5px;
        `;

        hitMarker.appendChild(line1);
        hitMarker.appendChild(line2);
        document.body.appendChild(hitMarker);

        // Animar fade out
        setTimeout(() => {
            hitMarker.style.transition = 'opacity 0.5s';
            hitMarker.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(hitMarker);
            }, 500);
        }, 100);
    }

    dispose() {
        if (this.hudElement) {
            document.body.removeChild(this.hudElement);
            this.hudElement = null;
        }

        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            document.body.removeChild(crosshair);
        }
    }
}

// Adicionar CSS para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);
