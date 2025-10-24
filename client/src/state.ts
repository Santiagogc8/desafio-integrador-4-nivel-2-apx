import { rtdb, ref, onValue } from './rtdb';

const API_BASE_URL = "http://localhost:3000";

const state = { // Creamos nuestro state
    data: { // Creamos un data que guardara los elementos en un objeto
        history: [] as any[], // Que dentro tendra un array de plays
        play: { // Y la play del momento
            player1: "",
            player2: ""
        }
    }, 
    listeners: [] as any[], // Creamos el array de listeners
    initLocalStorage(){ // Creamos un metodo que inicializara el localStorage
        // Obtenemos la data del localStorage, si es null, usa un objeto vacío '{}' por defecto
        const localData = localStorage.getItem('state');
        
        if (localData) {
            // Si hay data, la parseamos
            const parsedData = JSON.parse(localData);
            
            // 3. Fusionamos los datos cargados con el estado inicial. Esto asegura que `this.data` use el historial guardado.
            this.data = {
                ...this.data, // Mantiene la estructura base (como 'play')
                ...parsedData // Sobreescribe con los valores guardados ('history')
            };
        }
    },
    getState(){ // Creamos el metodo getState que retornara la data actual
        return this.data
    },
    setState(newState: any){ // Creamos el metodo setState que recibe un nuevo state de cualquier tipo
        this.data = {...this.data, ...newState}; // Establecemos a data con una copia de data y el nuevo estado fusionados

        // Ahora necesitamos de un algoritmo que nos renderice de nuevo todos los elementos. Por lo que hacemos un for que por cada callback de listeners
        for (const callback of this.listeners){
            callback(this.data); // Y ejecutamos cada callback con la data dentro. Asi nos ahorramos llamar a getState todo el tiempo
        }

        this.setLocalStorage(this.getState());
    }, 
    subscribe(callback: (arg: any) => any){ 
        // Ahora debemos de hacer un suscribe, que añade un nuevo callback a la lista de 'listeners' para que sea ejecutado cada vez que el estado cambie
        this.listeners.push(callback);

        return () => { // Rertornamos una funcion
            // Que hace un filtro de los listeners para que no sean igual al callback y se llamen dos veces
            this.listeners = this.listeners.filter(listener => listener !== callback);
        }
    }, 
    setLocalStorage(info: any){
        localStorage.setItem('state', JSON.stringify(info))
    },
    async registerPlayer(username: string): Promise<string | null>{
        const res = await fetch(API_BASE_URL + '/signup', { // Creamos nuestra llamada a la API con la url adicionando 'signup'
            method: 'POST', // Le pasamos el metodo POST
            headers: { 'Content-Type': 'application/json' }, // Pasamos los headers
            body: JSON.stringify({
                username
            })
        });

        if(res.ok){
            const newUser = await res.json();
            

            console.log(newUser)
            return newUser
        } else{
            if(res.status === 400){
                return await res.json()
            }

            return null;
        }


    }
}

state.initLocalStorage(); // Iniciamos el localStorage

export { state }