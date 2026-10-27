# Grand Line - Hackathon 2 (CS2031 DBP)

**Equipo:** Team 6 · **Código de equipo:** TEAM-029

## Integrantes

| Nombre | Código | Correo |
|:-------|:-------|:-------|
| Adriana Alvarado | 202420154 | adriana.alvarado@utec.edu.pe |
| Celeste Sevillano | 202310146 | adriana.sevillano@utec.edu.pe |

## Cómo ejecutar

1. Requisitos: Node 24 LTS (o superior) y npm.
2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Copiar `.env.example` a `.env` y dejar la URL base de la API:

   ```bash
   cp .env.example .env
   ```

   ```txt
   VITE_API_BASE_URL=https://logpose-api-jg7f.onrender.com/api/v1
   ```

4. Levantar el proyecto en desarrollo (abre http://localhost:5173):

   ```bash
   npm run dev
   ```

5. Verificar que compila sin errores:

   ```bash
   npm run build
   ```

## Qué incluye

- Login y rutas privadas.
- Dashboard con mapa del Grand Line.
- Se busca, con filtros en la URL y paginación.
- Noticias, con scroll infinito y filtros en la URL.
- Sagas, con scrollytelling.

## Notas

- La URL base de la API se lee de `VITE_API_BASE_URL`; no está escrita en el código.
- No se incluyen contraseñas ni credenciales en el repositorio.

## Tecnologías

React, TypeScript, Vite, React Router, Tailwind CSS y Axios.
