-- ================================================================
-- SEPTEM RACING — DDL Completo v2.0
-- Sistema de Gestão de Campeonato Automobilístico
-- ================================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

DROP SCHEMA IF EXISTS `septem`;
CREATE SCHEMA IF NOT EXISTS `septem` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `septem`;

-- ================================================================
-- Tabela: users
-- ================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `email`      VARCHAR(255) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- Tabela: teams
-- ================================================================
CREATE TABLE IF NOT EXISTS `teams` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `country`    VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_teams_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- Tabela: runners (pilotos)
-- ================================================================
CREATE TABLE IF NOT EXISTS `runners` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(255)  NOT NULL,
  `nationality`     VARCHAR(100)  NOT NULL DEFAULT '',
  `birth_date`      DATE          NULL,
  `car_number`      INT           NULL,
  `team`            INT           NOT NULL,
  `photo_url`       VARCHAR(500)  NULL,
  `weight_kg`       DECIMAL(5,2)  NULL,
  `height_cm`       DECIMAL(5,1)  NULL,
  `category`        VARCHAR(100)  NOT NULL DEFAULT '',
  `wins`            INT           NOT NULL DEFAULT 0,
  `podiums`         INT           NOT NULL DEFAULT 0,
  `poles`           INT           NOT NULL DEFAULT 0,
  `best_lap`        VARCHAR(20)   NULL COMMENT 'e.g. 1:23.456',
  `points`          INT           NOT NULL DEFAULT 0,
  `seasons`         INT           NOT NULL DEFAULT 0,
  `status`          ENUM('Ativo','Inativo','Aposentado') NOT NULL DEFAULT 'Ativo',
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_runners_team`   (`team`),
  INDEX `idx_runners_status` (`status`),
  INDEX `idx_runners_points` (`points` DESC),
  CONSTRAINT `fk_runners_teams`
    FOREIGN KEY (`team`) REFERENCES `teams` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- Tabela: tracks (pistas)
-- ================================================================
CREATE TABLE IF NOT EXISTS `tracks` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `country`    VARCHAR(100) NOT NULL,
  `laps`       INT          NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_tracks_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- Tabela: races (corridas)
-- ================================================================
CREATE TABLE IF NOT EXISTS `races` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `track_id`   INT          NOT NULL,
  `race_date`  DATE         NOT NULL,
  `weather`    VARCHAR(100) NOT NULL DEFAULT 'Seco',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_races_track`    (`track_id`),
  INDEX `idx_races_date`     (`race_date`),
  CONSTRAINT `fk_races_tracks`
    FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- Tabela: race_times (tempos por corrida/piloto)
-- ================================================================
CREATE TABLE IF NOT EXISTS `race_times` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `race_id`         INT           NOT NULL,
  `runner_id`       INT           NOT NULL,
  `best_lap_time`   VARCHAR(20)   NOT NULL COMMENT '1:23.456',
  `avg_lap_time`    VARCHAR(20)   NULL,
  `total_race_time` VARCHAR(30)   NULL,
  `position`        INT           NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_rt_race`   (`race_id`),
  INDEX `idx_rt_runner` (`runner_id`),
  UNIQUE INDEX `uq_rt_race_runner` (`race_id`, `runner_id`),
  CONSTRAINT `fk_rt_races`
    FOREIGN KEY (`race_id`)   REFERENCES `races`   (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rt_runners`
    FOREIGN KEY (`runner_id`) REFERENCES `runners` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- Tabela: laps (voltas avulsas — mantida para compatibilidade)
-- ================================================================
CREATE TABLE IF NOT EXISTS `laps` (
  `id`         INT           NOT NULL AUTO_INCREMENT,
  `time`       DECIMAL(10,3) NOT NULL,
  `date`       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `runners_id` INT           NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_laps_runners_idx` (`runners_id`),
  CONSTRAINT `fk_laps_runners`
    FOREIGN KEY (`runners_id`) REFERENCES `runners` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- Tabela: statistics (snapshot de estatísticas)
-- ================================================================
CREATE TABLE IF NOT EXISTS `statistics` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `runner_id`     INT           NOT NULL,
  `total_races`   INT           NOT NULL DEFAULT 0,
  `avg_lap_global` DECIMAL(8,3) NULL COMMENT 'Média global em segundos',
  `best_lap_global` DECIMAL(8,3) NULL,
  `ranking_pos`   INT           NULL,
  `updated_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_stats_runner` (`runner_id`),
  CONSTRAINT `fk_stats_runners`
    FOREIGN KEY (`runner_id`) REFERENCES `runners` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- Seed: 8 Pistas padrão
-- ================================================================
INSERT INTO `tracks` (`name`, `country`, `laps`) VALUES
  ('Autódromo de Interlagos',   'Brasil',         71),
  ('Monza',                      'Itália',         53),
  ('Silverstone',                'Reino Unido',    52),
  ('Suzuka',                     'Japão',          53),
  ('Circuit de Monaco',          'Mônaco',         78),
  ('Circuit de Barcelona-Catalunya', 'Espanha',    66),
  ('Circuit Gilles Villeneuve', 'Canadá',          70),
  ('Red Bull Ring',              'Áustria',        71);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
