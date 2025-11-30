<?php
include "db_connect.php";
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

$firstName = $data["firstName"];
$middleName = $data["middleName"];
$lastName = $data["lastName"];
$email = $data["email"];
$phone = $data["phone"];
$password = $data["password"];

// Validate required fields
if (!$firstName || !$lastName || !$email || !$phone || !$password) {
    echo json_encode(["success" => false, "message" => "All required fields must be filled."]);
    exit;
}

// Check if email already exists
$check = $conn->prepare("SELECT * FROM customer WHERE Email = ?");
$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already exists"]);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert customer into DB
$sql = "INSERT INTO customer (FirstName, MiddleName, LastName, Email, Password, Phone_Number)
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssss", $firstName, $middleName, $lastName, $email, $hashedPassword, $phone);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Account created successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to create account"]);
}

?>
