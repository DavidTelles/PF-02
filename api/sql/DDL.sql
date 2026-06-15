-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema septem
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `septem`;

CREATE SCHEMA IF NOT EXISTS `septem` DEFAULT CHARACTER SET utf8;
USE `septem`;

-- -----------------------------------------------------
-- Table `septem`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `septem`.`users`;

CREATE TABLE IF NOT EXISTS `septem`.`users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `septem`.`teams`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `septem`.`teams`;

CREATE TABLE IF NOT EXISTS `septem`.`teams` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `country` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `septem`.`runners`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `septem`.`runners`;

CREATE TABLE IF NOT EXISTS `septem`.`runners` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `team` INT NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_runners_teams_idx` (`team` ASC),
    CONSTRAINT `fk_runners_teams`
        FOREIGN KEY (`team`)
        REFERENCES `septem`.`teams` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `septem`.`laps`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `septem`.`laps`;

CREATE TABLE IF NOT EXISTS `septem`.`laps` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `time` DECIMAL(10,2) NOT NULL,
    `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `runners_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_laps_runners_idx` (`runners_id` ASC),
    CONSTRAINT `fk_laps_runners`
        FOREIGN KEY (`runners_id`)
        REFERENCES `septem`.`runners` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;