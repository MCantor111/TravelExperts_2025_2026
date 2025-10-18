<?php
file_put_contents("debug_log.txt", print_r($_SERVER, true), FILE_APPEND);
file_put_contents("debug_log.txt", print_r($_POST, true), FILE_APPEND);

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  echo "<h1>Form Submission Received!</h1>";
  echo "<pre>";
  print_r($_POST);
  echo "</pre>";
} else {
  echo "<h2>No data received. Please submit the form.</h2>";
}
?>
