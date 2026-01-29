📊 Backend Finanzas Chatbot

Un backend moderno y educativo para construir APIs de chatbot financiero, construido con Node.js 24, Express, Knex.js y PostgreSQL (Supabase), con integración opcional de IA a través de OpenRouter para capacidades inteligentes.

🧠 ✨ ¿Qué es este proyecto?

Este repositorio es un proyecto base de backend pensado para servir como estructura inicial de APIs que gestionen datos financieros y ofrezcan respuestas inteligentes mediante IA. Permite:

Servir rutas REST para recursos financieros.

Integrarse con bases de datos PostgreSQL (ideal usando Supabase).

Añadir funciones de IA usando OpenRouter (por ejemplo: respuestas automáticas sobre finanzas).

Escalar para chatbots u otros clientes (móviles, web o CLI).

🚀 Funcionalidades principales

📌 Servidor Express
📌 Gestión de rutas y controladores básicos
📌 Conexión con PostgreSQL via Knex.js
📌 Migraciones y seeds para manejo de datos
📌 Integración opcional con IA (OpenRouter)
📌 Estructura escalable para nuevos endpoints

🛠️ Tecnologías usadas
Capa	Tecnología
Backend	Node.js 24
Servidor	Express
ORM/Query Builder	Knex.js
Base de datos	PostgreSQL (Supabase)
IA	OpenRouter (opcional)
Scripts	JavaScript
📥 Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

✔︎ Node.js 24 o superior
✔︎ PostgreSQL / Supabase
✔︎ Variables de entorno configuradas

🧩 Instalación

Clona el repositorio:

git clone https://github.com/NayenRC/backend-finanzas-chatbot.git
cd backend-finanzas-chatbot


Instala dependencias:

npm install


Crea tu archivo .env a partir del ejemplo:

cp .env.example .env


Configura las variables en .env:

DATABASE_URL=postgres://usuario:contraseña@host:puerto/dbname
OPENROUTER_API_KEY=tu_api_key_openrouter   # opcional

🗄️ Base de datos y migraciones

Ejecuta las migraciones para crear las tablas iniciales:

npm run db:migrate


Si quieres datos de ejemplo (seed):

npm run db:seed

▶️ Ejecutar el servidor
En modo desarrollo
npm run dev

En producción
npm start


Por defecto, el servidor quedará corriendo en:

http://localhost:3000

📌 Endpoints básicos

GET /health
Verifica que el servidor esté activo.

POST /api/auth/login
Login de usuario (si aplica JWT).

GET /api/finanzas
Ejemplo de endpoint de finanzas.

POST /api/ia/query
Ejemplo de ruta que puede usar IA via OpenRouter (requiere la API Key).

👆 Ajusta estos endpoints según cómo esté estructurado tu código en src/routes/.

🧠 Integración con IA (OpenRouter)

Para usar funciones de IA debes:

Conseguir tu API Key de OpenRouter.

Añadirla en tu .env (ver arriba).

Consumir rutas que hagan llamadas a la API de OpenRouter en tu backend (como en src/services/OpenRouter.js).

📦 Estructura del proyecto
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── app.js
├── migrations/
├── seeds/
├── .env.example
├── knexfile.js
├── package.json
└── README.md

🧪 Testing

(Opcional — agrega pruebas si las tienes)

npm test

🧭 Contribuciones

¡Contribuciones bienvenidas!

Haz un fork del proyecto

Crea tu feature branch (git checkout -b feature/nueva-funcion)

Haz commit de tus cambios

Abre un Pull Request 🚀

📄 Licencia

Este proyecto está bajo licencia MIT — ver archivo LICENSE.
