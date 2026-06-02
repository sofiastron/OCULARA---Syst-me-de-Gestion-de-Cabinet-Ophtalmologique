-- Migration: Add email column to patients table
-- Run this SQL against your database (PostgreSQL example)

ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR;
