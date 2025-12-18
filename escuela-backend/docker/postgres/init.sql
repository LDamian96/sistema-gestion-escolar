-- Inicialización de PostgreSQL para Sistema de Gestión Escolar
-- Este script se ejecuta automáticamente al crear el contenedor

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para búsquedas de texto
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Para búsquedas sin acentos

-- Configuraciones de rendimiento para desarrollo
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos escuela_db inicializada correctamente';
    RAISE NOTICE 'Extensiones instaladas: uuid-ossp, pg_trgm, unaccent';
END $$;
