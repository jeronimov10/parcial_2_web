-- =============================================================
-- SEED 002: Roles iniciales y datos de prueba
-- =============================================================


-- 1. Insertar roles iniciales (sin duplicar si ya existen)
INSERT INTO roles (role_name, description)
VALUES
    ('admin',  'Administrador del sistema'),
    ('doctor', 'Médico del sistema')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Verificar roles insertados
SELECT id, role_name, description, created_at FROM roles;

-- =============================================================
-- PASOS MANUALES (ejecutar desde Postman/curl, no desde SQL)
-- =============================================================

-- PASO A: Crear un usuario administrador vía API:
--   POST http://localhost:3000/auth/register
--   Body: { "email": "admin@test.com", "password": "Admin123!", "name": "Admin" }

-- PASO B: Obtener el id del usuario recién creado:
-- SELECT id, email FROM users WHERE email = 'admin@test.com';

-- =============================================================
-- ASIGNAR ROL admin A UN USUARIO
-- (Reemplazar los valores de email con el real)
-- =============================================================

-- 3. Asignar rol 'admin' al usuario (reemplaza el email si es necesario)
-- INSERT INTO users_roles (user_id, role_id)
-- SELECT u.id, r.id
-- FROM users u
-- CROSS JOIN roles r
-- WHERE u.email = 'admin@test.com'
--   AND r.role_name = 'admin'
-- ON CONFLICT DO NOTHING;

-- 4. Asignar rol 'doctor' a otro usuario de prueba
-- INSERT INTO users_roles (user_id, role_id)
-- SELECT u.id, r.id
-- FROM users u
-- CROSS JOIN roles r
-- WHERE u.email = 'doctor@test.com'
--   AND r.role_name = 'doctor'
-- ON CONFLICT DO NOTHING;

-- =============================================================
-- CONSULTA FINAL: Verificar usuarios con sus roles
-- =============================================================

-- 5. Ver todos los usuarios con sus roles asignados
SELECT
    u.id,
    u.email,
    u.name,
    u.is_active,
    STRING_AGG(r.role_name, ', ') AS roles
FROM users u
LEFT JOIN users_roles ur ON ur.user_id = u.id
LEFT JOIN roles r         ON r.id = ur.role_id
GROUP BY u.id, u.email, u.name, u.is_active
ORDER BY u.created_at;
