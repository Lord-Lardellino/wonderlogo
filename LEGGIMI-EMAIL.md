# Attivare l'invio email del form contatti (PHPMailer)

Il form contatti invia i dati a `send.php`, che spedisce l'email via SMTP con
**PHPMailer**. Tutto è già pronto: mancano solo **la casella email reale** e
**l'installazione della libreria** sul server.

## 1. Installare PHPMailer
Serve un hosting con **PHP 7.4+**. Due modi:

**A) Con Composer (consigliato)** — dalla cartella del sito:
```
composer install
```
(crea la cartella `vendor/` con PHPMailer; `composer.json` è già incluso.)

**B) Senza Composer (manuale):**
1. Scarica PHPMailer: https://github.com/PHPMailer/PHPMailer/releases
2. Crea la cartella `vendor/phpmailer/phpmailer/` e copiaci dentro la cartella `src/`.
3. In cima a `send.php` sostituisci la riga
   `require __DIR__ . '/vendor/autoload.php';`
   con:
   ```php
   require __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php';
   require __DIR__ . '/vendor/phpmailer/phpmailer/src/SMTP.php';
   require __DIR__ . '/vendor/phpmailer/phpmailer/src/Exception.php';
   ```

## 2. Inserire i dati della casella email
Le credenziali NON stanno in `send.php` ma in un file separato **non versionato**
(`mail.config.php`), così la password non finisce mai su GitHub.

1. Copia `mail.config.example.php` → `mail.config.php`
2. Apri `mail.config.php` e compila i valori:

| Chiave        | Cosa mettere                                                    |
|---------------|-----------------------------------------------------------------|
| `MAIL_TO`     | L'email dove vuoi ricevere le richieste (info@wonderlogo.net)   |
| `MAIL_FROM`   | Mittente, di norma = casella autenticata (info@wonderlogo.net)  |
| `SMTP_HOST`   | Server SMTP del provider (es. `smtps.aruba.it`)                 |
| `SMTP_USER`   | Utente SMTP (di solito = la tua email)                          |
| `SMTP_PASS`   | Password della casella (o "app password")                       |
| `SMTP_PORT`   | `587` (TLS) oppure `465` (SSL)                                  |
| `SMTP_SECURE` | `tls` per la 587, `ssl` per la 465                              |

> `mail.config.php` è già in `.gitignore`: non verrà mai caricato su GitHub.
> Sul server va caricato a mano via FTP/pannello (non passa da git).

### Esempi rapidi
- **Aruba:** host `smtps.aruba.it`, porta `465`, secure `ssl`
- **Register.it:** host `authsmtp.register.it`, porta `587`, secure `tls`
- **Gmail / Google Workspace:** host `smtp.gmail.com`, porta `587`, secure `tls`,
  e come password una **App Password** (non la password normale).

## 3. Provare
Apri la pagina Contatti online, compila e invia. Se qualcosa non va, l'errore
tecnico è in `$mail->ErrorInfo` (puoi loggarlo temporaneamente in `send.php`).

## Note
- **Anti-bot già attivo:** honeypot (campo nascosto `sito-web`) + controllo del
  tempo di compilazione, sia lato browser sia lato server in `send.php`.
- **Sicurezza:** non committare mai la password su GitHub se il repo è pubblico.
  Valuta di mettere le credenziali in variabili d'ambiente del server.
- Finché `send.php` non è configurato, il sito mostra all'utente l'invito a
  scrivere direttamente a `info@wonderlogo.net`.
