CREATE TABLE IF NOT EXISTS contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  civilite ENUM('mme', 'm') NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  demande_visite BOOLEAN NOT NULL DEFAULT FALSE,
  etre_rappele BOOLEAN NOT NULL DEFAULT FALSE,
  plus_de_photos BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disponibilite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  jour ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche') NOT NULL,
  heure TINYINT UNSIGNED NOT NULL,
  minute TINYINT UNSIGNED NOT NULL,
  CONSTRAINT fk_disponibilite_contact
    FOREIGN KEY (contact_id) REFERENCES contact(id)
    ON DELETE CASCADE
);
