import os 
from flask_admin import Admin 
from .models import db,User, Administrador,Product, Carrito, Post 
from flask_admin.contrib.sqla import ModelView 

def setup_admin(app): 
    app.secret_key =os.environ.get('FLASK_APP_KEY','sample key') 
    app.config['FLASK_ADMIN_SWATCH']='cosmo' 
    admin=Admin(app,name='Fuente Salud Bethel') 

# Add your models here, for example this is how we add a the User model to the admin 
    admin.add_view(ModelView(User,db.session)) 
    admin.add_view(ModelView(Administrador,db.session)) 
    admin.add_view(ModelView(Product,db.session)) 
    admin.add_view(ModelView(Carrito,db.session)) 
    admin.add_view(ModelView(Post,db.session))
