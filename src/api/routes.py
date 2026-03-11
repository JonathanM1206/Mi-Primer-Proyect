import os
from flask import Flask, request, jsonify, Blueprint  
import requests
from api.models import db, User, Administrador, Product, Carrito, Post,Categoria, Pedido,PedidoItem,Pago
from api.utils import APIException 
from flask_cors import CORS 
from flask_bcrypt import Bcrypt 
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request  
from datetime import timedelta,datetime  
from werkzeug.utils import secure_filename
import uuid  # para generar guest_id únicos 

#Enviar Mails: 
from flask_mail import Message



def enviar_correo(destino, asunto, cuerpo):

    try:
        from app import mail

        msg = Message(
            subject=asunto,
            recipients=[destino],
            body=cuerpo,
            sender=os.getenv("MAIL_USERNAME")
        )

        mail.send(msg)

    except Exception as e:
        print("Error enviando correo:", e) 
    
    
def correo_bienvenida(usuario):
    
    cuerpo = f"""
Hola {usuario.name}

Bienvenido a nuestra tienda.

Tu cuenta fue creada correctamente.

Email: {usuario.email}

Gracias por registrarte.
"""

    enviar_correo(
        usuario.email,
        "Bienvenido a nuestra tienda",
        cuerpo
    ) 
    
def correo_recibo_pedido(usuario, pedido, items):
    
    detalle_productos = ""

    for item in items:

        detalle_productos += f"""
Producto: {item.product.name}
Cantidad: {item.cantidad}
Precio: L {item.precio_unitario}
"""

    cuerpo = f"""
Hola {usuario.name}

Tu pedido fue creado correctamente.

Numero de pedido: {pedido.pedido_id}

Direccion de envio:
{pedido.direccion}

Productos:
{detalle_productos}

Total: L {pedido.total}

Gracias por tu compra.
"""

    enviar_correo(
        usuario.email,
        "Confirmación de pedido",
        cuerpo
    )

 

UPLOAD_FOLDER = './uploads'  # Carpeta donde guardarás las imágenes
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'} 

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS 

app = Flask(__name__) 
api = Blueprint('api', __name__)  
pagos_api = Blueprint('pagos_api', __name__)


# Aquí agregamos la configuración de la carpeta para subir imágenes
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Crear la carpeta si no existe (esto es opcional pero recomendable)
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

CORS(app)

# Encriptacion JWT
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY_OWN', 'super-secret-key') 
app.config["JWT_TOKEN_LOCATION"] = ["headers"] 

bcrypt = Bcrypt() 
jwt = JWTManager() 
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
        if not data.get('email') or not data.get('name') or not data.get('password') or not data.get('direccion') or not data.get('telefono'): 
            return jsonify({'error':'Email, Name ,Direction,Telephone and  Password are required'}),400 
        
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
            direccion=data.get('direccion'), 
            telefono=data.get('telefono'), 
            password=password_hash
        )
        #Guardar usuario en la base de datos 
        db.session.add(new_user) 
        db.session.commit()   
        
        correo_bienvenida(new_user) 
        

        #Datos a retornar (sin Contrasena por seguridad) 
        ok_to_share={ 
            "id":new_user.user_id, 
            "name":new_user.name, 
            "direccion":new_user.direccion,
            "telefono":new_user.telefono, 
            "role":new_user.role,
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
                "name":login_user.name,
                "id":login_user.user_id, 
                "telefono":login_user.telefono, 
                "direccion":login_user.direccion, 
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
    if "direccion" in data: 
        user.direccion=data["direccion"] 
    if "telefono" in data: 
        user.telefono=data["telefono"] 
    if "foto_perfil" in data:
        user.foto_perfil=data["foto_perfil"]
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
            "email":new_admin.email,
           
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
                "name":login_admin.name,   
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
       # Verificar si el email ya existe en otro admin distinto a este
        existing_admin = Administrador.query.filter(
            Administrador.email == data["email"],
            Administrador.admin_id != admin_id  # Excluir al admin que editamos
        ).first()
        if existing_admin:
            return jsonify({'error': 'Email ya está en uso por otro administrador'}), 400
        admin.email = data["email"] 
 
    if "foto_perfil" in data: 
        admin.foto_perfil = data["foto_perfil"]
    if "password" in data: 
        password_hash =bcrypt.generate_password_hash(data.get('password')).decode('utf-8') 
        admin.password=password_hash 
    if not isinstance(data,dict): 
        return jsonify({'error':"los datos deben ser un diccionario"}),400 
    
    try: 
        db.session.commit() 
        return jsonify({'message':"El Administrador se actualizo correctamente"}),200 
    except Exception as e: 
        db.session.rollback() 
        return jsonify({"error":str(e)}),500

#Admin Elimina Usuario 
@api.route('/admin/delete_user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    claims = get_jwt()
    admin_id = get_jwt_identity()

    if claims.get('role') != 'admin':
        return jsonify({'error': 'Acceso denegado. Solo los administradores pueden eliminar usuarios.'}), 403

    if user_id == admin_id:
        return jsonify({'error': 'No puedes eliminar tu propia cuenta desde esta ruta.'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado.'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'msg': 'Usuario eliminado exitosamente por el administrador.'}), 200
#Agregar Producto 
@api.route('/producto',methods=['POST']) 
@jwt_required() #obliga a que el usuario esté logueado
def crear_producto():  
    admin_id = get_jwt_identity()  #  obtiene el ID del usuario desde el token

    admin = Administrador.query.get(admin_id)  #  busca al usuario en la base de datos
    if not admin or admin.role != "admin":  #  valida que sea admin
        return jsonify({"msg": "Acceso denegado. Solo los administradores pueden crear productos."}), 403

    #Verificamos si hay imagen  
    if 'imagen' not in request.files: 
        return jsonify({'msg': 'No se ha proporcionado una imagen'}), 400 
    
    imagen = request.files['imagen']  #  obtenemos la imagen del request 
    
    if imagen.filename == '':  #  verificamos que la imagen tenga un nombre
        return jsonify({'msg': 'No se ha proporcionado una imagen con nombre'}), 400 
    
    if not allowed_file(imagen.filename):  #  validamos el tipo de archivo
        return jsonify({'msg': 'Tipo de archivo no permitido. Solo se permiten imágenes'}), 400 
    
    # Guardamos la imagen en el servidor    
    filename = secure_filename(imagen.filename) 
    print("Guardando imagen en:", os.path.join(app.config['UPLOAD_FOLDER'], filename))

    imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))



    data= request.form
    try:
        precio = float(data['precio'])  #  convierte string a float
    except ValueError:
        return jsonify({'msg': 'El precio debe ser un número (sin texto como "lps")'}), 400

    try:
        cantidad = int(data['cantidad'])  #  también valida cantidad
    except ValueError:
        return jsonify({'msg': 'La cantidad debe ser un número entero'}), 400 
    
    categoria_id= data.get('categoria_id')  #  obtenemos la categoría del producto, si no se envía, será None
    
    nuevo_producto=Product( 
        name=data['name'], 
        descripcion=data['descripcion'], 
        categoria_id=categoria_id,  #  asignamos la categoría, puede ser None
        precio=precio, 
        imagen=filename, 
        cantidad=cantidad, 

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

#GET Producto por ID 
@api.route('/producto/<int:product_id>',methods=['GET']) 
def get_producto(product_id): 
    product=Product.query.get(product_id) 
    if not product: 
        return jsonify({'error':'Producto no encontrado'}),404 
    
    return jsonify(product.serialize()),200     
#Editar Producto PUT  
@api.route('/edit_producto/<int:product_id>', methods=['PUT'])
@jwt_required()
def edit_producto(product_id):
    admin_id = get_jwt_identity()

    admin = Administrador.query.get(admin_id)
    if not admin or admin.role != "admin":
        return jsonify({"msg": "Acceso denegado. Solo los administradores pueden crear productos."}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 400

    # Detectar si es FormData (con archivo) o JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form.to_dict()

        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                import time
                timestamp = str(int(time.time()))
                filename = f"{timestamp}_{filename}"

                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)

                product.imagen = f"{filename}"
            elif file and file.filename != '':
                return jsonify({'error': 'Archivo no permitido'}), 400
        # Si no hay imagen nueva, dejamos la actual sin cambios

    else:
        data = request.json
        if not isinstance(data, dict):
            return jsonify({'error': "Los datos deben ser un diccionario"}), 400

    # Actualizamos campos (validando que existan y no estén vacíos)
    if "name" in data and data["name"]:
        product.name = data['name']

    if "precio" in data and data["precio"]:
        try:
            product.precio = float(data['precio'])
        except ValueError:
            return jsonify({'error': 'El precio debe ser un número'}), 400

    if "cantidad" in data and data["cantidad"]:
        try:
            product.cantidad = int(data['cantidad'])
        except ValueError:
            return jsonify({'error': 'La cantidad debe ser un entero'}), 400

    if "descripcion" in data and data["descripcion"]:
        product.descripcion = data['descripcion']

    try:
        db.session.commit()

        return jsonify({
            'message': 'El Producto se actualizó correctamente',
            'producto': {
                'product_id': product.product_id,
                'name': product.name,
                'descripcion': product.descripcion,
                'precio': product.precio,
                'cantidad': product.cantidad,
                'imagen': product.imagen
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

#DELETE Producto 
@api.route('/delete_producto/<int:product_id>',methods=['DELETE']) 
@jwt_required()  # 👈 obliga a que el usuario esté logueado
def delete_producto(product_id): 
    admin_id = get_jwt_identity()  # 👈 obtiene el ID del usuario desde el token

    admin = Administrador.query.get(admin_id)  # 👈 busca al usuario en la base de datos
    if not admin or admin.role != "admin":  # 👈 valida que sea admin
        return jsonify({"msg": "Acceso denegado. Solo los administradores pueden crear productos."}), 403 
    product=Product.query.get(product_id) 
    if product: 

        db.session.delete(product) 
        db.session.commit() 
        return jsonify('Producto Borrado'),200 
    return jsonify({'message':"Producto no Encontrado","product_id":product_id}),404 
#Crear Carrito 
@api.route('/carrito', methods=['POST']) 
def agregar_a_carrito(): 
    data = request.get_json()
    product_id = data.get('product_id')
    cantidad = data.get('cantidad', 1)
    guest_id = data.get('guest_id')  # 🔹 viene del frontend si es invitado

    # Intentamos obtener user_id si hay token
    user_id = None
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
    except:
        pass

    if not product_id:
        return jsonify({'error': "Falta el ID del Producto"}), 400  

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 400 

    # 🔹 Verificar stock
    if cantidad > product.cantidad:
        return jsonify({'error': f'No hay suficiente stock. Disponible: {product.cantidad}'}), 400

    # 🔹 Si es usuario logueado
    if user_id:
        carrito_item = Carrito.query.filter_by(user_id=user_id, product_id=product_id).first()
    else:
        # 🔹 Si es invitado
        if not guest_id:
            guest_id = str(uuid.uuid4())  # genera un id temporal si no lo trae
        carrito_item = Carrito.query.filter_by(guest_id=guest_id, product_id=product_id).first()

    if carrito_item:
        nueva_cantidad = carrito_item.cantidad + cantidad
        if nueva_cantidad > product.cantidad:
            return jsonify({'error': f'No hay suficiente stock. Cantidad disponible: {product.cantidad}'}), 400
        carrito_item.cantidad = nueva_cantidad
    else:
        carrito_item = Carrito(product_id=product_id, cantidad=cantidad, user_id=user_id, guest_id=guest_id)
        db.session.add(carrito_item)

    db.session.commit()

    return jsonify({
        "msg": "Producto agregado al carrito",
        "guest_id": guest_id  # 🔹 devolvemos guest_id para guardarlo en el frontend
    }), 201
#GET del CARRITO 
@api.route('/carrito', methods=['GET'])
def ver_carrito():
    user_id = None
    guest_id = request.args.get('guest_id')

    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
    except:
        pass

    if user_id:
        carrito = Carrito.query.filter_by(user_id=user_id).all()
    elif guest_id:
        carrito = Carrito.query.filter_by(guest_id=guest_id).all()
    else:
        return jsonify([]), 200

    resultado = [
        {
            "carrito_id": item.carrito_id,
            "producto": item.product.serialize(),
            "cantidad": item.cantidad
        }
        for item in carrito
    ]
    return jsonify(resultado), 200


#PUT DE CARRITO 
@api.route("/carrito/<int:carrito_id>", methods=['PUT'])
def editar_carrito(carrito_id):

    data = request.get_json()  # obtiene datos enviados
    guest_id = data.get("guest_id")  # guest_id si es invitado
    nueva_cantidad = data.get("cantidad")

    user_id = None

    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
    except:
        pass

    if user_id:
        carrito = Carrito.query.filter_by(carrito_id=carrito_id, user_id=user_id).first()
    else:
        carrito = Carrito.query.filter_by(carrito_id=carrito_id, guest_id=guest_id).first()

    if not carrito:
        return jsonify({"error": "Carrito no encontrado"}), 404

    producto = Product.query.get(carrito.product_id)

    if nueva_cantidad > producto.cantidad:
        return jsonify({"error": f"No hay suficiente stock. Solo hay {producto.cantidad}"}), 400

    if nueva_cantidad < 1:
        db.session.delete(carrito)
        db.session.commit()
        return jsonify({"msg": "Producto eliminado del carrito"}), 200

    carrito.cantidad = nueva_cantidad

    db.session.commit()

    return jsonify({"msg": "Cantidad actualizada"}), 200

#DELETE CARRITO completo
@api.route('/carrito', methods=['DELETE'])
def vaciar_carrito():

    guest_id = request.args.get("guest_id")

    user_id = None

    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
    except:
        pass

    if user_id:
        Carrito.query.filter_by(user_id=user_id).delete()

    elif guest_id:
        Carrito.query.filter_by(guest_id=guest_id).delete()

    else:
        return jsonify({"error": "No se encontro carrito"}), 400

    db.session.commit()

    return jsonify({"msg": "Carrito vaciado"}), 200

#DELETE Prodcuto del  CARRITO 
@api.route('/delete_carrito/<int:carrito_id>', methods=["DELETE"])
def delete_carrito(carrito_id):

    guest_id = request.args.get("guest_id")

    user_id = None

    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
    except:
        pass

    if user_id:
        carrito = Carrito.query.filter_by(carrito_id=carrito_id, user_id=user_id).first()
    else:
        carrito = Carrito.query.filter_by(carrito_id=carrito_id, guest_id=guest_id).first()

    if not carrito:
        return jsonify({"error": "Carrito no encontrado"}), 404

    db.session.delete(carrito)
    db.session.commit()

    return jsonify({"msg": "Producto eliminado"}), 200

#Agregamos  Crear Categoria para cada producto 
@api.route('/categoria', methods=['POST'])
@jwt_required()
def crear_categoria():
    admin_id = get_jwt_identity()
    admin = Administrador.query.get(admin_id)
    if not admin or admin.role != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    data = request.get_json()
    nombre_categoria = data.get('nombre')

    if not nombre_categoria:
        return jsonify({"msg": "El nombre de la categoría es requerido"}), 400

    nueva_categoria = Categoria(nombre=nombre_categoria)
    db.session.add(nueva_categoria)
    db.session.commit()

    return jsonify({'msg': 'Categoría creada exitosamente', 'categoria': nueva_categoria.serialize()}), 201 
#GET Categorias 
@api.route('/categoria', methods=['GET'])
def get_categorias():
    categorias = Categoria.query.all()
    return jsonify([categoria.serialize() for categoria in categorias]), 200 
#GET EL Producto de la Categoria por ID 
@api.route('/productos/categoria/<int:categoria_id>', methods=['GET'])
def get_productos_por_categoria(categoria_id):
    productos = Product.query.filter_by(categoria_id=categoria_id).all()

    if not productos:
        return jsonify({'msg': 'No se encontraron productos en esta categoría'}), 404

    return jsonify([producto.serialize() for producto in productos]), 200 

# DELETE Categoria
@api.route('/categoria/<int:categoria_id>', methods=['DELETE'])
@jwt_required()
def eliminar_categoria(categoria_id):
    admin_id = get_jwt_identity()
    admin = Administrador.query.get(admin_id)
    if not admin or admin.role != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    categoria = Categoria.query.get(categoria_id)
    if not categoria:
        return jsonify({"msg": "Categoría no encontrada"}), 404

    # No eliminamos los productos, solo quitamos la categoría
    db.session.delete(categoria)
    db.session.commit()

    return jsonify({"msg": "Categoría eliminada correctamente"}), 200 

#ver Informacion de la Categoria como el nombre Dependiendo el id 
@api.route('/categoria/<int:categoria_id>', methods=['GET'])
def get_categoria(categoria_id):
    categoria = Categoria.query.get(categoria_id)
    if not categoria:
        return jsonify({"msg": "Categoría no encontrada"}), 404
    return jsonify(categoria.serialize()), 200 



# PUT para actualizar nombre de la categoría
@api.route('/categoria/<int:categoria_id>', methods=['PUT'])
@jwt_required()
def actualizar_categoria(categoria_id):
    admin_id = get_jwt_identity()
    admin = Administrador.query.get(admin_id)
    if not admin or admin.role != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    categoria = Categoria.query.get(categoria_id)
    if not categoria:
        return jsonify({"msg": "Categoría no encontrada"}), 404

    data = request.get_json()
    nuevo_nombre = data.get('nombre')
    if not nuevo_nombre:
        return jsonify({"msg": "El nombre es requerido"}), 400

    categoria.nombre = nuevo_nombre
    db.session.commit()

    return jsonify({'msg': 'Categoría actualizada', 'categoria': categoria.serialize()}), 200 

#Asignando Categoria: 
@api.route('/producto/<int:product_id>/categoria/<int:categoria_id>', methods=['PUT'])
@jwt_required()
def asignar_categoria_producto(product_id, categoria_id):

    admin_id = get_jwt_identity()  # obtiene el admin logueado
    admin = Administrador.query.get(admin_id)  # busca el admin en BD

    if not admin or admin.role != "admin":  # valida que sea admin
        return jsonify({"msg": "Acceso denegado"}), 403

    producto = Product.query.get(product_id)  # busca el producto

    if not producto:
        return jsonify({"msg": "Producto no encontrado"}), 404

    categoria = Categoria.query.get(categoria_id)  # busca la categoria

    if not categoria:
        return jsonify({"msg": "Categoria no encontrada"}), 404

    producto.categoria_id = categoria_id  # asigna categoria

    db.session.commit()  # guarda cambios

    return jsonify({
        "msg": "Categoria asignada correctamente",
        "producto": producto.serialize()
    }), 200 
    
#quitar de Categoria: 
@api.route('/producto/<int:product_id>/categoria', methods=['DELETE'])
@jwt_required()
def quitar_categoria_producto(product_id):

    admin_id = get_jwt_identity()
    admin = Administrador.query.get(admin_id)

    if not admin or admin.role != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    producto = Product.query.get(product_id)

    if not producto:
        return jsonify({"msg": "Producto no encontrado"}), 404

    producto.categoria_id = None  # quitamos la categoria

    db.session.commit()

    return jsonify({"msg": "Categoria removida del producto"}), 200



# ----------------------
# Pago PixelPay
# ----------------------
@api.route('/pago/pixelpay', methods=['POST'])
def crear_pago_pixelpay():
    data = request.get_json()
    pedido_id = data.get('pedido_id')

    pedido = Pedido.query.get(pedido_id)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    PIXELPAY_API_KEY = os.getenv("PIXELPAY_API_KEY")
    PIXELPAY_PRIVATE_KEY = os.getenv("PIXELPAY_PRIVATE_KEY")

    payload = {
        "amount": float(pedido.total),
        "order_id": str(pedido.pedido_id),
        "currency": "USD",
        "description": f"Pago pedido #{pedido.pedido_id}",
        "customer": {"name": pedido.pago.nombre if pedido.pago else "Cliente"}
    }

    url = "https://pixelpay.dev/api/v2/transaction/sale"
    headers = {
        "X-Api-Key": PIXELPAY_API_KEY,
        "X-Private-Key": PIXELPAY_PRIVATE_KEY,
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)
    if response.status_code != 200:
        return jsonify({"error": "No se pudo crear pago PixelPay", "detalle": response.json()}), 400

    data_pixel = response.json()
    pago = Pago(
        pedido_id=pedido_id,
        metodo="pixelpay",
        estado="pendiente",
        referencia=data_pixel["data"]["transaction_id"]
    )
    db.session.add(pago)
    db.session.commit()

    return jsonify({
        "msg": "Pago PixelPay creado",
        "pago_id": pago.pago_id,
        "transaccion_id": pago.referencia,
        "pago_url": data_pixel["data"]["payment_url"]
    }), 200

# ----------------------
# Pago Transferencia
# ----------------------
@api.route('/pago/transferencia', methods=['POST'])
def crear_pago_transferencia():
    data = request.get_json()
    pedido_id = data.get('pedido_id')

    pedido = Pedido.query.get(pedido_id)
    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    pago = Pago(
        pedido_id=pedido_id,
        metodo="transferencia",
        estado="pendiente",
        referencia=str(uuid.uuid4())
    )
    db.session.add(pago)
    db.session.commit()

    return jsonify({
        "msg": "Pago por transferencia creado",
        "pago_id": pago.pago_id,
        "referencia": pago.referencia,
        "estado": pago.estado
    }), 200

#Pagos de pago 
@api.route('/admin/pagos', methods=['GET'])
def ver_todos_pagos():
    pagos = Pago.query.order_by(Pago.fecha.desc()).all()
    resultado = []

    for p in pagos:
        pedido = Pedido.query.get(p.pedido_id)
        resultado.append({
            "pago_id": p.pago_id,
            "pedido_id": p.pedido_id,
            "metodo": p.metodo,
            "estado": p.estado,
            "referencia": p.referencia,
            "monto_total": pedido.total if pedido else 0,
            "fecha_pago": p.fecha.isoformat(),
           "usuario": {
    "nombre": pedido.user.name if pedido and pedido.user else "Invitado",
    "email": pedido.user.email if pedido and pedido.user else None
},
            "items": [
                {
                    "product_id": i.product_id,
                    "cantidad": i.cantidad,
                    "precio_unitario": i.precio_unitario
                } for i in pedido.items
            ] if pedido else []
        })

    return jsonify(resultado), 200 

#Pagos de Usuario 
@api.route('/usuario/pagos', methods=['GET'])
def ver_pagos_usuario():
    user_id = request.args.get('user_id')
    guest_id = request.args.get('guest_id')

    if user_id:
        pedidos = Pedido.query.filter_by(user_id=user_id).all()
    elif guest_id:
        pedidos = Pedido.query.filter_by(guest_id=guest_id).all()
    else:
        return jsonify({"error": "Se requiere user_id o guest_id"}), 400

    resultado = []
    for pedido in pedidos:
        pagos = Pago.query.filter_by(pedido_id=pedido.pedido_id).all()
        resultado.append({
            "pedido_id": pedido.pedido_id,
            "estado_pedido": pedido.estado,
            "total": pedido.total,
            "fecha": pedido.fecha.isoformat(),
            "items": [
                {
                    "product_id": i.product_id,
                    "cantidad": i.cantidad,
                    "precio_unitario": i.precio_unitario
                } for i in pedido.items
            ],
            "pagos": [
                {
                    "pago_id": p.pago_id,
                    "metodo": p.metodo,
                    "estado": p.estado,
                    "referencia": p.referencia,
                    "fecha_pago": p.fecha.isoformat()
                } for p in pagos
            ]
        })
    return jsonify(resultado), 200 

# ======================
# Cancelar pedido
# ======================

@api.route('/pedido/<int:pedido_id>/cancelar', methods=['PUT'])
def cancelar_pedido(pedido_id):

    pedido = Pedido.query.get(pedido_id)

    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    pedido.estado = "cancelado"
    pedido.estado_envio = "cancelado"

    db.session.commit()

    return jsonify({
        "msg": "Pedido cancelado",
        "pedido_id": pedido.pedido_id,
        "estado": pedido.estado,
        "estado_envio": pedido.estado_envio
    }), 200
# ======================
# Actualizar estado del pago de PAGADO Y PENDIENTE
# ======================
@api.route('/pago/<int:pago_id>', methods=['PUT'])
def actualizar_estado_pago(pago_id):
    data = request.get_json()
    nuevo_estado = data.get('estado')

    pago = Pago.query.get(pago_id)
    if not pago:
        return jsonify({"error": "Pago no encontrado"}), 404

    pago.estado = nuevo_estado
    db.session.commit()

    return jsonify({
        "msg": "Estado del pago actualizado",
        "pago_id": pago.pago_id,
        "estado": pago.estado
    }), 200 
    

# ======================
# Actualizar estado del pago de ENVIADO y ENRTEGADO
# ======================
@api.route('/pedido/<int:pedido_id>/envio', methods=['PUT'])
def actualizar_estado_envio(pedido_id):

    data = request.get_json()

    estado_envio = data.get("estado_envio")

    estados_validos = ["preparando", "enviado", "entregado"]

    if estado_envio not in estados_validos:
        return jsonify({"error": "Estado de envío inválido"}), 400

    pedido = Pedido.query.get(pedido_id)

    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    pedido.estado_envio = estado_envio

    db.session.commit()

    return jsonify({
        "msg": "Estado de envío actualizado",
        "pedido_id": pedido.pedido_id,
        "estado_envio": pedido.estado_envio
    }), 200


# EL ADMIN VE LO PAGOS EN UNA TABLA
@api.route('/admin/pagos/usuario/<int:user_id>', methods=['GET'])
def admin_pagos_por_usuario(user_id):
    pagos = Pago.query.join(Pedido).filter(Pedido.user_id == user_id).all()
    resultado = []

    for pago in pagos:
        pedido = pago.pedido
        resultado.append({
            "pago_id": pago.pago_id,
            "estado": pago.estado,
            "metodo": pago.metodo,
            "referencia": pago.referencia,
            "fecha": pago.fecha.isoformat(),
            "pedido_id": pedido.pedido_id,
            "total": pedido.total,
            "items": [
                {
                    "product_id": item.product_id,
                    "cantidad": item.cantidad,
                    "precio_unitario": item.precio_unitario
                } for item in pedido.items
            ]
        })
    return jsonify(resultado), 200



# ======================
# CREAR PEDIDO
# ======================

@api.route('/pedido', methods=['POST'])
def crear_pedido():

    data = request.get_json()  # obtenemos datos enviados desde frontend

    total = data.get("total")  # total enviado
    direccion = data.get("direccion")  # dirección del pedido
    guest_id = data.get("guest_id")  # id invitado
    user_id = data.get("user_id")  # id usuario

    # -----------------------------
    # MIGRAR CARRITO GUEST → USER
    # -----------------------------

    if user_id and guest_id:

        carrito_guest = Carrito.query.filter_by(guest_id=guest_id).all()  
        # buscamos carrito del invitado

        for item in carrito_guest:

            item.user_id = user_id  # asignamos ahora al usuario
            item.guest_id = None    # quitamos guest_id

        db.session.commit()  # guardamos cambios

    # -----------------------------
    # OBTENER CARRITO
    # -----------------------------

    carrito_items = []

    if user_id:
        carrito_items = Carrito.query.filter_by(user_id=user_id).all()  
        # buscamos carrito del usuario

    if not carrito_items and guest_id:
        carrito_items = Carrito.query.filter_by(guest_id=guest_id).all()  
        # si no hay carrito user buscamos guest

    # validar carrito vacío
    if not carrito_items:

        return jsonify({"error": "El carrito está vacío"}), 400

    # -----------------------------
    # CREAR PEDIDO
    # -----------------------------

    nuevo_pedido = Pedido(
        total=total,
        direccion=direccion,
        guest_id=guest_id,
        user_id=user_id,
        estado="pendiente", 
        estado_envio="preparando"
    )

    db.session.add(nuevo_pedido)

    db.session.flush()  
    # genera pedido_id antes del commit

    # -----------------------------
    # CREAR ITEMS DEL PEDIDO
    # -----------------------------

    for item in carrito_items:

        producto = Product.query.get(item.product_id)  
        # buscamos producto

        pedido_item = PedidoItem(
            pedido_id=nuevo_pedido.pedido_id,
            product_id=item.product_id,
            cantidad=item.cantidad,
            precio_unitario=producto.precio
        )

        db.session.add(pedido_item)

    # -----------------------------
    # VACIAR CARRITO
    # -----------------------------

    if user_id:

        Carrito.query.filter_by(user_id=user_id).delete()

    else:

        Carrito.query.filter_by(guest_id=guest_id).delete()

    db.session.commit() 
    
    if user_id:
        usuario = User.query.get(user_id)

        correo_recibo_pedido(
        usuario,
        nuevo_pedido,
        nuevo_pedido.items
    )

    return jsonify({
        "msg": "Pedido creado",
        "pedido_id": nuevo_pedido.pedido_id,
        "total": nuevo_pedido.total
    }), 201

# ======================
# Historial de pedidos usuario
# ======================
@api.route('/pedidos', methods=['GET'])
def obtener_pedidos():

    user_id = request.args.get("user_id")
    guest_id = request.args.get("guest_id")

    if user_id:
        pedidos = Pedido.query.filter_by(user_id=user_id)\
            .order_by(Pedido.fecha.desc()).all()

    elif guest_id:
        pedidos = Pedido.query.filter_by(guest_id=guest_id)\
            .order_by(Pedido.fecha.desc()).all()

    else:
        return jsonify({"error": "Debe enviar user_id o guest_id"}), 400

    resultado = []

    for pedido in pedidos:

        usuario = pedido.user.serialize() if pedido.user else {
            "name": "Invitado",
            "email": None,
            "telefono": None
        }

        resultado.append({
            "pedido_id": pedido.pedido_id,
            "fecha": pedido.fecha.isoformat() if pedido.fecha else None,
            "total": pedido.total,
            "estado": pedido.estado,
            "estado_envio": pedido.estado_envio, 
            "comentario": pedido.comentario,

            "usuario": {
                "name": usuario.get("name"),
                "email": usuario.get("email"),
                "telefono": usuario.get("telefono"),
                "direccion": pedido.direccion
            },

            "items": [
                {
                    "product_id": item.product_id,
                    "nombre": item.product.name,
                    "imagen": item.product.imagen,
                    "cantidad": item.cantidad,
                    "precio_unitario": item.precio_unitario
                }
                for item in pedido.items
            ],

            "pagos": [
                {
                    "metodo": pago.metodo,
                    "estado": pago.estado,
                    "referencia": pago.referencia
                }
                for pago in pedido.pagos
            ]
        })

    return jsonify(resultado), 200


# ======================
# Obtener pedidos de un día específico
# ======================
@api.route('/admin/pedidos/fecha/<fecha>', methods=['GET'])
def pedidos_por_fecha(fecha):

    try:
        fecha_dt = datetime.strptime(fecha, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Formato inválido"}), 400

    pedidos = Pedido.query.filter(
        db.func.date(Pedido.fecha) == fecha_dt.date()
    ).all()

    resultado = []

    for pedido in pedidos:

        usuario = pedido.user.serialize() if pedido.user else {
            "name": "Invitado",
            "email": None,
            "telefono": None,
            "direccion": pedido.direccion
        }

        resultado.append({
            "pedido_id": pedido.pedido_id,
            "fecha": pedido.fecha.isoformat(),
            "total": pedido.total,
            "estado": pedido.estado, 
            "estado_envio": pedido.estado_envio, 
            "comentario": pedido.comentario,

            "usuario": {
                "name": usuario.get("name"),
                "email": usuario.get("email"),
                "telefono": usuario.get("telefono"),
                "direccion": pedido.direccion
            },

            "items": [
                {
                    "product_id": item.product_id,
                    "nombre": item.product.name,
                    "cantidad": item.cantidad,
                    "precio_unitario": item.precio_unitario
                } for item in pedido.items
            ],

            "pagos": [
                {
                    "pago_id": pago.pago_id,
                    "metodo": pago.metodo,
                    "estado": pago.estado,
                    "referencia": pago.referencia
                } for pago in pedido.pagos
            ]
        })

    return jsonify(resultado), 200

# ======================
# Historial de pedidos por usuario ID
# ======================
@api.route('/pedidos/usuario/<int:user_id>', methods=['GET'])
def pedidos_por_usuario(user_id):

    usuario = User.query.get(user_id)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404


    pedidos = Pedido.query.filter_by(user_id=user_id)\
        .order_by(Pedido.fecha.desc()).all()


    resultado = []

    for pedido in pedidos:

        resultado.append({
            "pedido_id": pedido.pedido_id,
            "fecha": pedido.fecha.isoformat() if pedido.fecha else None,
            "total": pedido.total,
            "estado": pedido.estado, 
            "estado_envio": pedido.estado_envio,
            "comentario": pedido.comentario,
            
            "usuario": {
                "user_id": usuario.user_id,
                "name": usuario.name,
                "email": usuario.email
            },

            "items": [
                {
                    "product_id": item.product_id,
                    "nombre": item.product.name,
                    "imagen": item.product.imagen,
                    "cantidad": item.cantidad,
                    "precio_unitario": item.precio_unitario
                }
                for item in pedido.items
            ],

            "pagos": [
                {
                    "metodo": pago.metodo,
                    "estado": pago.estado,
                    "referencia": pago.referencia
                }
                for pago in pedido.pagos
            ]
        })

    return jsonify(resultado), 200


#Buscar Productos 
@api.route('/buscar/productos')  
def buscar_productos():  
    query=request.args.get('query','') #Capurtra lo que escriviste en el input 
    if not query: 
        return jsonify([]) #si no hay nada, devuelve lista vacia 
    
    product=Product.query.filter(Product.name.ilike(f'%{query}%')).all() #Busca Coincidencias  /api/buscar/productos?query=a

    return jsonify([p.serialize()for p in product]) #Devuelve JSON para los productos 

#Buscar Clientes 
@api.route('/buscar/clientes')  
@jwt_required()
def buscar_clientes():  

    admin_id = get_jwt_identity()
    admin = Administrador.query.get(admin_id)

    if not admin or admin.role != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    query=request.args.get('query','') 
    if not query: 
        return jsonify([])#Sino hay nada devuelve lista vacia 
    
    clientes=User.query.filter(User.name.ilike(f'%{query}%')).all()#Buscar Coincidencias 
    return jsonify([c.serialize() for c in clientes ])#Devuelve JSON para los clientes 
 
 
#Ruta para guardar comentarios en los pedidos: 
@api.route('/pedido/<int:pedido_id>/comentario', methods=['PUT'])
def actualizar_comentario(pedido_id):

    data = request.get_json()

    comentario = data.get("comentario")

    pedido = Pedido.query.get(pedido_id)

    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404

    pedido.comentario = comentario

    db.session.commit()

    return jsonify({
        "msg": "Comentario guardado",
        "pedido_id": pedido.pedido_id,
        "comentario": pedido.comentario
    }), 200