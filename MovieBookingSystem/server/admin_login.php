<?php
include "db_connect.php";
header("Content-Type: application/json");

// Read JSON login request
$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"] ?? null;
$email = $data["email"] ?? null;
$password = $data["password"];

// Check if either username or email is provided
if (!$username && !$email) {
    echo json_encode(["success" => false, "message" => "Username or email is required"]);
    exit;
}

// Build SQL query based on what's provided
if ($username) {
    $sql = "SELECT * FROM admin WHERE Username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
} else {
    $sql = "SELECT * FROM admin WHERE Email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
}

$stmt->execute();
$result = $stmt->get_result();

// If admin not found
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Admin credentials not found"]);
    exit;
}

$admin = $result->fetch_assoc();

// Check password
if (password_verify($password, $admin["PasswordHash"])) {
    
    // Remove password before sending admin data
    unset($admin["PasswordHash"]);

    echo json_encode([
        "success" => true,
        "message" => "Admin login successful",
        "admin" => $admin,
        "userType" => "admin"
    ]);
    
} else {
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
}
?>
