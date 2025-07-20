export class MultiplayerHUD {
    constructor() {
        this.statusElement = null;
        this.scoreBoardElement = null;
        this.isScoreBoardVisible = false;
        this.createHUD();
        this.setupEventListeners();
    }

    createHUD() {
        // Status de conexão
        this.statusElement = document.createElement('div');
        this.statusElement.id = 'multiplayer-status';
        this.statusElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
            border-left: 4px solid #00ff00;
        `;

        // ScoreBoard
        this.createScoreBoard();
        
        document.body.appendChild(this.statusElement);
    }

    createScoreBoard() {
        this.scoreBoardElement = document.createElement('div');
        this.scoreBoardElement.id = 'scoreboard';
        this.scoreBoardElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            z-index: 2000;
            pointer-events: none;
            display: none;
            max-width: 500px;
            min-width: 400px;
        `;

        document.body.appendChild(this.scoreBoardElement);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                this.toggleScoreBoard();
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                this.hideScoreBoard();
            }
        });
    }

    updateConnectionStatus(multiplayerClient) {
        if (!multiplayerClient) {
            this.statusElement.innerHTML = `
                <div>🔴 OFFLINE</div>
                <div style="font-size: 12px; opacity: 0.8;">Modo Single Player</div>
            `;
            this.statusElement.style.borderLeftColor = '#ff4444';
            return;
        }

        const connected = multiplayerClient.isConnected();
        const playerCount = multiplayerClient.getConnectedPlayersCount();

        if (connected) {
            this.statusElement.innerHTML = `
                <div>🟢 ONLINE</div>
                <div style="font-size: 12px; opacity: 0.8;">
                    ${playerCount} jogador${playerCount !== 1 ? 'es' : ''} conectado${playerCount !== 1 ? 's' : ''}
                </div>
            `;
            this.statusElement.style.borderLeftColor = '#00ff00';
        } else {
            this.statusElement.innerHTML = `
                <div>🟡 CONECTANDO...</div>
                <div style="font-size: 12px; opacity: 0.8;">Aguarde...</div>
            `;
            this.statusElement.style.borderLeftColor = '#ffaa00';
        }
    }

    updateScoreBoard(multiplayerClient) {
        if (!multiplayerClient || !multiplayerClient.isConnected()) {
            this.scoreBoardElement.innerHTML = `
                <div style="text-align: center;">
                    <h2>🔴 OFFLINE</h2>
                    <p>Não conectado ao servidor multiplayer</p>
                </div>
            `;
            return;
        }

        // Obter dados dos jogadores
        const players = Array.from(multiplayerClient.remotePlayers.values());
        
        // Adicionar jogador local (simulado)
        const localPlayer = {
            id: multiplayerClient.playerId,
            data: {
                name: 'Você',
                kills: 0, // Seria obtido do servidor em implementação completa
                deaths: 0,
                health: 100
            }
        };
        
        const allPlayers = [localPlayer, ...players];
        
        // Ordenar por kills
        allPlayers.sort((a, b) => (b.data.kills || 0) - (a.data.kills || 0));

        let scoreboardHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2>🏆 PLACAR</h2>
                <p style="opacity: 0.8;">${allPlayers.length} Jogadores Online</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #444; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold;">
                <span>Jogador</span>
                <span>K/D</span>
                <span>Status</span>
            </div>
        `;

        allPlayers.forEach((player, index) => {
            const isYou = player.id === multiplayerClient.playerId;
            const name = isYou ? '🎯 ' + player.data.name : player.data.name;
            const kills = player.data.kills || 0;
            const deaths = player.data.deaths || 0;
            const health = player.data.health || 100;
            const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toString();
            
            let statusIcon = '💚';
            let statusColor = '#00ff00';
            
            if (health <= 0) {
                statusIcon = '💀';
                statusColor = '#ff4444';
            } else if (health < 50) {
                statusIcon = '🟡';
                statusColor = '#ffaa00';
            }

            const backgroundColor = isYou ? 'rgba(0, 100, 255, 0.2)' : 'transparent';
            const position = index + 1;

            scoreboardHTML += `
                <div style="display: flex; justify-content: space-between; padding: 8px; background: ${backgroundColor}; border-radius: 3px; margin-bottom: 5px;">
                    <span style="min-width: 200px;">
                        <span style="color: #888;">#${position}</span> ${name}
                    </span>
                    <span style="min-width: 60px; text-align: center;">
                        ${kills}/${deaths} (${kd})
                    </span>
                    <span style="color: ${statusColor}; min-width: 40px; text-align: center;">
                        ${statusIcon}
                    </span>
                </div>
            `;
        });

        scoreboardHTML += `
            <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #444; opacity: 0.6; font-size: 12px;">
                Segure [TAB] para ver o placar
            </div>
        `;

        this.scoreBoardElement.innerHTML = scoreboardHTML;
    }

    toggleScoreBoard() {
        this.isScoreBoardVisible = !this.isScoreBoardVisible;
        this.scoreBoardElement.style.display = this.isScoreBoardVisible ? 'block' : 'none';
    }

    showScoreBoard() {
        this.isScoreBoardVisible = true;
        this.scoreBoardElement.style.display = 'block';
    }

    hideScoreBoard() {
        this.isScoreBoardVisible = false;
        this.scoreBoardElement.style.display = 'none';
    }

    showKillFeed(killerName, victimName, isYourKill = false) {
        const killFeed = document.createElement('div');
        killFeed.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1500;
            border-left: 4px solid ${isYourKill ? '#00ff00' : '#ff4444'};
            animation: slideInRight 0.5s ease-out;
        `;

        const icon = isYourKill ? '🎯' : '💀';
        killFeed.innerHTML = `${icon} ${killerName} ➤ ${victimName}`;

        document.body.appendChild(killFeed);

        // Remover após animação
        setTimeout(() => {
            killFeed.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (document.body.contains(killFeed)) {
                    document.body.removeChild(killFeed);
                }
            }, 500);
        }, 3000);
    }

    showConnectionMessage(message, type = 'info') {
        const notification = document.createElement('div');
        let bgColor = 'rgba(0, 100, 255, 0.9)';
        let icon = 'ℹ️';

        switch(type) {
            case 'success':
                bgColor = 'rgba(0, 200, 0, 0.9)';
                icon = '✅';
                break;
            case 'error':
                bgColor = 'rgba(200, 0, 0, 0.9)';
                icon = '❌';
                break;
            case 'warning':
                bgColor = 'rgba(255, 165, 0, 0.9)';
                icon = '⚠️';
                break;
        }

        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${bgColor};
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 18px;
            font-weight: bold;
            z-index: 2500;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        notification.innerHTML = `${icon} ${message}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s, transform 0.5s';
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 2500);
    }

    update(multiplayerClient) {
        this.updateConnectionStatus(multiplayerClient);
        
        if (this.isScoreBoardVisible) {
            this.updateScoreBoard(multiplayerClient);
        }
    }

    dispose() {
        if (this.statusElement) {
            document.body.removeChild(this.statusElement);
            this.statusElement = null;
        }

        if (this.scoreBoardElement) {
            document.body.removeChild(this.scoreBoardElement);
            this.scoreBoardElement = null;
        }

        // Remover event listeners seria ideal aqui
    }
}

// CSS adicional para animações
const multiplayerStyle = document.createElement('style');
multiplayerStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(multiplayerStyle);
