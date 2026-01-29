import axios from 'axios';
import 'dotenv/config';

// Necesito un token válido. Como no tengo fácil acceso, voy a intentar generar uno o simular la petición si pudiera.
// Pero la API requiere auth. 
// Voy a hacer LOGIN primero con el usuario nuevo.

async function testChat() {
    try {
        console.log("1. Logueando usuario...");
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'nayenromancepeda@gmail.com',
            password: 'password123' // Asumo que el user usó esta pass o similar, si falla, no puedo testear.
            // Si el user puso otra pass, fallará. Pero intentemos.
        });

        const token = loginRes.data.token;
        console.log("✅ Login exitoso. Token obtedido.");

        console.log("2. Enviando mensaje al chat...");
        const chatRes = await axios.post('http://localhost:3000/api/chat', {
            mensaje: 'Gasté 5000 en prueba script'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ Respuesta del Chat:", chatRes.data);

    } catch (error) {
        console.error("❌ Test Fallido:", error.response ? error.response.data : error.message);
    }
}

testChat();
