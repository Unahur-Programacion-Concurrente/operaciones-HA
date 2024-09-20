# Laboratorio

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
5. Instalar las Dependencias del Backend

    5.1. Cambiar al directorio del backend
    ```bash
    cd expense-tracker-app/backend
    ```
    5.2. Instalar las dependencias
    ```bash
    npm install
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

8. PROBAR BE ??

9. Instalar y Configurar Nginx
Ahora, instala Nginx para servir el frontend y hacer de proxy inverso para el backend.

Instala Nginx:

bash
Copy code
sudo apt install nginx -y
Habilita Nginx para que arranque al iniciar el sistema:

bash
Copy code
sudo systemctl enable nginx
sudo systemctl start nginx

10. Configurar Nginx como Proxy Inverso
Edita el archivo de configuración por defecto de Nginx para configurarlo como proxy inverso para el backend y para servir el frontend.

Abre el archivo de configuración de Nginx:

bash
Copy code
sudo nano /etc/nginx/sites-available/default
Configura el proxy inverso para el backend y el servidor de archivos estáticos del frontend:

nginx
Copy code
server {
    listen 80;
    server_name tu-dominio.com;

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
Verifica que la configuración de Nginx sea correcta:

bash
Copy code
sudo nginx -t
Reinicia Nginx para aplicar los cambios:

bash
Copy code
sudo systemctl restart nginx
11. Instalar Dependencias y Compilar el Frontend
Si tu frontend requiere compilación (por ejemplo, si usas React), instala las dependencias y genera la build de producción:

bash
Copy code
cd ../frontend
npm install
npm run build
Los archivos estáticos generados estarán en el directorio build/, y serán servidos por Nginx desde el bloque de configuración anterior.

12. Configurar el Firewall (Opcional)
    Asegúrate de que solo los puertos necesarios estén abiertos (puerto 80 para HTTP y puerto 22 para SSH):

bash
Copy code
sudo ufw allow 'Nginx Full'
sudo ufw enable
13. Probar la Aplicación
Finalmente, visita tu dominio o la IP del servidor en el navegador para verificar que la aplicación esté funcionando correctamente:

arduino
Copy code
http://tu-dominio.com
Resumen
Node.js: Instalado y utilizado para el backend.
PM2: Utilizado para gestionar el backend en modo producción.
Nginx: Configurado como proxy inverso y para servir archivos estáticos del frontend.
dotenv: Utilizado para manejar variables de entorno.

