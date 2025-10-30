import { state } from "../state";
import { Router } from "@vaadin/router";

class GameRoom extends HTMLElement{
    shadow: ShadowRoot;
    private unsubscribe!: () => void;
    private playSent: boolean = false;
    
    constructor(){
        super();
        this.shadow = this.attachShadow({"mode": "open"});
    }

    connectedCallback(){
        // 1. INICIAMOS el listener de la RTDB
        // Ojo: Se mantiene el window.location.href.slice(-6), que asume que el ID es siempre de 6 caracteres.
        const roomId = window.location.href.slice(-6);
        state.getRoomInfo(roomId); 
        
        // 2. Suscribimos el componente al State Manager
        this.unsubscribe = state.subscribe((currentState) => {
            
            // 💡 LÓGICA DE NAVEGACIÓN A RESULTADOS
            // Cuando el estado de la ronda cambia a "show results" (o el que use tu backend para el fin de ronda)
            if (currentState.roundStatus === "show results" && roomId) {
                // Navegamos al componente de resultados. Este componente se encargará de mostrar el score y la historia.
                Router.go(`/room/${roomId}/results`); 
                return; // Detenemos la re-renderización aquí, ya que vamos a navegar.
            }
            
            this.render(); // re-renderización
        });

        // El componente se dibuja la primera vez
        this.render();
    }

    disconnectedCallback() {
        // Al salir del DOM, cancelamos la suscripción
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

        // 1. Cláusula de Guardia para Sincronización y Usuario
        if (!currentState.play.player1?.username) {
            Router.go('/'); // Volver a la raíz si no hay usuario
            return;
        }

        // Si la data no está sincronizada, mostramos una carga rápida
        if (currentState.synced === false) {
            this.shadow.innerHTML = `<h2 style="color: grey;">Cargando sala...</h2>`;
            return;
        }

        // Datos comunes para el HTML
        const roomId = window.location.href.slice(-6);
        const thisUser = currentState.play.player1.username;
        const otherUser = currentState.play.player2?.username || "Esperando...";

        // 2. Creación del Contenedor Principal
        const container = document.createElement('div');
        container.classList.add('welcome__container');
        
        // 3. Renderizado Condicional simplificado (SOLO JUEGO Y ESPERA)

        // ESTADO A: VISTA DE JUEGO (waiting selections/Contador)
        if (currentState.roundStatus === "waiting selections") {
            
            // 💡 REINICIO DE BANDERA: Si el estado vuelve a "contando", podemos enviar de nuevo.
            if(currentState.isCounting){
                this.playSent = false;
            }

            if(currentState.play.player1.isReady && currentState.play.player2!.isReady){

                if(currentState.isCounting === false) { 
                    container.innerHTML = `
                        <h2>Esperando jugada de ${otherUser}</h2>
                        <div class='selection__container'>
                            <selection-el image="${currentState.play.player1.choice || 'tijeras'}"></selection-el>
                        </div>
                    `;
                    return; // Salimos de la función render.
                }

                // VISTA CONTADOR
                container.innerHTML = `
                    <counter-el count="4"></counter-el>
                    <div class='selection__container'>
                        <selection-el image="tijeras"></selection-el>
                        <selection-el image="piedra"></selection-el>
                        <selection-el image="papel"></selection-el>
                    </div>
                `;

                // Lógica de Listeners del Contador
                const allSelections = container.querySelectorAll("selection-el");
                let lastSelectedMove = "";

                const handleSelection = (e: any) => {
                    const selectedMove = e.detail.selection; 
                    allSelections.forEach((element) => { 
                        const image = element.shadowRoot?.querySelector("img"); 
                        if (!image) return; 
                        image.style.transform = "scale(1)"; 
                        image.style.opacity = "0.5";

                        if (element.getAttribute("image") === selectedMove) { 
                            image.style.transform = "scale(1.5)";
                            image.style.opacity = "1";
                        }
                    });

                    lastSelectedMove = selectedMove; 
                };

                container.addEventListener("selection-info", handleSelection);

                container.querySelector('counter-el')?.addEventListener("counter-finished", () => {
                    // 💡 CLÁUSULA DE GUARDIA: Previene el doble despacho
                    if (this.playSent) {
                        return;
                    }
                    this.playSent = true; // Marca como enviado inmediatamente

                    state.sendPlay(roomId, lastSelectedMove);
                    container.removeEventListener("selection-info", handleSelection);
                    state.setState({isCounting: false})
                });
            }            
            // Si no están listos (la vista por defecto)
            else {
                container.innerHTML = `
                    <h2>Esperando confirmación</h2>
                    <div class="room-info">
                        <div>
                            <p id="this-player">${thisUser}</p>
                            <p id="other-player">${otherUser}</p>
                        </div>
                        <p id="roomId">${roomId}</p>
                    </div>
                    <button-el class="new">Estoy listo</button-el>
                    <div class='selection__container'>
                        <selection-el image="tijeras"></selection-el>
                        <selection-el image="piedra"></selection-el>
                        <selection-el image="papel"></selection-el>
                    </div>
                `;

                if(otherUser !== "Esperando..."){
                    const buttonEl = container.querySelector('button-el') as HTMLElement;
                    buttonEl!.style.display = 'inherit';
                    buttonEl.addEventListener('click', this.handleReadyClick);
                }
            }
        }
        
        // ESTADO B: VISTA INICIAL / ESPERA (initial / waiting player 2)
        else {
            container.innerHTML = `
                <h2>${currentState.roundStatus}</h2>
                <div class="room-info">
                    <div>
                        <p id="this-player">${thisUser}</p>
                        <p id="other-player">${otherUser}</p>
                    </div>
                    <p id="roomId">${roomId}</p>
                </div>
                `;
        }

        // 4. Estilos
        const style = document.createElement('style');

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

            #local-message{
                display: none;
            }

            #this-choice{
                position: absolute;
                bottom: -20px;
                width: 300px;
                height: 400px;
                left: 50%;
                transform: translateX(-50%);
            }

            #opponent-choice{
                position: absolute;
                top: -20px;
                width: 300px;
                height: 400px;
                left: 50%;
                transform: translateX(-50%) rotate(180deg);
            }
        `

        this.shadow.innerHTML = ''; 
        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('game-room', GameRoom)