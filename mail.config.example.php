<?php
/* Modello di configurazione email.
   COPIA questo file come "mail.config.php" e inserisci i dati reali.
   mail.config.php è escluso da git (.gitignore) e NON va mai committato. */

return [
  'MAIL_TO'        => 'info@wonderlogo.net',   // dove arrivano le richieste del form
  'MAIL_FROM'      => 'info@wonderlogo.net',   // mittente (di norma = casella autenticata)
  'MAIL_FROM_NAME' => 'Sito WonderLogo',

  'SMTP_HOST'      => 'smtp.PROVIDER.it',       // es. smtps.aruba.it / authsmtp.register.it
  'SMTP_USER'      => 'info@wonderlogo.net',    // utente SMTP (di solito = email)
  'SMTP_PASS'      => 'LA-PASSWORD-QUI',
  'SMTP_PORT'      => 587,                       // 587 (TLS) oppure 465 (SSL)
  'SMTP_SECURE'    => 'tls',                     // 'tls' per 587, 'ssl' per 465
];
