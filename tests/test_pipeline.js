import axios from 'axios';
import db from '../src/config/db.js';
import Usuario from '../src/models/Usuario.js';
import { Model } from 'objection';

Model.knex(db);

const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
    name: 'Chat Tester',
    email: 'chat_test_final@gmail.com',
    password: 'testPassword123!'
};

async function runTest() {
    try {
        console.log("🛠️ PREPARANDO...");
        const existing = await Usuario.query().findOne({ email: TEST_USER.email });
        if (existing) await Usuario.query().deleteById(existing.user_id);

        console.log("1. Registro...");
        await axios.post(`${API_URL}/auth/register`, TEST_USER);

        console.log("2. Login...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        const token = loginRes.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        console.log("3. Enviando mensaje al Chat: 'Gasté 5000 en Cena'...");
        const chatRes = await axios.post(`${API_URL}/chat`, {
            mensaje: 'Gasté 5000 en Cena'
        }, authHeaders);
        console.log("Bot Response:", chatRes.data.response);

        console.log("4. Verificando Dashboard...");
        const dashRes = await axios.get(`${API_URL}/dashboard/summary`, authHeaders);
        console.log("Dashboard Data:", JSON.stringify(dashRes.data, null, 2));

        if (dashRes.data.expenses > 0) {
            console.log("✅ EXITOSO: El gasto fue registrado y aparece en el Dashboard.");
        } else {
            console.log("❌ FALLIDO: El gasto no aparece en el Dashboard.");
        }

        console.log("5. Intentando añadir Meta...");
        const metaRes = await axios.post(`${API_URL}/metas`, {
            nombre: 'Ahorro Final',
            monto_objetivo: '10000',
            fecha_limite: '2026-12-31'
        }, authHeaders);
        console.log("Meta Created:", metaRes.data.nombre);

        process.exit(0);

    } catch (error) {
        console.error("❌ Error en el Test:", error.message);
        if (error.response) console.error("Data:", error.response.data);
        process.exit(1);
    }
}

runTest();
