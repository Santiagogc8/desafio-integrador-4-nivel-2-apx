import { Router } from "@vaadin/router";

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
            <button-el></button-el>
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

            button-el{
                width: 100%;
                margin-bottom: 40px;
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
            Router.go('/login')
        });

        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('home-page', HomePage)