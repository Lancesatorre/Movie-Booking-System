<?php
include "db_connect.php";
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$customerId    = isset($data["customerId"]) ? (int)$data["customerId"] : 0;
$showtimeId    = isset($data["showtimeId"]) ? (int)$data["showtimeId"] : 0;
$seatNumbers   = isset($data["seatNumbers"]) ? $data["seatNumbers"] : [];
$paymentMethod = isset($data["paymentMethod"]) ? $data["paymentMethod"] : "UNKNOWN";
$paymentStatus = isset($data["paymentStatus"]) ? $data["paymentStatus"] : "PENDING";

if ($customerId <= 0 || $showtimeId <= 0 || !is_array($seatNumbers) || count($seatNumbers) == 0) {
    echo json_encode(["success" => false, "message" => "customerId, showtimeId, seatNumbers are required"]);
    exit;
}

// Start transaction (so it's all-or-nothing)
$conn->begin_transaction();

try {
    // 1) Get Movie Base Price + ScreenId from showtime
    $priceSql = "
        SELECT m.BasePrice, st.ScreenId
        FROM showtime st
        INNER JOIN movie m ON m.MovieId = st.MovieId
        WHERE st.ShowTimeId = ?
    ";
    $priceStmt = $conn->prepare($priceSql);
    $priceStmt->bind_param("i", $showtimeId);
    $priceStmt->execute();
    $priceRes = $priceStmt->get_result();

    if ($priceRes->num_rows === 0) {
        throw new Exception("Showtime not found.");
    }

    $priceRow = $priceRes->fetch_assoc();
    $basePrice = (float)$priceRow["BasePrice"];
    $screenId  = (int)$priceRow["ScreenId"];

    // 2) Convert seatNumbers (A1, B2...) -> SeatIds
    $seatPlaceholders = implode(",", array_fill(0, count($seatNumbers), "?"));
    $seatTypes = str_repeat("s", count($seatNumbers));

    $seatSql = "
        SELECT SeatId, Seatnumber
        FROM seat
        WHERE ScreenId = ?
          AND Seatnumber IN ($seatPlaceholders)
    ";
    $seatStmt = $conn->prepare($seatSql);

    // bind params dynamically: first screenId, then seatNumbers
    $params = array_merge([$screenId], $seatNumbers);
    $types  = "i" . $seatTypes;

    $seatStmt->bind_param($types, ...$params);
    $seatStmt->execute();
    $seatRes = $seatStmt->get_result();

    $seatIds = [];
    while ($row = $seatRes->fetch_assoc()) {
        $seatIds[$row["Seatnumber"]] = (int)$row["SeatId"];
    }

    // ensure all requested seats exist
    foreach ($seatNumbers as $sn) {
        if (!isset($seatIds[$sn])) {
            throw new Exception("Seat '$sn' not found in this screen.");
        }
    }

    // 3) Check if any requested seats are already booked for this showtime
    $checkPlaceholders = implode(",", array_fill(0, count($seatNumbers), "?"));
    $checkTypes = "i" . str_repeat("i", count($seatNumbers));

    $checkSql = "
        SELECT s.Seatnumber
        FROM booking b
        INNER JOIN ticketing t ON t.BookingId = b.BookingId
        INNER JOIN seat s ON s.SeatId = t.SeatId
        WHERE b.ShowTimeId = ?
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

    // 4) Insert into booking
    $totalAmount = $basePrice * count($seatNumbers);

    $bookingSql = "
        INSERT INTO booking (CustomerId, ShowTimeId, BookingDate, PaymentMethod, PaymentStatus, TotalAmount)
        VALUES (?, ?, NOW(), ?, ?, ?)
    ";
    $bookingStmt = $conn->prepare($bookingSql);
    $bookingStmt->bind_param("iissd", $customerId, $showtimeId, $paymentMethod, $paymentStatus, $totalAmount);
    $bookingStmt->execute();

    $bookingId = $conn->insert_id;

    // 5) Insert into ticketing (one row per seat)
    $ticketSql = "
        INSERT INTO ticketing (BookingId, SeatId, Price)
        VALUES (?, ?, ?)
    ";
    $ticketStmt = $conn->prepare($ticketSql);

    foreach ($seatNumbers as $sn) {
        $sid = $seatIds[$sn];
        $ticketStmt->bind_param("iid", $bookingId, $sid, $basePrice);
        $ticketStmt->execute();
    }

    // Commit transaction
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Booking created",
        "bookingId" => $bookingId,
        "totalAmount" => $totalAmount,
        "seats" => $seatNumbers
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
