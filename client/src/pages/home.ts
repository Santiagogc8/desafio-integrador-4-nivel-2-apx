import { Router } from "@vaadin/router";
import { state } from "../state";

class HomePage extends HTMLElement{
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
            <h1>Piedra Papel <span>ó</span> Tijera</h1>
            <div class="buttons__container">
                <button-el class="login">Entra</button-el>
                <button-el class="register">Registrate</button-el>
            </div>
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

            h1{
                color: #009048;
                font-size: min(20vw, 70px);
                width: 284px;
                margin: 0;
                margin-bottom: 26px;
            }

            span{
                color: #91CCAF;
            }

            .buttons__container{
                display: flex;
                gap: 10px;
                width: 100%;
                margin-bottom: 40px;
            }

            .buttons__container button-el{
                flex: 1;
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

        const currentState = state.getState(); // Obtenemos el estado actual

        if(currentState.play.player1){ // Si en la propiedad player1 de play es diferente de ""
            Router.go('/game'); // Enviamos al user a /game
            return; // Y terminamos la funcion
        }

        const btnCotainer = container.querySelector('.buttons__container');

        btnCotainer!.querySelector('.login')!.addEventListener('click', ()=>{
            Router.go('/login');
        });

        btnCotainer!.querySelector('.register')!.addEventListener('click', ()=>{
            Router.go('/register');
        });

        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('home-page', HomePage)