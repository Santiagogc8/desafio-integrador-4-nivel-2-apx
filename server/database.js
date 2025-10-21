"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtdb = exports.firestore = void 0;
require('dotenv').config(); // Importamos dotenv e inicializamos config
const firebase_admin_1 = __importDefault(require("firebase-admin")); // Importamos la libreria de firebase-admin
const credentialJson = process.env.FIREBASE_KEY_JSON;
if (!credentialJson) { // Si credentialJson no existe
    throw new Error("FIREBASE_KEY_JSON no está configurada"); // Enviamos un error
}
const databaseUrl = String(process.env.DATABASE_URL).trim(); // Convertimos en string la url recibida en env y le quitamos los espacios en blanco
if (!databaseUrl) { // Si no existe
    throw new Error("DATABASE_URL no está configurada o esta vacia"); // Enviamos un error
}
const credential = JSON.parse(credentialJson); // Convertimos la credencial a JSON
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(credential), // Validamos la credencial con admin.credential.cert del JSON credential
    databaseURL: databaseUrl // Y le pasamos la url de la database de firebase
});
// Guardamos los metodos de firestore y database (rtdb) en variables
const firestore = firebase_admin_1.default.firestore();
exports.firestore = firestore;
const rtdb = firebase_admin_1.default.database();
exports.rtdb = rtdb;
