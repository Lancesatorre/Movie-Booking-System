<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
  echo json_encode(["success" => false, "message" => "Invalid input"]);
  exit;
}

$adminId = isset($data["id"]) ? (int)$data["id"] : 1;
$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$newPassword = trim($data["newPassword"] ?? "");

// sanitize phone to digits only (PH format)
$mobileRaw = trim($data["mobile"] ?? "");
$mobileDigits = preg_replace("/\D+/", "", $mobileRaw);

// --------------------
// REQUIRED FIELD CHECKS
// --------------------
if ($name === "") {
  echo json_encode(["success" => false, "message" => "Please enter your full name."]);
  $conn->close();
  exit;
}

if ($email === "") {
  echo json_encode(["success" => false, "message" => "Email address is required."]);
  $conn->close();
  exit;
}

if ($mobileDigits === "") {
  echo json_encode(["success" => false, "message" => "Mobile number is required."]);
  $conn->close();
  exit;
}

if (strlen($mobileDigits) != 11) {
  echo json_encode(["success" => false, "message" => "Mobile number must be 11 digits."]);
  $conn->close();
  exit;
}

$mobile = $mobileDigits;

// --------------------
// SPLIT NAME (NO STICKY MIDDLE NAME)
// --------------------
$parts = preg_split('/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY);

if (count($parts) < 2) {
  echo json_encode(["success" => false, "message" => "Please enter your full name (first and last)."]);
  $conn->close();
  exit;
}

$firstName = $parts[0];
$lastName = "";
$middleName = null; // IMPORTANT: default NULL so it doesn't keep old middle name

if (count($parts) >= 3) {
  $lastName = $parts[count($parts) - 1];
  $middleName = implode(" ", array_slice($parts, 1, -1));
} else {
  // exactly 2 words
  $lastName = $parts[1];
  $middleName = null; // CLEAR middle name if not provided
}

// --------------------
// UNIQUE EMAIL CHECK
// --------------------
$check = $conn->prepare("SELECT AdminID FROM admin WHERE Email = ? AND AdminID <> ?");
$check->bind_param("si", $email, $adminId);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
  echo json_encode(["success" => false, "message" => "Email already in use."]);
  $check->close();
  $conn->close();
  exit;
}
$check->close();

// --------------------
// UPDATE PROFILE
// --------------------
$stmt = $conn->prepare("
  UPDATE admin
  SET FirstName = ?, MiddleName = ?, LastName = ?, Email = ?, Phone = ?
  WHERE AdminID = ?
");
$stmt->bind_param("sssssi", $firstName, $middleName, $lastName, $email, $mobile, $adminId);
$okProfile = $stmt->execute();

if (!$okProfile) {
  echo json_encode([
    "success" => false,
    "message" => "Profile update failed",
    "sql_error" => $stmt->error
  ]);
  $stmt->close();
  $conn->close();
  exit;
}
$stmt->close();

// --------------------
// UPDATE PASSWORD (OPTIONAL)
// --------------------
if ($newPassword !== "") {
  $hashed = password_hash($newPassword, PASSWORD_BCRYPT);

  $stmt2 = $conn->prepare("
    UPDATE admin
    SET Password = ?
    WHERE AdminID = ?
  ");
  $stmt2->bind_param("si", $hashed, $adminId);
  $okPassword = $stmt2->execute();

  if (!$okPassword) {
    echo json_encode([
      "success" => false,
      "message" => "Password update failed",
      "sql_error" => $stmt2->error
    ]);
    $stmt2->close();
    $conn->close();
    exit;
  }
  $stmt2->close();
}

$conn->close();
echo json_encode(["success" => true, "message" => "Admin updated"]);
