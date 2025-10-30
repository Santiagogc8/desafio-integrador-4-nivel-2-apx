class StarResult extends HTMLElement { // Creamos la clase que extiende de HTMLElement
	shadow: ShadowRoot; // Le damos un shadow
	constructor() {
		super();

		this.shadow = this.attachShadow({ mode: "open" }); // Inicializamos el shadow

		this.render();
	}

	render() {
		const div = document.createElement("div"); // Creamos un div

		const score = this.getAttribute('score'); // Obtenemos el atributo score

		// Y le agregamos un svg (Con un text que contiene el texto recibido)
		div.innerHTML = `
            <svg width="260" height="260" viewBox="0 0 363 362" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M206.486 62.1223L208.047 62.9729L209.795 62.6458L320.673 41.9446L299.972 152.823L299.646 154.571L300.496 156.132L354.447 255.187L242.599 269.762L240.835 269.992L239.614 271.283L162.078 353.202L113.654 251.333L112.891 249.728L111.285 248.964L9.41443 200.538L91.3344 123.004L92.6263 121.782L92.8558 120.019L107.431 8.17017L206.486 62.1223Z" fill="#6CB46C" stroke="black" stroke-width="13"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="70">${score}</text>
            </svg>
        `;

		div.style.fontFamily = 'Cabin", sans-serif'

        const svgPath = div.querySelector('svg')!.querySelector('path'); // Seleccionamos el path del svg

		// Si el atributo es igual a 'perdiste'
		if(score?.toLocaleLowerCase() === 'perdiste'){
			svgPath!.setAttribute('fill', 'var(--star-red)'); // Pone la estrella roja
		} 
		
		// Si el atributo es igual a 'empate'
		if (score?.toLocaleLowerCase() === 'empate'){
			svgPath!.setAttribute('fill', 'var(--star-yellow)'); // Pone la estrella amarilla
		}

		// Si no cumple con ninguna condicion, deja el color en #6CB46C

		this.shadow.appendChild(div); // Le agregamos al shadow el div
	}
}

customElements.define("star-result", StarResult); // Y definimos el custom element