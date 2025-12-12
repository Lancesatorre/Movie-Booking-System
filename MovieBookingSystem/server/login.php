<?php
include "db_connect.php";
header("Content-Type: application/json");

// Read JSON login request
$data = json_decode(file_get_contents("php://input"), true);

// Handle null data
if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON received"]);
    exit;
}

$email = $data["email"] ?? null;
$password = $data["password"] ?? null;

// Validate inputs
if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and password are required"]);
    exit;
}

/* =========================
   ADMIN LOGIN (customer style)
   admin table has:
   Email
   Password  (admin123)
   ========================= */
$adminSql = "SELECT * FROM admin WHERE Email = ?";
$adminStmt = $conn->prepare($adminSql);
$adminStmt->bind_param("s", $email);
$adminStmt->execute();
$adminResult = $adminStmt->get_result();

if ($adminResult->num_rows > 0) {
    $admin = $adminResult->fetch_assoc();

    // admin password stored like customer: hashed in "Password"
    if (password_verify($password, $admin["Password"])) {
        unset($admin["Password"]); // remove hash before returning

        echo json_encode([
            "success" => true,
            "message" => "Admin login successful",
            "userType" => "admin",
            "user" => $admin
        ]);
        exit;
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password"]);
        exit;
    }
}

/* ========================= CUSTOMER LOGIN ========================= */
$customerSql = "SELECT * FROM customer WHERE Email = ?";
$customerStmt = $conn->prepare($customerSql);
$customerStmt->bind_param("s", $email);
$customerStmt->execute();
$customerResult = $customerStmt->get_result();

if ($customerResult->num_rows > 0) {
    $customer = $customerResult->fetch_assoc();

    if (password_verify($password, $customer["Password"])) {
        unset($customer["Password"]);

        echo json_encode([
            "success" => true,
            "message" => "Customer login successful",
            "userType" => "customer",
            "user" => $customer
        ]);
        exit;
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password"]);
        exit;
    }
}

// Email not found in either table
echo json_encode(["success" => false, "message" => "Email not found"]);
?>
