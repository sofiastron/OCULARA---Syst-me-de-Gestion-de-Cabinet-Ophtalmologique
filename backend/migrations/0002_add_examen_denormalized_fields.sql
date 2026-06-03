-- Migration: Ajouter champs dénormalisés à la table examens
-- Pour améliorer l'affichage des informations du patient et de l'orthoptiste

ALTER TABLE examens
ADD COLUMN IF NOT EXISTS patient_nom VARCHAR(255),
ADD COLUMN IF NOT EXISTS patient_prenom VARCHAR(255),
ADD COLUMN IF NOT EXISTS patient_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS orthoptiste_nom VARCHAR(255);
