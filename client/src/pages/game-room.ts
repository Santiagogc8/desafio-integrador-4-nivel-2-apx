import { state } from "../state";
import { Router } from "@vaadin/router";

class GameRoom extends HTMLElement{
    shadow: ShadowRoot;
    private unsubscribe!: () => void;
    constructor(){
        super();
        this.shadow = this.attachShadow({"mode": "open"});
    }

    connectedCallback(){
        // 1. INICIAMOS el listener de la RTDB (Solo una vez)
        // Esto empieza el flujo de datos: RTDB -> state.setState()
        state.getRoomInfo(window.location.href.slice(-6)); 
        
        // 2. Suscribimos el componente al State Manager
        // Esto le dice al state: "Cada vez que cambies, llama a this.render()"
        this.unsubscribe = state.subscribe(() => {
            this.render(); // re-renderización
        });

        // El componente se dibuja la primera vez
        this.render();
    }

    disconnectedCallback() {
        // Al salir del DOM, cancelamos la suscripción para evitar escapes de memoria
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    handleReadyClick = () => {
        const roomId = window.location.href.slice(-6);
        state.setPlayerReady(true, roomId);
    }

    async render(){
        const currentState = state.getState();

        const roundStatus = currentState.roundStatus === "waiting player 2" ? "Esperando a player 2...": "Esperando a confirmacion";
        const thisUser = currentState.play.player1?.username;
        const otherUser = currentState.play.player2?.username || "Esperando...";

        if(!thisUser){
            Router.go('/');
        }

        const container = document.createElement('div');
        container.classList.add('welcome__container');

        if(currentState.roundScore){
            const player1Choice = currentState.play.player1?.choice;
            const player2Choice = currentState.play.player2?.choice;

            container.innerHTML = `
                <selection-el image="${player1Choice}"></selection-el>
                <selection-el image="${player2Choice}"></selection-el>

                <div>
                    <star-result score="${currentState.roundScore}"></star-result>
                    <div class="history">
                        <p>${thisUser}: 0</p>
                        <p>${otherUser}: 0</p>
                    </div>
                    <button id="new-round">Nueva ronda</button>
                </div>
            `

            container.querySelector('#new-round')?.addEventListener('click', ()=>{
                state.setState({roundScore: null})
            });

        } else {
            if(currentState.play.player1?.isReady && currentState.play.player2?.isReady){
            container.innerHTML = `
                <counter-el count="3"></counter-el>
                <div class='selection__container'>
                    <selection-el image="tijeras"></selection-el>
                    <selection-el image="piedra"></selection-el>
                    <selection-el image="papel"></selection-el>
                </div>
            `

            const allSelections = container.querySelectorAll("selection-el");

            let lastSelectedMove = "";

            const handleSelection = (e: any) => {
                const selectedMove = e.detail.selection; // Obtenemos el detail.selection

                allSelections.forEach((element) => { // Por cada elemento de allSelections
                    const image = element.shadowRoot?.querySelector("img"); // Obtenemos el shadow y la imagen

                    if (!image) return; // Si la imagen no es true, se termina la funcion
                    image.style.transform = "scale(1)"; // Le damos estilos a todas las imagenes
                    image.style.opacity = "0.5";

                    if (element.getAttribute("image") === selectedMove) { // Y a la imagen seleccionada le hacemos un estilo diferente
                        image.style.transform = "scale(1.5)";
                        image.style.opacity = "1";
                    }
                });

                lastSelectedMove = selectedMove; // Establecemos el lastSelectedMove con el valor de selectedMove
            };

            container.addEventListener("selection-info", handleSelection); // Ejecutamos la funcion handleSelection en el evento selection-info

            // Solo al terminar el contador se registra la jugada y se elimina el listener
            container.querySelector('counter-el')?.addEventListener("counter-finished", () => {
                state.sendPlay(window.location.href.slice(-6), lastSelectedMove);
                container.removeEventListener("selection-info", handleSelection); // Y removemos el eventListener
            });

        } else {
            container.innerHTML = `
                <h2>${roundStatus}</h2>
                <div class="room-info">
                    <div>
                        <p id="this-player">${thisUser}</p>
                        <p id="other-player">${otherUser}</p>
                    </div>
                    <p id="roomId">${window.location.href.slice(-6)}</p>
                </div>
                <button-el class="new">Estoy listo</button-el>
                <div class='selection__container'>
                    <selection-el image="tijeras"></selection-el>
                    <selection-el image="piedra"></selection-el>
                    <selection-el image="papel"></selection-el>
                </div>
            `

            if(otherUser !== "Esperando..."){
                const buttonEl = container.querySelector('button-el') as HTMLElement;
                buttonEl!.style.display = 'inherit';
                
                buttonEl.addEventListener('click', this.handleReadyClick);
            }
        }
        }

        const style = document.createElement('style')

        style.innerHTML = `
            .welcome__container{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                min-width: 322px;
                max-width: 336px;
                margin: 0 auto;
                position: relative;
                padding-bottom: 20px;
                font-family: "Cabin", sans-serif;
            }

            .room-info{
                position: absolute;
                top: 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
            }

            h2{
                color: #009048;
                font-size: min(10vw, 40px);
                width: 284px;
                margin: 0;
                margin-bottom: 26px;
            }

            button-el{
                width: 100%;
                display: none;
            }

            .selection__container{
                position: absolute;
                bottom: -30px;
                display: flex;
                gap: clamp(46px, 8vw, 65px);
                z-index: 2;
            }

            selection-el{
                width: clamp(57px, 7vw, 80px);
            }

            selection-el:last-child{
                width: clamp(68px, 8.5vw, 97px);;
            }
        `

        this.shadow.innerHTML = ''; // Limpiar el shadow DOM antes de redibujar
        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('game-room', GameRoom)