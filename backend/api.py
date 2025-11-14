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
    print(f"⚠️ Pozor pri vytváraní tabuľky: {e}")

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
                "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id",
                (user_data.name, user_data.email, hashed_password)
            )
            user_id = cur.fetchone()[0]
            conn.commit()

            # Vytvor JWT token
            access_token = create_access_token({"user_id": user_id, "email": user_data.email})
            
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
            cur.execute("SELECT id, name, email, password FROM users WHERE email = %s", (user_data.email,))
            user = cur.fetchone()
            
            if not user:
                raise HTTPException(status_code=400, detail="Nesprávny email alebo heslo")
            
            user_id, name, email, hashed_password = user
            
            if not verify_password(user_data.password, hashed_password):
                raise HTTPException(status_code=400, detail="Nesprávny email alebo heslo")

            # Vytvor JWT token
            access_token = create_access_token({"user_id": user_id, "email": email})
            
            return {
                "message": "Prihlásenie úspešné",
                "access_token": access_token,
                "token_type": "bearer", 
                "user_id": user_id,
                "name": name
            }
    except HTTPException:
        raise
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
            cur.execute("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC")
            users = cur.fetchall()
            
            users_list = []
            for user in users:
                users_list.append({
                    "id": user[0],
                    "name": user[1],
                    "email": user[2],
                    "created_at": user[3]
                })
            
            return {"users": users_list}
    except Exception as e:
        print(f"Error getting users: {e}")
        raise HTTPException(status_code=500, detail="Chyba pri načítaní používateľov")
    finally:
        if conn:
            conn.close()

@app.post("/classify")
async def classify(request: Request, file: UploadFile | None = File(None)):
    # Pôvodný kód pre OCR zostáva rovnaký
    if file is None:
        form = await request.form()
        cand = form.get("file") or form.get("image") or form.get("photo")
        if not isinstance(cand, UploadFile):
            for v in form.values():
                if isinstance(v, UploadFile):
                    cand = v
                    break
        file = cand if isinstance(cand, UploadFile) else None

    if file is None:
        print("❌ Žiadny UploadFile v požiadavke. Headers:", dict(request.headers))
        raise HTTPException(status_code=422, detail="Očakávam multipart pole 'file' so súborom.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Prázdny súbor.")

    code = detect_waste_code_bytes(content)
    if code is None:
        raise HTTPException(status_code=422, detail="OCR nenašlo použiteľný EÚ kód.")

    result = query_db_for_code(code)
    return {"code": code, "result": result}
