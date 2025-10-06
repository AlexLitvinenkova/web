-- Создание базы данных (если нужно)
-- CREATE DATABASE hr_department;

-- Создание таблицы должностей
CREATE TABLE IF NOT EXISTS duties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Создание таблицы сотрудников
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    duty INTEGER NOT NULL REFERENCES duties(id)
);

-- Вставка демо-данных для должностей
INSERT INTO duties (name) VALUES 
    ('Менеджер'),
    ('Разработчик'),
    ('Дизайнер'),
    ('Аналитик')
ON CONFLICT DO NOTHING;

-- Вставка демо-данных для сотрудников
INSERT INTO workers (name, duty) VALUES 
    ('Иванов Иван Иванович', 1),
    ('Петрова Анна Сергеевна', 2),
    ('Сидоров Петр Александрович', 2),
    ('Козлова Мария Владимировна', 3),
    ('Смирнов Алексей Дмитриевич', 4)
ON CONFLICT DO NOTHING;
