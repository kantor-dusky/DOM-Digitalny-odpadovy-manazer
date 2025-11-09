import argparse
import re
import sys
from pathlib import Path
import os
import io

import cv2
import numpy as np
import psycopg2
import easyocr  # type: ignore

# ===================== NASTAVENIA =====================

# DB konfigurácia – preferuj env premenné (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD)
DB_CFG = dict(
    host="127.0.0.1",        # určite IPv4, nie "localhost"
    port=5432,               # podľa pgAdmin (ty máš 5432)
    database="moja_db",      # tvoje meno DB
    user="postgres",         # používateľ
    password="DavidKovesi"  # sem vlož heslo, ktoré používaš v pgAdmine
)

# EÚ mapovanie – keď máme iba štítok
LABEL_TO_CODE = {
    # Plasty (1–7)
    "PET": 1, "PETE": 1,
    "HDPE": 2, "PE-HD": 2,
    "PVC": 3, "V": 3,
    "LDPE": 4, "PE-LD": 4,
    "PP": 5,
    "PS": 6, "PS-E": 6,
    "O": 7, "OTHER": 7, "PLA": 7,
    # Papier/kartón (20–22)
    "PAP": 22,
    # Kovy (40–41)
    "FE": 40,
    "ALU": 41, "AL": 41,
    # Drevo (50), Textil (60), Sklo (70–72)
    "FOR": 50, "TEX": 60, "GL": 70,
    # Kompozity – bezpečné defaulty
    "C/PAP": 81,
    "C/ALU": 82, "C/FE": 83,
    "C/PP": 90, "C/PE": 90, "C/LDPE": 90, "C/HDPE": 90,
}

# Legitímne EÚ kódy
EU_VALID = {1,2,3,4,5,6,7,20,21,22,40,41,50,60,70,71,72,81,82,83,84}

# Confidence prahy
LABEL_CONF_OK = 0.40
NUM_CONF_OK   = 0.40

# EasyOCR reader (načíta sa len raz)
READER = easyocr.Reader(['en'], gpu=False, verbose=False)

# ===================== POMOCNÉ FUNKCIE =====================

def resolve_desktop_path(user_input: str | None) -> Path:
    """
    Hľadá obrázok v tomto poradí:
      1) absolútna cesta
      2) relatívny názov -> images/<name>, potom priečinok skriptu, potom Desktop
      3) bez zadania -> ponúkne výber z images/, priečinka skriptu alebo Desktopu
    """
    repo_dir = Path(__file__).parent.resolve()
    images_dir = repo_dir / "images"
    desktop = Path.home() / "Desktop"

    def collect_from(dir_path: Path) -> list[Path]:
        imgs = []
        for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp", "*.jfif"):
            imgs += list(dir_path.glob(ext)) if dir_path.exists() else []
        return imgs

    if user_input:
        raw = user_input.strip().strip('"').strip("'")
        p = Path(raw)
        if p.is_absolute():
            return p
        for base in (images_dir, repo_dir, desktop):
            cand = base / p.name
            if cand.exists():
                return cand
        return images_dir / p.name

    imgs = collect_from(images_dir) or collect_from(repo_dir) or collect_from(desktop)
    if not imgs:
        print("❌ Nenašiel som žiadne obrázky. Zadaj cestu k súboru:")
        p = input("> ").strip()
        return resolve_desktop_path(p or None)

    imgs.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    print("Našiel som tieto obrázky (naposledy upravené hore):")
    for i, f in enumerate(imgs[:20], 1):
        print(f"  {i}. {f.name}")
    ch = input("Zadaj číslo / názov (Enter pre 1.): ").strip()

    if ch.isdigit():
        idx = int(ch) - 1
        return imgs[idx] if 0 <= idx < len(imgs) else imgs[0]
    if ch:
        provided = Path(ch)
        if provided.is_absolute() and provided.exists():
            return provided
        for base in (images_dir, repo_dir, desktop):
            cand = base / provided.name
            if cand.exists():
                return cand
        return images_dir / provided.name

    return imgs[0]

def _norm_text(t: str) -> str:
    t = t.upper().replace('|', 'I')
    t = re.sub(r'[^A-Z/0-9]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def _center_band_roi(img: np.ndarray) -> np.ndarray:
    """Široký stredný pás – aby sa vošiel trojuholník aj štítok pod ním."""
    h, w = img.shape[:2]
    y1, y2 = int(h*0.20), int(h*0.92)
    x1, x2 = int(w*0.12), int(w*0.88)
    return img[y1:y2, x1:x2]

def _prep_variants(gray: np.ndarray) -> list[np.ndarray]:
    gray = cv2.medianBlur(gray, 3)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    g2   = clahe.apply(gray)
    thr  = cv2.adaptiveThreshold(g2,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY,31,15)
    thri = cv2.adaptiveThreshold(g2,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY_INV,31,15)
    thri = cv2.dilate(thri, np.ones((2,2), np.uint8), 1)
    return [g2, thr, thri]

# ===================== CORE =====================

def _detect_from_img(img: np.ndarray) -> int | None:
    if img is None:
        return None

    # zväčši pre lepšie OCR + vyrež stred
    M = max(img.shape[:2])
    if M < 1600:
        f = 1600 / M
        img = cv2.resize(img, None, fx=f, fy=f, interpolation=cv2.INTER_CUBIC)

    roi_global = _center_band_roi(img)
    gray = cv2.cvtColor(roi_global, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 3)

    # --- 1) EasyOCR: najprv štítok ---
    det = READER.readtext(roi_global)  # [(bbox, text, conf), ...]
    label_key, label_conf, label_box = None, 0.0, None

    for (bbox, text, conf) in sorted(det, key=lambda x: x[2], reverse=True):
        t = _norm_text(text)
        if t in LABEL_TO_CODE:
            label_key, label_conf = t, conf
            xs = [p[0] for p in bbox]; ys = [p[1] for p in bbox]
            label_box = (int(min(xs)), int(min(ys)), int(max(xs)-min(xs)), int(max(ys)-min(ys)))
            break

    # 🔴 PRIORITA: spoľahlivý štítok rozhoduje okamžite
    if label_key and label_conf >= LABEL_CONF_OK:
        if label_key in ("AL","ALU"):     return 41
        if label_key == "FE":             return 40
        if label_key in ("PET","PETE"):   return 1
        if label_key == "PP":             return 5
        if label_key == "PS":             return 6
        if label_key in ("PVC","V"):      return 3
        if label_key in ("HDPE","PE-HD"): return 2
        if label_key in ("LDPE","PE-LD"): return 4

    # --- 2) urči ROI nad štítkom (alebo stredný pás) ---
    if label_box:
        lx, ly, lw, lh = label_box
        y_top   = max(0, ly - 3 * lh)
        y_bot   = max(0, ly - int(0.2 * lh))
        x_left  = max(0, lx - lw)
        x_right = min(gray.shape[1], lx + 2 * lw)
        roi_num = gray[y_top:y_bot, x_left:x_right]
        if roi_num.size == 0:
            roi_num = gray
    else:
        gh, gw = gray.shape[:2]
        roi_num = gray[int(gh*0.25):int(gh*0.60), int(gw*0.25):int(gw*0.75)]

    variants = _prep_variants(roi_num)

    # --- 3) EasyOCR čísla (z viacerých variantov) + hlasovanie ---
    votes: list[int] = []
    for src in [roi_num] + [v for v in variants]:
        if src.ndim == 2:
            src_bgr = cv2.cvtColor(src, cv2.COLOR_GRAY2BGR)
        else:
            src_bgr = src
        d = READER.readtext(src_bgr, detail=1)
        for (_bbox, text, conf) in d:
            if conf < NUM_CONF_OK:
                continue
            t = _norm_text(text)
            nums = re.findall(r'\b([1-9]\d?)\b', t)
            votes += [int(n) for n in nums]

    # rozhodni sa z hlasovania (preferuj EÚ kódy)
    code = None
    if votes:
        votes_pref = sorted(votes, key=lambda v: ((v not in EU_VALID), -votes.count(v)))
        code = votes_pref[0]

    # --- 4) Heuristiky a defaulty ---
    if label_key == "PAP":
        if code in (20,21,22): return code
        return 22
    if label_key == "GL":
        if code in (70,71,72): return code
        return 70

    if code in (42, 62):
        return 1

    if code in EU_VALID:
        return code

    if label_key in LABEL_TO_CODE:
        return LABEL_TO_CODE[label_key]

    return code  # môže byť None

def detect_waste_code(image_path: Path) -> int | None:
    img = cv2.imread(str(image_path))
    if img is None:
        print(f"⚠️ Neviem načítať obrázok: {image_path}")
        return None
    return _detect_from_img(img)

def detect_waste_code_bytes(img_bytes: bytes) -> int | None:
    data = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)
    return _detect_from_img(img)

# ===================== DB =====================

def query_db_for_code(code: int) -> str | None:
    conn = psycopg2.connect(**DB_CFG)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT vysledok FROM hodnoty WHERE cislo = %s", (code,))
            row = cur.fetchone()
            return row[0] if row else None
    finally:
        conn.close()

# ===================== MAIN (CLI ostáva) =====================

def main():
    parser = argparse.ArgumentParser(description="Vyhodnotenie odpadu z fotky (EÚ kódy, EasyOCR only).")
    parser.add_argument("image", nargs="?", help="Cesta k obrázku alebo názov súboru.")
    args = parser.parse_args()

    img_path = resolve_desktop_path(args.image)
    if not img_path.exists():
        print(f"❌ Súbor neexistuje: {img_path}")
        sys.exit(1)

    print(f"📷 Spracúvam: {img_path}")
    code = detect_waste_code(img_path)
    if code is None:
        print("❌ OCR nenašlo použiteľný EÚ kód (ani štítok PET/PAP/GL/V…).")
        sys.exit(2)

    print(f"🔎 Rozpoznaný EÚ kód: {code}")
    result = query_db_for_code(code)
    if result:
        print(f"✅ Výsledok z DB: {result}")
    else:
        print("ℹ️ V tabuľke 'hodnoty' sa nenašlo pravidlo pre tento kód.")

if __name__ == "__main__":
    main()
