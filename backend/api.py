# api.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta
from waste_ocr import detect_waste_code_bytes, query_db_for_code

app = FastAPI(title="Waste OCR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Konfigurácia
SECRET_KEY = "vas_tajny_kluc_pre_jwt"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dní

# Pydantic modely
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str

# Pomocné funkcie pre databázu
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="moja_db",
        user="postgres",
        password="123"
    )

def create_users_table():
    """Vytvorí tabuľku users ak neexistuje"""
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Skontroluj, či tabuľka existuje
            cur.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users'
                );
            """)
            table_exists = cur.fetchone()[0]
            
            if not table_exists:
                # Vytvor novú tabuľku
                cur.execute("""
                    CREATE TABLE users (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                print("✅ Tabuľka users bola vytvorená")
            else:
                # Skontroluj, či stĺpec password existuje
                cur.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='password'
                """)
                password_column_exists = cur.fetchone()
                
                if not password_column_exists:
                    # Pridaj chýbajúci stĺpec
                    cur.execute("ALTER TABLE users ADD COLUMN password VARCHAR(255)")
                    print("✅ Stĺpec password bol pridaný do tabuľky users")
                
                # Skontroluj aj ostatné stĺpce
                cur.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='name'
                """)
                name_column_exists = cur.fetchone()
                
                if not name_column_exists:
                    cur.execute("ALTER TABLE users ADD COLUMN name VARCHAR(100)")
                    print("✅ Stĺpec name bol pridaný do tabuľky users")

                cur.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='body'
                """)
                xp_column_exists = cur.fetchone()

                if not xp_column_exists:    
                    cur.execute("ALTER TABLE users ADD COLUMN body INTEGER DEFAULT 0")    
                    print("✅ Stĺpec body bol pridaný do tabuľky users")  

            conn.commit()
            print("✅ Tabuľka users je pripravená")
            
    except Exception as e:
        print(f"❌ Chyba pri vytváraní tabuľky: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

# Vytvor tabuľku pri štarte
try:
    create_users_table()
except Exception as e:
    print(f" Pozor pri vytváraní tabuľky: {e}")

def create_recycling_table():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_recyklacia (
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    typ_odpadu_id INTEGER NOT NULL REFERENCES hodnoty(cislo) ON DELETE CASCADE,
                    pocet_recyklacii INTEGER DEFAULT 0,
                    PRIMARY KEY (user_id, typ_odpadu_id)
                );
            """)
            conn.commit()
    except Exception as e:
        print(f"Chyba: {e}")
    finally:
        if conn: conn.close()
create_recycling_table()

def increment_recycling_stat(user_id: int, waste_code: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO user_recyklacia (user_id, typ_odpadu_id, pocet_recyklacii)
                VALUES (%s, %s, 1)
                ON CONFLICT (user_id, typ_odpadu_id) 
                DO UPDATE SET pocet_recyklacii = user_recyklacia.pocet_recyklacii + 1;
            """, (user_id, waste_code))
            conn.commit()
    finally:
        conn.close()



def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Endpointy
@app.get("/ping")
def ping():
    return {"ok": True}

@app.post("/register")
def register(user_data: UserRegister):
    # Validácia
    if not user_data.name or not user_data.email or not user_data.password:
        raise HTTPException(status_code=400, detail="Vyplňte všetky polia")
    
    if "@" not in user_data.email:
        raise HTTPException(status_code=400, detail="Neplatný email")
    
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Heslo musí mať aspoň 6 znakov")

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Skontroluj, či email už existuje
            cur.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Používateľ s týmto emailom už existuje")

            # Vytvor nového používateľa
            hashed_password = hash_password(user_data.password)
            cur.execute(
                "INSERT INTO users (name, email, password, body) VALUES (%s, %s, %s, %s) RETURNING id",
                (user_data.name, user_data.email, hashed_password, 0)
            )
            user_id = cur.fetchone()[0]
            conn.commit()

            # Vytvor JWT token
            access_token = create_access_token({"user_id": user_id, "email": user_data.email})
            print("User data: {user}")

            return {
                "message": "Registrácia bola úspešná",
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": user_id,
                "name": user_data.name
            }
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Interná chyba servera")
    finally:
        if conn:
            conn.close()

@app.post("/login")
def login(user_data: UserLogin):
    if not user_data.email or not user_data.password:
        raise HTTPException(status_code=400, detail="Vyplňte všetky polia")

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Načítaj používateľa podľa emailu
            cur.execute("SELECT id, name, email, password, body FROM users WHERE email = %s", (user_data.email,))
            user = cur.fetchone()

            if not user:
                raise HTTPException(status_code=400, detail="Nesprávny email alebo heslo")

            # Skontrolujeme počet hodnôt, ktoré sme dostali z databázy
            if len(user) == 5:
                user_id, name, email, hashed_password, body = user
            elif len(user) == 4:
                # Ak body chýba, nastavíme ho na 0
                user_id, name, email, hashed_password = user
                body = 0  # Priradíme hodnotu 0, ak body neexistuje
            else:
                # Ak je počet hodnôt iný, vrátime chybu
                raise HTTPException(status_code=500, detail="Nekonzistentné dáta v databáze")

            if not verify_password(user_data.password, hashed_password):
                raise HTTPException(status_code=400, detail="Nesprávny email alebo heslo")

            access_token = create_access_token({"user_id": user_id, "email": email})

            return {
                "message": "Prihlásenie úspešné",
                "access_token": access_token,
                "token_type": "bearer", 
                "user_id": user_id,
                "name": name,
                "body" : body  # Posielame správnu hodnotu body
            }
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Interná chyba servera")
    finally:
        if conn:
            conn.close()


@app.get("/users")
def get_users():
    """Endpoint na zobrazenie všetkých používateľov (len pre admina)"""
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, email, created_at, body FROM users ORDER BY created_at DESC")
            users = cur.fetchall()
            
            users_list = []
            for user in users:
                users_list.append({
                    "id": user[0],
                    "name": user[1],
                    "email": user[2],
                    "created_at": user[3],
                    "body" : user [4]
                })
            
            return {"users": users_list}
    except Exception as e:
        print(f"Error getting users: {e}")
        raise HTTPException(status_code=500, detail="Chyba pri načítaní používateľov")
    finally:
        if conn:
            conn.close()

@app.post("/update-points")
def update_points(user_data: dict):
    user_id = user_data.get("user_id")
    body = user_data.get("body")

    if not user_id or body is None:
        raise HTTPException(status_code=400, detail="Nesprávne údaje")

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Aktualizujeme body používateľa v databáze
            cur.execute("UPDATE users SET body = %s WHERE id = %s", (body, user_id))
            conn.commit()
            return {"message": "Points updated successfully"}
    except Exception as e:
        print(f"Error updating points: {e}")
        raise HTTPException(status_code=500, detail="Error updating points")
    finally:
        if conn:
            conn.close()


@app.get("/user-history/{user_id}")
async def get_user_history(user_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # SQL dopyt opravený podľa tvojej tabuľky: h.vysledok a h.cislo
            cur.execute("""
                SELECT h.vysledok, r.pocet_recyklacii, r.typ_odpadu_id
                FROM user_recyklacia r
                JOIN hodnoty h ON r.typ_odpadu_id = h.cislo
                WHERE r.user_id = %s
                ORDER BY r.pocet_recyklacii DESC;
            """, (user_id,))
            
            rows = cur.fetchall()
            
            history = []
            for row in rows:
                history.append({
                    "name": row[0],   # Toto je ten text z tabuľky (napr. 'Plast: PET...')
                    "count": row[1],  # Počet z tabuľky user_recyklacia
                    "code": row[2]    # Číslo kódu
                })
            return history
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        # Vrátime chybu ako JSON, aby frontend vedel, čo sa deje
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/user-chart/{user_id}")
async def get_user_chart(user_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT r.typ_odpadu_id, r.pocet_recyklacii
                FROM user_recyklacia r
                WHERE r.user_id = %s
            """, (user_id,))
            rows = cur.fetchall()

            # Logika rozradenia do farieb (rovnaká ako v tvojom App.tsx)
            bins = {
                "Plasty": {"count": 0, "color": "#f1c40f"}, # Žltá
                "Papier": {"count": 0, "color": "#3498db"}, # Modrá
                "Sklo": {"count": 0, "color": "#27ae60"},   # Zelená
                "Kovy": {"count": 0, "color": "#e74c3c"},   # Červená
                "Ostatné": {"count": 0, "color": "#34495e"} # Čierna/Sivá
            }

            for code, count in rows:
                if (1 <= code <= 7) or code == 19: bins["Plasty"]["count"] += count
                elif 20 <= code <= 22: bins["Papier"]["count"] += count
                elif 70 <= code <= 72: bins["Sklo"]["count"] += count
                elif code == 40 or code == 41: bins["Kovy"]["count"] += count
                else: bins["Ostatné"]["count"] += count

            # Sformátovanie pre frontend knižnicu
            chart_data = [
                {"name": k, "population": v["count"], "color": v["color"], "legendFontColor": "#7F7F7F", "legendFontSize": 12}
                for k, v in bins.items() if v["count"] > 0
            ]
            return chart_data
    finally:
        conn.close()

class HistoryUpdate(BaseModel):
    user_id: int
    typ_odpadu_id: int

@app.post("/update-history")
async def update_history(item: HistoryUpdate):
    print(f"DEBUG: Prijaté pre históriu - User: {item.user_id}, Typ: {item.typ_odpadu_id}")
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO user_recyklacia (user_id, typ_odpadu_id, pocet_recyklacii)
                VALUES (%s, %s, 1)
                ON CONFLICT (user_id, typ_odpadu_id)
                DO UPDATE SET pocet_recyklacii = user_recyklacia.pocet_recyklacii + 1;
            """, (item.user_id, item.typ_odpadu_id))
            conn.commit()
            return {"status": "success"}
    except Exception as e:
        print(f"❌ Chyba pri zápise histórie: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

@app.post("/classify")
async def classify(request: Request, file: UploadFile | None = File(None)):
    form = await request.form()
    
    # 1. Získame user_id z požiadavky (aplikácia ho musí poslať vo FormData)
    user_id = form.get("user_id")

    # Pôvodný kód pre hľadanie súboru
    if file is None:
        cand = form.get("file") or form.get("image") or form.get("photo")
        if not isinstance(cand, UploadFile):
            for v in form.values():
                if isinstance(v, UploadFile):
                    cand = v
                    break
        file = cand if isinstance(cand, UploadFile) else None

    if file is None:
        raise HTTPException(status_code=422, detail="Očakávam súbor.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Prázdny súbor.")

    # OCR detekcia
    code = detect_waste_code_bytes(content)
    if code is None:
        raise HTTPException(status_code=422, detail="OCR nenašlo použiteľný EÚ kód.")

    # Získanie popisu z DB
    result = query_db_for_code(code)
    
    # 2. Ak je kód platný a máme ID používateľa, zapíšeme štatistiku
    if result and user_id:
        try:
            increment_recycling_stat(int(user_id), code)
        except Exception as e:
            # Ak by zápis štatistiky zlyhal, nechceme aby spadla celá klasifikácia
            print(f"⚠️ Chyba pri zápise štatistiky: {e}")

    return {"code": code, "result": result}
