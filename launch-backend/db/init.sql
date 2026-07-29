CREATE DATABASE  IF NOT EXISTS `launch` ;
USE `launch`;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `turma` VARCHAR(80) NOT NULL,
  `username` VARCHAR(80) NOT NULL,
  `password` VARCHAR(120) NOT NULL,
  `is_admin` BOOL NOT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO users (name,turma,username, password, is_admin) VALUES ('fulano de tal silva','3BE','170819', '1234', 0);
INSERT INTO users (name,turma,username, password, is_admin) VALUES ('fulano de tal souza','3AE','170821', '1234', 0);
INSERT INTO users (name,turma,username, password, is_admin) VALUES ('FUCAPI','FUCAPI','170820', '123', 1);


CREATE TABLE `registros` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `type` VARCHAR(30) NOT NULL,
  `hours` INT NOT NULL,
  `certificate` VARCHAR(200),
  `status` VARCHAR(50),
  `created_at` DATETIME,
  `deleted_at` DATETIME,
  `updated_at` DATETIME,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);