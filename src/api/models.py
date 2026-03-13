
from flask_sqlalchemy import SQLAlchemy 
from datetime import datetime 
import pytz #Importar para hora Honduras 
import secrets


db=SQLAlchemy()   

def hora_honduras():  #Funciona para hacer la Hora Honduras en el pedido
    tz = pytz.timezone("America/Tegucigalpa")
    ahora = datetime.now(tz)
    return ahora.replace(tzinfo=None)

class User(db.Model): 
    __tablename__='user' 
    user_id=db.Column(db.Integer, primary_key=True) 
    name=db.Column(db.String(100),nullable=False) 
    email=db.Column(db.String(100),unique=True, nullable=False)  
    direccion=db.Column(db.String(100),nullable=False) 
    telefono=db.Column(db.Integer, nullable=False, default=0)    
    foto_perfil=db.Column(db.String(100),nullable=True)
    password=db.Column(db.String(100),nullable=False) 
    role=db.Column(db.String(100),nullable=False,default='user') 
    #Relaciones 
    posts=db.relationship('Post',backref='user',lazy=True)  
    carritos = db.relationship('Carrito', back_populates='user', lazy=True)
 
    # 
    def __repr__(self):
        return f'<User {self.name}>' 
    
    def serialize(self): 
        return { 
            "user_id":self.user_id, 
            "email":self.email, 
            "name":self.name, 
            "direccion":self.direccion, 
            "telefono":self.telefono, 
            "foto_perfil": f'/uploads/{self.foto_perfil}' if self.foto_perfil else None,
            "role":self.role
        } 

class Administrador (db.Model): 
    __tablename__='admin' 
    admin_id=db.Column(db.Integer,primary_key=True) 
    name=db.Column(db.String(100),nullable=False) 
    email=db.Column(db.String(100),unique=True, nullable=False)   
    foto_perfil=db.Column(db.String(100),nullable=True)
    password=db.Column(db.String(100),nullable=False)  
    role=db.Column(db.String(100),nullable=False,default='admin')  
     #Relaciones 
    posts=db.relationship('Post',backref='admin',lazy=True) 
    products = db.relationship('Product', back_populates='admin') 

  
    #  
    def __repr__(self):
        return f'<Admininistrador {self.name}>' 
    def serialize(self): 
        return { 
            "id":self.admin_id, 
            "email":self.email, 
            "name":self.name, 
          
            "foto_perfil": f'/uploads/{self.foto_perfil}' if self.foto_perfil else None,
            "role":self.role
        }  

class Product (db.Model): 
    __tablename__='product' 
    product_id=db.Column(db.Integer,primary_key=True) 
    name=db.Column(db.String(100),nullable=False) 
    precio=db.Column(db.Float,nullable=False) 
    cantidad=db.Column(db.Integer,nullable=False) 
    descripcion=db.Column(db.String(200),nullable=False) 
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.admin_id'))
    imagen = db.Column(db.String(255), nullable=True)
    role=db.Column(db.String(100),nullable=False,default='product')


    #RelationShip
      
    carritos = db.relationship('Carrito', back_populates='product', lazy=True)
    admin = db.relationship('Administrador', back_populates='products') 
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.categoria_id'), nullable=True)
    #
      
      
    def __repr__(self):
        return f'<Product {self.name}>' 
    def serialize(self): 
        return { 
            "product_id":self.product_id, 
            "precio":self.precio, 
            "cantidad":self.cantidad, 
            "categoria_id":self.categoria_id, 
            "name":self.name, 
            "imagen": f'/uploads/{self.imagen}' if self.imagen else None,
            "descripcion":self.descripcion,
            "role":self.role
        } 
class Carrito (db.Model): 
    __tablename__='carrito'  
    carrito_id=db.Column(db.Integer, primary_key=True)
    product_id=db.Column(db.Integer,db.ForeignKey('product.product_id'),) 
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id')) 
    guest_id = db.Column(db.String(100), nullable=True)  # 🔹 identificador para invitado
    cantidad=db.Column(db.Integer, nullable=False) 
    role=db.Column(db.String(100),nullable=False,default='carrito')    
    #Relationship  
    user = db.relationship('User', back_populates='carritos')
    product = db.relationship('Product', back_populates='carritos')

    #
    def serialize(self):  
        return{ 
            "carrito_id":self.carrito_id,
            "product_id":self.product_id, 
            "user_id":self.user_id, 
            "guest_id":self.guest_id,   
            "cantidad":self.cantidad, 
            "product":self.product.serialize()

        } 
    
class Categoria (db.Model):
    __tablename__ = 'categoria'
    categoria_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False) 


    #Relaciones 
    productos = db.relationship('Product', backref='categoria', lazy=True)


    def __repr__(self):
        return f'<Categoria {self.nombre}>'

    def serialize(self):
        return {
            "categoria_id": self.categoria_id,
            "nombre": self.nombre,
         
        }

class Post (db.Model):
    __tablename__ = 'post'
    post_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=True) 
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.admin_id'), nullable=True)
    date = db.Column(db.Date, nullable=False)
    content = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f'<Post {self.post_id}>'

    def serialize(self):
        return {
            "post_id": self.post_id, 
            "admin_id":self.admin_id,
            "user_id": self.user_id,
            "date": self.date.isoformat() if self.date else None,
            "content": self.content,
        }

class Pedido(db.Model):
    __tablename__ = 'pedido'
    pedido_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=True)  # Puede ser guest
    guest_id = db.Column(db.String(100), nullable=True)  # Para usuarios invitados 
    direccion = db.Column(db.String(255))
    fecha = db.Column(db.DateTime, default=hora_honduras)
    total = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(50), default='pendiente')  # pendiente, pagado, cancelado
    estado_envio = db.Column(db.String(50), default='preparando') #Estadod de envio , seria enviado y Entregado 
    comentario = db.Column(db.Text, nullable=True)
    #Relaciones 
    user = db.relationship("User", backref="pedidos")
    pagos = db.relationship('Pago', backref='pedido', lazy=True)
    items = db.relationship('PedidoItem', backref='pedido', lazy=True)

class PedidoItem(db.Model):
    __tablename__ = 'pedido_item'
    item_id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.pedido_id'))
    product_id = db.Column(db.Integer, db.ForeignKey('product.product_id'))
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False) 
    product = db.relationship("Product")

class Pago(db.Model):
    __tablename__ = 'pago'
    pago_id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.pedido_id'))
    metodo = db.Column(db.String(50))  # pixelpay, tarjeta, efectivo, etc
    estado = db.Column(db.String(50), default='pendiente')  # pendiente, completado, fallido
    referencia = db.Column(db.String(200))  # ID de la transacción externa
    fecha = db.Column(db.DateTime, default=hora_honduras) 
    
    
class PasswordReset(db.Model):
    __tablename__ = "password_reset"

    id = db.Column(db.Integer, primary_key=True)  # id del registro

    email = db.Column(db.String(100), nullable=False)  # correo del usuario

    codigo = db.Column(db.String(6), nullable=False)  # código seguro de 6 dígitos

    expiracion = db.Column(db.DateTime, nullable=False)  # tiempo límite del código

    # función para generar código seguro
    @staticmethod
    def generar_codigo():
        return str(secrets.randbelow(900000) + 100000)