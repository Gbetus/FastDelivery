# FastDelivery Mobile (React Native + Expo)

## Requisitos

- Node.js 20+
- Expo Go en el telefono o emulador Android/iOS
- API backend corriendo en `http://localhost:3000/v1` (o URL equivalente)

## Configuracion

1. Copiar variables:

```bash
cp .env.example .env
```

2. Ajustar `EXPO_PUBLIC_API_URL` segun dispositivo:

- iOS simulator: `http://localhost:3000/v1`
- Android emulator: `http://10.0.2.2:3000/v1`
- Dispositivo fisico: `http://<IP_DE_TU_PC>:3000/v1`

## Ejecucion

```bash
npm install
npm run start
```

Atajos:

- `a` para Android
- `i` para iOS
- `w` para web

## Credenciales de prueba

Por defecto (segun seed del backend):

- Email: `repartidor@fastdelivery.local`
- Password: `RepartidorPassword`

