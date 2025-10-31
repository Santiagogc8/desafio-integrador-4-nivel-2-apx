# 🚀 Desafío Integrador 4: Piedra, Papel o Tijera Online

Este proyecto implementa una aplicación full-stack de Piedra, Papel o Tijera con funcionalidades online, gestión de salas, persistencia de usuarios y puntajes, y un sistema de presencia robusto.

---

## 🔗 Acceso al Juego

Puedes probar la aplicación desplegada a través del siguiente enlace:

* **Juego Desplegado (Render):** [https://desafio-integrador-4-nivel-2-apx.onrender.com](https://desafio-integrador-4-nivel-2-apx.onrender.com)

---

## ⚙️ Tecnologías Utilizadas

* **Frontend:** TypeScript, Custom Elements/Web Components (Vanilla JS).
* **Backend:** Node.js, Express.js.
* **Base de Datos:**
    * **Firestore:** Para persistencia de usuarios (`users`) y metadatos de salas (`rooms`), incluyendo el ID de la RTDB y el historial de puntajes.
    * **Firebase Realtime Database (RTDB):** Para la gestión en tiempo real de los datos de la partida (jugadores, selecciones, estado de la ronda, y presencia).

---

## 💡 Características Clave de la Implementación

* **Registro/Login de Usuarios:** Persistencia de usuarios mediante **Firestore**.
* **Gestión de Salas:**
    * Creación de salas con un ID corto aleatorio (6 caracteres alfanuméricos).
    * Almacenamiento del ID largo de la RTDB en Firestore.
* **Sincronización en Tiempo Real (RTDB):** Actualización inmediata de los estados de la ronda y las selecciones de los jugadores.
* **Lógica de Juego en el Backend:** El servidor es responsable de determinar el ganador de cada ronda, asegurando la integridad del resultado.
* **Persistencia de Puntaje:** El *score* y el historial de jugadas se almacenan en **Firestore** usando transacciones para garantizar la atomicidad en la actualización de puntajes después de cada ronda.
* **Gestión de Presencia (Autodestrucción):** Utiliza la función `onDisconnect().remove()` de Firebase RTDB para eliminar automáticamente a un jugador de la sala si pierde la conexión. Esto libera el espacio inmediatamente para que un nuevo usuario pueda unirse a la sala.

---

## 📝 Documentación de la API

---
### **Link de Uso de API**

---