# Invitación de bautizo — proyecto editable

Proyecto independiente en React + Vite, listo para editar manualmente y desplegar.

## 1. Instalar

Necesitas Node.js 18 o superior.

```bash
npm install
npm run dev
```

Abre la URL local que muestre Vite.

## 2. Cambiar toda la información

Edita solamente:

`src/invitationConfig.ts`

Ahí puedes cambiar:
- nombre y apellidos
- iniciales
- padres
- mensajes
- fecha y hora
- iglesia
- recepción
- Google Maps
- fecha límite de confirmación
- regalos
- mensaje final
- ruta de la foto

## 3. Cambiar la foto de la bebé

Coloca tu imagen en:

`public/assets/bebe.jpg`

Luego cambia en `src/invitationConfig.ts`:

```ts
photoUrl: '/assets/bebe.jpg',
```

## 4. Cambiar decoración floral

Reemplaza:

`public/assets/floral.svg`

por una imagen propia y actualiza las rutas en `src/styles.css` si cambias el nombre.

## 5. Compilar para producción

```bash
npm run build
```

La carpeta `dist/` será el sitio compilado.

## 6. Despliegue

Funciona en cualquier hosting para Vite/React, por ejemplo Netlify, Vercel, Cloudflare Pages o hosting estático compatible.

## Archivo principal de diseño

`src/styles.css`

Contiene colores, movimientos, transiciones, sobre, tarjeta, pétalos, hero, foto, mapas, RSVP, etc.

## Nota

Los mapas usan Google Maps mediante enlaces e iframes. No requieren API key para este uso básico.
