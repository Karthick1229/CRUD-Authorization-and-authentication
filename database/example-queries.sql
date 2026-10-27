-- Flyway creates users from backend/src/main/resources/db/migration.
-- Register accounts through the API so their passwords are always encoded.
-- INSERT example shape only: never replace <BCrypt hash> with a plaintext password.
-- INSERT INTO users (full_name, email, password, role, active, created_at, updated_at)
-- VALUES ('Example User', 'example@example.com', '<BCrypt hash>', 'USER', TRUE, NOW(6), NOW(6));
SELECT id,
    full_name,
    email,
    role,
    active,
    created_at
FROM users
WHERE id = 1;
SELECT id,
    full_name,
    email,
    role
FROM users
WHERE active = TRUE
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
SELECT role,
    COUNT(*) AS account_count
FROM users
GROUP BY role
ORDER BY account_count DESC;
SELECT role,
    COUNT(*) AS active_count
FROM users
WHERE active = TRUE
GROUP BY role;
UPDATE users
SET active = FALSE,
    updated_at = NOW(6)
WHERE id = 1;
DELETE FROM users
WHERE id = 1;
-- A single role column needs no role join table; this is a self-join report example.
SELECT administrator.email AS admin_email,
    member.email AS member_email
FROM users administrator
    JOIN users member ON member.id <> administrator.id
WHERE administrator.role = 'ADMIN';