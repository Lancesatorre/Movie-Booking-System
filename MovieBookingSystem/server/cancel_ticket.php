<?php
include "db_connect.php";
header("Content-Type: application/json");

// Preflight
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

// Optional safety: prevent cancel within 24 hours
$sqlCheck = "
SELECT st.ShowDate, st.StartTime
FROM booking b
JOIN showtime st ON b.ShowTimeId = st.ShowTimeId
WHERE b.BookingId = ?
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

// Delete booking (ticketing will cascade delete)
$del = $conn->prepare("DELETE FROM booking WHERE BookingId = ?");
$del->bind_param("i", $bookingId);

if ($del->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to cancel booking"]);
}
