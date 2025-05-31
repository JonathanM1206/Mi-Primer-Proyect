import os 
from flask import Flask, request ,jsonify,Blueprint   
from api.models import db, User, Administrador, Product, Carrito, Post
from api.utils import APIException 
from flask_cors import CORS 
from flask_bcrypt import Bcrypt 
from flask_jwt_extended import JWTManager, create_access_token,jwt_required, get_jwt_identity,get_jwt  
from datetime import timedelta


app=Flask(__name__) 
api = Blueprint('api',__name__) 

CORS(app)
 
#Encriptacion JWT-- 
app.config["JWT_SECRET_KEY"]=os.getenv('JWT_SECRET_KEY_OWN','super-secret-key') 
app.config["JWT_TOKEN_LOCATION"]=["headers"] 

bcrypt =Bcrypt() 
jwt= JWTManager() 
jwt.init_app(app) 

#Ruta Ejemplo 

@api.route('/hello',methods=['POST']) 
def handle_hello(): 
    response_body={
        "message": "Hello! This message comes from the backed. Checkj the network tab in your browser to see the GET request"
    }   
    return jsonify(response_body),200 



#Endpoints para el modelo User 
@api.route('/user', methods=['GET']) 
def get_user(): 
    try: 
        users=User.query.all() 
        return jsonify([user.serialize() for user in users]),200 
    except Exception as e: 
        return jsonify({"error":str(e)}),500 
    
@api.route('/user', methods=['POST']) 
def create_user(): 
    data= request.get_json()
    try:
        #Validacion de Campos requeridos 
        if not data.get('email') or not data.get('name') or not data.get('password'): 
            return jsonify({'error':'Email, Name and Password are required'}),400 
        
        #Verificar si el usuario ya existe  
        existing_user=User.query.filter_by(email=data.get('email')).first() 
        if existing_user: 
            return jsonify({'error':'Email arleady exists'}),400 
        
        #hash a la Contrasena 
        password_hash= bcrypt.generate_password_hash(data.get('password')).decode('utf-8') 

        #Crear nuevo usuario 
        new_user=User( 
            name=data.get('name'), 
            email=data.get('email'), 
            password=password_hash
        )
        #Guardar usuario en la base de datos 
        db.session.add(new_user) 
        db.session.commit()  

        #Datos a retornar (sin Contrasena por seguridad) 
        ok_to_share={ 
            "id":new_user.user_id, 
            "name":new_user.name, 
             
            "email":new_user.email
        } 
        
        return jsonify({"Usuario Creado":ok_to_share}),201 
    
    except Exception as e: 
        db.session.rollback()
        return jsonify({"error creando Usuario":str(e)}),400 
    

#User Token
@api.route('/login/user',methods=['POST'])
def get_token_user(): 
    try: 
        email=request.json.get('email') 
        password=request.json.get('password') 

        if not email or not password: 
            return jsonify({'error':'Email and password are required'}),400 

        login_user=User.query.filter_by(email=email).first() 

        if not login_user: 
            return jsonify({'error':'Invalid Email'}),404  

        password_from_db=login_user.password 

        true_o_false= bcrypt.check_password_hash(password_from_db,password) 

        if true_o_false: 
            expires=timedelta(days=3) 
            user_id=login_user.user_id 
            access_token=create_access_token( 
                identity=str(user_id), 
                additional_claims={'role':login_user.role}, 
                expires_delta=expires  
                ) 
            user_data={ 
                "email":login_user.email, 
                "id":login_user.user_id, 
                 "role":login_user.role,
                "access_token":access_token
            } 
            return jsonify(user_data),200 
        else: 
            return jsonify({"Error":"Contraseña incorrecta"}),404 
    except Exception as e: 
     return jsonify({"Error":'El email proporcionado no correspone a ninguno registrado'+str(e)}),500 

#if not Found 
@api.route('/current_user') 
@jwt_required()  #obliga a que el usuario esté logueado
def get_current_user(): 
    currennt_user=get_jwt_identity() 
    user=User.query.get(currennt_user['id']) 
    if not user: 
        return jsonify(msg='User not Found'),404 
    return jsonify(user.serialize()),200 

#Restringida por Token Usuario 
@api.route('/users2')
@jwt_required() #obliga a que el usuario esté logueado
def show_users():
    current_user_id = get_jwt_identity()  # Obtenemos el ID del usuario desde el token
    current_user = User.query.get(current_user_id)  # Buscamos al usuario en la base de datos

    if not current_user or current_user.role != 'admin':
        return jsonify({"error": "No autorizado. Solo el admin puede ver esta información"}), 403

    users = User.query.all()  # Traemos todos los usuarios
    user_list = []

    for user in users:
        user_dict = {
            'id': user.user_id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
        user_list.append(user_dict)

    return jsonify(user_list), 200 
#DELETE USER     
@api.route('/delete_user/<int:user_id>',methods=['DELETE'])  
@jwt_required()  #obliga a que el usuario esté logueado
def delete_user(user_id): 
    user=User.query.get(user_id) 
    if not user: 
        return jsonify({"error":"Usuario no encontrado"}),404 
    
    db.session.delete(user) 
    db.session.commit() 
    return jsonify({"message":'Usuario Borrado Correctamente',"user_id":user_id}),200 

# EDITAR USER con PUT 
@api.route('/edit_user/<int:user_id>',methods=['PUT']) 
@jwt_required() #obliga a que el usuario esté logueado  
def edit_user(user_id): 
    user=User.query.get(user_id) 
    if not user: 
        return jsonify({'error':'Usuario no encontrado'}),400 
    
    data=request.json 
    if "name" in data: 
        user.name=data["name"] 
    if "email" in data: 
        user.email=data["email"]
    if "password" in data: 
        password_hash=bcrypt.generate_password_hash(data.get('password')).decode('utf-8') 
        user.password=password_hash 

    if not isinstance(data,dict): 
        return jsonify({'error':'Los datos deben ser un diccionario'}),400 
    
    try: 
        db.session.commit() 
        return jsonify({'message':'El usuario se actualizo correctamente'}),200 
    except Exception as e: 
        db.session.rollback() 
        return jsonify({'error':str(e)}),500

#Endpoints para el Modelo ADMIN 
@api.route('/Admin', methods=['GET']) 
def get_admin(): 
    try: 
        admins=Administrador.query.all() 
        return jsonify([admin.serialize() for admin in admins]),200 
    except Exception as e: 
        return jsonify({"error":str(e)}),500 
    
@api.route('/Admin', methods=['POST']) 
def create_admin(): 
    data= request.get_json()
    try:
        #Validacion de Campos requeridos 
        if not data.get('email') or not data.get('name') or not data.get('password'): 
            return jsonify({'error':'Email, Name and Password are required'}),400 
        
        #Verificar si el usuario ya existe  
        existing_admin=Administrador.query.filter_by(email=data.get('email')).first() 
        if existing_admin: 
            return jsonify({'error':'Email arleady exists'}),400 
        
        #hash a la Contrasena 
        password_hash= bcrypt.generate_password_hash(data.get('password')).decode('utf-8') 

        #Crear nuevo usuario 
        new_admin=Administrador( 
            name=data.get('name'), 
            email=data.get('email'), 
            password=password_hash
        )
        #Guardar usuario en la base de datos 
        db.session.add(new_admin) 
        db.session.commit()  

        #Datos a retornar (sin Contrasena por seguridad) 
        ok_to_share={ 
            "id":new_admin.admin_id, 
            "name":new_admin.name,
            "role":new_admin.role, 
            "email":new_admin.email
        } 
        
        return jsonify({"Administrador Creado":ok_to_share}),201 
    
    except Exception as e: 
        db.session.rollback()
        return jsonify({"error creando Administrador":str(e)}),400  

#Admin Token 
@api.route('/login/admin',methods=['POST'])
def get_token_admin(): 
    try: 
        email=request.json.get('email') 
        password=request.json.get('password') 

        if not email or not password: 
            return jsonify({'error':'Email or Password are requiered'}),400 

        login_admin=Administrador.query.filter_by(email=email).first() 

        if not login_admin: 
            return jsonify({'error':'Invalid Email'}),404 

        password_from_db=login_admin.password 

        true_or_false=bcrypt.check_password_hash(password_from_db,password) 

        if true_or_false: 
            expires=timedelta(days=3) 
            admin_id=login_admin.admin_id 
            access_token=create_access_token( 
                identity=str(admin_id), 
                additional_claims={'role':login_admin.role}, 
                expires_delta=expires
            )   
            admin_data={ 
                "email":login_admin.email, 
                "id":login_admin.admin_id, 
                "role":login_admin.role, 
                "access_token":access_token
            }  
            return jsonify(admin_data),200 
        else: 
            return jsonify({'error':"Contraseña incorrecta"}),404 
    except Exception as e: 
        return jsonify({'Error':'El email proporcionado no corresponder a ninguno registrado'+str(e)}),500 

#if Not Found 
@api.route('/current_admin') 
@jwt_required()  #obliga a que el usuario esté logueado
def get_current_admin(): 
    current_admin=get_jwt_identity() 
    admin=Administrador.query.get(current_admin['id']) 
    if not admin: 
        return jsonify(msg='Administrador not found'),404 
    return jsonify(admin.serialize()),200 

#DELETE ADMIN 
@api.route('/delete_admin/<int:admin_id>',methods=['DELETE'])  
@jwt_required()  #obliga a que el usuario esté logueado
def delete_admin(admin_id): 
    admin=Administrador.query.get(admin_id) 
    if not admin: 
        return jsonify({"error":"Admin no encontrado"}),404 

    db.session.add(admin) 
    db.session.commit() 
    return jsonify({"message":"Administrador Borrado Correctamente","admin_id":admin_id}),200 

#EDIT ADMIN con PUT 
@api.route('/edit_admin/<int:admin_id>',methods=['PUT']) 
@jwt_required()  #obliga a que el usuario esté logueado 
def edit_admin(admin_id): 
    admin=Administrador.query.get(admin_id) 
    if not admin: 
        return jsonify({'Error':"Administrador no encontrado"}),400 
    data=request.json 
    if "name" in data: 
        admin.name=data["name"] 
    if "email" in data: 
        admin.email=data["email"] 
    if "password" in data: 
        password_hash =bcrypt.generate_password_hash(data.get('password')).decode('utf-8') 
        admin.password=password_hash 
    if not isinstance(data,dict): 
        return jsonify({'error':"los datos deben ser un diccionario"}),400 
    
    try: 
        db.session.commint() 
        return jsonify({'message':"El Administrador se actualizo correctamente"}),200 
    except Exception as e: 
        db.session.rollback() 
        return jsonify({"error":str(e)}),500


#Agregar Producto 
@api.route('/producto',methods=['POST']) 
@jwt_required() #obliga a que el usuario esté logueado
def crear_producto(): 
    data= request.get_json() 
    try:
        precio = float(data['precio'])  # ✅ convierte string a float
    except ValueError:
        return jsonify({'msg': 'El precio debe ser un número (sin texto como "lps")'}), 400

    try:
        cantidad = int(data['cantidad'])  # ✅ también valida cantidad
    except ValueError:
        return jsonify({'msg': 'La cantidad debe ser un número entero'}), 400
    nuevo_producto=Product( 
        name=data['name'], 
        descripcion=data['descripcion'], 
        precio=data['precio'], 
        imagen=data['imagen'], 
        cantidad=data['cantidad'],
    ) 
    db.session.add(nuevo_producto) 
    db.session.commit() 

    return jsonify({'msg':'Producto Creado Existosamente'}),201  

#Producto GET 
@api.route('/producto',methods=['GET']) 
def get_prodcuts(): 
    try: 
        products=Product.query.all() # Trae todos los productos de la base
        # Ahora convertimos cada producto a diccionario usando serialize
        return jsonify([product.serialize() for product in products]),200  
            # Devolvemos JSON con la lista de productos
    except Exception as e: 
        return jsonify({'error':str(e)}),500 

#Producto Edit con PUT 
@api.route('/edit_producto/<int:product_id>',methods=['PUT']) 
def edit_producto(product_id): 
    product=Product.query.get(product_id) 
    if not product: 
        return jsonify({"error":"Producto no encontrado"}),400 
    
    data=request.json 
    if "name" in data: 
        product.name=data['name']
    if "precio" in data: 
        product.precio=data['precio'] 
    if "cantidad" in data: 
        product.cantidad=data['cantidad'] 
    if "descripcion" in data: 
        product.descripcion=data['descripcion'] 
    if "imagen" in data: 
        product.imagen=data['imagen'] 
    
    if not isinstance(data,dict): 
        return jsonify({'error':"los datos debe ser un diccionario"}),400 
    
    try: 
        db.session.commit()
        return jsonify({'message':'El Producto se actualizo correctamente'}),200 
    except Exception as e: 
        db.session.rollback() 
        return jsonify({'error':str(e)}),500 
#DELETE Producto 
@api.route('/delete_producto/<int:product_id>',methods=['DELETE'])
def delete_producto(product_id): 
    product=Product.query.get(product_id) 
    if product: 

        db.session.delete(product) 
        db.session.commit() 
        return jsonify('Producto Borrado'),200 
    return jsonify({'message':"Producto Borrado Correctamente","product_id":product_id}),404 
#Crear Carrito 
@api.route('/carrito', methods=['POST']) 
@jwt_required() 
def agregar_a_carrito(): 
    data=request.get_json() 
    user_id=get_jwt_identity() # Aquí sacamos el ID del usuario que está haciendo la petición 
    product_id=data.get('product_id') 
    cantidad=data.get('cantidad',1) 

    if not product_id: 
        return jsonify({'error':"falta el ID del Producto"}),400  
    
    #Verificamos si el producto existe
    product=Product.query.get(product_id) 
    if not product: 
        return jsonify({'error':'Producto no encontrado'}),400 
    
    #Validacion con el Campo cantidad  
    if cantidad > product.cantidad: 
        return jsonify({'error':f'No hay suficiente stock. Cantidad disponible: {product.cantidad}'}),400
    
    
    nuevo_item=Carrito( 
        product_id=product_id, 
        user_id=user_id, 
        cantidad=cantidad
    )
    db.session.add(nuevo_item) 
    db.session.commit() 

    return jsonify({"msg":"Producto agregado al carrito"}),201 
#GET del CARRITO 
@api.route('/carrito',methods=['GET']) 
@jwt_required() 
def ver_carrito(): 
    user_id = get_jwt_identity() #si el token no pertenece a ese usuario, no lo deja ver el carrito. 
      
    
    carrito=Carrito.query.filter_by(user_id=user_id).all() #Busca todos los productos en la tabla Carrito que tengan el mismo user_id
    resultado=[] 

    for item in carrito: 
        producto=Product.query.get(item.product_id) 
        resultado.append({ #append agruega al final
            "carrito_id":item.carrito_id, 
            "producto":producto.serialize(), 
            "cantidad":item.cantidad
        }) 
    return jsonify(resultado),200 

#PUT DE CARRITO 
@api.route("/carrito/<int:carrito_id>",methods=['PUT']) 
@jwt_required() 
def editar_carrito(carrito_id):  
    user_id = get_jwt_identity()  #si el token no pertenece a ese usuario, no lo deja ver el carrito. 
     
    #verifico si el carrito existe y que pertenezca al usuario que hace la petición 
    producto=Product.query.all()
    carrito=Carrito.query.filter_by(carrito_id=carrito_id,user_id=user_id).first() 
    if not carrito: 
        return jsonify({"message":"Carrito no encontrado"}),400 
    
    data=request.json  
    if not isinstance(data,dict): 
        return jsonify({"error":"Los datos deben ser un diccionario"}),400 
    
    # if "cantidad" in data: 
    #     carrito.cantidad=data['cantidad'] 
    #permite cambiar la cantidad y valida en stock
    nueva_cantidad = data.get("cantidad")
    if not nueva_cantidad:
        return jsonify({"error": "Falta el campo cantidad"}), 400

    producto = Product.query.get(carrito.product_id)
    if nueva_cantidad > producto.cantidad:
        return jsonify({"error": f"No hay suficiente stock. Solo hay {producto.cantidad} disponibles"}), 400

    carrito.cantidad = nueva_cantidad

    
    
    if "producto_id" in data:
        carrito.product_id=data['producto_id'] 

  
    try: 
        db.session.commit() 
        return jsonify({"message":"El Carrito se edito correctamente"}),200 
    except Exception as e: 
        db.session.rollback() 
        return jsonify({"error":str(e)}),500 

#DELETE CARRITO completo
@api.route('/delete_carrito/<int:carrito_id>',methods=["DELETE"])  
@jwt_required() 
def delete_carrito(carrito_id) : 
    user_id = get_jwt_identity()  # Obtengo el usuario que hace la petición

    # Busco el carrito que tenga el carrito_id y que además pertenezca a este usuario

    carrito = Carrito.query.filter_by(carrito_id=carrito_id, user_id=user_id).first()
    if carrito: 

        db.session.delete(carrito) 
        db.session.commit() 
        return jsonify("Carrito Eliminado"),200 
    return jsonify('no se encontro Carrito')  

#DELETE un Producto del Carrito   
@api.route('/delete_producto_carrito/<int:carrito_id>/<int:product_id>',methods=['DELETE']) 
@jwt_required() 
def delete_producto_carrito(carrito_id,product_id): 
    user_id = get_jwt_identity()
 
    carrito=Carrito.query.filter_by(carrito_id=carrito_id,product_id=product_id,user_id=user_id).first() 
    if not carrito:
     return jsonify('no se encontró el producto'), 404
    if carrito: 

         db.session.delete(carrito) 
         db.session.commit() 
         return jsonify("Producto eliminado del carrito") ,200 
    return jsonify('no se encontro el producto')


