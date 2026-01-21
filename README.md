# Proyecto Base Backend Educativo

Este repositorio contiene un proyecto base para desarrollar un backend robusto y moderno utilizando Node.js 24, Express, Knex.js y PostgreSQL (Supabase). Incluye integración con Inteligencia Artificial a través de OpenRouter.

## 📋 Requisitos Previos

- **Node.js**: Versión 24 o superior recomendada.
- **Base de Datos**: Una instancia de PostgreSQL. Recomendamos [Supabase](https://supabase.com/) por su facilidad de uso.
- **OpenRouter (Opcional)**: Una API Key de [OpenRouter](https://openrouter.ai/) para probar la funcionalidad de IA.

## 🚀 Instalación Paso a Paso

### 1. Clonar y Preparar

Descarga este código y abre la terminal en la carpeta del proyecto.

### 2. Instalar Dependencias

Ejecuta el siguiente comando para instalar las librerías necesarias:

```bash
npm install
```

### 3. Configurar Variables de Entorno

1. Duplica el archivo `.env.example` y renómbralo a `.env`.
2. Abre `.env` y edita las variables:
   - `DATABASE_URL`: Pega aquí tu cadena de conexión de Supabase (Connection String > URI). Asegúrate de usar la contraseña real de tu base de datos.
   - `OPENROUTER_API_KEY`: Pega tu API Key si deseas usar la funcionalidad de IA.

```env
DATABASE_URL=postgres://postgres:[TU_PASSWORD]@db.[REF].supabase.co:5432/postgres
```

### 4. Ejecutar Migraciones

Las migraciones crean las tablas necesarias en tu base de datos.

```bash
npm run db:migrate
```

_Si tienes errores de conexión, verifica tu DATABASE_URL en el archivo .env_

### 5. (Opcional) Poblar la Base de Datos

Para tener datos de prueba, puedes ejecutar el script de "seed":

```bash
npm run command:seed
```

### 6. Iniciar el Servidor

Para desarrollo (se reinicia automáticamente al guardar cambios):

```bash
npm run dev
```

Para producción:

```bash
npm start
```

El servidor iniciará en `http://localhost:3000`.

## 📂 Guía del Código

El proyecto está organizado para ser fácil de entender y escalar:

### `src/models/`

Aquí definimos la estructura de nuestros datos.

- **`Model.js`**: Una clase base que simplifica las consultas a la base de datos (Active Record simplificado).
- **`Article.js`**: Ejemplo de un modelo que extiende de `Model`. Muestra cómo interactuar con la tabla `articles`.

### `src/controllers/`

La lógica de negocio. Reciben la petición del usuario y deciden qué hacer.

- **`ArticleController.js`**: Contiene métodos `index`, `show`, `store`, `update`, `destroy` para gestionar artículos.

### `src/services/`

Lógica para conectar con servicios externos.

- **`OpenRouter.js`**: Un servicio dedicado a hablar con la API de OpenRouter. Tiene el método `generateSummary` que envía texto a una IA y devuelve un resumen.

### `src/routes/`

- **`router.js`**: Define las URLs de tu API.
  - `GET /api/articles` -> Lista artículos
  - `POST /api/articles` -> Crea artículo
  - `POST /api/articles/:id/summarize` -> ✨ **Feature IA**: Resume el artículo usando OpenRouter.

### 7. Sistema de Autenticación

El proyecto incluye un sistema completo de usuarios con JWT.

#### Configuración Extra

Asegúrate de agregar `JWT_SECRET` en tu `.env`:

```env
JWT_SECRET=tu_secreto_super_seguro
```

#### Endpoints de Autenticación

- `POST /api/register`: Crear cuenta (requiere `name`, `email`, `password`).
- `POST /api/login`: Iniciar sesión (requiere `email`, `password`). Retorna un token.
- `GET /api/profile`: Ruta protegida. Requiere header `Authorization: Bearer <TOKEN>`.

### 8. Comandos Útiles

- **Crear migración**: `npx knex migrate:make nombre_migracion`
- **Correr migraciones**: `npm run db:migrate`
- **Poblar DB (Seeds)**: `npm run db:seed` (Crea usuarios de prueba: admin@example.com / 123456)

## 📂 Guía del Código

Puedes usar Postman o cURL.

**Crear un artículo:**

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi primer post", "content": "Este es un contenido muy largo que la IA va a resumir...", "author": "Yo"}'
```

**Resumir un artículo con IA:**

```bash
# Reemplaza :id con el ID del artículo creado
curl -X POST http://localhost:3000/api/articles/1/summarize
```

---

¡Diviértete aprendiendo! 🚀
