# Checklist Preparcial — Sistema de Usuarios y Roles

## Modelos

| Requisito | Archivo | Estado | Observación |
|-----------|---------|--------|-------------|
| Tabla `users` con id (uuid PK) | `src/user/user.entity.ts` | ✅ Cumplido | `@PrimaryGeneratedColumn('uuid')` |
| Campo `email` único, not null | `src/user/user.entity.ts` | ✅ Cumplido | `unique: true, nullable: false` |
| Campo `password` hash, not null | `src/user/user.entity.ts` + `auth.service.ts` | ✅ Cumplido | bcryptjs con salt 10 |
| Campo `name` string | `src/user/user.entity.ts` | ✅ Cumplido | `@Column varchar` |
| Campo `phone` opcional | `src/user/user.entity.ts` | ✅ Cumplido | `nullable: true` |
| Campo `is_active` boolean default true | `src/user/user.entity.ts` | ✅ Cumplido | `default: true` |
| Campo `created_at` timestamp default now | `src/user/user.entity.ts` | ✅ Cumplido | `@CreateDateColumn` |
| Tabla `roles` con id (uuid PK) | `src/roles/roles.entity.ts` | ✅ Cumplido | `@PrimaryGeneratedColumn('uuid')` |
| Campo `role_name` único | `src/roles/roles.entity.ts` | ✅ Cumplido | `unique: true` |
| Campo `description` opcional | `src/roles/roles.entity.ts` | ✅ Cumplido | `nullable: true` |
| Campo `created_at` en roles | `src/roles/roles.entity.ts` | ✅ Cumplido | `@CreateDateColumn` |
| Relación muchos a muchos `users_roles` | `src/user/user.entity.ts` | ✅ Cumplido | `@ManyToMany` + `@JoinTable(name: 'users_roles')` |

---

## Endpoints

| Requisito | Archivo | Estado | Observación |
|-----------|---------|--------|-------------|
| `POST /auth/register` — público, 201 | `src/auth/auth.controller.ts` + `auth.service.ts` | ✅ Cumplido | Sin guard |
| Register: 400 "Email inválido" | `src/auth/dto/register.dto.ts` | ✅ Cumplido | `@IsEmail()` |
| Register: 409 "Email ya registrado" | `src/auth/auth.service.ts` | ✅ Cumplido | `ConflictException` |
| `POST /auth/login` — público, 200 | `src/auth/auth.controller.ts` + `auth.service.ts` | ✅ Cumplido | Sin guard |
| Login: 401 "Credenciales incorrectas" | `src/auth/auth.service.ts` | ✅ Cumplido | `UnauthorizedException` |
| Login: 423 "Usuario desactivado" | `src/auth/auth.service.ts` | ✅ Cumplido | `HttpException(423)` |
| `POST /roles` — solo admin, 201 | `src/roles/roles.controller.ts` | ✅ Cumplido | `JwtAuthGuard + RolesGuard + @Roles('admin')` |
| Roles: 409 "role_name ya existe" | `src/roles/roles.service.ts` | ✅ Cumplido | `ConflictException` |
| `GET /roles` — solo admin, 200 | `src/roles/roles.controller.ts` | ✅ Cumplido | `JwtAuthGuard + RolesGuard + @Roles('admin')` |
| Roles: 500 "Error al obtener roles" | `src/roles/roles.service.ts` | ✅ Cumplido | `InternalServerErrorException` |
| `PATCH /users/:id/roles` — solo admin | `src/user/user.controller.ts` | ✅ Cumplido | `JwtAuthGuard + RolesGuard + @Roles('admin')` |
| AssignRoles: 400 "roles inválidos" | `src/user/user.service.ts` | ✅ Cumplido | Compara cantidad de roles encontrados |
| AssignRoles: 404 "Usuario no encontrado" | `src/user/user.service.ts` | ✅ Cumplido | `NotFoundException` |
| `GET /users/me` — autenticado | `src/user/user.controller.ts` | ✅ Cumplido | `JwtAuthGuard`, usa `req.user.sub` |
| `GET /users` — solo admin | `src/user/user.controller.ts` | ✅ Cumplido | `JwtAuthGuard + RolesGuard + @Roles('admin')` |
| Users: 500 "Error al listar usuarios" | `src/user/user.service.ts` | ✅ Cumplido | `InternalServerErrorException` |

---

## Requerimientos Técnicos

| Requisito | Archivo | Estado | Observación |
|-----------|---------|--------|-------------|
| Passport con `passport-jwt` | `src/auth/jwt.strategy.ts` | ✅ Cumplido | `PassportStrategy(Strategy)` |
| Hash con `bcryptjs` | `src/auth/auth.service.ts` | ✅ Cumplido | `bcrypt.hash(password, 10)` |
| `JWT_SECRET` en variables de entorno | `src/auth/auth.module.ts` + `jwt.strategy.ts` | ✅ Cumplido | `process.env.JWT_SECRET \|\| 'secret_temporal'` |
| `JWT_EXPIRES_IN = '120s'` | `src/auth/auth.module.ts` | ✅ Cumplido | Hardcoded `'120s'` según enunciado |
| Token en `Authorization: Bearer` | `src/auth/jwt.strategy.ts` | ✅ Cumplido | `ExtractJwt.fromAuthHeaderAsBearerToken()` |
| Decorador `@Roles(...roles)` | `src/common/decorators/roles.decorator.ts` | ✅ Cumplido | `SetMetadata(ROLES_KEY, roles)` |
| `RolesGuard` con 403 | `src/common/guards/roles.guard.ts` | ✅ Cumplido | `ForbiddenException('No autorizado')` |
| JWT payload: `sub`, `email`, `roles` | `src/auth/auth.service.ts` | ✅ Cumplido | Incluye `roles.map(r => r.role_name)` |
| `JwtStrategy.validate()` retorna user | `src/auth/jwt.strategy.ts` | ✅ Cumplido | Retorna `{ sub, email, roles }` |
| TypeORM con PostgreSQL | `src/app.module.ts` | ✅ Cumplido | `TypeOrmModule.forRoot(...)` |
| Variables de entorno para DB | `src/app.module.ts` | ✅ Cumplido | `process.env.DB_*` con fallbacks |
| `.env` cargado al inicio | `src/main.ts` | ✅ Cumplido | `import 'dotenv/config'` |
| Validación con `class-validator` + DTOs | `src/auth/dto/`, `src/roles/dto/`, `src/user/dto/` | ✅ Cumplido | `ValidationPipe` global en `main.ts` |
| Nunca devolver `password` | `src/user/user.service.ts`, `src/auth/auth.service.ts` | ✅ Cumplido | Respuestas excluyen el campo `password` |

---

## Entregables

| Entregable | Archivo | Estado |
|-----------|---------|--------|
| Migraciones SQL | `sql/001_create_users_roles_schema.sql` | ✅ Creado |
| Script SQL de seed y prueba | `sql/002_seed_roles_and_test_data.sql` | ✅ Creado |
| Guía de pruebas Postman | `TESTING_GUIDE.md` | ✅ Creado |
| Release en GitHub | — | ⏳ Pendiente manual |

---

## Pendiente manual

- [ ] Crear release en GitHub antes del **14 de mayo de 2026 a las 5 PM**
  1. `git add -A && git commit -m "feat: complete preparcial entregables"`
  2. `git push origin main`
  3. En GitHub: `Releases > Create a new release > Tag: v1.0.0`
