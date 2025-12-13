<?php
include "db_connect.php";
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$showtimeId = isset($_GET["showtimeId"]) ? (int)$_GET["showtimeId"] : 0;

if ($showtimeId <= 0) {
    echo json_encode(["success" => false, "message" => "showtimeId is required"]);
    exit;
}

/*
  Logic:
  booking.ShowTimeId -> booking.BookingId
  ticketing.BookingId -> ticketing.SeatId
  seat.SeatId -> seat.Seatnumber (A1, A2, ...)
*/
$sql = "
    SELECT DISTINCT s.Seatnumber
    FROM booking b
    INNER JOIN ticketing t ON t.BookingId = b.BookingId
    INNER JOIN seat s ON s.SeatId = t.SeatId
    WHERE b.ShowTimeId = ?
      AND b.PaymentStatus = 'confirmed'
    ORDER BY s.Seatnumber ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $showtimeId);
$stmt->execute();
$result = $stmt->get_result();

$unavailable = [];
while ($row = $result->fetch_assoc()) {
    $unavailable[] = $row["Seatnumber"];
}

echo json_encode([
    "success" => true,
    "unavailableSeats" => $unavailable
]);
