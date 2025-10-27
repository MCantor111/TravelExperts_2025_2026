<?php
// =====================================
// File: bouncer.php
// Purpose: Log registration data to terminal (no web output)
// =====================================

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    error_log("=== New Registration Submission ===");
    error_log(print_r($_POST, true));
    http_response_code(200);
    echo "OK"; // return minimal success response
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>
