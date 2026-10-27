CREATE DATABASE securegate CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'securegate' @'localhost' IDENTIFIED BY 'replace-with-a-local-password';
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE,
    CREATE,
    ALTER,
    INDEX,
    REFERENCES ON securegate.* TO 'securegate' @'localhost';
FLUSH PRIVILEGES;