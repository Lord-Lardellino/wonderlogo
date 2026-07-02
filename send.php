<?php
/* ============================================================
   WonderLogo — invio form contatti
   ------------------------------------------------------------
   Funziona SENZA dipendenze: usa la funzione nativa mail() di PHP
   (ok su Aruba e hosting condivisi).
   Se è presente PHPMailer (vendor/) E i dati SMTP in mail.config.php,
   usa lo SMTP autenticato (più affidabile). Altrimenti usa mail().
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');

function out($ok, $msg = '', $code = 200) {
  http_response_code($code);
  echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $msg]);
  exit;
}

/* Verifica token reCAPTCHA v2 con le API di Google */
function recaptcha_verify($secret, $token, $ip = '') {
  $data = http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => $ip]);
  $url  = 'https://www.google.com/recaptcha/api/siteverify';
  $result = false;
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_POST           => true,
      CURLOPT_POSTFIELDS     => $data,
      CURLOPT_TIMEOUT        => 10,
    ]);
    $result = curl_exec($ch);
    curl_close($ch);
  }
  if ($result === false && ini_get('allow_url_fopen')) {
    $ctx = stream_context_create(['http' => [
      'method'  => 'POST',
      'header'  => 'Content-Type: application/x-www-form-urlencoded',
      'content' => $data,
      'timeout' => 10,
    ]]);
    $result = @file_get_contents($url, false, $ctx);
  }
  if ($result === false) return false;
  $json = json_decode($result, true);
  return is_array($json) ? $json : false;   // ritorna l'esito completo (success, score, action)
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'Metodo non consentito', 405);

/* ── Config (opzionale): se manca, usa i valori di default ─────── */
$cfgFile = __DIR__ . '/mail.config.php';
$cfg = file_exists($cfgFile) ? (require $cfgFile) : [];
$MAIL_TO        = $cfg['MAIL_TO']        ?? 'info@wonderlogo.it';
$MAIL_FROM      = $cfg['MAIL_FROM']      ?? 'info@wonderlogo.it';
$MAIL_FROM_NAME = $cfg['MAIL_FROM_NAME'] ?? 'Sito WonderLogo';
$RECAPTCHA_SECRET = $cfg['RECAPTCHA_SECRET'] ?? '';

/* ── Anti-bot lato server ──────────────────────────────────────── */
if (trim($_POST['sito-web'] ?? '') !== '') out(true);                 // honeypot → fingi successo
$elapsed = isset($_POST['form_time']) ? (round(microtime(true) * 1000) - (int) $_POST['form_time']) : 99999;
if ($elapsed >= 0 && $elapsed < 2500) out(true);                       // troppo veloce → bot

// reCAPTCHA v3: verificato solo se la secret key è configurata in mail.config.php
if ($RECAPTCHA_SECRET !== '') {
  $token = $_POST['g-recaptcha-response'] ?? '';
  if ($token === '') out(false, 'Verifica anti-bot mancante. Riprova.');
  $rc = recaptcha_verify($RECAPTCHA_SECRET, $token, $_SERVER['REMOTE_ADDR'] ?? '');
  $score = isset($rc['score']) ? (float) $rc['score'] : 1.0;  // v2 non restituisce score
  if (!$rc || empty($rc['success']) || $score < 0.5) {
    out(false, 'Verifica anti-bot non superata. Riprova.');
  }
}

/* ── Campi e validazione ───────────────────────────────────────── */
$nome      = trim($_POST['nome'] ?? '');
$azienda   = trim($_POST['azienda'] ?? '');
$email     = trim($_POST['email'] ?? '');
$telefono  = trim($_POST['telefono'] ?? '');
$servizio  = trim($_POST['servizio'] ?? '');
$messaggio = trim($_POST['messaggio'] ?? '');
$privacy   = $_POST['privacy'] ?? '';

if ($nome === '' || $messaggio === '')          out(false, 'Compila i campi obbligatori.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 'Indirizzo email non valido.');
if ($privacy === '')                            out(false, 'Devi accettare il trattamento dei dati.');
if (preg_match('/[\r\n]/', $nome . $email))     out(false, 'Input non valido.'); // anti header-injection

/* ── Composizione messaggio ────────────────────────────────────── */
$subject = 'Richiesta dal sito — ' . ($servizio !== '' ? $servizio : 'Generale');
$body =
  "Nuova richiesta dal form contatti del sito WonderLogo\n" .
  "----------------------------------------------------\n" .
  "Nome:      $nome\n" .
  "Azienda:   $azienda\n" .
  "Email:     $email\n" .
  "Telefono:  $telefono\n" .
  "Servizio:  $servizio\n\n" .
  "Messaggio:\n$messaggio\n";

/* ── Invio ──────────────────────────────────────────────────────
   1) Se c'è PHPMailer + SMTP configurato → SMTP autenticato
   2) Altrimenti → mail() nativa di PHP
   (classi PHPMailer chiamate col nome completo per evitare "use") */
$autoload = __DIR__ . '/vendor/autoload.php';

if (file_exists($autoload) && !empty($cfg['SMTP_HOST'])) {
  require $autoload;
  try {
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $cfg['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['SMTP_USER'] ?? $MAIL_FROM;
    $mail->Password   = $cfg['SMTP_PASS'] ?? '';
    $mail->SMTPSecure = $cfg['SMTP_SECURE'] ?? 'ssl';
    $mail->Port       = (int) ($cfg['SMTP_PORT'] ?? 465);
    $mail->CharSet    = 'UTF-8';
    $mail->setFrom($MAIL_FROM, $MAIL_FROM_NAME);
    $mail->addAddress($MAIL_TO);
    $mail->addReplyTo($email, $nome);
    $mail->Subject = $subject;
    $mail->Body    = $body;
    $mail->send();
    out(true);
  } catch (\Throwable $e) {
    out(false, 'Invio non riuscito. Riprova o scrivici a ' . $MAIL_TO . '.', 500);
  }
}

/* ── Fallback: mail() nativa (Aruba/hosting condiviso) ─────────── */
$subjectEnc = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$fromName   = '=?UTF-8?B?' . base64_encode($MAIL_FROM_NAME) . '?=';
$headers  = "From: $fromName <$MAIL_FROM>\r\n";
$headers .= "Reply-To: $nome <$email>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$sent = @mail($MAIL_TO, $subjectEnc, $body, $headers, '-f' . $MAIL_FROM);
if ($sent) out(true);
out(false, 'Invio non riuscito. Scrivici direttamente a ' . $MAIL_TO . '.', 500);
