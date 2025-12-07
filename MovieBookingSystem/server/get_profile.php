<?php
require_once("db_connect.php");
header("Content-Type: application/json; charset=UTF-8");

$customerId = isset($_GET["customer_id"]) ? intval($_GET["customer_id"]) : 0;

if ($customerId <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid customer_id"]);
    exit;
}

$stmt = $conn->prepare("
    SELECT CustomerId, FirstName, MiddleName, LastName, Email, Phone_Number
    FROM customer
    WHERE CustomerId = ?
    LIMIT 1
");
$stmt->bind_param("i", $customerId);
$stmt->execute();
$res = $stmt->get_result();

if ($res && $res->num_rows === 1) {
    $row = $res->fetch_assoc();

    echo json_encode([
        "success" => true,
        "customer" => $row
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Customer not found"]);
}

$stmt->close();
$conn->close();
