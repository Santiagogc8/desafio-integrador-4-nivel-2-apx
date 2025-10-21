"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = require('path');
const database_1 = require("./database");
const uuid_1 = require("uuid");
const idUnico = (0, uuid_1.v4)();
// console.log(idUnico.slice(0, 6).toUpperCase())
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.post('/rooms', (req, res) => {
    res.json({
        respuestaDeFirestore: database_1.firestore.collection('rooms')
    });
});
// Determinamos la ruta absoluta a la carpeta 'dist' del frontend
// __dirname es 'desafio-integrador-4/server'. Subimos (..) y entramos a 'client/dist'
const staticPath = path.join(__dirname, '..', 'client', 'dist');
// Usamos express.static para servir la carpeta compilada
app.use(express_1.default.static(staticPath));
// SPA FALLBACK: Redirigimos todas las demás rutas a index.html
app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});
app.listen(port, () => {
    console.log(`Your app is running on http://localhost:${port}`);
});
