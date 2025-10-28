// En las ultimas versiones de firebase debemos hacer importaciones modulares
import { initializeApp } from "firebase/app"; // Importamos initializeApp
import { getDatabase, ref, onValue, onDisconnect, set, get, update } from "firebase/database"; // Y getDatabase, refs, onValue 

const app = initializeApp({ // Inicializamos nuestros datos de la rtdb
    apiKey: '3nSmC5YskdClrl12uCiWW4rWE97LZ7ThC2EoCPoS',
    authDomain: 'desafio-integrador-4-nivel-2.firebaseapp.com',
    databaseURL: 'https://desafio-integrador-4-nivel-2-default-rtdb.firebaseio.com',
    projectId: 'desafio-integrador-4-nivel-2'
});

const rtdb = getDatabase(app); // Obtenemos la database

export { rtdb, ref, onValue, onDisconnect, set, get, update } // Y exportamos la rtdb, ref y el onValue