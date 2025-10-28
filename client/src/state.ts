import { rtdb, ref, onValue, onDisconnect, set } from './rtdb';

const API_BASE_URL = "http://localhost:3000";

interface StateData {
    play: {
        player1: {
            username: string;
            id: string; // Asumimos que también guardamos el ID
        } | null;
        player2: {
            username: string;
            id: string;
        } | null;
    };
    // 💡 Propiedad que faltaba en la definición inicial
    roundStatus: string; 
    // 💡 Podemos agregar el shortRoomId y rtdbRoomId para referencia
    shortRoomId?: string;
    rtdbRoomId?: string; 
    // ... otras propiedades que quieras que sean tipadas
}

const state = { // Creamos nuestro state
    data: { // Creamos un data que guardara los elementos en un objeto
        play: {
            player1: null, // Inicialmente null o el objeto con username/id si ya está logueado
            player2: null
        },
        roundStatus: "initial", // Valor inicial de la ronda
    } as StateData, 
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
            ...this.data, // Mantiene la data actual
            ...newState, // Mezcla las propiedades del nuevo estado

            // Y luego sobrescribimos play con una mezcla profunda
            play: {
                ...this.data.play, // Manteniendo lo que ya tenia
                ...newState.play // Y agregando lo nuevo
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
        const player1Info = info.play.player1;

        if(player1Info && player1Info.id){
            const filteredData = {
                play: {
                    player1: {
                        username: player1Info.username,
                        id: player1Info.id
                    },
                    player2: null
                }
            }

            localStorage.setItem('state', JSON.stringify(filteredData));
        } else{
            localStorage.removeItem('state');
        }
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
        const res = await fetch(API_BASE_URL + '/rooms/'+roomId, { // Creamos nuestra llamada a la API con la url adicionando 'rooms'
            method: 'PATCH', // Le pasamos el metodo POST
            headers: { 'Content-Type': 'application/json' }, // Pasamos los headers
            body: JSON.stringify({ // Y el body en string con el userId recibido y el roomId
                userId,
                roomId
            })
        });

        if(res.ok){
            const response = await res.json(); // Convertimos en json la respuesta
            return response.message;
        } else{
            if(res.status === 400){ // Validamos si el estado es un 400
                const mensaje = await res.json(); // Esperamos el json
                return mensaje.error; // Y retornamos el mensaje que viene
            }

            if(res.status === 401){ // Validamos si el estado es un 400
                const mensaje = await res.json(); // Esperamos el json
                return mensaje.error; // Y retornamos el mensaje que viene
            }

            if(res.status === 403){ // Validamos si el estado es un 400
                const mensaje = await res.json(); // Esperamos el json
                return mensaje.error; // Y retornamos el mensaje que viene
            }

            if(res.status === 404){ // Validamos si el estado es un 400
                const mensaje = await res.json(); // Esperamos el json
                return mensaje.error; // Y retornamos el mensaje que viene
            }

            return null; // En caso de que no sea un 400 sino que sea otra cosa, enviamos otra cosa
        }
    },
    async getRoomInfo(roomId: string){ // Creamos un metodo que nos permitira obtener la data en tiempo real de la rtdb
        const response = await fetch(API_BASE_URL + `/rooms/${roomId}`); // Hacemos un get a la room con la roomId recibida

        const rtdbRes = await response.json(); // Esperamos la respuesta y la hacemos un json

        const rtdbRoomRef = ref(rtdb, `/rooms/${rtdbRes.rtdbRoomId}`); // Obtenemos la referencia en la ruta con el id largo

        onValue(rtdbRoomRef, (snapshot) => {
            if (snapshot.exists()) {
                const roomData = snapshot.val();
                const currentState = this.getState(); 
                
                // Usamos el ID del state local para saber el rol en la DB de la sala.
                const localUserId = currentState.play.player1?.id;
                
                // Si el ID de la DB no existe, hay un error de sincronización, salimos.
                if (!localUserId) return; 

                // Validamos si el userId del player1 de la rtdb es igual al local
                const isLocalUserP1_inDB = roomData.player1.userId === localUserId;
                
                // Mapear los datos de la DB al State Local:
                let opponentData = null;
                
                if (isLocalUserP1_inDB) {
                    // Si es P1 en la DB. Oponente es P2 de la DB.
                    opponentData = roomData.player2;
                } else {
                    // Si se es P2 en la DB. EL oponente es P1 de la DB.
                    opponentData = roomData.player1;
                }

                // Mantenemos al player1 local y actualizamos al oponente y el status
                this.setState({
                    // play.player1 NO se actualiza aquí, ya que se hizo en logInPlayer/registerPlayer.
                    // play.player2 recibe los datos del oponente.
                    play: {
                        player2: opponentData // Solo actualizamos al oponente
                    },
                    roundStatus: roomData.roundStatus // Actualizamos el estado de la ronda
                });

            } else {
                console.error("La RTDB no existe");
            }
        });
    },
    async setPlayerOnline(rtdbPlayerPath: string){
        // La ruta debe ser específica para la sala y el jugador: /rooms/ID_LARGO/playerX/online
        const playerOnlineRef = ref(rtdb, rtdbPlayerPath);

        // 1. Decirle a Firebase: "Si mi conexión se cae, establece esta referencia a 'false'"
        onDisconnect(playerOnlineRef).set(false)
            .then(() => {
                // 2. Establecer el estado actual como CONECTADO (true)
                // Esto solo se ejecuta si onDisconnect se registró correctamente.
                set(playerOnlineRef, true);
                
                console.log("Presencia registrada. Jugador en línea.");
            })
            .catch(error => {
                console.error("Error al registrar la presencia:", error);
            });
    }
}

state.initLocalStorage(); // Iniciamos el localStorage

export { state }