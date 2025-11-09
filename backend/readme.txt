ak si budete stahovat tie python kody dajte ich do nove priecinka python. Cize nie v app priecinku ale novy na rovnakom lvly. waste_ocr.py je na prepojenie s datazabazou ale musite si v nom zmenit nazov db co mate lokalne a taktiez heslo a meno, api.py je na to prepojenie s reactom a posielanie fotiek.
Kody na spustenie :
npx ngrok config add-authtoken 35C2HVauMHrs0RR2CISLlPengNA_2basbi6VJtGVqASQCuUA2
npx ngrok http 8000 
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
npx expo start --tunnel
pip install fastapi uvicorn pillow python-multipart
