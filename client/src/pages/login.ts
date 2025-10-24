import { Router } from "@vaadin/router";

class LoginPage extends HTMLElement{
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
            <h2>Ingresa un nombre de usuario</h2>
            <input placeholder="Username">
            <button-el>Continuar</button-el>
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
            }

            h2{
                color: #009048;
                font-size: 50px;
                width: 284px;
                margin: 0;
                margin-bottom: 26px;
            }

            input{
                width: 85%;
                box-sizing: border-box;
                padding: 10px;
                margin-bottom: 15px;
                font-size: 20px;
                border-radius: 5px;
            }

            button-el{
                width: 85%;
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

        const button = container.querySelector('button-el');
        button?.addEventListener('click', ()=>{
            Router.go('/game')
        });

        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('login-page', LoginPage)