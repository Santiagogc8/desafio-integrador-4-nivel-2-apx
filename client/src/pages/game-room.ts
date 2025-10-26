import { state } from "../state";

class GameRoom extends HTMLElement{
    shadow: ShadowRoot;
    constructor(){
        super();
        this.shadow = this.attachShadow({"mode": "open"});
    }

    connectedCallback(){
        this.render();
    }

    render(){
        const container = document.createElement('div');
        container.classList.add('welcome__container')

        container.innerHTML = `
            <h2>Que dice la RTDB?</h2>
            <div class="room-info">
                <div>
                    <p id="this-player">This</p>
                    <p id="other-player">Waiting...</p>
                </div>
                <p id="roomId"></p>
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

            #this-player{
                text-transform: capitalize;
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

        const currentState = state.getState()

        const roomInfo = container.querySelector('.room-info');

        roomInfo!.querySelector('#this-player')!.textContent = currentState.play.player1.username;
        roomInfo!.querySelector('#roomId')!.textContent = window.location.href.slice(-6)

        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('game-room', GameRoom)