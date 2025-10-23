require('dotenv').config(); // Importamos dotenv e inicializamos config
import admin from 'firebase-admin'; // Importamos la libreria de firebase-admin

const credentialJson = process.env.FIREBASE_KEY_JSON;

if(!credentialJson){ // Si credentialJson no existe
    throw new Error("FIREBASE_KEY_JSON no está configurada"); // Enviamos un error
}

const databaseUrl = String(process.env.DATABASE_URL).trim(); // Convertimos en string la url recibida en env y le quitamos los espacios en blanco

if (!databaseUrl){ // Si no existe
    throw new Error("DATABASE_URL no está configurada o esta vacia"); // Enviamos un error
}

const credential = JSON.parse(credentialJson); // Convertimos la credencial a JSON

admin.initializeApp({ // Inicializamos la app con el metodo initializeApp de admin
    credential: admin.credential.cert(credential), // Validamos la credencial con admin.credential.cert del JSON credential
    databaseURL: databaseUrl // Y le pasamos la url de la database de firebase
});

// Guardamos los metodos de firestore y database (rtdb) en variables
const firestore = admin.firestore();
const rtdb = admin.database();

const FieldValue = admin.firestore.FieldValue; // Creamos una variable fieldValue que contendra a FieldValue de firestore

export { firestore, rtdb, FieldValue }; // Exportamos las funciones de firestore-admin