import { state } from "../state";

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
        state.getRoomInfo("jYh0JiOoVWct4qTKsImJO"); 
        
        // 2. SUSCRIBIMOS el componente al State Manager
        // Esto le dice al state: "Cada vez que cambies, llama a this.render()"
        this.unsubscribe = state.subscribe(() => {
            this.render(); // 👈 ¡La clave de la re-renderización!
        });

        // 3. Renderizado inicial (el componente se dibuja la primera vez)
        this.render();
    }

    disconnectedCallback() {
        // LIMPIEZA: Al salir del DOM, cancelamos la suscripción para evitar memory leaks
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    async render(){
        const currentState = state.getState();

        const roundStatus = currentState.roundStatus === "waiting player 2" ? "Esperando a player 2...": "Esperando a confirmacion";
        const thisUser = currentState.play.player1?.username;
        const otherUser = currentState.play.player2?.username || "Esperando...";

        const container = document.createElement('div');
        container.classList.add('welcome__container');

        container.innerHTML = `
            <h2>${roundStatus}</h2>
            <div class="room-info">
                <div>
                    <p id="this-player">${thisUser}</p>
                    <p id="other-player">${otherUser}</p>
                </div>
                <p id="roomId">${window.location.href.slice(-6)}</p>
            </div>
            <button-el class="new">Room nueva</button-el>
            <div class='selection__container'>
                <selection-el image="tijeras"></selection-el>
                <selection-el image="piedra"></selection-el>
                <selection-el image="papel"></selection-el>
            </div>
        `

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

        this.shadow.innerHTML = ''; // 💡 Limpiar el shadow DOM antes de redibujar
        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('game-room', GameRoom)