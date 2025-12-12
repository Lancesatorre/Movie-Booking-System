<?php
include "db_connect.php";
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$bookingId = isset($data["ticketId"]) ? (int)$data["ticketId"] : 0;

if ($bookingId <= 0) {
    echo json_encode(["success" => false, "message" => "Missing ticketId/bookingId"]);
    exit;
}

/*
  1) get showtime for this booking
  2) block cancel if within 24 hours
*/
$sqlCheck = "
    SELECT st.ShowDate, st.StartTime
    FROM booking b
    JOIN showtime st ON b.ShowTimeId = st.ShowTimeId
    WHERE b.BookingId = ?
    LIMIT 1
";
$checkStmt = $conn->prepare($sqlCheck);
$checkStmt->bind_param("i", $bookingId);
$checkStmt->execute();
$checkRes = $checkStmt->get_result();

if ($checkRes->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Booking not found"]);
    exit;
}

$show = $checkRes->fetch_assoc();
$showDateTime = $show["ShowDate"] . " " . $show["StartTime"];
$hoursDiff = (strtotime($showDateTime) - time()) / 3600;

if ($hoursDiff <= 24) {
    echo json_encode(["success" => false, "message" => "Cannot cancel within 24 hours"]);
    exit;
}

$upd = $conn->prepare("
    UPDATE booking
    SET PaymentStatus = 'cancelled'
    WHERE BookingId = ?
");
$upd->bind_param("i", $bookingId);

if ($upd->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to cancel booking"]);
}
