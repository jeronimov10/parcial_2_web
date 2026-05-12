# Guía de Pruebas en Postman

## Prerrequisitos
1. PostgreSQL corriendo en `localhost:5433`
2. Base de datos `parcial2_web_nest` creada
3. Ejecutar: `npm run start:dev` dentro de `parcial_2_web/`
4. Ejecutar el script SQL `sql/002_seed_roles_and_test_data.sql` para crear los roles `admin` y `doctor`

---

## Flujo completo de prueba

### PASO 1 — Registrar un usuario

**POST** `http://localhost:3000/auth/register`

Headers: `Content-Type: application/json`

Body:
```json
{
  "email": "admin@test.com",
  "password": "Admin123!",
  "name": "Admin Usuario"
}
```

Respuesta esperada `201`:
```json
{ "message": "Usuario registrado con éxito", "userId": "<uuid>" }
```

---

### PASO 2 — Asignar rol admin por SQL

Como el primer usuario no tiene rol todavía, asigna `admin` directamente en la base de datos:

```sql
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@test.com'
  AND r.role_name = 'admin'
ON CONFLICT DO NOTHING;
```

> **Importante:** Si asignas roles después de haber hecho login, debes hacer login de nuevo. El token viejo NO se actualiza solo.

---

### PASO 3 — Hacer login

**POST** `http://localhost:3000/auth/login`

Body:
```json
{
  "email": "admin@test.com",
  "password": "Admin123!"
}
```

Respuesta esperada `200`:
```json
{ "access_token": "<jwt>" }
```

Copia el `access_token`. Expira en **120 segundos**.

---

### PASO 4 — Configurar Authorization en Postman

En la pestaña **Authorization** de cada request protegido:
- Type: `Bearer Token`
- Token: pega el `access_token`

O en la pestaña **Headers**:
- Key: `Authorization`
- Value: `Bearer <token>`

---

### PASO 5 — Obtener perfil propio

**GET** `http://localhost:3000/users/me`

Headers: `Authorization: Bearer <token>`

Respuesta esperada `200`:
```json
{
  "id": "<uuid>",
  "email": "admin@test.com",
  "name": "Admin Usuario",
  "phone": null,
  "roles": ["admin"]
}
```

---

### PASO 6 — Listar usuarios (solo admin)

**GET** `http://localhost:3000/users`

Headers: `Authorization: Bearer <token>`

Respuesta esperada `200`:
```json
[
  {
    "id": "<uuid>",
    "email": "admin@test.com",
    "name": "Admin Usuario",
    "roles": ["admin"]
  }
]
```

---

### PASO 7 — Crear un rol (solo admin)

**POST** `http://localhost:3000/roles`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{
  "role_name": "enfermero",
  "description": "Enfermero del sistema"
}
```

Respuesta esperada `201`:
```json
{ "message": "Rol creado con éxito", "roleId": "<uuid>" }
```

---

### PASO 8 — Listar roles (solo admin)

**GET** `http://localhost:3000/roles`

Headers: `Authorization: Bearer <token>`

Respuesta esperada `200`:
```json
[
  { "id": "<uuid>", "role_name": "admin", "description": "Administrador del sistema" },
  { "id": "<uuid>", "role_name": "doctor", "description": "Médico del sistema" }
]
```

---

### PASO 9 — Registrar un segundo usuario

**POST** `http://localhost:3000/auth/register`

Body:
```json
{
  "email": "doctor@test.com",
  "password": "Doctor123!",
  "name": "Doctor Prueba"
}
```

---

### PASO 10 — Asignar roles a un usuario (solo admin)

**PATCH** `http://localhost:3000/users/<userId>/roles`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

Body:
```json
{
  "roles": ["doctor"]
}
```

Respuesta esperada `200`:
```json
{ "message": "Roles asignados" }
```

> Usa el `userId` obtenido en el registro o consulta en la BD.

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Unauthorized` | Token faltante, inválido o expirado | Haz login nuevamente (el token dura 120s) |
| `403 Forbidden` | Tu usuario no tiene rol `admin` | Asigna rol admin vía SQL y vuelve a hacer login |
| `423 Locked` | Usuario con `is_active = false` | Cambiar manualmente en la BD |
| `409 Conflict` | Email o role_name ya existe | Usar otro email o rol |
| `400 Bad Request` | Campos inválidos o faltantes | Revisar el body del request |

---

## Nota sobre expiración del token

El token JWT expira en **120 segundos** (`JWT_EXPIRES_IN=120s`). Si recibes un `401` inesperado, simplemente vuelve a hacer `POST /auth/login` para obtener un nuevo token.
