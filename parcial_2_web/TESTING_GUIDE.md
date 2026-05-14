# Guía de pruebas

## Antes de empezar

1. PostgreSQL corriendo (este proyecto usa puerto 5433 por defecto)
2. Base de datos creada: `CREATE DATABASE parcial2_web_nest;`
3. App corriendo: `npm run start:dev` dentro de `parcial_2_web/`
4. Ejecutar en tu cliente SQL (DBeaver, pgAdmin, psql): `sql/001_create_users_roles_schema.sql`
5. Ejecutar: `sql/002_seed_roles_and_test_data.sql` (crea roles admin y doctor)

El token expira en **120 segundos**. Si recibes 401, vuelve a hacer login.

---

## Paso 1 — Registrar usuario admin

```
POST http://localhost:3000/auth/register
Content-Type: application/json
```
```json
{
  "email": "admin@test.com",
  "password": "Admin123!",
  "name": "Admin"
}
```
Guarda el `userId` de la respuesta.

---

## Paso 2 — Asignar rol admin por SQL

Abre tu cliente SQL y ejecuta (cambia el email si usaste otro):

```sql
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@test.com'
  AND r.role_name = 'admin'
ON CONFLICT DO NOTHING;
```

Verifica:
```sql
SELECT u.email, r.role_name FROM users u
JOIN users_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id;
```

---

## Paso 3 — Login

```
POST http://localhost:3000/auth/login
Content-Type: application/json
```
```json
{
  "email": "admin@test.com",
  "password": "Admin123!"
}
```
Copia el `access_token` de la respuesta.

---

## Paso 4 — Configurar el token en Postman

En cada request protegido, pestaña **Headers**:
```
Authorization: Bearer <pega el token aquí>
```

---

## Paso 5 — GET /users/me

```
GET http://localhost:3000/users/me
Authorization: Bearer <token>
```
Respuesta esperada:
```json
{ "id": "...", "email": "admin@test.com", "name": "Admin", "phone": null, "roles": ["admin"] }
```

---

## Paso 6 — GET /users

```
GET http://localhost:3000/users
Authorization: Bearer <token>
```
Respuesta esperada: array con todos los usuarios y sus roles.

---

## Paso 7 — GET /roles

```
GET http://localhost:3000/roles
Authorization: Bearer <token>
```
Respuesta esperada: `[{ "id": "...", "role_name": "admin", "description": "..." }, ...]`

---

## Paso 8 — POST /roles (crear rol nuevo)

```
POST http://localhost:3000/roles
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{ "role_name": "enfermero", "description": "Enfermero del sistema" }
```
Respuesta esperada: `{ "message": "Rol creado con éxito", "roleId": "..." }`

---

## Paso 9 — Registrar segundo usuario

```
POST http://localhost:3000/auth/register
Content-Type: application/json
```
```json
{ "email": "doctor@test.com", "password": "Doctor123!", "name": "Doctor" }
```
Guarda el `userId` de la respuesta.

---

## Paso 10 — PATCH /users/:id/roles (asignar roles)

Reemplaza `:id` con el `userId` del doctor:
```
PATCH http://localhost:3000/users/<userId>/roles
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{ "roles": ["doctor"] }
```
Respuesta esperada: `{ "message": "Roles asignados" }`

> Si asignas roles a tu propio usuario admin, haz login de nuevo para que el token refleje los cambios.

---

## Paso 11 — POST /users/me/profile (crear perfil)

```
POST http://localhost:3000/users/me/profile
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{ "bio": "Médico general", "address": "Calle 123", "birth_date": "1990-05-15" }
```
Respuesta esperada: `{ "message": "Perfil creado con éxito", "profileId": "..." }`

---

## Paso 12 — GET /users/me/profile

```
GET http://localhost:3000/users/me/profile
Authorization: Bearer <token>
```

---

## Paso 13 — PATCH /users/me/profile (actualizar campos sueltos)

```
PATCH http://localhost:3000/users/me/profile
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{ "bio": "Especialista en cardiología" }
```

---

## Paso 14 — PUT /users/me/profile (reemplazar perfil completo)

```
PUT http://localhost:3000/users/me/profile
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{ "bio": "Nuevo bio", "address": "Nueva dirección", "birthdate": "1985-03-20" }
```

---

## Paso 15 — DELETE /users/me/profile

```
DELETE http://localhost:3000/users/me/profile
Authorization: Bearer <token>
```

---

## Tabla de errores

| Código | Causa | Solución |
|--------|-------|----------|
| 400 | Body inválido o campo faltante | Revisar el JSON enviado |
| 401 | Token faltante, expirado o mal escrito | Hacer login de nuevo |
| 403 | Token válido pero sin rol admin | Asignar rol admin vía SQL y re-login |
| 404 | Recurso no encontrado | Verificar el id o que el recurso exista |
| 409 | Email o role_name duplicado | Usar valores únicos |
| 423 | Usuario con is_active = false | Activar manualmente en la BD |
