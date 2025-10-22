<?php
/* ============================================
   File: bouncer.php
   Project: Travel Experts – Workshop 1
   Authors:
     Cantor (Matte Black ᗰტ)
     Partners: Metacoda (☣️ケイオバリア☣️, VΞR1FΞX)
   Date: 2025-10-21
   Description:
     Inserts new customer records into the existing TravelExperts DB.
   ============================================ */

$host = "localhost";
$user = "root";          // Default user in XAMPP
$pass = "";              // Leave blank unless you’ve set a root password
$dbname = "travelexperts";

// Connect to MySQL
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
  die("<p style='color:red'>Connection failed: " . $conn->connect_error . "</p>");
}

// Collect POST data
$first = $_POST['custFirstName'] ?? '';
$last = $_POST['custLastName'] ?? '';
$address = $_POST['custAddress'] ?? '';
$city = $_POST['custCity'] ?? '';
$prov = $_POST['custProv'] ?? '';
$postal = $_POST['custPostal'] ?? '';
$country = $_POST['custCountry'] ?? '';
$home = $_POST['custHomePhone'] ?? '';
$bus = $_POST['custBusPhone'] ?? '';
$email = $_POST['custEmail'] ?? '';

// AgentId left NULL (new customers register independently)
$agentId = null;

// Prepare insert statement
$stmt = $conn->prepare("
  INSERT INTO customers
  (CustFirstName, CustLastName, CustAddress, CustCity, CustProv, CustPostal,
   CustCountry, CustHomePhone, CustBusPhone, CustEmail, AgentId)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

// Bind parameters
$stmt->bind_param(
  "ssssssssssi",
  $first, $last, $address, $city, $prov, $postal,
  $country, $home, $bus, $email, $agentId
);

// Execute
if ($stmt->execute()) {
  echo "<p style='color:lime'>✅ Registration successful! Welcome to Travel Experts.</p>";
  echo "<a href='register.html'>Return to registration</a>";
} else {
  echo "<p style='color:red'>❌ Error: " . $stmt->error . "</p>";
}

$stmt->close();
$conn->close();
?>
