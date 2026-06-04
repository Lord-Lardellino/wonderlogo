<?php
/* ============================================================
   WonderLogo — invio form contatti con PHPMailer (SMTP)
   ------------------------------------------------------------
   PRIMA DI ANDARE ONLINE compila la sezione CONFIG qui sotto
   con i dati della casella email reale (vedi LEGGIMI-EMAIL.md).
   ============================================================ */

/* ===================== CONFIG (DA COMPILARE) ===================== */
$MAIL_TO     = 'info@wonderlogo.net';        // dove arrivano le richieste
$MAIL_FROM   = 'no-reply@wonderlogo.it';     // mittente tecnico (meglio sul dominio del sito)
$MAIL_FROM_NAME = 'Sito WonderLogo';

$SMTP_HOST   = 'smtp.IL-TUO-PROVIDER.it';    // es. smtps.aruba.it, authsmtp.register.it, smtp.gmail.com
$SMTP_USER   = 'no-reply@wonderlogo.it';     // utente SMTP (di solito = email)
$SMTP_PASS   = 'METTI-LA-PASSWORD-QUI';      // password della casella / app password
$SMTP_PORT   = 587;                          // 587 (TLS) oppure 465 (SSL)
$SMTP_SECURE = 'tls';                         // 'tls' per 587, 'ssl' per 465
/* ================================================================ */

header('Content-Type: application/json; charset=utf-8');

function out($ok, $msg = '', $code = 200) {
  http_response_code($code);
  echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $msg]);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'Metodo non consentito', 405);

/* ── Anti-bot lato server ──────────────────────────────────────── */
// 1) Honeypot: campo nascosto che gli umani non vedono
if (trim($_POST['sito-web'] ?? '') !== '') out(true);          // bot → fingi successo
// 2) Tempo minimo dal caricamento del form (millisecondi)
$elapsed = isset($_POST['form_time']) ? (round(microtime(true) * 1000) - (int) $_POST['form_time']) : 99999;
if ($elapsed >= 0 && $elapsed < 2500) out(true);               // troppo veloce → bot

/* ── Lettura e validazione campi ───────────────────────────────── */
$nome      = trim($_POST['nome'] ?? '');
$azienda   = trim($_POST['azienda'] ?? '');
$email     = trim($_POST['email'] ?? '');
$telefono  = trim($_POST['telefono'] ?? '');
$servizio  = trim($_POST['servizio'] ?? '');
$messaggio = trim($_POST['messaggio'] ?? '');
$privacy   = $_POST['privacy'] ?? '';

if ($nome === '' || $messaggio === '')                 out(false, 'Compila i campi obbligatori.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))        out(false, 'Indirizzo email non valido.');
if ($privacy === '')                                   out(false, 'Devi accettare il trattamento dei dati.');
// anti header-injection
if (preg_match('/[\r\n]/', $nome . $email))            out(false, 'Input non valido.');

/* ── Invio con PHPMailer ───────────────────────────────────────── */
$autoload = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload)) out(false, 'Server email non configurato.', 500);
require $autoload;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);
try {
  $mail->isSMTP();
  $mail->Host       = $SMTP_HOST;
  $mail->SMTPAuth   = true;
  $mail->Username   = $SMTP_USER;
  $mail->Password   = $SMTP_PASS;
  $mail->SMTPSecure = $SMTP_SECURE;
  $mail->Port       = $SMTP_PORT;
  $mail->CharSet    = 'UTF-8';

  $mail->setFrom($MAIL_FROM, $MAIL_FROM_NAME);
  $mail->addAddress($MAIL_TO);
  $mail->addReplyTo($email, $nome);

  $mail->Subject = 'Richiesta dal sito — ' . ($servizio !== '' ? $servizio : 'Generale');
  $mail->Body =
    "Nuova richiesta dal form contatti del sito WonderLogo\n" .
    "----------------------------------------------------\n" .
    "Nome:      $nome\n" .
    "Azienda:   $azienda\n" .
    "Email:     $email\n" .
    "Telefono:  $telefono\n" .
    "Servizio:  $servizio\n\n" .
    "Messaggio:\n$messaggio\n";

  $mail->send();
  out(true);
} catch (Exception $e) {
  // $mail->ErrorInfo contiene il dettaglio (non lo mostriamo all'utente)
  out(false, 'Invio non riuscito. Riprova o scrivici a ' . $MAIL_TO . '.', 500);
}
