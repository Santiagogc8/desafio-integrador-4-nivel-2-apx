import express from 'express'; // Hacemos la importacion de express
const path = require('path'); // Importacion de path (para rutas relativas y el staticServer)
import { firestore, rtdb, FieldValue } from './database'; // Firestore y rtdb para obtener las databases
import { v4 as uuidv4 } from 'uuid'; // v4 de uuid para obtener ids alfanumericos aleatorios
import cors from 'cors'; // Cors para conexiones mas sencillas
import { nanoid } from 'nanoid'; // E importamos nanoid para crear keys aleatorios a las referencias de la rtdb

const roomsCollection = firestore.collection('rooms'); // Obtenemos la roomCollection desde firestore
const usersCollection = firestore.collection('users'); // Obtenemos la usersCollection desde firestore

const app = express(); // Inicializamos express
const port = process.env.PORT || 3000; // Y tomamos el puerto desde env o lo establecemos en 3000

app.use(cors()); // Usamos el middleware de cors 
app.use(express.json()); // Y el middleware de json en express para realizar un parseo de todas las requests

// SignUp
// Hacemos un endpoint para que el usuario se pueda "registrar" a traves de un username
app.post('/signup', async (req, res) => {
    const { username } = req.body; // Extraemos el username del body de la request

    if (!username) { // Si no nos pasaron un username
        return res.status(400).json({ error: "a username was expected" }); // Retornamos un 400 con un mensaje
    }

    const searchUser = await usersCollection.where("username", "==", username).get(); // Hacemos la busqueda del usario recibido y verificamos si la propiedad username tiene el valor igual al recibido y lo obtenemos

    if(searchUser.empty){ // Si el resultado de la busqueda es que esta vacio
        const newUser = await usersCollection.add({ // Hacemos un await de un add a la coleccion de usuarios
            username // Con el username recibido
        })

        res.json({ // Respondemos con
            id: newUser.id // El id del usuario creado
        })
    } else{ // Si no esta vacio
        res.status(400).json({ // Enviamos un estado de 400
            message: `user already exists` // Y un mensaje de que el usuario ya existe
        })
    }
});

// Login
// Hacemos un endpoint para que el usuario se pueda "loguear" a traves de un username
app.post('/auth', async (req, res) => {
    const { username } = req.body; // Extraemos el username del body de la request

    if (!username) { // Si no nos pasaron un username
        return res.status(400).json({ error: "a username was expected" }); // Retornamos un 400 con un mensaje
    }

    const searchUser = await usersCollection.where("username", "==", username).get(); // Hacemos la busqueda del usario recibido y verificamos si la propiedad username tiene el valor igual al recibido y lo obtenemos

    if(searchUser.empty){ // Si el resultado de la busqueda es que esta vacio
        res.status(404).json({ // Enviamos un estado de 400
            message: `user not found` // Y un mensaje de que el usuario no ha sido encontrado
        })
    } else{ // Si no esta vacio
        res.json({ // Enviamos un json
            id: searchUser.docs[0].id // Con el id del usuario (En este caso debemos de entrar a la promesa y extraer el docs que es un array y extraer la posicion 0 y mostrar su id)
        })
    }
});


// Crear una nueva room
// Validaremos si un usuario esta "registrado". En caso afirmativo, crearemos una room con un id corto y dentro de este doc, guardaremos la data del la rtdb
app.post('/rooms', async (req, res)=>{
    const {userId} = req.body; // Obtenemos el userId desde el body

    if(!userId) res.status(400).json({error: "an userId was expected"}); // Si no nos pasaron un userId enviamos un estado 400

    const searchUser = await usersCollection.doc(userId).get(); // Buscamos el documento con el userId recibido y lo obtenemos

    if(searchUser.exists){ // Si el usuario existe
        const rtdbRoomRef = rtdb.ref('rooms/'+nanoid()); // Y creamos una referencia en la rtdb, en la pestaña de rooms y con el valor que nos envia nanoid
        rtdbRoomRef.set({ // Seteamos la referencia de la rtdb con
            owner: userId, // El owner como propiedad y el userId como valor
            roundStatus: "waiting player 2", // Un estado de ronda por defecto
            player1: {
                userId,
                choice: null
            }, // El player1 con un objeto que tiene su id y una seleccion nula
            player2: null // Y el player2 en null
        })

        let shortId: string; // Declaramos una variable para guardar el shortId
        let roomDoc; // Declaramos una variable roomDoc

        do{ // Ejecutamos un do donde
            shortId = uuidv4().slice(0, 6).toUpperCase(); // Establecemos un id alfanumerico aleatorio y lo cortamos desde la posicion 0 hasta la 6 y lo guardamos en la variable shortId

            roomDoc = await roomsCollection.doc(shortId).get(); // Buscamos si existe una room con el shortId recibido y la obtenemos y lo guardamos en roomDoc

            if(!roomDoc.exists){ // Si el roomDoc no existe
                roomsCollection.doc(shortId).set({ // Creamos un documento en la roomsCollection de firestore con el shortId y lo seteamos 
                    rtdbRoomId: rtdbRoomRef.key // Con el id largo de la rtdbRoomId como propiedad y la key de la referencia de la rtdb como valor
                });
            }
        } while(roomDoc.exists); // Se repite mientras que roomDoc exista

        res.json({ // Respondemos con un json que contiene
            roomId: shortId // Una propiedad roomId con el shortId como valor
        })

    } else{ // En caso de que el documento con el id recibido no exista
        res.status(401).json({error: 'you are not authorized'}) // Enviamos un estado 401 que envia un mensaje de unauthorized
    }
})

// Entrar a una sala
// Debemos crear un endpoint que permita modificar el player2 de la database y algunas otras cosas. Lo hacemos en /rooms/:roomId
app.patch('/rooms/:roomId', async (req, res)=>{
    const {userId} = req.body; // Obtenemos el userId del body
    const {roomId} = req.params; // Y obtenemos el roomId de los params

    if(!userId) res.status(400).json({error: "a username was expected"}) // Si no recibimos un userId en el body, enviamos un 400 y un mensaje de error como respuesta

    const searchUser = await usersCollection.doc(userId).get(); // Buscamos al usuario en la userCollection y le hacemos un get

    if(searchUser.exists){ // Si el usuario existe en la usersCollection
        const searchShortRoom = await roomsCollection.doc(roomId).get(); // Hace una busqueda de la coleccion de rooms con el roomId recibido y la obtiene

        if(searchShortRoom.exists){ // En caso de que la room con el id corto exista
            const rtdbRoomId = searchShortRoom.data().rtdbRoomId; // Obtiene el room de la rtdb de sus propiedades
            const rtdbRoomRef = await rtdb.ref('/rooms/'+rtdbRoomId).get(); // E intenta obtener la ref de la rtdb en la ruta que le pasamos

            if(rtdbRoomRef.exists){ // Si la referencia de la rtdb existe
                if(!rtdbRoomRef.val().player2){ // Valida si NO tiene un valor player2 (o sea, que esta vacia)
                    const newRtdbRoomRef = await rtdb.ref('/rooms/'+rtdbRoomId) // Crea una nueva referencia de la rtdb
                    newRtdbRoomRef.update({ // Y le hace un update
                        player2: {
                            userId,
                            choice: null
                        },
                        roundStatus: "waiting selections"
                    })
                    res.status(200).json({message: "updated"}); // Y envia una respuesta con estado 200
                } else { // En caso de que player2 exista en la referencia de la rtdb (esta llena la sala)
                    res.status(403).json({error: 'the room is full'}); // Envia un estado 403 y yun mensaje
                }
            } else { // En caso de que la referencia de la rtdb no exista
                res.status(404).json({error: 'room not found'}); // Enviamos un 404
            }
        } else { // Y en caso de que el shortId no se encuentre en la roomsCollection
            res.status(404).json({error: 'room not found'}); // Enviamos un 404
        }
    } else{
        res.status(401).json({error: 'you are not authorized'}); // Enviamos un estado 401 que envia un mensaje de unauthorized
    }
});

// Establecer plays
// En este endpoint necesitamos actualizar las selecciones de los jugadores en la rtdb
app.patch('/rooms/:roomId/play', async (req, res) =>{
    const {userId, choice} = req.body; // Obtenemos el userId y la seleccion del usuario del body
    const {roomId} = req.params; // Y obtenemos el roomId de los parametros

    if(!userId) res.status(400).json({error: "a username was expected"}) // Si no recibimos un userId en el body, enviamos un 400 y un mensaje de error como respuesta

    const searchUser = await usersCollection.doc(userId).get(); // Buscamos al usuario en la userCollection y le hacemos un get

    if(searchUser.exists){ // Si el usuario existe en la usersCollection
        const searchShortRoom = await roomsCollection.doc(roomId).get(); // Hace una busqueda de la coleccion de rooms con el roomId recibido y la obtiene

        if(searchShortRoom.exists){ // En caso de que la room con el id corto exista
            const rtdbRoomId = searchShortRoom.data().rtdbRoomId; // Obtiene el room de la rtdb de sus propiedades
            const rtdbRoomRef = await rtdb.ref('/rooms/'+rtdbRoomId).get(); // E intenta obtener la ref de la rtdb en la ruta que le pasamos
            const roomData = rtdbRoomRef.val(); // Guardamos la data de la room en la rtdb

            if(roomData.roundStatus !== "waiting selections"){ // Validamos si el roundStatus es diferente a wating selections
                res.status(400).json("you cannot make moves yet"); // En caso afirmativo, enviamos un error 400
                return; // Y terminamos la funcion
            }

            if(roomData.player1.userId === userId){ // Validamos si la propiedad userId del player1 en la rtdb es igual al que nos pasaron
                const player1Ref = await rtdb.ref('/rooms/'+rtdbRoomId+'/player1'); // En caso afirmativo obtenemos la referencia del player 1

                player1Ref.update({choice: choice || null}); // Y updateamos el choice al valor recibido o null
            } 
            else if(roomData.player2.userId === userId){ // Validamos si la propiedad userId del player2 en la rtdb es igual al que nos pasaron
                const newRtdbRoomRef = await rtdb.ref('/rooms/'+rtdbRoomId+'/player2'); // En caso afirmativo obtenemos la referencia del player 2

                newRtdbRoomRef.update({choice: choice || null}); // Y updateamos el choice al valor recibido o null
            } 
            else { // En caso de que ningun userId sea el que recibimos
                res.status(400).json({error: "userId not valid"}); // enviamos un error
            }

            const updatedRoomData = (await rtdb.ref('/rooms/'+rtdbRoomId).get()).val(); // Obtenemos la data actualizada del roomRef y accedemos a su valor

            // Sobre la data de la room actualizada, entramos a la propiedad choice de cada player y validamos que no sea null (para que podamos establecer los resultados)
            if(updatedRoomData.player1.choice !== null && updatedRoomData.player2.choice !== null){
                const rulesMap = { // Establecemos las reglas del juego
                    piedra: "tijeras", // La piedra le gana a las tijeras
                    papel: "piedra", // El papel a la piedra
                    tijeras: "papel" // Y las tijeras al papel
                }

                const player1Choice = updatedRoomData.player1.choice; // Guardamos la seleccion del player1
                const player2Choice = updatedRoomData.player2.choice; // y la seleccion del player2
                let winner = "tie"; // Y declaramos una variable winner que inicializamos en "tie" y cambiara dependiendo del resultado

                // La logica utilizada por el lado de escoger al ganador fue la siguiente:
                // Lo mas "seguro" para evitar trampas es directamente hacer el resultado desde el back

                if(rulesMap[player1Choice] === player2Choice) winner = "player1"; // Entonces primero validamos si lo que selecciono el player1 en el mapa, es igual a lo que contiene el player2 en su seleccion. De ser asi, significa que el player1 gano. Por lo que cambiamos la variable winner

                if(rulesMap[player2Choice] === player1Choice) winner = "player2"; // en caso de que lo que escogio el player2 sea igual en el mapa a lo que escogio el player1, gana player2 y cambiamos la variable winner

                const historyEntry = { // Creamos un entry
                    player1Choice,
                    player2Choice,
                    winner,
                    date: Date.now()
                }

                await roomsCollection.doc(roomId).update({ // Y en la roomCollection obtenemos el documento con el roomId y le hacemos un update
                    history: FieldValue.arrayUnion(historyEntry) // Le pasamos al history el arrayUnion con el historyEntry (es decir, hacemos un "push", con un metodo que ofrece firestore para no sustituir todo el array)
                })

                await rtdb.ref('/rooms/'+rtdbRoomId).update({
                    roundStatus: 'waiting selections', // Cambia el estado para que puedan volver a jugar
                    // Reiniciamos la selección de los jugadores a null
                    'player1/choice': null, // Usa la notación de ruta anidada
                    'player2/choice': null,
                    winner: null // Limpiamos el campo 'winner' que no es necesario
                });

                res.json({winner: historyEntry.winner})
            } else { // Si solo un jugador ha jugado
                res.status(200).json({ // Envia un estado 200 y un mensaje
                    message: "play recorded, waiting for the opponent..."
                })
            }
        } else { // Y en caso de que el shortId no se encuentre en la roomsCollection
            res.status(404).json({error: 'room not found'}); // Enviamos un 404
        }
    } else{
        res.status(401).json({error: 'you are not authorized'}); // Enviamos un estado 401 que envia un mensaje de unauthorized
    }
});

// Determinamos la ruta absoluta a la carpeta 'dist' del frontend
// __dirname es 'desafio-integrador-4/server'. Subimos (..) y entramos a 'client/dist'
const staticPath = path.join(__dirname, '..', 'client', 'dist');

// Usamos express.static para servir la carpeta compilada
app.use(express.static(staticPath));

// SPA FALLBACK: Redirigimos todas las demás rutas a index.html
app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen( port, ()=>{
    console.log(`Your app is running on http://localhost:${port}`);
})