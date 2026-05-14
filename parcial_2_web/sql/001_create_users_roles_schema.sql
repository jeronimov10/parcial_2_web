CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR   UNIQUE NOT NULL,
    password   VARCHAR   NOT NULL,
    name       VARCHAR   NOT NULL,
    phone      VARCHAR,
    is_active  BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name   VARCHAR   UNIQUE NOT NULL,
    description VARCHAR,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS profiles (
    id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    bio        VARCHAR,
    address    VARCHAR,
    birthdate  DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id    UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
);
