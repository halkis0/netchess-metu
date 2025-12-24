ALTER TABLE users ADD COLUMN student_number VARCHAR(20);

UPDATE users SET student_number = LPAD(CAST(id::text AS text), 7, '0') WHERE student_number IS NULL;

ALTER TABLE users ADD CONSTRAINT users_student_number_unique UNIQUE (student_number);

ALTER TABLE users ALTER COLUMN student_number SET NOT NULL;