# Test Suite Documentation

Este directorio contiene la suite completa de pruebas para el backend del chatbot de finanzas.

## 📁 Estructura de Directorios

```
tests/
├── setup.js                    # Configuración global de pruebas
├── helpers/                    # Utilidades para testing
│   ├── testDb.js              # Helpers para base de datos de prueba
│   └── factories.js           # Factories para crear datos de prueba
├── unit/                      # Pruebas unitarias
│   ├── models/               # Tests de modelos
│   │   ├── Model.test.js
│   │   ├── Gasto.test.js
│   │   └── Ingreso.test.js
│   ├── controllers/          # Tests de controladores
│   │   └── GastoController.test.js
│   └── services/             # Tests de servicios
│       └── openRouterService.test.js
└── integration/              # Pruebas de integración
    └── routes/              # Tests de rutas API
        └── finanzas.routes.test.js
```

## 🚀 Ejecutar las Pruebas

### Todas las pruebas
```bash
npm test
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

### Con reporte de cobertura
```bash
npm run test:coverage
```

### Pruebas específicas
```bash
# Un archivo específico
npm test -- Gasto.test.js

# Por patrón
npm test -- --testPathPattern=models

# Por nombre de test
npm test -- --testNamePattern="should create"
```

## 📝 Convenciones de Naming

### Archivos de prueba
- Formato: `[NombreArchivo].test.js`
- Ubicación: Misma estructura que `src/` pero dentro de `tests/unit/`

### Estructura de tests
```javascript
describe('ComponentName', () => {
  describe('methodName()', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

## 🔧 Configuración

### Variables de Entorno
Las pruebas usan el archivo `.env.test` para configuración. Asegúrate de tener:
- Base de datos de prueba configurada
- API keys de testing (pueden ser mocks)

### Base de Datos de Prueba
Las pruebas usan una base de datos PostgreSQL separada. Configuración en `.env.test`:
```
DB_NAME=backend_finanzas_test
```

**Importante**: La base de datos se limpia automáticamente entre tests.

## 📊 Cobertura de Código

Objetivos de cobertura configurados en `jest.config.js`:
- **Branches**: 60%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Archivos excluidos de cobertura:
- `src/app.js`
- `src/bot/**`
- `src/commands/**`
- `src/config/**`
- `src/routes/router.js`

## 🛠️ Utilidades de Testing

### Test Database Helpers (`helpers/testDb.js`)
```javascript
import { setupDatabase, teardownDatabase, cleanDatabase } from './helpers/testDb.js';

// En tus tests
beforeAll(async () => {
  await setupDatabase(); // Ejecuta migraciones y limpia DB
});

afterAll(async () => {
  await teardownDatabase(); // Cierra conexión
});
```

### Factories (`helpers/factories.js`)
```javascript
import { createUserData, createGastoData } from './helpers/factories.js';

// Crear datos de prueba
const userData = createUserData({ nombre: 'Custom Name' });
const gastoData = createGastoData(userId, { monto: 5000 });
```

## ✅ Buenas Prácticas

1. **Aislamiento**: Cada test debe ser independiente
2. **Limpieza**: Usa `beforeEach` para limpiar datos entre tests
3. **Descriptivo**: Nombres de tests claros y específicos
4. **AAA Pattern**: Arrange, Act, Assert
5. **Mocking**: Mock servicios externos (OpenRouter, etc.)

## 🐛 Debugging

### Ver output de tests
```bash
npm test -- --verbose
```

### Ejecutar un solo test
```javascript
it.only('should do something', () => {
  // Este test se ejecutará solo
});
```

### Saltar un test
```javascript
it.skip('should do something', () => {
  // Este test se saltará
});
```

## 📚 Tipos de Tests

### Unit Tests
Prueban componentes individuales en aislamiento:
- Modelos (CRUD, métodos custom)
- Controladores (con mocks)
- Servicios (con mocks de APIs externas)

### Integration Tests
Prueban el flujo completo de requests HTTP:
- Rutas API
- Middleware
- Validación de datos

## 🔄 CI/CD

Para integración continua, asegúrate de:
1. Configurar base de datos de prueba en CI
2. Ejecutar `npm test` en el pipeline
3. Verificar cobertura mínima

## 📖 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## 🆘 Troubleshooting

### Error: "Cannot find module"
- Verifica que las rutas de import usen `.js` extension
- Revisa `jest.config.js` para configuración de ES modules

### Tests timeout
- Aumenta `testTimeout` en `jest.config.js`
- Verifica conexiones a base de datos

### Base de datos no se limpia
- Revisa que `cleanDatabase()` se llame en `beforeEach`
- Verifica permisos de base de datos de prueba
