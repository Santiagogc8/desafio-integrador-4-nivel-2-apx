class HomePage extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.render();
    }

    render(){
        
    }
}

customElements.define('home-page', HomePage)