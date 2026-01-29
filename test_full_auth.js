import axios from 'axios';
import db from './src/config/db.js';
import Usuario from './src/models/Usuario.js';
import { Model } from 'objection';

Model.knex(db);

const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
    name: 'Test Setup',
    email: 'test_setup_full@gmail.com',
    password: 'securePassword123!'
};

async function runTest() {
    try {
        console.log("🛠️ PREPARANDO ENTORNO...");
        // 1. Limpiar usuario anterior si existe
        const existing = await Usuario.query().findOne({ email: TEST_USER.email });
        if (existing) {
            await Usuario.query().deleteById(existing.user_id);
            console.log("🗑️ Usuario previo eliminado.");
        }

        console.log("\n1️⃣ INTENTANDO REGISTRO...");
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, TEST_USER);
            console.log(`✅ Registro exitoso: ${regRes.status}`);
        } catch (e) {
            console.error(`❌ Falló Registro: ${e.message}`, e.response?.data);
            process.exit(1);
        }

        console.log("\n2️⃣ INTENTANDO LOGIN...");
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: TEST_USER.email,
                password: TEST_USER.password
            });
            token = loginRes.data.token;
            console.log(`✅ Login exitoso. Token recibido.`);
        } catch (e) {
            console.error(`❌ Falló Login: ${e.message}`, e.response?.data);
            process.exit(1);
        }

        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        console.log("\n3️⃣ ACCEDIENDO A DASHBOARD...");
        try {
            const dashRes = await axios.get(`${API_URL}/dashboard/summary`, authHeaders);
            console.log(`✅ Dashboard accesible. Data:`, dashRes.data);
        } catch (e) {
            console.error(`❌ Falló Dashboard: ${e.message}`, e.response?.data);
        }

        console.log("\n4️⃣ ACCEDIENDO A CATEGORIAS...");
        try {
            const catRes = await axios.get(`${API_URL}/categorias`, authHeaders);
            console.log(`✅ Categorias accesibles. Total: ${catRes.data.length}`);
        } catch (e) {
            console.error(`❌ Falló Categorias: ${e.message}`, e.response?.data);
        }

        console.log("\n✅ PRUEBA COMPLETADA EXITOSAMENTE");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error General:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

runTest();
