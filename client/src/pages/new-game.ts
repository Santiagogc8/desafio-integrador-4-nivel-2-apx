import { Router } from "@vaadin/router";
import { state } from "../state";

class NewGame extends HTMLElement{
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
        container.classList.add('welcome__container');

        const currentState = state.getState();
        const thisUser = currentState.play.player1?.username;

        if(!thisUser){
            Router.go('/');
        }

        container.innerHTML = `
            <h2>Quieres crear una nueva room o entrar a una room existente?</h2>
            <div class="buttons__container">
                <button-el class="new">Room nueva</button-el>
                <button-el class="existing">Room existente</button-el>
            </div>
            <form class="hide">
                <input id="roomId" placeholder="ID Room" maxlength="6" required>
                <button type="submit">Entrar</button>
            </form>
            <p id="server-response"></p>
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

            h2{
                color: #009048;
                font-size: min(10vw, 40px);
                width: 284px;
                margin: 0;
                margin-bottom: 26px;
            }

            .buttons__container{
                display: flex;
                gap: 10px;
                width: 100%;
            }

            .buttons__container button-el{
                flex: 1;
            }

            form.show{
                display: flex;
                width: 284px;
                gap: 10px;
            }

            form input{
                padding: 10px;
                width: 100%;
                font-size: 1.5rem;
            }

            form button{
                width: 100%;
                padding: 10px;
                font-size: 1.5rem;
                border: 10px solid var(--dark-btn-blue);
                border-radius: 10px;
                color: var(--light-btn-font);
                background-color: var(--light-btn-blue);
                box-sizing: border-box;
            }

            form button:hover{
                cursor: pointer;
            }

            form *{
                flex: 1;
            }

            form.hide{
                display: none;
            }

            p#server-response{
                color: red;
                font-weight: 600;
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

        const newRoomBtn = container.querySelector('.new') as HTMLElement;
        const existingRoomBtn = container.querySelector('.existing') as HTMLElement;
        const form = container.querySelector('form');

        newRoomBtn?.addEventListener('click', async ()=>{
            const res = await state.setRoom(currentState.play.player1!.userId);
            Router.go(`/room/${res.roomId}`);
        })

        existingRoomBtn?.addEventListener('click', async ()=>{
            newRoomBtn!.style.display = 'none';
            existingRoomBtn!.style.display = 'none';

            form?.classList.remove('hide');

            container.querySelector('h2')!.textContent = 'Ingresa el id de la sala'
            form?.classList.add('show');
        });

        form?.addEventListener('submit', async (e)=>{
            e.preventDefault();

            const input = container.querySelector('#roomId') as HTMLInputElement;
            const userId = currentState.play.player1!.userId;
            const pServerResponseEl = container.querySelector('#server-response') as HTMLParagraphElement;

            const res = await state.joinRoom(userId, input.value);

            if(res === "this is the room owner"){
                Router.go(`/room/${input.value}`);
                return;
            }

            if(res === "updated"){
                Router.go(`/room/${input.value}`);
                return;
            }

            if(res === "the room is full"){
                pServerResponseEl.style.display = "inherit";
                pServerResponseEl.textContent = "La room esta llena";
                return;
            }

            if(res === "room not found"){
                pServerResponseEl.style.display = "inherit";
                pServerResponseEl.textContent = "La room no existe";
                return;
            }

            if(res === "you are not authorized"){
                pServerResponseEl.style.display = "inherit";
                pServerResponseEl.textContent = "No estas autorizado";
                return;
            }
        })

        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('new-game', NewGame)