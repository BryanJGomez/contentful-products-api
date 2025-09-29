# Contentful Products API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descripción

API RESTful desarrollada con NestJS para la gestión de productos integrada con Contentful CMS.
Incluye autenticación JWT, manejo de base de datos PostgreSQL con TypeORM, y documentación automática con Swagger.

## Características principales

- **Autenticación JWT** con guards personalizados
- **Base de datos PostgreSQL** con migraciones y seeders
- **Desarrollo con Docker** completamente containerizado
- **Documentación Swagger** automática
- **Testing completo** con Jest (unitarios e integración)
- **Linting y formateo** con ESLint y Prettier
- **Arquitectura modular** siguiendo principios SOLID
- **Integración con Contentful CMS**

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Docker** >= 20.0
- **Docker Compose** >= 2.0
- **Git**
- **VS Code** (recomendado para aprovechar las tasks configuradas)

## Setup inicial

### 1. Clonar el repositorio

```bash
git clone git@github.com:BryanJGomez/contentful-products-api.git
cd contentful-products-api
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

### 3. Instalar dependencias (para VS Code IntelliSense)

> **Nota**: Las dependencias se instalan automáticamente en el contenedor Docker, pero es recomendable instalarlas localmente para evitar errores de linting y autocompletado en VS Code.

```bash
npm install
```

### 4. Construir y ejecutar con Docker

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# Solo construir la aplicación
docker-compose up app --build

# Ejecutar en background
docker-compose up -d
```

La aplicación estará disponible en:

- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **PostgreSQL**: localhost:5433

## Base de datos y migraciones

### Ejecutar migraciones

```bash
# Ejecutar todas las migraciones pendientes
docker-compose run --rm app npm run migration:run

# Ejecutar migraciones y seeders
docker-compose run --rm app npm run migration:run:seed
```

### Crear nueva migración

```bash
# Generar migración basada en cambios en entidades
docker-compose run --rm app npm run migration:generate -- src/db/migrations/NombreDeLaMigracion

# Crear migración vacía
docker-compose run --rm app npm run typeorm -- migration:create src/db/migrations/NombreDeLaMigracion
```

### Revertir migración

```bash
# Revertir la última migración
docker-compose run --rm app npm run migration:revert
```

### Poblar datos de prueba (Seeders)

```bash
# Ejecutar seeders manualmente
docker-compose run --rm app npm run seed

```

Los seeders incluyen productos de ejemplo con diferentes categorías, marcas y precios.

## 🔐 Autenticación y acceso a módulos privados

La API utiliza autenticación JWT para proteger ciertos endpoints. Para acceder a los módulos privados, es necesario autenticarse e incluir el token en las cabeceras de las peticiones.

### 1. Registro de nuevo usuario

Si no tienes una cuenta, primero debes registrarte:

**Endpoint:** `POST /auth/register`

### 2. Iniciar sesión

Una vez registrado, inicia sesión para obtener tu token:

**Endpoint:** `POST /auth/login`

### 3. Usar el token en peticiones autenticadas

Para acceder a endpoints protegidos, incluye el token en la cabecera `Authorization`:

```bash
curl -X GET http://localhost:3000/protected-endpoint \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🧪 Ejecutar tests

El proyecto incluye tasks de VS Code configuradas para facilitar la ejecución de tests.

### Usando VS Code Tasks

1. Abrir **Command Palette** (`Ctrl+Shift+P` o `Cmd+Shift+P`)
2. Ejecutar **Tasks: Run Task**
3. Seleccionar una de las opciones disponibles:

#### Tests disponibles:

- **`Test Current File with Coverage`**: Ejecutar test con cobertura en archivo actual
- **`Test Current File`**: Ejecutar tests del archivo actual
- **`Test All with Coverage`**: Ejecutar todos los tests con reporte de cobertura

### Usando terminal

```bash
# Tests unitarios
docker-compose run --rm app npm run test

# Tests con cobertura
docker-compose run --rm app npm run test:cov

# Tests específicos
docker-compose run --rm app npm run test -- --testPathPattern=products

```

## Recursos adicionales

- **Swagger UI**: http://localhost:3000/docs
- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io
- **Docker Compose Docs**: https://docs.docker.com/compose/
