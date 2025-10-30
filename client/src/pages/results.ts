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

        const backgroundColors: { [key: string]: string } = {
            // Establecemos un mapa con los colores de fondo por cada valor
            ganaste: "var(--win-bg)",
            perdiste: "var(--loose-bg)",
            empate: "var(--draw-bg)",
        };
        
        const style = document.createElement('style');
        style.textContent = `
            .other-player{
                position: absolute;
                top: -20px;
                width: 300px;
                height: 400px;
                left: 50%;
                transform: translateX(-50%) rotate(180deg);
            }

            .this-player{
                position: absolute;
                bottom: -20px;
                width: 300px;
                height: 400px;
                left: 50%;
                transform: translateX(-50%);
            }

            .result__fallback{
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 40px;
            }

            button-el{
                width: 340px;
            }

            h4{
                text-align: center;
                font-size: 40px;
            }

            .results-container{
                background-color: ${backgroundColors[roundResult] || "var(--draw-bg)"};
                position: absolute;
                inset: 0;
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 20px;
                font-family: "Cabin", sans-serif;
            }

            .score-board{
                width: 100%;
                max-width: 326px;
                background-color: white;
                border: 10px solid black;
                border-radius: 10px;
                padding: 20px;
            }

            .score-item{
                margin: 20px;
                margin-left: 0;
                display: flex;
                justify-content: space-around;
            }

            .score-title{
                font-size: 40px;
                text-align: center;
            }

            .score-board span{
                font-size: 30px;
                text-align: end;
            }

            .play-again{
                width: 100%;
                max-width: 326px;
                height: 87px;
                border: 10px solid var(--dark-btn-blue);
                border-radius: 10px;
                color: var(--light-btn-font);
                background-color: var(--light-btn-blue);
                font-family: "Cabin", sans-serif;
                font-size: 30px;
            }

            .play-again:hover{
                cursor: pointer;
            }
        `;

        // Obtener scores de manera segura
        const score1 = this.score ? this.score.player1 : 0;
        const score2 = this.score ? this.score.player2 : 0;

        if(currentState.play.player1!.restartRequested){
            this.innerHTML = `
                <div class="results-container" style="display: flex;">
                    <h2>Esperando al otro jugador</h2>
                </div>
            `
            this.appendChild(style);
            return
        }

        if(!currentState.play.player1!.restartRequested && currentState.localMessage === "Esperando reinicio del otro jugador"){
            this.innerHTML = `
                <div class="results-container" style="display: flex;">
                    <h2>El otro jugador esta listo!</h2>
                    <button class="play-again">¡Volver a jugar!</button>
                </div>
            `
            this.appendChild(style);

            const playAgainButton = this.querySelector('.play-again');
            playAgainButton?.addEventListener('click', this.handlePlayAgain);

            return
        }

        this.innerHTML = `
                <selection-el class="this-player" image=${currentState.play.player1?.choice}></selection-el>
                <selection-el class="other-player" image=${currentState.play.player2?.choice}></selection-el>

                <div class="results-container">
                    <div>
                        <star-result score="${roundResult}"></star-result>
                    </div>
                    
                    <div class="score-board">
                        <h2 class="score-title">Score</h2>
                        <div class="score-item">
                            <span>${this.player1Name}:   </span>
                            <span>${score1}</span>
                        </div>
                        <div class="score-item">
                            <span>${this.player2Name}:   </span>
                            <span>${score2}</span>
                        </div>
                    </div>

                    <button class="play-again">¡Volver a jugar!</button>
                </div>
            `;

            setTimeout(() => { // Establecemos un timeout de 2 segundos
                const result = this.querySelector(".results-container") as HTMLElement; // Seleccionamos el .result
                result!.style.display = "flex"; // Y le cambiamos el style a flex
            }, 2000);


            this.appendChild(style);

            // Agregamos el listener para el botón
            const playAgainButton = this.querySelector('.play-again');
            playAgainButton?.addEventListener('click', this.handlePlayAgain);
    }
}

customElements.define('results-page', ResultsPage);