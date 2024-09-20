# Laboratorio

## Instalación de Aplicación en entorno de Producción

### En el AppServer1

1. Conectarse al Servidor
   
   ```bash
   ssh usuario@ip-del-servidor
   ```

2. Instalar Node.js y npm

    2.1. Actualizar base de datos de paquetes
    ```bash
    sudo apt update
    ```

    2.2. Instalar node.js y npm 
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt install -y nodejs
    ```
    2.3. Verificar la instalación:
    ```bash
    node -v
    npm -v
    ````

3. Instalar Git

    3.1. instalar paquete
    ```bash
    sudo apt install git -y
    ```
    3.2. Verificar la instalación
    ```bash
    git --version
    ```
4. Clonar el Repositorio
Clonar el repositorio con el código de la aplicación en el directorio /var/www/ (o cualquier directorio que prefiera para alojar tu app):
    4.1. Crear el directorio para alojar el proyecto de la app si no existe
    ```bash
    sudo mkdir /var/www
    ```
    4.2. Clonar el repositorio en el directorio de destino
    ```bash
    cd /var/www/
    sudo git clone https://github.com/Unahur-Programacion-Concurrente/operaciones-HA.git expense-tracker-app
    ```
    4.3. Cambiar temporalmente usuario y grupo dueño del directorio destino
    ```bash
    sudo chown -R $USER:www-data /var/www/expense-tracker-app/backend
    ````

5. Instalar las Dependencias del Backend

    5.1. Cambiar al directorio del backend
    ```bash
    cd expense-tracker-app/backend
    ```
    5.2. Instalar las dependencias
    ```bash
    sudo npm install
    ```
6. Configurar Variables de Entorno con dotenv
Crear un archivo .env en el directorio del backend para almacenar las variables de entorno.

    5.1. Cambiar al directorio del backend
    ```bash
    cd expense-tracker-app/backend
    ```
    5.3 Editar el archivo ```.env```
    ```bash
    nano .env
    ````
    Agregar las siguientes variables de entorno (ajustando los valores correspondientes a su entorno):
    ```bash
    MONGO_URI=mongodb://<IP_SERVER_MONGODB>:27017/expense-tracker
    PORT=3000
    SERVER_IP=<IP_APP_SERVER>  # Reemplazar con la IP del servidor
    NODE_ENV=production
    ````

7. Instalar PM2 para Manejar el Backend
PM2 es un administrador de procesos que permite mantener la aplicación corriendo en segundo plano. 
    
    7.1. Instalar PM2:
    ```bash
    sudo npm install pm2 -g
    ```
    7.2. Arrancar PM2:
    ```bash
    pm2 start index.js --name "expense-tracker-backend"
    ```

    7.3 Configuar para que PM2 se inicie automáticamente después de reiniciar el servidor:
    ```bash
    pm2 startup
    pm2 save
    ```

8. Probar Backend
Desde un browser abrir la URL del backend:

    ```arduino
    http://<IP_APP_SERVER>:3000/api/gastos
    ```

9. Instalar Nginx
Instalar Nginx para servir el frontend y hacer de proxy inverso para el backend.

    9.1. Instalar Nginx:
    ```bash
    sudo apt install nginx -y
    ````
    9.2. Habilitar Nginx para que arranque al iniciar el sistema:
    ```bash
    sudo systemctl enable nginx
    sudo systemctl start nginx
    ```
    9.3 Probar nginx
    Con un browser abrir la IP del App Server
    ```arduino
    http://<IP_APP_SERVER>
    ```
10. Configurar Nginx como Proxy Inverso
    Editar el archivo de configuración por defecto de Nginx para configurarlo como proxy inverso para el backend y para servir el frontend.

    10.1. Abrir el archivo de configuración de Nginx:
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ````

    10.2. Configurar el proxy inverso para el backend y el servidor de archivos estáticos del frontend

    **Borrar o comentar todas las líneas existentes y luego agregar las siguientes:**
    ```nginx
    server {
        listen 80;
        server_name tu-dominio.com; # Colocar dirección IP del App Server

        # Proxy inverso para el backend (API)
        location /api/ {
            proxy_pass http://localhost:3000/;  # Backend en Node.js
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Servir el frontend estático
        root /var/www/expense-tracker-app/frontend/build;  # Ruta a tu frontend (compilado)
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }

    }
    ````

    10.3. Verifica que la configuración de Nginx sea correcta:
    ```bash
    sudo nginx -t
    ````

    10.4. Reinicia Nginx para aplicar los cambios:
    ```bash
    sudo systemctl restart nginx
    ````

11. Instalar Dependencias y Compilar el Frontend

    11.1 Crear el archivo para variables de entorno ```.env``` en el directorio raiz del frontend

    ```bash
    cd frontend
    nano .env
    ````
    Agregar la siguiente información:
      ```bash
      API_URL=https://<IP_APP_SERVER>:3000
      NODE_ENV=production
      ````

    11.2. Instalar las dependencias y generar el build de producción:
    ```bash
    cd ../frontend
    npm install
    npm run build
    ````

    Los archivos estáticos generados estarán en el directorio build/, y serán servidos por Nginx desde el bloque de configuración del paso 10.2.

12. Probar la Aplicación
Con un browser abrir la IP del App Server
arduino
http://<IP_APP_SERVER>

## Configuración de HA (Alta Disponibilidad)

### En el AppServer1

13. Instalar App Server Redundante para Alta Disponibilidad (HA)
   13.1. Repetir los pasos 1 a 12 en el servidor AppServer2.

   13.2. Editar el archivo ```frontend/index.html```

   Buscar la línea:
   ```html
    <h1>Registro de Gastos</h1>
   ````
   y reemplazarla por:
   
   ```html
    <h1>Registro de Gastos - AppServer2</h1>
   ```

   (opcional): hacer el mismo cambio, pero colocando Servidor 1 en el otro servidor.
   
   **_Nota:_** _Este paso es solo a fines ilustrativos, no es necesario si fuera una instalación real_


### En el LoadBalancer

14. Instalar Load Balancer

En el servidor LoadBalancer realizar los siguientes pasos de instalación con el usuario **ubuntu**:

   14.1. Instalar Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```
   14.2. Verificar si el servicio está arriba:
   ```bash
   sudo systemctl status nginx
   ```
   Verificar: `Active: active (running)`
   
   Si el servicio no está activo, arrancarlo:
   ```bash
   sudo systemctl start nginx
   ```

   14.3. Verificar que el servicio esté habilitado para arrancar automáticamente si el servidor se reinicia:

   ```bash
   sudo systemctl is-enabled nginx
   ```
   Verificar: `enabled`

   Si no está habilitado, habilitarlo:
   ```bash
   sudo systemctl enable nginx
   ```
   
   14.4. Configurar nginx como balanceador de carga

   Eliminar el archivo de configuración por defecto de Nginx
   ```bash
   sudo rm -rf /etc/nginx/sites-enabled/default
   ```
   
   Crear un nuevo archivo de configuración de balanceador de carga:
   ```bash
   sudo vi /etc/nginx/conf.d/load-balancing.conf
   ```
   
   Agregar las siguientes líneas en el archivo
   
   ```nginx
      upstream website {

               server \<AppServer1 IP\>:80;
               server \<AppServer2 IP\>:80;
      }

               server {

                  listen     80;
                  location / {
                        proxy\_pass http://website;
                        }

      }
   ```

   Ejemplo:
   ```nginx
         upstream website {

                  server 192.168.170.15:80;
                  server 192.168.170.32:80;

         }
   ```

   14.5. Verificar que no hay errores de sintaxis en la configuración de Nginx con el siguiente comando:

   (no olvidar **sudo**)

   ```bash
   sudo nginx -t   
   ```
 
   14.6. Reiniciar Nginx
   ```bash
   sudo systemctl restart nginx
   ```

   14.7. Probar el balanceo de carga con el navegador
   ```bash
   http://\<dirección IP loadbalancer\>
   ```
   
   Ejemplo:

   ```bash
   http://192.168.170.35
   ```
   **Refrescar en forma periódica la página para comprobar que se alternan los servidores.**


# ANEXO

## Instalación de MongoDB

(ref: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)

En el servidor mongodbX

Importar la clave pública de MongoDB:
```
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
```
Agregar el repositorio de MongoDB (crear archivo .list)
```
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```
Actualizar el índice de paquetes
```
sudo apt-get update
```
Instalar MongoDB

sudo apt-get install -y mongodb-org

Iniciar y habilitar el servicio MongoDB
```
sudo systemctl start mongod
sudo systemctl status mongod
sudo systemctl enable mongod
```
Configurar MongoDB para aceptar conexiones remotas

Abrir el archivo de configuración con un editor de texto (por ejemplo, nano):

sudo nano /etc/mongod.conf

Busca la sección # network interfaces y cambia la opción bindIp para que incluya la IP del servidor. Si deseas permitir conexiones desde cualquier IP, usa 0.0.0.0:
```
net:
  bindIp: 0.0.0.0
  port: 27017
```

Guarda el archivo y cierra el editor.

Reinicia MongoDB para aplicar los cambios:

sudo systemctl restart mongod

Probar el servicio mongod localmente:
mongosh

test> show dbs

Probar el servicio mongod en forma remota:
Instalar el cliente mongoDB en la máquina local o en alguno de los otros dos servidores (appserverX o nagiosX):
Agrega el repositorio de MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

Actualizar la lista de paquetes
sudo apt update

Instalar el cliente MongoDB
sudo apt install mongodb-mongosh

Probar la conexión con MongoDB externo:
mongosh "mongodb://<mongodbX-IP>:27017"

test> show dbs


