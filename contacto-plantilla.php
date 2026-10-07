<?php
/* ============================================================
   TORTOSA — Plantilla del email de "nueva solicitud" (contacto.php)
   Mismo estilo que la sección de contacto de la web: tarjeta marfil
   con los datos y panel oscuro con el mensaje. HTML de email: tablas
   y estilos en línea (Gmail y Outlook no leen <style> ni flex).
   ============================================================ */
declare(strict_types=1);

// Solo se usa desde contacto.php: abierto directamente, no muestra nada
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) { http_response_code(404); exit; }

/**
 * @param array $d nombre, contacto, necesita (array), mensaje, fecha (DateTimeInterface), logo (URL absoluta)
 * @return array{html: string, text: string}
 */
function emailSolicitud(array $d): array {
  $e = function (string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); };
  $meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  $f = $d['fecha'];
  $fecha = $f->format('j') . ' de ' . $meses[(int) $f->format('n') - 1] . ' de ' . $f->format('Y') . ' · ' . $f->format('H:i');
  $primerNombre = explode(' ', $d['nombre'])[0];

  // Botón: responder por email o llamar, según lo que haya dejado
  $boton = null;
  $telefono = preg_replace('/[\s.\-()]/', '', $d['contacto']) ?? '';
  if (filter_var($d['contacto'], FILTER_VALIDATE_EMAIL)) {
    $boton = ['Responder a ' . $primerNombre, 'mailto:' . $d['contacto'] . '?subject=' . rawurlencode('Tu solicitud de presupuesto — Comercial Tortosa')];
  } elseif (preg_match('/^\+?\d{9,15}$/', $telefono)) {
    $boton = ['Llamar a ' . $primerNombre, 'tel:' . $telefono];
  }

  // Paleta y tipografías de la web (styles.css)
  $fondo = '#2A211B'; $panel = '#352A22'; $marfil = '#E9DFCC'; $marfilClaro = '#F6F0E4';
  $champan = '#B7937B'; $marronTexto = '#140F0B'; $acento = '#8A6A44';
  $serif = "'DM Serif Display', Georgia, 'Times New Roman', serif";
  $sans = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";

  $chips = '';
  foreach ($d['necesita'] ?: ['Sin indicar'] as $t) {
    $chips .= '<span style="display:inline-block;margin:0 0 6px 6px;padding:6px 12px;border-radius:999px;background:' . $marfilClaro .
      ';border:1px solid ' . $champan . ';font-size:13px;line-height:1.2;color:' . $marronTexto . ';">' . $e($t) . '</span>';
  }

  $fila = function (string $etiqueta, string $valor, bool $primera = false) use ($sans): string {
    return '<tr><td style="padding:14px 0;' . ($primera ? '' : 'border-top:1px solid rgba(20,15,11,.12);') .
      'font-family:' . $sans . ';font-size:15px;color:rgba(20,15,11,.55);vertical-align:top;white-space:nowrap;">' . $etiqueta . '</td>' .
      '<td align="right" style="padding:14px 0 14px 16px;' . ($primera ? '' : 'border-top:1px solid rgba(20,15,11,.12);') .
      'font-family:' . $sans . ';font-size:15px;color:#140F0B;text-align:right;">' . $valor . '</td></tr>';
  };

  $contactoHtml = $e($d['contacto']);
  if ($boton) $contactoHtml = '<a href="' . $e($boton[1]) . '" style="color:#140F0B;text-decoration:underline;">' . $contactoHtml . '</a>';

  $botonHtml = '';
  if ($boton) {
    $botonHtml = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;"><tr>' .
      '<td style="border-radius:999px;background:' . $marfil . ';">' .
      '<a href="' . $e($boton[1]) . '" style="display:inline-block;padding:7px 7px 7px 24px;font-family:' . $sans .
      ';font-size:15px;font-weight:600;color:' . $marronTexto . ';text-decoration:none;border-radius:999px;">' . $e($boton[0]) .
      '&nbsp;&nbsp;<span style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;border-radius:50%;background:' .
      $fondo . ';color:' . $marfil . ';font-size:15px;vertical-align:middle;">&#8599;</span></a></td></tr></table>';
  }

  $html = '<!doctype html><html lang="es"><head><meta charset="utf-8">' .
    '<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light">' .
    '<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400..700&display=swap" rel="stylesheet">' .
    '<title>Solicitud de presupuesto</title></head>' .
    '<body style="margin:0;padding:0;background:' . $fondo . ';">' .
    // Texto de vista previa en la bandeja de entrada
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' . $e($d['nombre'] . ' — ' . cortarTexto($d['mensaje'], 90)) . '</div>' .
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' . $fondo . ';"><tr><td align="center" style="padding:32px 12px;">' .
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">' .

    // Cabecera: logo + etiqueta
    '<tr><td style="padding:4px 8px 28px;">' .
    '<img src="' . $e($d['logo']) . '" width="150" height="26" alt="Tortosa" style="display:block;border:0;width:150px;height:auto;">' .
    '</td></tr>' .

    // Tarjeta marfil con los datos
    '<tr><td style="background:' . $marfil . ';border-radius:28px;padding:36px 32px 24px;">' .
    '<p style="margin:0 0 14px;font-family:' . $sans . ';font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:' . $marronTexto . ';">Nueva solicitud</p>' .
    '<h1 style="margin:0 0 10px;font-family:' . $serif . ';font-size:36px;line-height:1.05;font-weight:400;color:' . $marronTexto . ';">' .
    'Solicitud de <em style="font-style:italic;color:' . $acento . ';">presupuesto</em></h1>' .
    '<p style="margin:0 0 26px;font-family:' . $sans . ';font-size:15px;line-height:1.5;color:rgba(20,15,11,.65);">Recibida desde la web el ' . $fecha . '.</p>' .
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' .
    $fila('Nombre', $e($d['nombre']), true) .
    $fila('Email o teléfono', $contactoHtml) .
    $fila('Necesita', $chips) .
    '</table></td></tr>' .

    '<tr><td style="height:14px;line-height:14px;font-size:0;">&nbsp;</td></tr>' .

    // Panel oscuro con el mensaje
    '<tr><td style="background:' . $panel . ';border:1px solid rgba(233,223,204,.13);border-radius:28px;padding:32px;">' .
    '<p style="margin:0 0 12px;font-family:' . $sans . ';font-size:14px;font-weight:500;color:rgba(233,223,204,.62);">Mensaje</p>' .
    '<p style="margin:0;font-family:' . $sans . ';font-size:16px;line-height:1.6;color:' . $marfil . ';white-space:pre-wrap;">' . $e($d['mensaje']) . '</p>' .
    $botonHtml .
    '</td></tr>' .

    // Pie
    '<tr><td style="padding:24px 8px 0;font-family:' . $sans . ';font-size:12px;line-height:1.6;color:rgba(233,223,204,.45);">' .
    'Este aviso llega desde el formulario de contacto de comercialtortosa.com.' .
    (filter_var($d['contacto'], FILTER_VALIDATE_EMAIL) ? ' Si respondes a este correo, la respuesta le llega directamente a ' . $e($primerNombre) . '.' : '') .
    '</td></tr>' .

    '</table></td></tr></table></body></html>';

  $text = "NUEVA SOLICITUD DE PRESUPUESTO\nRecibida desde la web el $fecha.\n\n" .
    'Nombre: ' . $d['nombre'] . "\nEmail o teléfono: " . $d['contacto'] .
    "\nNecesita: " . ($d['necesita'] ? implode(', ', $d['necesita']) : 'Sin indicar') .
    "\n\nMensaje:\n" . $d['mensaje'] . "\n\n—\nFormulario de contacto de comercialtortosa.com\n";

  return ['html' => $html, 'text' => $text];
}

function cortarTexto(string $s, int $max): string {
  $s = preg_replace('/\s+/u', ' ', $s) ?? '';
  $largo = function_exists('mb_strlen') ? mb_strlen($s) : strlen($s);
  if ($largo <= $max) return $s;
  return rtrim(function_exists('mb_substr') ? mb_substr($s, 0, $max) : substr($s, 0, $max)) . '…';
}
