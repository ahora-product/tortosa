# Tortosa · Web (landing)

Página web de una sola pantalla para **Comercial Tortosa** — reclamos publicitarios en Valencia. Diseño moderno en colores **mocca + negro**, con foco en **rótulos y fachadas** y una sección de **Instagram que se actualiza sola**.

---

## 📂 Qué hay en el proyecto

| Archivo | Para qué sirve |
|---------|----------------|
| `index.html` | La página. **Es el archivo que se abre.** |
| `styles.css` | El diseño (colores, tipografías, distribución). |
| `script.js` | El comportamiento (menú móvil, animaciones, formulario). |
| `assets/` | Las imágenes (mira `assets/README.md`). |
| `robots.txt` y `sitemap.xml` | Ayudan a que Google encuentre la web (SEO). |

---

## ▶️ Cómo verla en tu ordenador

Haz **doble clic en `index.html`**. Se abre en tu navegador. Nada más. No hace falta instalar nada.

> Para verla con internet (Google Fonts e Instagram), conéctate a la red. Sin internet también se ve, pero con la tipografía del sistema.

---

## 🖼️ Cómo poner tus fotos

Las fotos van en la carpeta `assets/` con un nombre concreto cada una. Está todo explicado en **[assets/README.md](assets/README.md)**. Resumen rápido:

- `tienda-fachada.jpg` → la foto grande de la portada
- `fachada-1/2/3.jpg` → fotos de fachadas y rótulos
- `tienda-interior.jpg` → foto del interior de la tienda

Mientras no las pongas, salen unos recuadros con etiquetas. En cuanto subes la foto con el nombre correcto, **aparece sola**.

---

## 📸 Cómo conectar el Instagram (que se actualice solo)

La sección "Portfolio" muestra tus últimas fotos de Instagram y **se actualiza sola** cada vez que publicas. Para que funcione hay que conectarla una vez con un servicio gratuito (Instagram no deja hacerlo directo en una web sencilla). Es muy fácil:

### Opción recomendada: Behold (gratis)

1. Entra en **[behold.so](https://behold.so)** y crea una cuenta gratis.
2. Conecta la cuenta de Instagram **@comercialtortosa**.
3. Te dará un trozo de código (un "widget"). Cópialo.
4. Abre `index.html` y busca esta línea (está marcada con un comentario grande):
   ```html
   <!-- 👇 AQUÍ VA EL FEED DE INSTAGRAM QUE SE ACTUALIZA SOLO -->
   ```
5. Pega ahí el código y borra el bloque de ejemplo (`<div id="instagram-feed">...</div>`).

> ¿Prefieres otra? **[lightwidget.com](https://lightwidget.com)** también es gratis y funciona igual.
> Si me pasas el código del widget, te lo dejo pegado yo en su sitio.

A partir de ahí: tú subes una foto a Instagram → en unas horas aparece sola en la web. Sin tocar nada.

---

## ✉️ El formulario de contacto

Ahora mismo, al enviar el formulario se **abre el correo** del visitante con el mensaje ya escrito hacia `david@comercialtortosa.com`.

Si quieres que los mensajes lleguen solos a tu correo (sin que se abra nada), se conecta con **[formspree.io](https://formspree.io)** (gratis): se crea una cuenta y se cambia una línea en `index.html`. Avísame y lo dejo listo.

---

## 🌐 Cómo ponerla en internet

Tres formas, de más fácil a más completa:

1. **Netlify Drop** (lo más rápido): entra en [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta. Te da una dirección al momento.
2. **GitHub Pages**: gratis, usando este mismo repositorio. Te lo configuro yo cuando quieras.
3. **Tu dominio `comercialtortosa.com`**: cuando esté lista, se apunta el dominio a la web nueva.

---

## 🎨 Colores de marca (por si los necesitas)

| Color | Código |
|-------|--------|
| Mocca | `#9B7B65` |
| Mocca oscuro | `#7C5E49` |
| Mocca claro | `#C3A892` |
| Negro cálido | `#16120F` |
| Crema | `#F6F1EC` |

---

## ✅ SEO ya incluido

- Título y descripción optimizados para "rótulos y fachadas en Valencia".
- Datos de negocio local para Google (dirección, teléfono, horario) → ayuda a salir en Google Maps.
- Etiquetas para que se vea bien al compartir por WhatsApp y redes.
- Textos pensados para posicionar, imágenes con descripción y carga rápida.

> ⚠️ Revisa el **horario** del negocio en `index.html` (busca `openingHoursSpecification`) y confírmame si es correcto.
