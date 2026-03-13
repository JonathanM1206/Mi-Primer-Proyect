import os
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from .models import db, Administrador, User, Product, Carrito, Categoria, Post, Pedido, PedidoItem, Pago,PasswordReset

def setup_admin(app):
    # Secret key y tema para Flask-Admin
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample_key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cosmo'

    # Creamos la interfaz de admin
    admin_panel = Admin(app, name='Fuente de Salud Bethel', url='/admin')

    # Agregamos los modelos
    admin_panel.add_view(ModelView(Administrador, db.session, name='Administradores', endpoint='admin_model'))
    admin_panel.add_view(ModelView(User, db.session, name='Usuarios'))
    admin_panel.add_view(ModelView(Product, db.session, name='Productos'))
    admin_panel.add_view(ModelView(Categoria, db.session, name='Categorías'))
    admin_panel.add_view(ModelView(Carrito, db.session, name='Carritos'))
    admin_panel.add_view(ModelView(Post, db.session, name='Posts'))
    admin_panel.add_view(ModelView(Pedido, db.session, name='Pedidos'))
    admin_panel.add_view(ModelView(PedidoItem, db.session, name='Items de Pedido'))
    admin_panel.add_view(ModelView(Pago, db.session, name='Pagos')) 
    admin_panel.add_view(ModelView(PasswordReset, db.session, name='Reset Password'))
