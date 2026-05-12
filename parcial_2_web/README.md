# Sistema de Usuarios y Roles — NestJS

API REST construida con NestJS que implementa autenticación con JWT, autorización por roles y persistencia en PostgreSQL con relación muchos a muchos entre usuarios y roles.

---

## Tabla de contenidos

1. [Stack tecnológico](#stack-tecnológico)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Variables de entorno](#variables-de-entorno)
4. [Configuración de la base de datos](#configuración-de-la-base-de-datos)
5. [Migraciones SQL](#migraciones-sql)
6. [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
7. [Endpoints](#endpoints)
8. [Módulos en detalle](#módulos-en-detalle)
   - [AppModule](#appmodule)
   - [AuthModule](#authmodule)
   - [RolesModule](#rolesmodule)
   - [UserModule](#usermodule)
   - [Common — Decoradores y Guards](#common--decoradores-y-guards)
9. [Flujo de autenticación y autorización](#flujo-de-autenticación-y-autorización)

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **NestJS** | ^11 | Framework principal |
| **TypeORM** | ^0.3 | ORM para PostgreSQL |
| **PostgreSQL** | — | Base de datos relacional |
| **passport-jwt** | ^4 | Estrategia de autenticación JWT |
| **@nestjs/jwt** | ^11 | Firma y verificación de tokens JWT |
| **bcryptjs** | ^3 | Hash seguro de contraseñas |
| **class-validator** | — | Validación de DTOs con decoradores |
| **dotenv** | — | Carga de variables de entorno desde `.env` |

---

## Estructura del proyecto

```
parcial_2_web/
├── .env                                      # Variables de entorno (no subir a git)
├── sql/
│   ├── 001_create_users_roles_schema.sql     # Migración: crea las 3 tablas
│   └── 002_seed_roles_and_test_data.sql      # Seed: roles iniciales y datos de prueba
├── TESTING_GUIDE.md                          # Guía paso a paso para probar en Postman
├── CHECKLIST_PREPARCIAL.md                   # Estado de cada requisito del enunciado
└── src/
    ├── main.ts                               # Entrada: carga .env y registra ValidationPipe
    ├── app.module.ts                         # Módulo raíz: configura TypeORM y une módulos
    ├── auth/
    │   ├── auth.module.ts                    # Módulo de autenticación
    │   ├── auth.controller.ts                # Rutas públicas: /auth/register y /auth/login
    │   ├── auth.service.ts                   # Lógica: hash, comparación y firma JWT
    │   ├── jwt.strategy.ts                   # Estrategia Passport que valida el Bearer token
    │   ├── guards/
    │   │   └── jwt-auth.guard.ts             # Guard: protege rutas exigiendo JWT válido
    │   └── dto/
    │       ├── register.dto.ts               # Validación del body de registro
    │       └── login.dto.ts                  # Validación del body de login
    ├── roles/
    │   ├── roles.module.ts                   # Módulo de roles
    │   ├── roles.controller.ts               # Rutas /roles/* (solo admin)
    │   ├── roles.service.ts                  # Lógica: crear y listar roles
    │   ├── roles.entity.ts                   # Entidad TypeORM → tabla roles
    │   └── dto/
    │       └── create-role.dto.ts            # Validación del body para crear rol
    ├── user/
    │   ├── user.module.ts                    # Módulo de usuarios
    │   ├── user.controller.ts                # Rutas /users/*
    │   ├── user.service.ts                   # Lógica: perfil propio, listar, asignar roles
    │   ├── user.entity.ts                    # Entidad TypeORM → tabla users
    │   └── dto/
    │       └── assign-roles.dto.ts           # Validación del body para asignar roles
    └── common/
        ├── decorators/
        │   └── roles.decorator.ts            # @Roles(...roles) — adjunta metadata de roles
        └── guards/
            └── roles.guard.ts                # Guard: verifica que req.user tenga el rol requerido
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (`parcial_2_web/`) con el siguiente contenido y ajusta los valores según tu entorno local:

```env
# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=tu_password
DB_NAME=parcial2_web_nest

# JWT
JWT_SECRET=mi_clave_super_secreta
JWT_EXPIRES_IN=120s
```

> El archivo `.env` se carga automáticamente al inicio de la app mediante `import 'dotenv/config'` en `main.ts`, que es la primera línea que se ejecuta.

---

## Configuración de la base de datos

1. Asegúrate de tener PostgreSQL instalado y corriendo.
2. Crea la base de datos manualmente desde psql o tu cliente SQL:

```sql
CREATE DATABASE parcial2_web_nest;
```

3. El proyecto usa `synchronize: true` en TypeORM, lo que significa que las tablas se crean y actualizan automáticamente cada vez que arranca la app. Los scripts SQL de la carpeta `sql/` sirven como documentación de migración o para crear las tablas manualmente si no usas `synchronize`.

---

## Migraciones SQL

Los scripts están en la carpeta `sql/` y deben ejecutarse en orden si prefieres crear las tablas manualmente.

### `001_create_users_roles_schema.sql` — Crear tablas

Crea las tres tablas del sistema con todas sus restricciones:

```sql
-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR   UNIQUE NOT NULL,
    password   VARCHAR   NOT NULL,
    name       VARCHAR   NOT NULL,
    phone      VARCHAR,
    is_active  BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name   VARCHAR   UNIQUE NOT NULL,
    description VARCHAR,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla intermedia (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS users_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

### `002_seed_roles_and_test_data.sql` — Datos iniciales

Inserta los roles `admin` y `doctor` si no existen, y provee queries comentadas para:
- Consultar usuarios creados vía la API
- Asignar roles directamente en la BD
- Verificar usuarios con sus roles asignados

```sql
INSERT INTO roles (role_name, description)
VALUES
    ('admin',  'Administrador del sistema'),
    ('doctor', 'Médico del sistema')
ON CONFLICT (role_name) DO NOTHING;
```

> **Importante:** Los usuarios siempre deben crearse vía `POST /auth/register` para que la contraseña quede hasheada con bcrypt. Nunca insertes usuarios directamente con contraseña en texto plano.

---

## Cómo ejecutar el proyecto

### Prerrequisitos

- Node.js >= 18
- PostgreSQL corriendo
- Base de datos `parcial2_web_nest` creada

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env (ver sección Variables de entorno)

# 3. (Opcional) Ejecutar el seed SQL para crear los roles admin y doctor
#    Abre tu cliente SQL y ejecuta: sql/002_seed_roles_and_test_data.sql

# 4. Arrancar en modo desarrollo con hot reload
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Modo desarrollo con hot reload (recomendado) |
| `npm run build` | Compila TypeScript a JavaScript en `/dist` |
| `npm run start:prod` | Ejecuta el build compilado |
| `npm run lint` | Linter con ESLint y corrección automática |

---

## Endpoints

### Tabla resumen

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/auth/register` | Público | Registrar nuevo usuario |
| `POST` | `/auth/login` | Público | Login, retorna JWT |
| `GET` | `/users/me` | Autenticado (JWT) | Perfil del usuario del token |
| `GET` | `/users` | Solo admin | Listar todos los usuarios |
| `PATCH` | `/users/:id/roles` | Solo admin | Asignar roles a un usuario |
| `POST` | `/roles` | Solo admin | Crear un nuevo rol |
| `GET` | `/roles` | Solo admin | Listar todos los roles |

---

### `POST /auth/register` — Registrar usuario

Crea un nuevo usuario. La contraseña es hasheada con bcrypt (10 rondas) antes de guardarse. El campo `phone` es opcional.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123",
  "name": "Juan Pérez",
  "phone": "3001234567"
}
```

**Respuesta exitosa `201`:**
```json
{
  "message": "Usuario registrado con éxito",
  "userId": "d3f1a2b3-4c5d-6e7f-8a9b-0c1d2e3f4a5b"
}
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| `400` | `Email inválido` | El campo `email` no tiene formato de email válido |
| `409` | `Email ya registrado` | Ya existe un usuario con ese email en la BD |

---

### `POST /auth/login` — Login

Autentica al usuario y devuelve un token JWT firmado con los datos del usuario y sus roles. El token expira en **120 segundos**.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```

**Respuesta exitosa `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

El token contiene el siguiente payload (decodificado):
```json
{
  "sub": "d3f1a2b3-...",
  "email": "usuario@ejemplo.com",
  "roles": ["admin"]
}
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| `401` | `Credenciales incorrectas` | Email no existe o password incorrecto |
| `423` | `Usuario desactivado` | El usuario tiene `is_active = false` en la BD |

---

### `GET /users/me` — Perfil propio

Retorna los datos del usuario identificado por el token JWT. Usa el campo `sub` del token (que contiene el `userId`) para buscarlo en la BD.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa `200`:**
```json
{
  "id": "d3f1a2b3-...",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "phone": "3001234567",
  "roles": ["admin"]
}
```

> El campo `password` nunca aparece en la respuesta.

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| `401` | `Unauthorized` | Token inválido, expirado o faltante |
| `404` | `Usuario no encontrado` | El `sub` del token no existe en la BD |

---

### `GET /users` — Listar usuarios

Lista todos los usuarios con sus roles. Solo accesible con rol `admin`.

**Headers:**
```
Authorization: Bearer <token>   (el usuario debe tener rol admin)
```

**Respuesta exitosa `200`:**
```json
[
  {
    "id": "d3f1a2b3-...",
    "email": "admin@test.com",
    "name": "Admin",
    "roles": ["admin"]
  },
  {
    "id": "a1b2c3d4-...",
    "email": "doctor@test.com",
    "name": "Doctor",
    "roles": ["doctor"]
  }
]
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| `401` | `Unauthorized` | Token inválido o faltante |
| `403` | `No autorizado` | El usuario no tiene rol `admin` |
| `500` | `Error al listar usuarios` | Error inesperado en la base de datos |

---

### `PATCH /users/:id/roles` — Asignar roles

Reemplaza completamente los roles de un usuario por los especificados en el body. Los nombres de roles deben existir previamente en la tabla `roles`.

**Headers:**
```
Authorization: Bearer <token>   (el usuario debe tener rol admin)
```

**URL:** reemplaza `:id` con el UUID del usuario al que le asignarás roles.

**Body:**
```json
{
  "roles": ["admin", "doctor"]
}
```

**Respuesta exitosa `200`:**
```json
{
  "message": "Roles asignados"
}
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| `400` | `roles inválidos` | Algún `role_name` del array no existe en la BD |
| `401` | `Unauthorized` | Token inválido o faltante |
| `403` | `No autorizado` | El usuario no tiene rol `admin` |
| `404` | `Usuario no encontrado` | El `:id` no existe en la BD |

---

### `POST /roles` — Crear rol

Crea un nuevo rol en el sistema. El campo `description` es opcional.

**Headers:**
```
Authorization: Bearer <token>   (el usuario debe tener rol admin)
```

**Body:**
```json
{
  "role_name": "enfermero",
  "description": "Enfermero del sistema"
}
```

**Respuesta exitosa `201`:**
```json
{
  "message": "Rol creado con éxito",
  "roleId": "f7a8b9c0-..."
}
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| `400` | `role_name es requerido` | El campo `role_name` está vacío o faltante |
| `401` | `Unauthorized` | Token inválido o faltante |
| `403` | `No autorizado` | El usuario no tiene rol `admin` |
| `409` | `role_name ya existe` | Ya existe un rol con ese nombre |

---

### `GET /roles` — Listar roles

Retorna todos los roles del sistema. Solo accesible con rol `admin`.

**Headers:**
```
Authorization: Bearer <token>   (el usuario debe tener rol admin)
```

**Respuesta exitosa `200`:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "role_name": "admin",
    "description": "Administrador del sistema"
  },
  {
    "id": "e5f6g7h8-...",
    "role_name": "doctor",
    "description": "Médico del sistema"
  }
]
```

**Errores:**

| Código | Mensaje | Causa |
|--------|---------|-------|
| `401` | `Unauthorized` | Token inválido o faltante |
| `403` | `No autorizado` | El usuario no tiene rol `admin` |
| `500` | `Error al obtener roles` | Error inesperado en la base de datos |

---

## Módulos en detalle

### AppModule

**Archivo:** `src/app.module.ts`

Es el módulo raíz que NestJS usa como punto de entrada. Su única responsabilidad es unir todos los demás módulos y configurar la conexión a la base de datos.

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({ ... }),  // conexión a PostgreSQL con variables de entorno
    UserModule,
    RolesModule,
    AuthModule,
  ],
})
export class AppModule {}
```

La conexión a PostgreSQL se configura con `process.env.DB_*` y tiene los valores locales como fallback, por lo que funciona aunque el `.env` no esté configurado durante desarrollo.

---

### AuthModule

**Archivo:** `src/auth/auth.module.ts`

Módulo responsable de todo lo relacionado con autenticación. Conecta el repositorio de usuarios, Passport, JWT y los proveedores propios.

```
AuthModule
├── TypeOrmModule.forFeature([User])    → acceso al repositorio de usuarios en la BD
├── PassportModule                      → habilita el sistema de estrategias Passport
├── JwtModule.register({ secret, expiresIn })  → configura la firma de tokens (expira en 120s)
├── AuthController                      → expone POST /auth/register y POST /auth/login
├── AuthService                         → lógica de negocio (hash, compare, sign)
└── JwtStrategy                         → estrategia que valida el Bearer token en cada request
```

---

#### `auth.controller.ts` — Controlador de autenticación

Expone las dos únicas rutas públicas de la API. No tiene ningún guard porque cualquier persona puede registrarse o hacer login.

| Decorador | Ruta | Método del servicio |
|-----------|------|---------------------|
| `@Post('register')` | `POST /auth/register` | `authService.register(dto)` |
| `@Post('login')` | `POST /auth/login` | `authService.login(dto)` |

---

#### `auth.service.ts` — Servicio de autenticación

Contiene toda la lógica de negocio de autenticación. Tiene acceso al repositorio de `User` y al `JwtService`.

**`register(dto: RegisterDto)`**

1. Busca en la BD si ya existe un usuario con ese email (`findOne({ where: { email } })`).
2. Si existe → lanza `ConflictException` con mensaje `"Email ya registrado"` (409).
3. Hashea el password con `bcrypt.hash(password, 10)` — el `10` es el número de rondas de salt (mayor = más seguro pero más lento).
4. Crea la entidad con `userRepository.create(...)` y la persiste con `userRepository.save(...)`.
5. Retorna `{ message: "Usuario registrado con éxito", userId }`.

**`login(dto: LoginDto)`**

1. Busca el usuario por email, cargando también sus roles con `relations: ['roles']` (TypeORM no trae relaciones automáticamente).
2. Si no existe → `UnauthorizedException` (401). Se usa el mismo mensaje que password incorrecto para no filtrar si el email existe.
3. Compara el password ingresado con el hash de la BD usando `bcrypt.compare(plain, hash)`.
4. Si no coincide → `UnauthorizedException` (401).
5. Si `is_active === false` → `HttpException('Usuario desactivado', HttpStatus.LOCKED)` (423).
6. Construye el payload del JWT: `{ sub: user.id, email: user.email, roles: user.roles.map(r => r.role_name) }`.
7. Firma el token con `jwtService.sign(payload)`.
8. Retorna `{ access_token }`.

---

#### `jwt.strategy.ts` — Estrategia JWT de Passport

Define cómo Passport debe extraer y validar el token JWT en cada petición protegida. Se ejecuta automáticamente cuando una ruta usa `JwtAuthGuard`.

```typescript
// Extrae el token del header: Authorization: Bearer <token>
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()

// Rechaza tokens expirados (no ignora la expiración)
ignoreExpiration: false

// Usa el mismo secret que JwtModule para verificar la firma
secretOrKey: process.env.JWT_SECRET || 'secret_temporal'
```

**`validate(payload)`**: Passport llama a este método solo si el token es criptográficamente válido y no expiró. Lo que retorne aquí queda disponible en los controladores como `req.user`.

```typescript
// req.user queda así después de que JwtStrategy valida el token:
{
  sub: "uuid-del-usuario",      // id del usuario
  email: "usuario@ejemplo.com",
  roles: ["admin"]              // array de nombres de roles
}
```

---

#### `guards/jwt-auth.guard.ts` — Guard de JWT

Guard que extiende `AuthGuard('jwt')` de Passport. Se aplica con `@UseGuards(JwtAuthGuard)` en cualquier ruta que requiera un usuario autenticado.

**Flujo cuando se aplica a una ruta:**
1. Intercepta la petición antes de que llegue al controlador.
2. Extrae el token del header `Authorization: Bearer <token>`.
3. Lo verifica con `JwtStrategy`.
4. Si el token es inválido, expirado o faltante → responde `401 Unauthorized` automáticamente.
5. Si es válido → pone el resultado de `validate()` en `req.user` y deja pasar la petición.

---

#### DTOs de autenticación

Los DTOs (Data Transfer Objects) definen la forma esperada del body y sus validaciones. El `ValidationPipe` global en `main.ts` los aplica automáticamente.

**`register.dto.ts`**

| Campo | Decoradores | Obligatorio |
|-------|-------------|-------------|
| `email` | `@IsEmail()` | Sí |
| `password` | `@IsString() @IsNotEmpty()` | Sí |
| `name` | `@IsString() @IsNotEmpty()` | Sí |
| `phone` | `@IsString() @IsOptional()` | No |

**`login.dto.ts`**

| Campo | Decoradores | Obligatorio |
|-------|-------------|-------------|
| `email` | `@IsEmail()` | Sí |
| `password` | `@IsString() @IsNotEmpty()` | Sí |

---

### RolesModule

**Archivo:** `src/roles/roles.module.ts`

Módulo que gestiona la creación y consulta de roles. Exporta su servicio y `TypeOrmModule` para que otros módulos puedan acceder al repositorio de `Role` si lo necesitan.

```
RolesModule
├── TypeOrmModule.forFeature([Role])    → acceso al repositorio de roles
├── RolesController                     → expone POST /roles y GET /roles
├── RolesService                        → lógica de negocio
└── exports: [RolesService, TypeOrmModule]   → disponible para UserModule
```

---

#### `roles.controller.ts` — Controlador de roles

Todas las rutas tienen doble guard: primero se valida el JWT y luego que el usuario tenga rol `admin`. El orden de `@UseGuards` importa: `JwtAuthGuard` corre primero y pone `req.user`; `RolesGuard` corre segundo y lee `req.user.roles`.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('roles')
```

| Decorador | Ruta | Método del servicio |
|-----------|------|---------------------|
| `@Post()` | `POST /roles` | `rolesService.create(dto)` |
| `@Get()` | `GET /roles` | `rolesService.findAll()` |

---

#### `roles.service.ts` — Servicio de roles

**`create(dto: CreateRoleDto)`**

1. Verifica si ya existe un rol con ese `role_name` (`findOne({ where: { role_name } })`).
2. Si existe → `ConflictException` (409) con mensaje `"role_name ya existe"`.
3. Crea y guarda el rol en la BD.
4. Retorna `{ message: "Rol creado con éxito", roleId }`.

**`findAll()`**

1. Busca todos los roles, pero selecciona solo `id`, `role_name` y `description` (excluye `created_at` de la respuesta con `select: [...]`).
2. Envuelve en `try/catch`: si ocurre cualquier error de BD → `InternalServerErrorException` (500).
3. Retorna el array de roles.

---

#### `roles.entity.ts` — Entidad de roles

Define la estructura de la tabla `roles` en la BD. TypeORM usa esta clase para generar el SQL y mapear resultados.

| Decorador TypeORM | Columna SQL | Descripción |
|-------------------|-------------|-------------|
| `@PrimaryGeneratedColumn('uuid')` | `id UUID PK` | UUID autogenerado |
| `@Column({ unique: true })` | `role_name VARCHAR UNIQUE` | Nombre único del rol |
| `@Column({ nullable: true })` | `description VARCHAR` | Descripción opcional |
| `@CreateDateColumn()` | `created_at TIMESTAMP DEFAULT NOW()` | Timestamp automático al insertar |
| `@ManyToMany(() => User, ...)` | — | Relación inversa hacia usuarios |

---

#### `dto/create-role.dto.ts`

| Campo | Decoradores | Obligatorio |
|-------|-------------|-------------|
| `role_name` | `@IsString() @IsNotEmpty()` | Sí |
| `description` | `@IsString() @IsOptional()` | No |

---

### UserModule

**Archivo:** `src/user/user.module.ts`

Módulo que gestiona las operaciones sobre usuarios: ver perfil propio, listar todos y asignar roles.

```
UserModule
├── TypeOrmModule.forFeature([User, Role])  → repositorios de users Y roles
├── UserController                          → expone las rutas /users/*
├── UserService                             → lógica de negocio
└── exports: [UserService, TypeOrmModule]
```

> Importa el repositorio de `Role` también porque `assignRoles` necesita buscar roles por nombre para validarlos antes de asignarlos.

---

#### `user.controller.ts` — Controlador de usuarios

> **Nota de orden importante:** `GET /users/me` está declarado ANTES de `GET /users` en el controlador. Esto es necesario porque si `GET /:id` existiera, NestJS trataría la cadena `"me"` como un parámetro dinámico. Al declarar primero la ruta específica, NestJS la empareja correctamente.

| Decorador | Ruta | Guard | Método del servicio |
|-----------|------|-------|---------------------|
| `@Get('me')` | `GET /users/me` | `JwtAuthGuard` | `userService.findMe(req.user.sub)` |
| `@Get()` | `GET /users` | `JwtAuthGuard + RolesGuard + @Roles('admin')` | `userService.findAll()` |
| `@Patch(':id/roles')` | `PATCH /users/:id/roles` | `JwtAuthGuard + RolesGuard + @Roles('admin')` | `userService.assignRoles(id, dto)` |

`req.user.sub` es el `userId` que dejó `JwtStrategy.validate()` en el request. Es el campo `sub` del payload JWT, que se setea al `user.id` durante el login.

---

#### `user.service.ts` — Servicio de usuarios

**`findMe(userId: string)`**

1. Busca al usuario por su `id` cargando sus roles con `relations: ['roles']`.
2. Si no existe → `NotFoundException` (404).
3. Retorna `{ id, email, name, phone, roles: [role_name, ...] }`.
4. El campo `password` nunca se incluye, ya que se desestructura manualmente solo lo necesario.

**`findAll()`**

1. Busca todos los usuarios con `relations: ['roles']`.
2. Mapea el resultado para retornar solo `{ id, email, name, roles }` — sin `password`.
3. Si hay error de BD → `InternalServerErrorException` (500).

**`assignRoles(userId, dto: AssignRolesDto)`**

1. Busca al usuario por `id`.
2. Si no existe → `NotFoundException` (404).
3. Busca los roles en la BD usando `In([...names])` — busca todos los que coincidan con el array de nombres.
4. Valida que la cantidad de roles encontrados sea igual a la solicitada. Si difiere (algún nombre no existe) → `BadRequestException` (400).
5. Reemplaza `user.roles` completamente con los nuevos roles.
6. Guarda con `userRepository.save(user)`. TypeORM actualiza automáticamente la tabla `users_roles` (borra las entradas viejas e inserta las nuevas).
7. Retorna `{ message: "Roles asignados" }`.

---

#### `user.entity.ts` — Entidad de usuarios

Define la estructura de la tabla `users` y la relación muchos a muchos con `roles`.

| Decorador TypeORM | Columna SQL | Descripción |
|-------------------|-------------|-------------|
| `@PrimaryGeneratedColumn('uuid')` | `id UUID PK` | UUID autogenerado |
| `@Column({ unique: true, nullable: false })` | `email VARCHAR UNIQUE NOT NULL` | Email único |
| `@Column({ nullable: false })` | `password VARCHAR NOT NULL` | Hash bcrypt |
| `@Column()` | `name VARCHAR NOT NULL` | Nombre |
| `@Column({ nullable: true })` | `phone VARCHAR` | Teléfono opcional |
| `@Column({ default: true })` | `is_active BOOLEAN DEFAULT TRUE` | Estado activo |
| `@CreateDateColumn()` | `created_at TIMESTAMP DEFAULT NOW()` | Timestamp automático |
| `@ManyToMany() @JoinTable(...)` | tabla `users_roles` | Relación con roles |

El decorador `@JoinTable` con `name: 'users_roles'` le dice a TypeORM que él es el dueño de la relación y que la tabla intermedia se llama `users_roles`, con columnas `user_id` y `role_id`.

---

#### `dto/assign-roles.dto.ts`

| Campo | Decoradores | Descripción |
|-------|-------------|-------------|
| `roles` | `@IsArray() @IsString({ each: true }) @IsNotEmpty()` | Array de strings con nombres de roles |

---

### Common — Decoradores y Guards

Código compartido sin módulo propio. Se importa directamente donde se necesita.

---

#### `decorators/roles.decorator.ts` — Decorador `@Roles`

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

`SetMetadata` de NestJS adjunta un valor arbitrario como metadata al handler del controlador (o a la clase). El `RolesGuard` luego lee esa metadata con `Reflector` para saber qué roles se requieren.

**Uso:**
```typescript
@Roles('admin')           // adjunta ['admin'] como metadata con clave 'roles'
@UseGuards(RolesGuard)
@Get()
findAll() { ... }

@Roles('admin', 'doctor') // múltiples roles (cualquiera de ellos es suficiente)
@UseGuards(RolesGuard)
@Get(':id')
findOne() { ... }
```

---

#### `guards/roles.guard.ts` — Guard de autorización por roles

Se aplica con `@UseGuards(JwtAuthGuard, RolesGuard)` siempre junto a `JwtAuthGuard`, que debe correr primero para poner `req.user`.

**Flujo de `canActivate(context)`:**

```
1. Lee la metadata 'roles' del handler usando Reflector
   → Si no hay @Roles en la ruta → permite el acceso (return true)

2. Obtiene req.user del contexto HTTP
   → Si no existe o no tiene .roles → ForbiddenException (403)

3. Verifica si ALGUNO de los roles del usuario está en la lista requerida:
   requiredRoles.some(role => user.roles.includes(role))
   → Si ninguno coincide → ForbiddenException (403)
   → Si al menos uno coincide → permite el acceso (return true)
```

---

## Flujo de autenticación y autorización

### Ciclo de vida de una petición protegida

```
HTTP Request
    │
    ├─ ValidationPipe (global)
    │    └─ Valida el body contra el DTO (@IsEmail, @IsString, etc.)
    │         Si falla → 400 Bad Request
    │
    ├─ JwtAuthGuard
    │    └─ Extrae token de "Authorization: Bearer <token>"
    │         Verifica firma y expiración con JwtStrategy
    │         Si falla → 401 Unauthorized
    │         Si OK → pone payload en req.user = { sub, email, roles }
    │
    ├─ RolesGuard (solo en rutas con @Roles)
    │    └─ Lee metadata @Roles('admin')
    │         Compara con req.user.roles
    │         Si no coincide → 403 Forbidden
    │
    └─ Handler del controlador
         └─ Llama al servicio → consulta BD → retorna respuesta
```

### Por qué hay que re-hacer login al cambiar roles

El token JWT se firma **una sola vez** en el momento del login, y los roles quedan grabados dentro del token. Si después asignas nuevos roles a un usuario vía `PATCH /users/:id/roles`, el token viejo sigue teniendo los roles anteriores. El servidor los verifica solo leyendo el token (sin consultar la BD). Para obtener un token con los roles actualizados debes hacer `POST /auth/login` nuevamente.

### Primer flujo completo — Crear y usar un admin

```bash
# 1. Crear usuario
POST /auth/register   { email, password, name }

# 2. Asignar rol admin directamente en la BD
#    (porque no hay admin que pueda usar PATCH /users/:id/roles todavía)
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@test.com' AND r.role_name = 'admin';

# 3. Hacer login → obtener token con roles: ["admin"]
POST /auth/login   { email, password }

# 4. Usar el token para todas las rutas protegidas
GET  /users         Authorization: Bearer <token>
POST /roles         Authorization: Bearer <token>
...
```
