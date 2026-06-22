<?php
/**
 * send-mail.php — FPdeveloper Contact Form Handler
 *
 * Riceve la POST dal form contatti, valida i dati e invia l'email.
 * Risponde con JSON { success: bool, message: string }.
 */

// --- Configurazione ----------------------------------------------------------
define('RECIPIENT_EMAIL', 'fede-palma@hotmail.it');   // ← Modifica con la tua email
define('RECIPIENT_NAME',  'FPdeveloper');
define('SITE_NAME',       'FPdeveloper');

// --- Headers -----------------------------------------------------------------
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Accetta solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Metodo non consentito.']));
}

// --- Honeypot anti-spam -------------------------------------------------------
if (!empty($_POST['website'])) {
    // Bot rilevato: risposta finta positiva per non rivelare il meccanismo
    exit(json_encode(['success' => true, 'message' => 'Messaggio inviato con successo!']));
}

// --- Raccolta e sanitizzazione input -----------------------------------------
$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim(strip_tags($_POST['email']   ?? ''));
$phone   = trim(strip_tags($_POST['phone']   ?? ''));
$budget  = trim(strip_tags($_POST['budget']  ?? ''));
$service = trim(strip_tags($_POST['service'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));

// --- Validazione --------------------------------------------------------------
$errors = [];

if (empty($name) || mb_strlen($name) < 2) {
    $errors[] = 'Il nome è obbligatorio (minimo 2 caratteri).';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Inserisci un indirizzo email valido.';
}

if (empty($message) || mb_strlen($message) < 10) {
    $errors[] = 'Il messaggio è obbligatorio (minimo 10 caratteri).';
}

// Rate limiting minimale via sessione (1 invio ogni 60 secondi)
session_start();
if (isset($_SESSION['last_contact_time']) && (time() - $_SESSION['last_contact_time']) < 60) {
    $errors[] = 'Hai già inviato un messaggio di recente. Attendi qualche minuto.';
}

if (!empty($errors)) {
    http_response_code(422);
    exit(json_encode(['success' => false, 'message' => implode(' ', $errors)]));
}

// --- Costruzione email -------------------------------------------------------
$subject = '[' . SITE_NAME . '] Nuovo messaggio da ' . $name;

$body  = "Hai ricevuto un nuovo messaggio dal sito " . SITE_NAME . ".\n\n";
$body .= "═══════════════════════════════════════\n";
$body .= "Nome:     " . $name    . "\n";
$body .= "Email:    " . $email   . "\n";
if (!empty($phone)) {
    $body .= "Telefono: " . $phone . "\n";
}
if (!empty($service)) {
    $body .= "Servizio: " . $service . "\n";
}
if (!empty($budget)) {
    $body .= "Budget:   " . $budget  . "\n";
}
$body .= "═══════════════════════════════════════\n\n";
$body .= "MESSAGGIO:\n" . $message . "\n\n";
$body .= "═══════════════════════════════════════\n";
$body .= "Inviato il: " . date('d/m/Y H:i:s') . "\n";
$body .= "IP: "         . ($_SERVER['REMOTE_ADDR'] ?? 'n/d') . "\n";

// Headers per l'email principale
$headers  = "From: " . SITE_NAME . " <noreply@fpdeveloper.it>\r\n";
$headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// --- Invio email principale --------------------------------------------------
$sent = mail(RECIPIENT_EMAIL, $subject, $body, $headers);

if (!$sent) {
    http_response_code(500);
    exit(json_encode(['success' => false, 'message' => 'Errore nell\'invio. Riprova o contattami direttamente via email.']));
}

// --- Email di conferma al mittente -------------------------------------------
$confirmSubject = 'Ho ricevuto il tuo messaggio — ' . SITE_NAME;
$confirmBody  = "Ciao " . $name . ",\n\n";
$confirmBody .= "Ho ricevuto il tuo messaggio e ti risponderò entro 24 ore lavorative.\n\n";
$confirmBody .= "Se la questione è urgente, puoi scrivermi direttamente a " . RECIPIENT_EMAIL . ".\n\n";
$confirmBody .= "A presto,\nFrancesco — " . SITE_NAME . "\n\n";
$confirmBody .= "---\n";
$confirmBody .= "Il tuo messaggio:\n" . $message . "\n";

$confirmHeaders  = "From: " . SITE_NAME . " <" . RECIPIENT_EMAIL . ">\r\n";
$confirmHeaders .= "MIME-Version: 1.0\r\n";
$confirmHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

@mail($email, $confirmSubject, $confirmBody, $confirmHeaders);

// --- Salva timestamp per rate limiting ---------------------------------------
$_SESSION['last_contact_time'] = time();

// --- Risposta positiva -------------------------------------------------------
exit(json_encode(['success' => true, 'message' => 'Messaggio inviato con successo! Ti rispondo presto.']));
