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
            <form>
                <input placeholder="Username" id="username" autocomplete="off" required>
                <button type="submit" disabled>Continuar</button>
            </form>
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
                font-size: 50px;
                width: 284px;
                margin: 0;
                margin-bottom: 26px;
            }

            form{
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            #username{
                width: 85%;
                box-sizing: border-box;
                padding: 10px;
                margin-bottom: 15px;
                font-size: 20px;
                border-radius: 10px;
                font-family: "Cabin", sans-serif;
                border: 2px solid black;
            }

            button{
                width: 85%;
                height: 87px;
                border: 10px solid var(--dark-btn-blue);
                border-radius: 10px;
                color: var(--light-btn-font);
                background-color: var(--light-btn-blue);
                font-family: "Cabin", sans-serif;
                font-size: 30px;
            }

            button:hover{
                cursor: pointer;
            }

            button.disabled{
                opacity: 50%;
            }

            button.disabled:hover{
                cursor: not-allowed;
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

        const form = container.querySelector('form');
        const input = form?.querySelector('input') as HTMLInputElement;
        const button = form?.querySelector('button');
        button?.classList.add('disabled');
        

        // Escuchar cambios en el input
        input?.addEventListener('input', () => {
            const hasText = input.value.trim().length > 0;
            
            if (hasText) {
                button!.disabled = false;
                button?.classList.remove('disabled');
            } else {
                button!.disabled = true;
                button?.classList.add('disabled');
            }
        });

        form?.addEventListener('submit', (e)=>{
            e.preventDefault();
            Router.go('/game')
        })

        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('login-page', LoginPage)