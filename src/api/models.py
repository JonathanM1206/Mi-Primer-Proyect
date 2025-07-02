
from flask_sqlalchemy import SQLAlchemy 

db=SQLAlchemy()  

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
 


    #RelationShip
    role=db.Column(db.String(100),nullable=False,default='product')   
    carritos = db.relationship('Carrito', back_populates='product', lazy=True)
    admin = db.relationship('Administrador', back_populates='products')
    #
      
      
    def __repr__(self):
        return f'<Product {self.name}>' 
    def serialize(self): 
        return { 
            "product_id":self.product_id, 
            "precio":self.precio, 
            "cantidad":self.cantidad, 
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
            "cantidad":self.cantidad, 
            "product":self.product.serialize

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


