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

$customerId    = isset($data["customerId"]) ? (int)$data["customerId"] : 0;
$showtimeId    = isset($data["showtimeId"]) ? (int)$data["showtimeId"] : 0;
$seatNumbers   = isset($data["seatNumbers"]) ? $data["seatNumbers"] : [];
$paymentMethod = isset($data["paymentMethod"]) ? trim($data["paymentMethod"]) : "UNKNOWN";
$allowedStatuses = ["confirmed", "cancelled", "pending"];
$paymentStatus = isset($data["paymentStatus"]) ? strtolower(trim($data["paymentStatus"])) : "confirmed";
if (!in_array($paymentStatus, $allowedStatuses, true)) {
    $paymentStatus = "confirmed";
}

if ($customerId <= 0 || $showtimeId <= 0 || !is_array($seatNumbers) || count($seatNumbers) == 0) {
    echo json_encode(["success" => false, "message" => "Seat Reserved! \n Please choose another seat. Thank you!"]);
    exit;
}

$conn->begin_transaction();

try {
    // 1) Get BasePrice + ScreenId
    $priceSql = "
        SELECT m.BasePrice, st.ScreenId
        FROM showtime st
        INNER JOIN movie m ON m.MovieId = st.MovieId
        WHERE st.ShowTimeId = ?
        LIMIT 1
    ";
    $priceStmt = $conn->prepare($priceSql);
    $priceStmt->bind_param("i", $showtimeId);
    $priceStmt->execute();
    $priceRes = $priceStmt->get_result();

    if ($priceRes->num_rows === 0) {
        throw new Exception("Showtime not found.");
    }

    $priceRow  = $priceRes->fetch_assoc();
    $basePrice = (float)$priceRow["BasePrice"];
    $screenId  = (int)$priceRow["ScreenId"];

    // 2) SeatNumbers -> SeatIds (only for this screen)
    $seatPlaceholders = implode(",", array_fill(0, count($seatNumbers), "?"));
    $seatTypes = str_repeat("s", count($seatNumbers));

    $seatSql = "
        SELECT SeatId, Seatnumber
        FROM seat
        WHERE ScreenId = ?
          AND Seatnumber IN ($seatPlaceholders)
    ";
    $seatStmt = $conn->prepare($seatSql);

    $params = array_merge([$screenId], $seatNumbers);
    $types  = "i" . $seatTypes;
    $seatStmt->bind_param($types, ...$params);
    $seatStmt->execute();
    $seatRes = $seatStmt->get_result();

    $seatIds = [];
    while ($row = $seatRes->fetch_assoc()) {
        $seatIds[$row["Seatnumber"]] = (int)$row["SeatId"];
    }

    foreach ($seatNumbers as $sn) {
        if (!isset($seatIds[$sn])) {
            throw new Exception("Seat '$sn' not found in this screen.");
        }
    }

    // 3) Check if any seats already booked on this showtime
    // only count CONFIRMED (cancelled should free seats)
    $checkPlaceholders = implode(",", array_fill(0, count($seatNumbers), "?"));
    $checkTypes = "i" . str_repeat("i", count($seatNumbers));

    $checkSql = "
        SELECT s.Seatnumber
        FROM booking b
        INNER JOIN ticketing t ON t.BookingId = b.BookingId
        INNER JOIN seat s ON s.SeatId = t.SeatId
        WHERE b.ShowTimeId = ?
          AND b.PaymentStatus = 'confirmed'
          AND t.SeatId IN ($checkPlaceholders)
        LIMIT 1
    ";
    $checkStmt = $conn->prepare($checkSql);

    $checkParams = array_merge([$showtimeId], array_values($seatIds));
    $checkStmt->bind_param($checkTypes, ...$checkParams);
    $checkStmt->execute();
    $checkRes = $checkStmt->get_result();

    if ($checkRes->num_rows > 0) {
        $taken = $checkRes->fetch_assoc()["Seatnumber"];
        throw new Exception("Seat '$taken' was already booked. Please refresh and choose another seat.");
    }

    // 4) Insert booking
    $totalAmount = $basePrice * count($seatNumbers);

    $bookingSql = "
        INSERT INTO booking (CustomerId, ShowTimeId, BookingDate, PaymentMethod, PaymentStatus, TotalAmount)
        VALUES (?, ?, CURDATE(), ?, ?, ?)
    ";
    $bookingStmt = $conn->prepare($bookingSql);
    $bookingStmt->bind_param("iissd", $customerId, $showtimeId, $paymentMethod, $paymentStatus, $totalAmount);

    if (!$bookingStmt->execute()) {
        throw new Exception("Failed to create booking.");
    }

    $bookingId = $conn->insert_id;

    // 5) Insert ticketing per seat
    $ticketSql = "
        INSERT INTO ticketing (BookingId, SeatId, Price)
        VALUES (?, ?, ?)
    ";
    $ticketStmt = $conn->prepare($ticketSql);

    foreach ($seatNumbers as $sn) {
        $sid = $seatIds[$sn];
        $ticketStmt->bind_param("iid", $bookingId, $sid, $basePrice);
        if (!$ticketStmt->execute()) {
            throw new Exception("Failed to reserve seat '$sn'.");
        }
    }

    $conn->commit();

    echo json_encode([
        "success"     => true,
        "message"     => "Booking created",
        "bookingId"   => $bookingId,
        "totalAmount" => $totalAmount,
        "seats"       => $seatNumbers,
        "status"      => $paymentStatus
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
