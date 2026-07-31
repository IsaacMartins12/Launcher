CREATE DATABASE IF NOT EXISTS `launch` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `launch`;
SET NAMES utf8mb4;

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
  ('Maria Clara Santos', '3AE', '170819', '1234', 0),
  ('João Pedro Oliveira', '3BE', '170821', '1234', 0),
  ('Ana Beatriz Lima', '2AE', '170822', '1234', 0),
  ('Prof. Carlos Diretor', 'Coordenação', '170820', '123', 1);

CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `max_hours` INT NOT NULL,
  `weight` FLOAT NOT NULL DEFAULT 1.0,
  `description` VARCHAR(200),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categorias padrão de exemplo
INSERT INTO categories (name, max_hours, weight, description) VALUES
  ('Curso', 80, 1.0, 'Cursos livres, online ou presenciais'),
  ('Palestra', 40, 0.8, 'Participação como ouvinte em palestras'),
  ('Workshop', 60, 1.0, 'Oficinas práticas e workshops'),
  ('Evento', 40, 0.8, 'Participação em eventos acadêmicos'),
  ('Monitoria', 100, 1.5, 'Atuação como monitor em disciplinas'),
  ('Projeto de Extensão', 120, 1.5, 'Participação em projetos de extensão'),
  ('Voluntariado', 60, 1.2, 'Atividades voluntárias comprovadas');

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

-- Seed data for screenshots / demo
INSERT INTO registros (user_id, category_id, title, type, hours, certificate, status, rejection_reason, created_at) VALUES
  (1, 1, 'Curso de Python Avançado', 'Curso', 40, 'certificado-python.pdf', 'Aprovado', NULL, '2026-06-15 10:30:00'),
  (1, 3, 'Workshop Docker & Kubernetes', 'Workshop', 16, 'cert-docker.pdf', 'Aprovado', NULL, '2026-06-20 14:00:00'),
  (1, 2, 'Palestra IA Generativa', 'Palestra', 4, 'palestra-ia.pdf', 'Em Análise', NULL, '2026-07-28 09:15:00'),
  (1, 5, 'Monitoria de Algoritmos', 'Monitoria', 60, 'declaracao-monitoria.pdf', 'Aprovado', NULL, '2026-05-10 08:00:00'),
  (1, 4, 'Semana de Tecnologia FUCAPI', 'Evento', 20, 'evento-semtec.pdf', 'Rejeitado', 'Certificado sem carga horária especificada', '2026-07-01 11:00:00'),
  (2, 1, 'Curso de Java Spring Boot', 'Curso', 30, 'cert-java.pdf', 'Em Análise', NULL, '2026-07-29 16:00:00'),
  (2, 6, 'Projeto Horta Comunitária', 'Projeto de Extensão', 80, 'extensao-horta.pdf', 'Aprovado', NULL, '2026-04-20 10:00:00'),
  (2, 7, 'Voluntariado Hospital', 'Voluntariado', 24, 'voluntariado.pdf', 'Em Análise', NULL, '2026-07-30 08:30:00'),
  (3, 1, 'Curso React e TypeScript', 'Curso', 20, 'cert-react.pdf', 'Aprovado', NULL, '2026-07-10 13:00:00'),
  (3, 2, 'Palestra Segurança Web', 'Palestra', 3, 'palestra-sec.pdf', 'Em Análise', NULL, '2026-07-31 09:00:00');

INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES
  (4, 'Maria Clara Santos enviou 1 atividade(s) para análise.', 'info', 0, '2026-07-28 09:15:00'),
  (4, 'João Pedro Oliveira enviou 2 atividade(s) para análise.', 'info', 0, '2026-07-30 08:30:00'),
  (4, 'Ana Beatriz Lima enviou 1 atividade(s) para análise.', 'info', 0, '2026-07-31 09:00:00'),
  (1, 'Sua atividade ''Curso de Python Avançado'' foi aprovada!', 'success', 1, '2026-06-16 14:00:00'),
  (1, 'Sua atividade ''Semana de Tecnologia FUCAPI'' foi rejeitada. Motivo: Certificado sem carga horária especificada', 'error', 0, '2026-07-05 10:00:00'),
  (1, 'Sua atividade ''Workshop Docker & Kubernetes'' foi aprovada!', 'success', 1, '2026-06-22 11:00:00'),
  (1, 'Sua atividade ''Monitoria de Algoritmos'' foi aprovada!', 'success', 1, '2026-05-12 09:00:00');
