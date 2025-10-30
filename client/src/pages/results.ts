import { state } from '../state';
import { Router } from '@vaadin/router';

class ResultsPage extends HTMLElement {
    roomId: string | null = null;
    score: any = null;
    history: any = null;
    player1Name: string = "Tú";
    player2Name: string = "Oponente";

    connectedCallback() {
        const pathSegments = window.location.pathname.split('/');
        
        // La ruta es '/room/:roomId/results'
        // pathSegments será algo como ["", "room", "ABC123", "results"]
        
        // Buscamos el índice de 'room' y tomamos el siguiente segmento (el roomId)
        const roomIndex = pathSegments.indexOf('room'); 
        
        if (roomIndex !== -1 && pathSegments.length > roomIndex + 1) {
            this.roomId = pathSegments[roomIndex + 1];
        }
        
        if (!this.roomId) {
            // Cláusula de seguridad: si no encontramos el ID, redirigimos.
            console.error("Error: No se pudo extraer el Room ID de la URL. Redirigiendo a /");
            Router.go('/');
            return;
        }
        
        // Cargar los datos y suscribirse a los cambios
        this.getResultsData();
        
        state.subscribe((data) => {
            
            // 💡 NUEVA LÓGICA: Navegar de vuelta si el estado de la ronda ya no es "show results"
            // Esto se activa después de un reseteo exitoso o cuando el oponente fuerza un cambio.
            if (data.roundStatus !== "show results" && this.roomId) {
                Router.go('/room/'+this.roomId);
                return; // Detenemos la ejecución para evitar el renderizado de los resultados
            }
            
            // Lógica de actualización de resultados
            if (data.globalScore) {
                this.score = data.globalScore;
                this.history = data.history;
                this.player1Name = data.play.player1?.username || "Tú";
                this.player2Name = data.play.player2?.username || "Oponente";
                this.render();
            }
        });
        
        this.render(); // Render inicial (mientras carga la data)
    }

    async getResultsData() {
        if (this.roomId) {
            // Llama al nuevo método para cargar la metadata
            await state.getRoomMetadata(this.roomId);
        }
    }
    
    // Función para manejar la acción de jugar de nuevo
    handlePlayAgain = async() => {
        if(this.roomId){
            // 1. Llama a la API para resetear el estado de la sala
            await state.resetRoom(this.roomId);
            // 2. Navega de vuelta a la sala de juego
            Router.go('/room/'+this.roomId);
        }
    }

    render() {
        const currentState = state.getState();

        console.log(currentState)

        const roundResult = currentState.roundScore || 'incompleto'; // Resultado de la última ronda
        
        const style = document.createElement('style');
        style.textContent = `
            .results-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 50px;
                padding: 20px;
                text-align: center;
                min-height: 100vh;
                justify-content: space-between;
            }
            .score-title {
                font-size: 40px;
                font-weight: 700;
                color: #000;
                margin-bottom: 20px;
            }
            .score-board {
                width: 300px;
                max-width: 90%;
                padding: 20px;
                border: 10px solid #000;
                border-radius: 10px;
                background-color: #fff;
            }
            .score-item {
                display: flex;
                justify-content: space-between;
                font-size: 28px;
                font-weight: 500;
                margin: 10px 0;
            }
            .controls {
                margin-top: 50px;
            }
        `;

        // Obtener scores de manera segura
        const score1 = this.score ? this.score.player1 : 0;
        const score2 = this.score ? this.score.player2 : 0;

        this.innerHTML = `
            <div class="results-container">
                <div>
                    <star-result result="${roundResult}"></star-result>
                </div>
                
                <div class="score-board">
                    <h2 class="score-title">Score</h2>
                    <div class="score-item">
                        <span>${this.player1Name}</span>
                        <span>${score1}</span>
                    </div>
                    <div class="score-item">
                        <span>${this.player2Name}</span>
                        <span>${score2}</span>
                    </div>
                </div>

                <div class="controls">
                    <button-el class="play-again" text="¡Volver a jugar!"></button-el>
                </div>
            </div>
        `;

        this.appendChild(style);

        // Agregamos el listener para el botón
        const playAgainButton = this.querySelector('.play-again');
        playAgainButton?.addEventListener('click', this.handlePlayAgain);
    }
}

customElements.define('results-page', ResultsPage);