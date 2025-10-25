class ButtonEl extends HTMLElement{ // Creamos la clase ButtonEl que extiende a HTMLElement
    shadow: ShadowRoot; // Le decimos que recibe un shadow
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'}); // Inicializamos el shadow
    }

    connectedCallback(){
        this.render(); // Y hacemos el render
    }

    render(){
        const button = document.createElement('button');
        button.textContent = this.textContent || 'Empezar';
        const style = document.createElement('style');

        style.innerHTML = `
            :host {
                container-type: inline-size;
            }

            :host :hover{
                cursor: pointer;
            }

            button{
                width: 100%;
                height: 87px;
                font-size: 13cqw;
                border: 10px solid var(--dark-btn-blue);
                border-radius: 10px;
                color: var(--light-btn-font);
                background-color: var(--light-btn-blue);
                font-family: "Cabin", sans-serif;
            }
        `

        this.shadow.appendChild(style);
        this.shadow.appendChild(button);
    }
}

customElements.define('button-el', ButtonEl);