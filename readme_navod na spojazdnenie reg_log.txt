
1-PRIDAJ SI DO DATABAZY!
------------------------------------
-- Zmazať tabuľku ak existuje
DROP TABLE IF EXISTS users;

-- Vytvoriť novú tabuľku s správnymi stĺpcami
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--Sledovanie vytvorených použivatelov 
SELECT * FROM users;
------------------------------------


2-STIAHNI KNIŽNICE!
------------------------------------
# Autentifikácia
pip install bcrypt
pip install pyjwt
------------------------------------


3-AKTUALIZUJ SÚBORY
------------------------------------
api.py - nezabudni zmenit heslo do databazy podla svojho
login.tsx
register.tsx
------------------------------------

4-MOŽEŠ SPUSTIT
------------------------------------

Registrovanie prihlasovanie funguje malo by to by to byť aj dostatočne ošetrené(zle heslo, nevyplnene pole atď) ale skuste najst niečo čo by to mohlo crashnut.
je tam aj hashovanie hesla ked si zobrazis uživatela v db.



