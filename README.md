# Práctica Acceso a Datos - Entrega 2.1

Este repositorio contiene la solución a la Entrega 2 de la asignatura "Acceso a Datos". El proyecto se divide en dos partes principales integradas en una misma aplicación web:

1.  **API RESTful Sakila (Práctica 1):** Gestión de clientes y alquileres utilizando la base de datos Sakila. Incluye extras como GraphQL y autenticación con Auth0.
2.  **Servidor WebSockets (Práctica 2):** Un juego de Ajedrez multijugador en tiempo real con salas públicas/privadas y chat.

**Frontend:** [ajedrez-web-sockets.vercel.app](https://ajedrez-web-sockets.vercel.app)
**Backend:** [https://ajedrez-websockets.onrender.com](https://ajedrez-websockets.onrender.com)

---

## Índice

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Ejecución](#ejecución)
5. [Manual de Uso Rápido](#manual-de-uso-rápido)
6. [Documentación API (Sakila)](#documentación-api-sakila)
7. [WebSockets (Ajedrez)](#websockets-ajedrez)
8. [Tecnologías Utilizadas](#tecnologías-utilizadas)
9. [Uso Responsable de IA](#uso-responsable-de-ia)

---

## Estructura del Proyecto

El proyecto está organizado en dos carpetas principales dentro de la raíz:

```text
Ajedrez-WebSockets/
├── client/                         # Frontend (React + Vite)
│   ├── public/                     # Archivos estáticos
│   ├── src/
│   │   ├── assets/                 # Recursos (imágenes, estilos)
│   │   ├── modules/
│   │   │   ├── ajedrez/            # Módulo de Ajedrez (WebSockets)
│   │   │   │   ├── components/     # Componentes visuales (Tablero, Salas, etc.)
│   │   │   │   └── services/       # Lógica de conexión Socket.io
│   │   │   └── sakila/             # Módulo de Gestión (API REST/GraphQL)
│   │   │       ├── componentes/    # Tablas, Modales, Formularios
│   │   │       └── ModuloSakila.jsx # Componente principal de gestión
│   │   ├── App.jsx                 # Componente raíz
│   │   └── main.jsx                # Punto de entrada React
│   ├── .env                        # Variables de entorno (Auth0, API URL)
│   ├── package.json                # Dependencias del cliente
│   └── vite.config.js              # Configuración de Vite
│
├── server/                         # Backend (Node.js + Express)
│   ├── src/
│   │   ├── ajedrez/                # Lógica del servidor de juego
│   │   │   └── events/             # Manejadores de eventos Socket.io
│   │   ├── sakila/                 # API REST Sakila
│   │   │   ├── controllers/        # Lógica de negocio (Clientes, Alquileres)
│   │   │   ├── models/             # Modelos Sequelize
│   │   │   └── routes/             # Definición de rutas Express
│   │   ├── compartido/             # Utilidades compartidas
│   │   │   └── database.js         # Conexión MySQL
│   │   └── graphql/                # Esquemas y Resolvers GraphQL
│   ├── index.js                    # Punto de entrada del servidor
│   ├── .env                        # Variables de entorno (DB, Puerto)
│   └── package.json                # Dependencias del servidor
│
└── README.md               # Documentación del proyecto
```

---

## Requisitos Previos

*   **Node.js** (v16 o superior)
*   **MySQL** (Base de datos Sakila instalada y corriendo)
*   **Git**

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/nataliagamezbarea/Ajedrez-WebSockets.git
cd Ajedrez-WebSockets
```

### 2. Configuración del Backend (Server)

Navega a la carpeta del servidor e instala las dependencias:

```bash
cd server
npm install
```

Crea un archivo `.env` en la carpeta `server/` con la siguiente configuración (ajusta los valores según tu base de datos local):

```env
PORT=3000

# Configuración Base de Datos (MySQL - Sakila)
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=sakila
DB_PORT=3306
```

### 3. Configuración del Frontend (Client)

Abre una nueva terminal, navega a la carpeta del cliente e instala las dependencias:

```bash
cd client
npm install
```

Crea un archivo `.env` en la carpeta `client/` con las credenciales de Auth0 y la URL del servidor:

```env
# URL del Backend
VITE_API_BASE_URL=http://localhost:3000

# Configuración Auth0 (Para autenticación)
VITE_AUTH0_DOMAIN=tu-dominio.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id
```

---

## Ejecución

Para ejecutar el proyecto completo, necesitas dos terminales abiertas:

**Terminal 1: Servidor**
```bash
cd server
npm start
# O si usas nodemon: npm run dev
```
*El servidor iniciará en el puerto 3000, conectando a MySQL y levantando Socket.io y GraphQL.*

**Terminal 2: Cliente**
```bash
cd client
npm run dev
```
*Vite iniciará la aplicación web (generalmente en http://localhost:5173).*

---

## Manual de Uso Rápido

1.  **Acceso:** Abre tu navegador en `http://localhost:5173` (o el puerto que indique Vite).
2.  **Inicio de Sesión:**
    *   Puedes entrar como **Invitado** (se generará un ID aleatorio).
    *   O iniciar sesión con **Auth0** (Google/Email) para acceder a funciones protegidas.
3.  **Módulo Ajedrez:**
    *   Selecciona "Jugar Ajedrez".
    *   **Público:** Crea una sala con nombre o únete a una existente en el lobby.
    *   **Privado:** Genera un código secreto y compártelo con un amigo.
4.  **Módulo Sakila (Gestión):**
    *   Requiere inicio de sesión (Auth0).
    *   Navega entre las pestañas "Clientes" y "Alquileres".
    *   Usa el buscador por ID o los botones de acción para Editar/Eliminar.

---

## Documentación API (Sakila)

Se ha implementado una API RESTful completa para la gestión de la base de datos Sakila, cumpliendo con los requisitos de la Práctica 1.

### Endpoints Implementados

| Método | Ruta | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- |
| **Clientes** | | | |
| `POST` | `/api/v1/customers` | Crear un nuevo cliente. | `201` Creado, `400` Datos inválidos |
| `GET` | `/api/v1/customers` | Listar clientes (soporta paginación `?page=1&limit=10` y búsqueda `?search=Nombre`). | `200` OK, `500` Error Servidor |
| `GET` | `/api/v1/customers/:id` | Obtener detalle de un cliente. | `200` OK, `400` ID inválido, `404` No encontrado |
| `PUT` | `/api/v1/customers/:id` | Actualizar datos de un cliente. | `200` OK, `400` Faltan campos, `404` No existe |
| `DELETE` | `/api/v1/customers/:id` | Eliminar un cliente (y sus alquileres asociados). | `200` OK, `404` No encontrado, `500` Error |
| **Alquileres** | | | |
| `POST` | `/api/v1/rentals` | Crear un nuevo alquiler. | `201` Creado, `400` Datos faltantes, `404` Cliente no existe |
| `GET` | `/api/v1/rentals` | Listar alquileres (soporta paginación). | `200` OK, `500` Error Servidor |
| `GET` | `/api/v1/rentals/:id` | Obtener detalle de un alquiler. | `200` OK, `400` ID inválido, `404` No encontrado |
| `PUT` | `/api/v1/rentals/:id/return` | Marcar un alquiler como devuelto (fecha actual). | `200` OK, `400` Ya devuelto, `404` No encontrado |
| `GET` | `/api/v1/customers/:id/rentals` | Listar alquileres de un cliente. | `200` OK, `404` Cliente no encontrado, `500` Error |
| `DELETE` | `/api/v1/rentals/:id` | Eliminar un alquiler. | `200` OK, `404` No encontrado, `500` Error |

### Extras Implementados (Puntos Adicionales)
*   **GraphQL:** Se ha implementado un servidor Apollo en `/graphql` para consultas complejas (ej: obtener cliente con sus rentas anidadas).
*   **Frontend:** Interfaz visual completa en React para gestionar la tabla de datos.
*   **Seguridad:** Implementación de **Auth0** para proteger el acceso al módulo de gestión.

---

## WebSockets (Ajedrez)

Implementación de la Práctica 2 utilizando **Socket.io**.

### Funcionalidades
*   **Lobby en Tiempo Real:** Lista de salas públicas que se actualiza automáticamente para todos los clientes conectados.
*   **Salas Privadas:** Posibilidad de crear salas con códigos únicos para compartir.
*   **Juego Sincronizado:**
    *   Validación de movimientos legales en servidor y cliente (`chess.js`).
    *   Sincronización de temporizadores (reloj de ajedrez).
    *   Detección de Jaque Mate, Tablas y Rendición.
*   **Chat en Vivo:** Chat integrado en la sala de juego.
*   **Sistema de Revancha:** Flujo para solicitar y aceptar revancha sin salir de la sala.
*   **Gestión de Desconexiones:** Manejo automático de abandonos y victorias por desconexión.

---

## Tecnologías Utilizadas

*   **Frontend:** React, Vite, Tailwind CSS, Lucide React, Auth0 React SDK.
*   **Backend:** Node.js, Express.
*   **Base de Datos:** MySQL, Sequelize ORM.
*   **Tiempo Real:** Socket.io.
*   **API Adicional:** Apollo Server (GraphQL).
*   **Lógica de Juego:** Chess.js.

---

## Uso Responsable de IA

Este proyecto ha sido desarrollado aplicando un uso responsable de herramientas de Inteligencia Artificial generativa como apoyo en:

*   Generación de estructuras base (boilerplate) y componentes de UI.
*   Refactorización de código y mejora de legibilidad.
*   Redacción de documentación técnica.

Todo el código ha sido revisado, validado y adaptado para cumplir con los requisitos académicos, asegurando la comprensión total de la solución implementada.


# Video

[trabajo](https://1drv.ms/v/c/34a4da934b34c313/IQBalaDk2sjBSr764Z3hDrd9Aca_0oE-2DFnTCCP7w8toZA?e=0oSwUH)