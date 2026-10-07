<?php
/* Plantilla de la configuración del formulario de contacto (contacto.php).
   En el servidor va en /data/contacto-config.php: FUERA de html/, para que
   no se pueda abrir desde internet. Nunca subas al repo la versión con la
   clave real (está en .gitignore). */
return [
  // Resend → API Keys → "Sending access", dominio comercialtortosa.com
  'resend_api_key' => 're_PEGA_AQUI_LA_CLAVE',
  // Remitente: tiene que ser del dominio verificado en Resend
  'from' => 'Web Comercial Tortosa <web@comercialtortosa.com>',
  // Quién recibe las solicitudes
  'to' => 'jonro674@gmail.com',
];
