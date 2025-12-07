<?php
require_once("db_connect.php");
header("Content-Type: application/json; charset=UTF-8");

// Read JSON body
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid JSON"]);
    exit;
}

$customerId = intval($input["CustomerId"] ?? 0);
$firstName  = trim($input["FirstName"] ?? "");
$middleName = trim($input["MiddleName"] ?? "");
$lastName   = trim($input["LastName"] ?? "");
$email      = trim($input["Email"] ?? "");
$phone      = trim($input["Phone_Number"] ?? "");
$newPass    = $input["NewPassword"] ?? "";

if ($customerId <= 0 || $firstName === "" || $lastName === "" || $email === "" || $phone === "") {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Check if email already exists (except current user)
$chk = $conn->prepare("SELECT CustomerId FROM customer WHERE Email=? AND CustomerId<>? LIMIT 1");
$chk->bind_param("si", $email, $customerId);
$chk->execute();
$chkRes = $chk->get_result();

if ($chkRes && $chkRes->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already in use"]);
    exit;
}
$chk->close();

// If password is provided, update it too
if ($newPass !== "") {
    if (strlen($newPass) < 6) {
        echo json_encode(["success" => false, "message" => "Password must be at least 6 characters"]);
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
    echo json_encode(["success" => false, "message" => "Update failed"]);
}

$stmt->close();
$conn->close();
