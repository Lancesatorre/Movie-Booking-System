<?php
include "db_connect.php";
header("Content-Type: application/json");

// Read JSON login request
$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"];
$password = $data["password"];

$sql = "SELECT * FROM customer WHERE Email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// If email not found
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

$user = $result->fetch_assoc();

// Check password
if (password_verify($password, $user["Password"])) {
    
    // Remove password before sending user data
    unset($user["Password"]);

    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => $user
    ]);
    
} else {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
}
?>
