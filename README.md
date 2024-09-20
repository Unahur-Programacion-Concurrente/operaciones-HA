# Laboratorio

## Instalación de Aplicación en entorno de Producción

### En el servidor 1 (ex App Server)

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
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
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
    9.3 PROBAR NGINX?

10. Configurar Nginx como Proxy Inverso
    Editar el archivo de configuración por defecto de Nginx para configurarlo como proxy inverso para el backend y para servir el frontend.

    10.1. Abrir el archivo de configuración de Nginx:
    ```bash
    sudo nano /etc/nginx/sites-available/default
    ````

    10.2. Configurar el proxy inverso para el backend y el servidor de archivos estáticos del frontend:
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
Si el frontend requiere compilación (por ejemplo, si usas React)

    11.1 Instalar las dependencias y generar el build de producción:
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

### En el servidor 2 (ex Nagios)

#### Repetir los mismo pasos realizados en servidor 1

## Configuración de HA (Alta Disponibilidad)

### En el servidor 3

2. ## Instalar Servidor Web Redundante para Alta Disponibilidad (HA)

   1. Repetir los pasos 2.1.1 a 2.1.12 en el servidor webserver2.

   3. ## Instalar Load Balancer

      En el servidor loadbalancer realizar los siguientes pasos de instalación con el usuario **ubuntu**:

      1. Instalar Nginx:

         sudo apt update

         sudo apt install nginx

      2. Verificar si el servicio está arriba:

         sudo systemctl status nginx

         Vericar: Active: active (running)

         

         Si el servicio no está activo, arrancarlo:

         sudo systemctl start nginx

      3. Verificar que el servicio esté habilitado para arrancar automáticamente si el servidor se reinicia:

         sudo systemctl is-enabled nginx

         Verificar: enabled

         Si no está habilitado, habilitarlo:

         sudo systemctl enable nginx

      4. Configurar nginx como balanceador de carga

         Eliminar el archivo de configuración por defecto de Nginx

         sudo rm \-rf /etc/nginx/sites-enabled/default

         Crear un nuevo archivo de configuración de balanceador de carga:

         sudo vi /etc/nginx/conf.d/load-balancing.conf

         Agregar las siguientes líneas en el archivo

         upstream website {

                 server \<webserver1 IP\>:8080;

                 server \<webserver2 IP\>:8080;

         }

                 server {

                     listen     80;

                     location / {

                         proxy\_pass http://website;

                         }

         }

         

         Ejemplo:

         upstream website {

                 server 192.168.170.15:8080;

                 server 192.168.170.32:8080;

         }

      5. Verificar que no hay errores de sintaxis en la configuración de Nginx con el siguiente comando:

         sudo nginx \-t   (no olvidar **sudo**)

      6. Reiniciar Nginx

         sudo systemctl restart nginx

      7. Probar el balanceo de carga con el navegador

         http://\<dirección IP loadbalancer\>

         Ejemplo:

         http://192.168.170.35

         Refrescar en forma periódica la página para comprobar que se alternan los servidores. 

   4. ## Configurar Firewall

      Nota: si se está accediendo por SSH para realizar esta configuración, asegurarse que el firewall (ufw) esté “inactivo”, caso contrario perderían conexión con la máquina. **Verificar:**

      

      sudo ufw status

      Status: inactive

      1. Habilitar únicamente acceso SSH a todos los servidores

         1. Bloqueo de todo el tráfico que provenga del exterior:

            sudo ufw default deny incoming

         2. Autorización de todas las conexiones salientes:

            sudo ufw default allow outgoing

         3. Permitir conexiones ssh (puerto 22).

            sudo ufw allow ssh

         4. Verificar reglas default (antes de activar)

            sudo cat /etc/default/ufw

            Verificar que están presentes las siguientes líneas:

            DEFAULT\_INPUT\_POLICY="DROP"

            DEFAULT\_OUTPUT\_POLICY="ACCEPT"

         5. Verificar que SSH (22) está autorizado (antes de activar)

            sudo ufw show added

         6. Activar el Firewall

            sudo ufw enable

         7. Listar reglas

            sudo ufw status verbose

         8. Comprobar que el acceso SSH funciona antes de continuar

         9. Comprobar que el único acceso permitido a todos los servidores es SSH (puerto 22/TCP) intentando abrir con el browser las siguientes URLs:  
            http://\<webserver1 IP\>  
            http://\<webserver2 IP\>  
            http://\<webserver1 IP\>:8080  
            http://\<webserver2 IP\>:8080  
            http://\<loadbalancer IP\>

      2. Habilitar acceso HTTP (puerto 80/TCP) en el **load balancer**.

         1. En el servidor loadbalancer habilitar acceso al puerto 80  
            sudo ufw allow 80/tcp

         2. Confirmar los cambios  
            sudo ufw status verbose  
            

         3. Intentar abrir con el browser la URL del loadbalancer:  
            http://\<webserver1 IP\>  
            Puede ver la página Web? 

      3. Habilitar acceso al puerto 8080/TCP en los servidores web.  
         En los servidores webserver1 y webserver2: 

         1. Abrir el puerto 8080/TCP  
            sudo ufw allow 8080/tcp

         2. Confirmar los cambios  
            sudo ufw status verbose

         3. Intentar abrir con el browser la URL del loadbalancer:  
            http://\<webserver1 IP\>  
            Puede ver la página Web? Por qué?

         4. Probar con el browser las siguientes URLs:  
            http://\<webserver1 IP\>  
            http://\<webserver2 IP\>  
            http://\<webserver1 IP\>:8080  
            http://\<webserver2 IP\>:8080  
            http://\<loadbalancer IP\>  
            Cuáles son accesibles y cuáles no? Por qué?

      4. Permitir únicamente el acceso del loadbalancer a los servidores web.   
         En los servidores webserver1 y webserver2

         1. Abrir el puerto 8080/TCP para el servidor loadbalancer únicamente.

       sudo ufw allow from 192.168.170.35 proto tcp to any port 8080

2. Borrar la regla general del puerto 8080  
   sudo ufw status numbered  
   Buscar la regla correspondiente en la salida del comando. Ejemplo:

   Status: active

   

        To                  Action      From

        \--                  \------      \----

   \[ 1\] 22/tcp              ALLOW IN    Anywhere

   **\[ 2\] 8080/tcp            ALLOW IN    Anywhere**

   \[ 3\] 8080/tcp            ALLOW IN    192.168.170.35

   \[ 4\] 22/tcp (v6)         ALLOW IN    Anywhere (v6)

   \[ 5\] 8080/tcp (v6)       ALLOW IN    Anywhere (v6)

   3. Borrar la regla general del puerto 8080  
      sudo ufw delete 2

      4. Comprobar que el puerto 8080 de webserver1 y webserver2 solo está permitido desde el load balancer abriendo con un browser las siguientes URLs:  
         http://\<webserver1 IP\>:8080  
         http://\<webserver2 IP\>:8080  
         http://\<loadbalancer IP\>  
         

   5. ## Configurar SSL (TLS) / HTTPS

      ## En el siguiente laboratorio, se configura el acceso seguro (encriptado) HTTPS en el sitio utilizando un certificado “auto firmado”.

      1. Generar llave (key) privada y certificado

         1. Preparar directorio para alojar llaves y certificados

         sudo mkdir /etc/nginx/ssl/website

         cd /etc/nginx/ssl/website

         2. Generar llave privada

         sudo openssl genrsa \-out key.pem 2048

         

      2. Generar solicitud de firma de certificado  
         sudo openssl req \-new \-key key.pem \-out miwebste.csr  
         Colocar las siglas del País  
         Country Name (2 letter code) \[AU\]:AR  
           
         Colocar Estado (o provincia):  
         State or Province Name (full name) \[Some-State\]: Buenos Aires  
         Colocar Localidad (o ciudad):  
         Locality Name (eg, city) \[\]:Hurlingham  
         Colocar Organización:  
         Organization Name (eg, company) \[Internet Widgits Pty Ltd\]: Unahur  
         Colocar Unidad de Organización:  
         Organizational Unit Name (eg, section) \[\]: Laboratorio  
         Colocar Nombre servidor  
         Common Name (eg, YOUR name) \[\]: miwebsrv.com  
         Colocar dirección de correo del responsable   
         Email Address \[\]: laboratorio@unahur2.edu.ar  
         Contraseña (Dejar en Blanco):  
           Please enter the following 'extra' attributes  
           to be sent with your certificate request  
           A challenge password \[\]: (Dejar en blanco)  
         Nombre opcional organización (Dejar en blanco)  
         An optional company name \[\]: (Dejar en blanco)

         1. Visualizar el contenido de la solicitud de firma de certificación

         sudo openssl req \-in miwebsrv.csr \-noout \-text

         Ejemplo de salida:

         Certificate Request:

             Data:

                 Version: 1 (0x0)

                 Subject: C \= AR, ST \= Buenos Aires, L \= Hurlingham, O \= Unahur, OU \= Laboratorio, CN \= miwebsrv.com, emailAddress \= laboratorio@unahur2.edu.ar

                 Subject Public Key Info:

                     Public Key Algorithm: rsaEncryption

                         RSA Public-Key: (2048 bit)

                         Modulus:

                             00:c9:5f:1a:90:b6:d4:28:9e:60:14:9a:54:ee:0d:

                             59:22:4e:a9:30:98:49:3d:af:6e:6f:41:59:f6:c9:

                             b0:2b:fa:af:ed:f7:56:fb:c6:ba:42:62:24:fa:0c:

                             77:de:56:39:e8:d8:d4:d6:04:ca:73:d3:09:52:c2:

                             92:b6:5a:66:26:84:96:4f:95:ff:a0:aa:b1:ed:39:

                             3c:cb:c6:cf:77:06:8d:13:63:52:1d:e9:ba:f3:80:

                             79:8e:11:f2:e6:aa:37:7b:81:6e:7c:0e:75:d1:df:

                             24:f8:7b:94:15:83:d3:59:81:2c:08:e0:10:77:3a:

                             8d:60:01:15:d7:19:b7:22:43:10:c3:05:52:0e:a7:

                             d3:50:b2:9f:ff:5c:90:32:a9:4b:49:82:42:8e:aa:

                             ed:5c:18:2f:b0:4d:1c:f3:4c:75:0e:84:92:ef:96:

                             ce:97:83:cf:19:35:7b:ed:ab:96:a1:af:e0:fb:c2:

                             2f:d6:74:cb:70:85:84:c5:13:2b:5c:b4:f5:5d:67:

                             f9:5b:87:2b:e1:3f:76:63:9b:2a:b2:ba:ba:22:42:

                             5a:6e:f3:13:54:ab:62:e1:e1:73:40:2e:6a:47:6f:

                             33:d0:fa:ed:15:d5:37:88:a3:74:64:ec:81:7b:a2:

                             65:64:f6:bd:b2:61:18:ea:88:c4:52:06:61:7a:9c:

                             be:41

                         Exponent: 65537 (0x10001)

                 Attributes:

                     a0:00

             Signature Algorithm: sha256WithRSAEncryption

                  a7:99:55:06:a6:ac:e2:16:41:a6:db:5f:d8:90:1c:3a:9f:91:

                  85:d6:ed:2c:df:14:1f:11:ce:a5:40:96:2a:89:bd:5c:ef:14:

                  8e:91:80:07:66:10:20:d9:31:75:1d:1c:74:ab:f8:74:7a:c5:

                  6f:3e:ff:d2:e2:bb:9d:8e:cb:e3:33:5f:bd:6e:e0:37:49:74:

                  64:cf:42:27:b3:d2:d8:ff:0e:8c:7c:f4:0e:a1:e3:49:7b:26:

                  db:f4:5b:59:28:10:a5:bd:fc:7b:63:40:b6:85:d5:b4:a6:0a:

                  3e:ad:36:0c:e6:29:8f:36:d6:c5:d8:c0:fd:4e:64:b5:a9:1d:

                  0d:11:7d:9a:fc:9f:8e:45:f0:64:20:4e:dd:1e:28:65:22:d5:

                  f9:cd:0e:47:29:7c:ba:14:e8:1c:81:a4:4a:ed:2e:ec:1a:9a:

                  02:d8:bc:d1:09:c8:9b:3d:4a:2e:71:7d:90:04:dc:b0:c2:21:

                  e8:e7:f2:e7:de:91:03:dd:be:72:01:7a:6c:f5:6b:de:15:68:

                  1d:b1:be:5e:31:fb:60:92:3b:a5:ec:12:15:93:fe:ba:02:77:

                  53:1c:de:b9:c5:66:c6:c5:ce:6c:49:27:1a:ab:5e:81:4b:ae:

                  7c:39:3f:0a:02:08:a7:28:5b:33:2b:70:fe:7c:4f:14:58:a5:

                  de:33:91:5d

         

      3. Remitir la solicitud de firma de certificación a una entidad certificadora o **autofirmar**.   
         Para **autofirmar** utilizar el siguiente comando

         sudo openssl x509 \-req \-days 365 \-in miwebsrv.csr \-signkey key.pem \-out miwebsrv.crt

         Ejemplo de salida:

         Signature ok

         subject=C \= AR, ST \= Buenos Aires, L \= Hurlingham, O \= Unahur, OU \= Laboratorio, CN \= miwebsrv.com, emailAddress \= laboratorio@unahur2.edu.ar

         Getting Private key

         1. Verificar que se hayan generado los siguientes archivos

         ls \-l

         total 12

         \-rw------- 1 root root 1679 Sep 22 15:52 key.pem

         \-rw-r--r-- 1 root root 1379 Sep 22 15:57 miwebsrv.crt

         \-rw-r--r-- 1 root root 1086 Sep 22 15:54 miwebsrv.csr

         key.pem  		llave privada

         miwebsrv.crs	solicitud de firma de certificación

         miwebsrv.crt  	certificado auto-firmado

         2. Listar contenido certificado Firmados o Auto-firmados

         sudo openssl x509 \-subject \-issuer \-enddate \-noout \-in miwebsrv.crt

         

         Ejemplo de salida

         subject=C \= AR, ST \= Buenos Aires, L \= Hurlingham, O \= Unahur, OU \= Laboratorio, CN \= miwebsrv.com, emailAddress \= laboratorio@unahur2.edu.ar

         issuer=C \= AR, ST \= Buenos Aires, L \= Hurlingham, O \= Unahur, OU \= Laboratorio, CN \= miwebsrv.com, emailAddress \= laboratorio@unahur2.edu.ar

         notAfter=Sep 21 15:57:37 2024 GMT

      4. Habilitar SSL en nginx

         1. Editar configuración del load balancer  
            Editar el archivo de configuración del balanceo de carga agregando las siguientes líneas **al final** del mismo.

         

         server {

              listen      443 ssl;

         

              ssl on;

              ssl\_certificate     /etc/nginx/ssl/website/miwebsrv.crt;

              ssl\_certificate\_key /etc/nginx/ssl/website/key.pem;

         

              location /  {

                         proxy\_pass http://website;

         

                         }

          }

         

         2. Comprobar que no hayan errores de sintaxis en la configuración de nginx

         sudo nginx \-t

 			Ejemplo de salida

nginx: \[warn\] the "ssl" directive is deprecated, use the "listen ... ssl" directive instead in /etc/nginx/conf.d/load-balancing.conf:15

nginx: the configuration file /etc/nginx/nginx.conf syntax is ok

nginx: configuration file /etc/nginx/nginx.conf test is successful

3. Reiniciar el servicio nginx para forzar la carga de configuración

   sudo systemctl restart nginx

   

   

   5. Habilitar el acceso al puerto 443/TCP (https) en el servidor loadbalancer

      sudo ufw allow https

      6. Probar el acceso HTTPS al sitio a través del balanceador de carga.   
         Con un navegador abrir la siguiente URL:

         https://\<loadbalancer IP\>

