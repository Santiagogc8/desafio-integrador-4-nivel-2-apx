// A traves de esta cabecera le decimos a ts que debe incluir ese archivo de tipos, incluso sin tsconfig.json
/// <reference path="./types.d.ts" />

// De esta manera, los import funcionan correctamente
import scissorsUrl from '../img/tijera.svg';
import rockUrl from '../img/piedra.svg';
import paperUrl from '../img/papel.svg';

class SelectionEl extends HTMLElement{ // Creamos el custom element que extiende de HTMLElement
    shadow: ShadowRoot; // Establecemos shadow de tipo ShadowRoot
    constructor(){
        super();

        this.shadow = this.attachShadow({mode: 'open'}); // Incializamos shadow con su mode open
    }

    connectedCallback(){ // Usamos connectedCallback para el ciclo de vida del component
        this.render(); // Y hacemos el render
    }

    render(){
        // Creamos los elementos que necesitamos
        const image = document.createElement('img'); 
        const imageAttribute = this.getAttribute('image'); // Y obtenemos el atributo image y lo guardamos en imageAttribute
        const style = document.createElement('style');

        // Creamos un mapa que recibe una propiedad de tipo string y un valor de tipo string
        const imageMap: {[key: string]: string} = {
            // Establecemos las propiedades
            'tijeras': scissorsUrl, 
            'piedra': rockUrl,
            'papel': paperUrl
        }

        const imageUrl = imageMap[imageAttribute!]; // Y establecemos como imageUrl el valor de la imagen con propiedad imageAttribute (piedra, papel o tijeras)

        console.log(rockUrl)
        if(imageUrl){ // Si imageUrl no es null
            image.src = imageUrl; // Le establecemos como src la url
            image.classList.add(imageAttribute!); // Y le agregamos el atributo como clase
        }

        image.alt = 'seleccion'; // Agregamos un alt a la imagen

        style.innerHTML = `
            img{
                transition: all 0.3s ease-in-out;
                width: 100%;
                height: 100%;
            }
        `;

        image.addEventListener('click', ()=>{ // Y hacemos un evento de click sobre la imagen
            const selectionInfo = new CustomEvent('selection-info', { // El evento crea un custom event de nombre selection-info
                detail: {
                    selection: imageAttribute // Que devuelve el detail con selection y el atributo como valor
                },
                bubbles: true // Permitimos el burbujeo
            })
            this.dispatchEvent(selectionInfo); // Y enviamos el evento
        })

        this.shadow.appendChild(style);
        this.shadow.appendChild(image);
    }
}

customElements.define('selection-el', SelectionEl)