CREATE DATABASE IF NOT EXISTS `launch` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `launch`;
SET NAMES utf8mb4;

CREATE TABLE `institutions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(60) NOT NULL UNIQUE,
  `goal_hours` INT NOT NULL DEFAULT 200,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `institution_id` INT NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `turma` VARCHAR(80) NOT NULL,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `is_admin` BOOL NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
  INDEX `idx_username` (`username`),
  INDEX `idx_institution` (`institution_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `institution_id` INT NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `max_hours` INT NOT NULL,
  `weight` FLOAT NOT NULL DEFAULT 1.0,
  `description` VARCHAR(200),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_institution_category` (`institution_id`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `registros` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `category_id` INT,
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
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON SET NULL,
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `message` VARCHAR(300) NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT 'info',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `registro_id` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: instituição padrão para desenvolvimento
INSERT INTO institutions (name, slug, goal_hours) VALUES
  ('FUCAPI', 'fucapi', 200);

-- Senhas em plaintext para seed de desenvolvimento.
-- No primeiro login, o sistema migra automaticamente para bcrypt hash.
INSERT INTO users (institution_id, name, turma, username, password, is_admin) VALUES
  (1, 'Fulano de Tal Silva', '3BE', '170819', '1234', 0),
  (1, 'Fulano de Tal Souza', '3AE', '170821', '1234', 0),
  (1, 'FUCAPI Admin', 'FUCAPI', '170820', '123', 1);

-- Categorias padrão da instituição FUCAPI
INSERT INTO categories (institution_id, name, max_hours, weight, description) VALUES
  (1, 'Curso', 80, 1.0, 'Cursos livres, online ou presenciais'),
  (1, 'Palestra', 40, 0.8, 'Participação como ouvinte em palestras'),
  (1, 'Workshop', 60, 1.0, 'Oficinas práticas e workshops'),
  (1, 'Evento', 40, 0.8, 'Participação em eventos acadêmicos'),
  (1, 'Monitoria', 100, 1.5, 'Atuação como monitor em disciplinas'),
  (1, 'Projeto de Extensão', 120, 1.5, 'Participação em projetos de extensão'),
  (1, 'Voluntariado', 60, 1.2, 'Atividades voluntárias comprovadas');
