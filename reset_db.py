import sys
sys.path.append('./src')  # Esto agrega la carpeta src al path

from app import app, db  # Ahora sí lo podés importar como si estuvieras dentro de src

with app.app_context():
    db.drop_all()
    db.create_all()
    print("Base de datos reiniciada con éxito.")