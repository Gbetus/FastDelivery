# 02 - Instalacion Mobile (Expo React Native)

Descripcion del archivo: guia para instalar y ejecutar la app movil `mobile` conectada al backend local.

## Alcance de cada archivo `.env`

- `mobile/.env`: configuración de la app Expo (por ejemplo `EXPO_PUBLIC_API_URL`).

Este instructivo usa únicamente `mobile/.env`.

## Requisitos

- Node.js 20 o superior
- npm
- Expo Go (telefono) o emulador Android/iOS
- Backend API corriendo

## Pasos de instalacion

1. Entrar al proyecto mobile:

```bash
cd mobile
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.example .env
```

4. Ajustar `EXPO_PUBLIC_API_URL` en `.env` segun entorno:

- iOS simulator: `http://localhost:3000/v1`
- Android emulator: `http://10.0.2.2:3000/v1`
- Dispositivo fisico: `http://<IP_DE_TU_PC>:3000/v1`

## Levantar la app

```bash
npm run start
```

Alternativa (arranque limpio, util si hay errores de cache o compilacion):

```bash
npm run start -- --clear
```

Atajos en terminal de Expo:

- `a`: abrir Android
- `i`: abrir iOS
- `w`: abrir en web

## Nota de conexión

La app requiere que el backend esté corriendo y accesible en la URL configurada en `EXPO_PUBLIC_API_URL`.

## Comprobaciones rapidas

- Verificar que el backend responde: abrir `http://localhost:3000/v1` en navegador o usar `curl`.
- Verificar que `EXPO_PUBLIC_API_URL` apunta al host correcto (simulador vs dispositivo fisico).
- Confirmar que el bundler de Expo inicia sin errores en terminal.
- Si la app no refleja cambios o falla al compilar, usar `npm run start -- --clear`.
