-- Roles iniciales
INSERT INTO roles (role_name, description)
VALUES
    ('admin',  'Administrador del sistema'),
    ('doctor', 'Médico del sistema')
ON CONFLICT (role_name) DO NOTHING;

-- Verificar roles
SELECT id, role_name, description FROM roles;

-- ---------------------------------------------------------------
-- PASO 1: Crear usuarios usando POST /auth/register (desde Postman)
-- Los passwords deben hashearse por la API, no insertar aquí.
-- ---------------------------------------------------------------

-- PASO 2: Ver usuarios creados y copiar sus ids
SELECT id, email, name FROM users;

-- ---------------------------------------------------------------
-- PASO 3: Asignar rol admin al primer usuario
-- Reemplaza el email con el que usaste en el registro
-- ---------------------------------------------------------------
INSERT INTO users_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@test.com'
  AND r.role_name = 'admin'
ON CONFLICT DO NOTHING;

-- PASO 4: Verificar que el usuario tiene el rol asignado
SELECT u.email, u.name, r.role_name
FROM users u
JOIN users_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id;
