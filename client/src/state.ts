import { rtdb, ref, onValue } from './rtdb';

const API_BASE_URL = "http://localhost:3000";

const state = { // Creamos nuestro state
    data: { // Creamos un data que guardara los elementos en un objeto
        history: [] as any[], // Que dentro tendra un array de plays
        play: { // Y la play del momento
            player1: "" as any,
            player2: "" as any
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
        this.data = {
            ...this.data,                    // mantenemos todas las propiedades de data
            play: {                          // reemplazamos solo la parte de play
                ...this.data.play,           // conservamos valores anteriores de play
                ...newState.play             // actualizamos solo las propiedades indicadas
            }
        };

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
        localStorage.setItem('state', JSON.stringify(info));
    },
    async logInPlayer(username: string): Promise<string | null>{
        const res = await fetch(API_BASE_URL + '/auth', { // Creamos nuestra llamada a la API con la url adicionando 'auth'
            method: 'POST', // Le pasamos el metodo POST
            headers: { 'Content-Type': 'application/json' }, // Pasamos los headers
            body: JSON.stringify({ // Y el body en string con el username recibido
                username
            })
        });

        if(res.ok){ // Si la respuesta es ok
            const user = await res.json(); // Esperamos el json de la respuesta
            
            this.setState({ // Actualizamos el estado y le decimos
                play: { // Que en la propiedad play
                    player1: { // Establezca a player1 con 
                        username, // El username recibido
                        id: user.id // Y el userId como id
                    }
                }
            });

            return user.id; // Y devolvemos el id del usuario
        } else{ // Si no
            if(res.status === 404){ // Validamos si el estado es un 404
                const error = await res.json(); // Esperamos el json
                return error.message; // Y retornamos el mensaje que viene
            }
            return null; // En caso de que no sea un 404 sino que sea otra cosa, enviamos otra cosa
        }
    },
    async registerPlayer(username: string): Promise<string | null>{
        const res = await fetch(API_BASE_URL + '/signup', { // Creamos nuestra llamada a la API con la url adicionando 'signup'
            method: 'POST', // Le pasamos el metodo POST
            headers: { 'Content-Type': 'application/json' }, // Pasamos los headers
            body: JSON.stringify({ // Y el body en string con el username recibido
                username
            })
        });

        if(res.ok){ // Si la respuesta es ok
            const newUser = await res.json(); // Esperamos el json de la respuesta

            this.setState({ // Actualizamos el estado
                play: { // Solo en la propiedad play
                    player1: { // Le cambiamos al player1
                        username, // Y le establecemos el username recibido
                        id: newUser.id // Y el id del nuevo usuario
                    }
                }
            })

            return newUser.id // Y devolvemos el id del usuario
        } else{ // Si no
            if(res.status === 400){ // Validamos si el estado es un 400
                const error = await res.json(); // Esperamos el json
                return error.message; // Y retornamos el mensaje que viene
            }
            return null; // En caso de que no sea un 400 sino que sea otra cosa, enviamos otra cosa
        }
    },
    async setRoom(userId: string){
        const res = await fetch(API_BASE_URL + '/rooms', { // Creamos nuestra llamada a la API con la url adicionando 'rooms'
            method: 'POST', // Le pasamos el metodo POST
            headers: { 'Content-Type': 'application/json' }, // Pasamos los headers
            body: JSON.stringify({ // Y el body en string con el userId recibido
                userId
            })
        });

        if(res.ok){
            const roomId = await res.json(); // Convertimos en json la respuesta
            return roomId;
        } else{
            if(res.status === 400){ // Validamos si el estado es un 400
                const mensaje = await res.json(); // Esperamos el json
                return mensaje.error; // Y retornamos el mensaje que viene
            }

            if(res.status === 401){ // Validamos si el estado es un 400
                const mensaje = await res.json(); // Esperamos el json
                return mensaje.error; // Y retornamos el mensaje que viene
            }

            return null; // En caso de que no sea un 400 sino que sea otra cosa, enviamos otra cosa
        }
    },
    async joinRoom(userId: string, roomId: string){

    }
}

state.initLocalStorage(); // Iniciamos el localStorage

export { state }