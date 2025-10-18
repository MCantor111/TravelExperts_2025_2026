<?php
// bouncer.php — basic POST data echo for testing
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    echo "<h1>Form Submission Received!</h1>";
    echo "<pre>";
    print_r($_POST);
    echo "</pre>";
} else {
    echo "<h2>No data received. Please submit the form.</h2>";
}
?>
