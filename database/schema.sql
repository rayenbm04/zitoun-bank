SET NAMES utf8mb4;

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

CREATE TABLE IF NOT EXISTS pressages (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id   INT UNSIGNED NOT NULL,
  date      DATE         NOT NULL,
  moulin    VARCHAR(100) NOT NULL,
  olives_kg INT UNSIGNED NOT NULL,
  huile_l   DECIMAL(9,1) NOT NULL,
  qualite   VARCHAR(20)  NOT NULL,
  PRIMARY KEY (id),
  KEY idx_pressages_user (user_id),
  CONSTRAINT fk_pressages_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS offres (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  acheteur       VARCHAR(100) NOT NULL,
  type           VARCHAR(20)  NOT NULL,
  region         VARCHAR(40)  NOT NULL,
  qualite        VARCHAR(20)  NOT NULL,
  prix_par_l     DECIMAL(6,2) NOT NULL,
  quantite_max_l INT UNSIGNED NOT NULL,
  date           DATE         NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO offres (acheteur, type, region, qualite, prix_par_l, quantite_max_l, date)
SELECT * FROM (
  SELECT 'Med Olive Export' AS acheteur, 'Exportateur' AS type, 'Sousse' AS region, 'Extra vierge' AS qualite, 14.20 AS prix_par_l, 1000 AS quantite_max_l, CURDATE() AS date
  UNION ALL SELECT 'Monastir Oils', 'Exportateur', 'Monastir', 'Extra vierge', 13.90, 800, CURDATE() - INTERVAL 1 DAY
  UNION ALL SELECT 'Coopérative Ennour', 'Coopérative', 'Sfax', 'Extra vierge', 13.40, 600, CURDATE()
  UNION ALL SELECT 'Huilerie El Amal', 'Moulin', 'Sfax', 'Vierge', 11.10, 300, CURDATE() - INTERVAL 2 DAY
  UNION ALL SELECT 'SMSA El Baraka', 'Coopérative', 'Mahdia', 'Vierge', 10.80, 500, CURDATE() - INTERVAL 1 DAY
  UNION ALL SELECT 'Grossiste Kairouan', 'Grossiste', 'Kairouan', 'Ordinaire', 7.60, 2000, CURDATE() - INTERVAL 3 DAY
) AS depart
WHERE NOT EXISTS (SELECT 1 FROM offres);

CREATE TABLE IF NOT EXISTS ventes (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  date       DATE         NOT NULL,
  acheteur   VARCHAR(100) NOT NULL,
  qualite    VARCHAR(20)  NOT NULL,
  quantite_l DECIMAL(9,1) NOT NULL,
  prix_par_l DECIMAL(6,2) NOT NULL,
  statut     VARCHAR(20)  NOT NULL DEFAULT 'En attente',
  PRIMARY KEY (id),
  KEY idx_ventes_user (user_id),
  CONSTRAINT fk_ventes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS taches (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  parcelle_id INT UNSIGNED NULL,
  date        DATE         NOT NULL,
  type        VARCHAR(20)  NOT NULL,
  note        VARCHAR(80)  NOT NULL DEFAULT '',
  faite       TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_taches_user (user_id),
  CONSTRAINT fk_taches_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_taches_parcelle FOREIGN KEY (parcelle_id) REFERENCES parcelles (id) ON DELETE SET NULL
) ENGINE=InnoDB;
