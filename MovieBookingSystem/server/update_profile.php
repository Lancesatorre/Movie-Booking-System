<?php
require_once("db_connect.php");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

// Read JSON body
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
  echo json_encode(["success" => false, "message" => "Invalid input"]);
  exit;
}

$customerId = intval($input["CustomerId"] ?? 0);
$firstName  = trim($input["FirstName"] ?? "");
$middleName = trim($input["MiddleName"] ?? "");
$lastName   = trim($input["LastName"] ?? "");
$email      = trim($input["Email"] ?? "");
$phoneRaw   = trim($input["Phone_Number"] ?? "");
$newPass    = trim($input["NewPassword"] ?? "");

// sanitize phone -> digits only
$phoneDigits = preg_replace("/\D+/", "", $phoneRaw);

// --------------------
// REQUIRED FIELD CHECKS
// --------------------
if ($customerId <= 0) {
  echo json_encode(["success" => false, "message" => "Invalid customer ID"]);
  exit;
}

if ($firstName === "" || $lastName === "") {
  echo json_encode(["success" => false, "message" => "Please enter your full name!"]);
  exit;
}

if ($email === "") {
  echo json_encode(["success" => false, "message" => "Email address is required!"]);
  exit;
}

if ($phoneDigits === "") {
  echo json_encode(["success" => false, "message" => "Mobile number is required!"]);
  exit;
}

if (strlen($phoneDigits) != 11) {
  echo json_encode(["success" => false, "message" => "Mobile number must be 11 digits"]);
  exit;
}

$phone = $phoneDigits;

// if middle is empty, store NULL (so it doesn't stick)
if ($middleName === "") {
  $middleName = null;
}

// --------------------
// UNIQUE EMAIL CHECK
// --------------------
$chk = $conn->prepare("SELECT CustomerId FROM customer WHERE Email=? AND CustomerId<>? LIMIT 1");
$chk->bind_param("si", $email, $customerId);
$chk->execute();
$chkRes = $chk->get_result();

if ($chkRes && $chkRes->num_rows > 0) {
  echo json_encode(["success" => false, "message" => "Email already in use."]);
  $chk->close();
  exit;
}
$chk->close();

// --------------------
// PASSWORD RULE (OPTIONAL)
// --------------------
if ($newPass !== "") {
  if (strlen($newPass) < 6) {
    echo json_encode(["success" => false, "message" => "Password must be at least 6 characters."]);
    exit;
  }

  $hash = password_hash($newPass, PASSWORD_BCRYPT);

  $stmt = $conn->prepare("
    UPDATE customer
    SET FirstName=?, MiddleName=?, LastName=?, Email=?, Phone_Number=?, Password=?
    WHERE CustomerId=?
  ");
  $stmt->bind_param("ssssssi", $firstName, $middleName, $lastName, $email, $phone, $hash, $customerId);

} else {
  $stmt = $conn->prepare("
    UPDATE customer
    SET FirstName=?, MiddleName=?, LastName=?, Email=?, Phone_Number=?
    WHERE CustomerId=?
  ");
  $stmt->bind_param("sssssi", $firstName, $middleName, $lastName, $email, $phone, $customerId);
}

// Execute update
if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Profile updated"]);
} else {
  echo json_encode(["success" => false, "message" => "Update failed", "sql_error" => $stmt->error]);
}

$stmt->close();
$conn->close();
