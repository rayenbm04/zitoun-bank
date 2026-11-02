-- Base de données Zitoun Bank
-- À exécuter une seule fois (phpMyAdmin > Importer, ou en ligne de commande MySQL)

CREATE DATABASE IF NOT EXISTS zitoun_bank
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE zitoun_bank;

-- Comptes des utilisateurs (agriculteurs)
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom           VARCHAR(80)  NOT NULL,
  prenom        VARCHAR(80)  NOT NULL,
  email         VARCHAR(160) NOT NULL,
  telephone     VARCHAR(20)  NULL,
  region        VARCHAR(80)  NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;
