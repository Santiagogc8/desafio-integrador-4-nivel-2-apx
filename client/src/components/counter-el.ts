class CounterEl extends HTMLElement {
    // Creamos un customElement para el contador
    shadow: ShadowRoot; // Le decimos que tendrá shadow
    interval: any; // Y un intervalo repetitivo para el conteo

    static get observedAttributes() {
        return ["count"]; // Observamos el atributo 'count' para actualizar el contador cuando cambie
    }

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" }); // Inicializamos el shadow DOM abierto
        this.render();
    }

    render() {
        // Método para renderizar el contenido del shadow
        this.shadow.innerHTML = ""; // Limpiamos contenido previo

        const div = document.createElement("div");
        const span = document.createElement('span');
        const style = document.createElement("style");

        // Agregamos el SVG para el anillo de progreso
        div.innerHTML = `
            <svg class="progress-ring" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="45"></circle>
                <circle class="ring-progress" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="0"></circle>
            </svg>
        `;

        div.appendChild(span); // Añadimos el span para mostrar segundos restantes

        let seconds: number = parseInt(this.getAttribute("count")!) || 0; // Valor inicial del atributo count

        // Función para actualizar el contador cada segundo
        const updateCounter = () => {
            span.textContent = `${seconds}`; // Mostrar el tiempo restante
            if (seconds < 0) { // Cuando finalice el conteo
                div.style.display = 'none'; // Ocultar el contador
                clearInterval(this.interval); // Detener el intervalo
                
                // Disparar evento custom para avisar que terminó el contador
                this.dispatchEvent(new CustomEvent('counter-finished', {
                    bubbles: true,
                    composed: true
                }));
            }
            seconds--; // Restar 1 al contador
        };

        // Estilos para el componente contador
        style.innerHTML = `
            div {
                width: 200px;
                height: 200px;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }

            span {
                position: absolute;
                font-size: 100px;
                font-weight: 700;
                z-index: 2;
                color: black;
            }

            .progress-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
            }

            .ring-bg {
                fill: none;
                stroke: #e0e0e0;
                stroke-width: 10;
            }

            .ring-progress {
                fill: none;
                stroke: black;
                stroke-width: 10;
                stroke-dasharray: 283;
                stroke-dashoffset: 0;
                animation: sweep 1s linear infinite;
            }

            @keyframes sweep {
                from {
                    stroke-dashoffset: 0;
                }
                to {
                    stroke-dashoffset: 283;
                }
            }
        `;

        this.shadow.appendChild(style);
        this.shadow.appendChild(div);

        updateCounter(); // Actualizamos el contador inmediatamente

        this.interval = setInterval(updateCounter, 1000); // Ejecutamos updateCounter cada segundo
    }

    // Se ejecuta cuando cambia algún atributo observado, como "count"
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "count") {
            clearInterval(this.interval); // Limpiamos el intervalo previo al cambiar el contador
            this.render(); // Volvemos a renderizar con el nuevo valor
        }
    }

    // Cuando el elemento se elimina del DOM limpiamos el intervalo para evitar fugas de memoria
    disconnectedCallback() {
        clearInterval(this.interval);
    }
}

customElements.define("counter-el", CounterEl); // Registramos el elemento personalizado