<?php
/* ============================================================
   TORTOSA — Formulario de contacto → email (Resend)
   Recibe el formulario de la web (script.js) y lo envía por email.
   La clave de Resend NO está aquí: se lee de data/contacto-config.php,
   fuera de la carpeta pública html/ (plantilla en
   herramientas/contacto-config.example.php). El destinatario también
   está en ese archivo, así que cambiarlo no requiere tocar la web.
   ============================================================ */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function responder(int $code, array $data): void {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function cortar(string $s, int $max): string {
  return function_exists('mb_substr') ? mb_substr($s, 0, $max) : substr($s, 0, $max);
}

// Texto limpio: sin caracteres de control y con longitud máxima
function texto($v, int $max, bool $unaLinea): string {
  $v = is_string($v) ? trim($v) : '';
  if ($unaLinea) $v = preg_replace('/\s+/u', ' ', $v) ?? '';
  $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
  return cortar($v, $max);
}

// Busca data/contacto-config.php subiendo desde esta carpeta
// (sirve igual en html/ que en html/nueva/)
function rutaConfig(): ?string {
  $dir = __DIR__;
  for ($i = 0; $i < 4; $i++) {
    $f = $dir . '/data/contacto-config.php';
    if (@is_file($f)) return $f;
    $dir = dirname($dir);
  }
  return null;
}

// Máximo 5 envíos por IP y hora. Si no se puede escribir el registro, no limita.
function dentroDelLimite(string $dir): bool {
  $f = $dir . '/contacto-limite.json';
  $fp = @fopen($f, 'c+');
  if (!$fp) return true;
  flock($fp, LOCK_EX);
  $datos = json_decode((string) stream_get_contents($fp), true);
  if (!is_array($datos)) $datos = [];
  $ahora = time();
  $ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
  foreach ($datos as $k => $marcas) {
    $datos[$k] = array_values(array_filter((array) $marcas, function ($t) use ($ahora) { return $ahora - (int) $t < 3600; }));
    if (!$datos[$k]) unset($datos[$k]);
  }
  $ok = count($datos[$ip] ?? []) < 5;
  if ($ok) $datos[$ip][] = $ahora;
  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($datos));
  flock($fp, LOCK_UN);
  fclose($fp);
  return $ok;
}

function enviarResend(string $clave, array $payload): array {
  $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
  $cabeceras = ['Authorization: Bearer ' . $clave, 'Content-Type: application/json', 'User-Agent: comercialtortosa-web/1.0'];
  if (function_exists('curl_init')) {
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => $json,
      CURLOPT_HTTPHEADER => $cabeceras,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 15,
    ]);
    $cuerpo = curl_exec($ch);
    return [(int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE), (string) $cuerpo];
  }
  // Sin cURL: conexión TLS directa (no depende de allow_url_fopen, que está en OFF)
  $fp = @stream_socket_client('ssl://api.resend.com:443', $errno, $errstr, 15);
  if (!$fp) return [0, (string) $errstr];
  stream_set_timeout($fp, 15);
  fwrite($fp, "POST /emails HTTP/1.1\r\nHost: api.resend.com\r\n" . implode("\r\n", $cabeceras) .
    "\r\nContent-Length: " . strlen($json) . "\r\nConnection: close\r\n\r\n" . $json);
  $resp = (string) stream_get_contents($fp);
  fclose($fp);
  if (!preg_match('#^HTTP/\S+ (\d{3})#', $resp, $m)) return [0, ''];
  $pos = strpos($resp, "\r\n\r\n");
  return [(int) $m[1], $pos === false ? '' : substr($resp, $pos + 4)];
}

/* ---------- Petición ---------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  header('Allow: POST');
  responder(405, ['ok' => false, 'error' => 'Método no permitido']);
}

// Solo desde la propia web
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origen !== '' && !in_array(parse_url($origen, PHP_URL_HOST), ['comercialtortosa.com', 'www.comercialtortosa.com'], true)) {
  responder(403, ['ok' => false, 'error' => 'Origen no permitido']);
}

$in = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($in)) responder(400, ['ok' => false, 'error' => 'Petición no válida']);

// Campo trampa: solo lo rellenan los bots. Se finge éxito y no se envía nada.
if (!empty($in['botcheck'])) responder(200, ['ok' => true]);

$nombre = texto($in['name'] ?? '', 100, true);
$contacto = texto($in['contact'] ?? '', 150, true);
$mensaje = texto($in['message'] ?? '', 5000, false);
$permitidos = ['Rótulo o fachada', 'Rotulación', 'Regalos de empresa', 'Textil', 'Ropa laboral', 'Imprenta', 'Otro'];
$tipos = array_values(array_intersect($permitidos, array_filter((array) ($in['tipos'] ?? []), 'is_string')));

if ($nombre === '' || $contacto === '' || $mensaje === '') {
  responder(422, ['ok' => false, 'error' => 'Faltan campos']);
}

$rutaCfg = rutaConfig();
$cfg = $rutaCfg ? require $rutaCfg : null;
if (!is_array($cfg) || empty($cfg['resend_api_key']) || empty($cfg['to']) || empty($cfg['from'])) {
  error_log('contacto.php: falta data/contacto-config.php o está incompleto');
  responder(500, ['ok' => false, 'error' => 'Configuración incompleta']);
}

if (!dentroDelLimite(dirname($rutaCfg))) {
  responder(429, ['ok' => false, 'error' => 'Demasiados envíos, prueba más tarde']);
}

/* ---------- Email (diseño en contacto-plantilla.php) ---------- */
require __DIR__ . '/contacto-plantilla.php';

// El logo se sirve desde la misma carpeta que este archivo (vale en /nueva/ y en la raíz)
$carpeta = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
$email = emailSolicitud([
  'nombre' => $nombre,
  'contacto' => $contacto,
  'necesita' => $tipos,
  'mensaje' => $mensaje,
  'fecha' => new DateTimeImmutable('now', new DateTimeZone('Europe/Madrid')),
  'logo' => 'https://comercialtortosa.com' . $carpeta . '/assets/brand/logo-email.png',
]);

$payload = [
  'from' => $cfg['from'],
  'to' => [$cfg['to']],
  'subject' => 'Solicitud de presupuesto — ' . $nombre,
  'text' => $email['text'],
  'html' => $email['html'],
];
// "Responder" va directo al cliente si dejó un email
if (filter_var($contacto, FILTER_VALIDATE_EMAIL)) $payload['reply_to'] = $contacto;

[$estado, $cuerpo] = enviarResend((string) $cfg['resend_api_key'], $payload);
if ($estado < 200 || $estado >= 300) {
  error_log('contacto.php: Resend respondió ' . $estado . ' ' . substr($cuerpo, 0, 300));
  responder(502, ['ok' => false, 'error' => 'No se pudo enviar']);
}
responder(200, ['ok' => true]);
