import express from 'express';
const path = require('path');

const app = express();
const port = 3000;

app.get('/users', (req, res)=>{
    res.json({
        message: "todos los users"
    })
})

// Determinamos la ruta absoluta a la carpeta 'dist' del frontend
// __dirname es 'desafio-integrador-4/server'. Subimos (..) y entramos a 'client/dist'
const staticPath = path.join(__dirname, '..', '..', 'client', 'dist');

// Usamos express.static para servir la carpeta compilada
app.use(express.static(staticPath));

// SPA FALLBACK: Redirigimos todas las demás rutas a index.html
app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen( port, ()=>{
    console.log(`Your app is running on http://localhost:${port}`);
})