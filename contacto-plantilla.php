<?php
/* ============================================================
   TORTOSA — Plantilla del email de "nueva solicitud" (contacto.php)
   Mismo estilo que la sección de contacto de la web: tarjeta marfil
   con los datos y el mensaje ("Cuéntanos más"). Sin botón: se contesta
   con "Responder" del propio correo (contacto.php pone reply_to).
   HTML de email pensado también para Outlook de escritorio (motor de
   Word): solo tablas, estilos en línea, colores en hex (no lee rgba),
   saltos de línea con <br> (no lee pre-wrap), ancho fijo con tabla
   condicional (no lee max-width) y tipografías de sistema en Outlook.
   ============================================================ */
declare(strict_types=1);

// Solo se usa desde contacto.php: abierto directamente, no muestra nada
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) { http_response_code(404); exit; }

/**
 * @param array $d nombre, contacto, necesita (array), mensaje, fecha (DateTimeInterface)
 * @return array{html: string, text: string}
 */
function emailSolicitud(array $d): array {
  $e = function (string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); };
  $meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  $f = $d['fecha'];
  $fecha = $f->format('j') . ' de ' . $meses[(int) $f->format('n') - 1] . ' de ' . $f->format('Y') . ' · ' . $f->format('H:i');
  $esEmail = (bool) filter_var($d['contacto'], FILTER_VALIDATE_EMAIL);
  $telefono = preg_replace('/[\s.\-()]/', '', $d['contacto']) ?? '';

  // Paleta y tipografías de la web (styles.css). Los tonos "suaves" son el
  // marrón del texto mezclado con el marfil, ya calculados (Outlook no lee rgba).
  $fondo = '#2A211B'; $marfil = '#E9DFCC'; $marfilClaro = '#F6F0E4';
  $champan = '#B7937B'; $marronTexto = '#140F0B'; $acento = '#8A6A44';
  $etiqueta = '#746D62'; $secundario = '#5F584F'; $linea = '#CFC6B5'; $pie = '#807769';
  $serif = "'DM Serif Display', Georgia, 'Times New Roman', serif";
  $sans = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";

  // Chips de "¿Qué necesita?". En Outlook los &nbsp; hacen de relleno lateral.
  $chips = '';
  foreach ($d['necesita'] as $t) {
    $chips .= '<span style="display:inline-block;margin:0 0 6px 6px;padding:6px 12px;border-radius:999px;background:' . $marfilClaro .
      ';border:1px solid ' . $champan . ';font-family:' . $sans . ';font-size:13px;line-height:16px;color:' . $marronTexto . ';white-space:nowrap;">' .
      '<!--[if mso]>&nbsp;&nbsp;<![endif]-->' . $e($t) . '<!--[if mso]>&nbsp;&nbsp;<![endif]--></span> ';
  }

  $fila = function (string $titulo, string $valor, bool $primera = false) use ($sans, $etiqueta, $linea, $marronTexto): string {
    $borde = $primera ? '' : 'border-top:1px solid ' . $linea . ';';
    return '<tr><td valign="top" style="padding:14px 0;' . $borde .
      'font-family:' . $sans . ';font-size:15px;line-height:22px;color:' . $etiqueta . ';white-space:nowrap;">' . $titulo . '</td>' .
      '<td align="right" valign="top" style="padding:14px 0 14px 16px;' . $borde .
      'font-family:' . $sans . ';font-size:15px;line-height:22px;color:' . $marronTexto . ';text-align:right;">' . $valor . '</td></tr>';
  };

  // Email en texto plano (sin mailto: se contesta con "Responder"); teléfono, pulsable para llamar
  $contactoHtml = $e($d['contacto']);
  if (!$esEmail && preg_match('/^\+?\d{9,15}$/', $telefono)) {
    $contactoHtml = '<a href="tel:' . $e($telefono) . '" style="color:' . $marronTexto . ';text-decoration:underline;">' . $contactoHtml . '</a>';
  }

  $mensajeHtml = nl2br($e($d['mensaje']), false);

  $html = '<!doctype html><html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">' .
    '<head><meta charset="utf-8">' .
    '<meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge">' .
    '<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">' .
    '<title>Solicitud de presupuesto</title>' .
    // Outlook: escala correcta en pantallas de alta resolución y fuentes de sistema
    // (con DM Sans/DM Serif pasaría a Times New Roman)
    '<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>' .
    '<style>body,table,td,p,a,span{font-family:Arial,Helvetica,sans-serif !important;}.serif,.serif em{font-family:Georgia,\'Times New Roman\',serif !important;}</style><![endif]-->' .
    '<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400..700&display=swap" rel="stylesheet"><!--<![endif]-->' .
    '</head>' .
    '<body bgcolor="' . $fondo . '" style="margin:0;padding:0;background:' . $fondo . ';-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">' .
    // Texto de vista previa en la bandeja de entrada
    '<div style="display:none;mso-hide:all;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:' . $fondo . ';">' .
    $e($d['nombre'] . ' — ' . cortarTexto($d['mensaje'], 90)) . '</div>' .
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' . $fondo . '" style="background:' . $fondo . ';"><tr><td align="center" style="padding:32px 12px;">' .
    // Outlook no entiende max-width: tabla fija de 600 solo para él
    '<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->' .
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">' .

    // Tarjeta marfil con los datos
    '<tr><td bgcolor="' . $marfil . '" style="background:' . $marfil . ';border-radius:28px;padding:36px 32px 32px;">' .
    '<p style="margin:0 0 14px;font-family:' . $sans . ';font-size:12px;line-height:16px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:' . $marronTexto . ';">Nueva solicitud</p>' .
    '<h1 class="serif" style="margin:0 0 10px;font-family:' . $serif . ';font-size:36px;line-height:40px;mso-line-height-rule:exactly;font-weight:400;color:' . $marronTexto . ';">' .
    'Solicitud de <em style="font-style:italic;font-weight:400;color:' . $acento . ';">presupuesto</em></h1>' .
    '<p style="margin:0 0 26px;font-family:' . $sans . ';font-size:15px;line-height:22px;color:' . $secundario . ';">Recibida desde la web el ' . $fecha . '.</p>' .
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' .
    $fila('Nombre', $e($d['nombre']), true) .
    $fila('Email o teléfono', $contactoHtml) .
    ($chips !== '' ? $fila('¿Qué necesita?', $chips) : '') .

    // "Cuéntanos más": el mensaje, como descripción a todo el ancho
    '<tr><td colspan="2" style="padding:16px 0 0;border-top:1px solid ' . $linea . ';font-family:' . $sans . ';font-size:15px;line-height:22px;color:' . $etiqueta . ';">Cuéntanos más</td></tr>' .
    '<tr><td colspan="2" style="padding:10px 0 0;font-family:' . $sans . ';font-size:16px;line-height:26px;color:' . $marronTexto . ';">' . $mensajeHtml . '</td></tr>' .
    '</table>' .
    '</td></tr>' .

    // Pie
    '<tr><td style="padding:24px 8px 0;font-family:' . $sans . ';font-size:12px;line-height:19px;color:' . $pie . ';">' .
    'Este aviso llega desde el formulario de contacto de comercialtortosa.com.' .
    '</td></tr>' .

    '</table>' .
    '<!--[if mso]></td></tr></table><![endif]-->' .
    '</td></tr></table></body></html>';

  $text = "NUEVA SOLICITUD DE PRESUPUESTO\nRecibida desde la web el $fecha.\n\n" .
    'Nombre: ' . $d['nombre'] . "\nEmail o teléfono: " . $d['contacto'] .
    ($d['necesita'] ? "\n¿Qué necesita?: " . implode(', ', $d['necesita']) : '') .
    "\n\nCuéntanos más:\n" . $d['mensaje'] . "\n\n—\n" .
    "Formulario de contacto de comercialtortosa.com\n";

  return ['html' => $html, 'text' => $text];
}

function cortarTexto(string $s, int $max): string {
  $s = preg_replace('/\s+/u', ' ', $s) ?? '';
  $largo = function_exists('mb_strlen') ? mb_strlen($s) : strlen($s);
  if ($largo <= $max) return $s;
  return rtrim(function_exists('mb_substr') ? mb_substr($s, 0, $max) : substr($s, 0, $max)) . '…';
}
