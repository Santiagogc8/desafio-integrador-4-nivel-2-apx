import { Router } from "@vaadin/router";

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
            
        `

        const style = document.createElement('style')

        style.innerHTML = `
            
        `

        // const button = container.querySelector('button-el');
        // button?.addEventListener('click', ()=>{
        //     Router.go('/new-game')
        // });

        this.shadow.appendChild(container);
        this.shadow.appendChild(style);
    }
}

customElements.define('game-room', GameRoom)