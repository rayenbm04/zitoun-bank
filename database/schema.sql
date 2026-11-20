CREATE DATABASE IF NOT EXISTS zitoun_bank
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE zitoun_bank;

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

CREATE TABLE IF NOT EXISTS parcelles (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  nom           VARCHAR(80)  NOT NULL,
  region        VARCHAR(40)  NOT NULL,
  superficie_ha DECIMAL(8,2) NOT NULL,
  variete       VARCHAR(40)  NOT NULL,
  nb_oliviers   INT UNSIGNED NOT NULL,
  etat          VARCHAR(20)  NOT NULL DEFAULT 'Bon',
  PRIMARY KEY (id),
  KEY idx_parcelles_user (user_id),
  CONSTRAINT fk_parcelles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recoltes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  parcelle_id INT UNSIGNED NULL,
  date        DATE         NOT NULL,
  quantite_kg INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_recoltes_user (user_id),
  CONSTRAINT fk_recoltes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_recoltes_parcelle FOREIGN KEY (parcelle_id) REFERENCES parcelles (id) ON DELETE SET NULL
) ENGINE=InnoDB;
