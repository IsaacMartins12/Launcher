CREATE DATABASE IF NOT EXISTS `launch`;
USE `launch`;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `turma` VARCHAR(80) NOT NULL,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `is_admin` BOOL NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Senhas em plaintext para seed de desenvolvimento.
-- No primeiro login, o sistema migra automaticamente para bcrypt hash.
INSERT INTO users (name, turma, username, password, is_admin) VALUES
  ('Fulano de Tal Silva', '3BE', '170819', '1234', 0),
  ('Fulano de Tal Souza', '3AE', '170821', '1234', 0),
  ('FUCAPI', 'FUCAPI', '170820', '123', 1);

CREATE TABLE `registros` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `hours` INT NOT NULL,
  `certificate` VARCHAR(200),
  `status` VARCHAR(50) DEFAULT 'Em Análise',
  `rejection_reason` VARCHAR(500),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME,
  `deleted_at` DATETIME,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
