<?php
include "db_connect.php";
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

error_log("GET DATA: " . print_r($_GET, true));

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

date_default_timezone_set("Asia/Manila");

// from FE: screenId = ScreenNumber (NOT ScreenID)
$movieId      = isset($_GET["movieId"]) ? (int)$_GET["movieId"] : 0;
$screenNumber = isset($_GET["screenId"]) ? (int)$_GET["screenId"] : 0; // ScreenNumber
$theaterId    = isset($_GET["theaterId"]) ? (int)$_GET["theaterId"] : 0;
$date         = isset($_GET["date"]) ? $_GET["date"] : "";

if ($movieId <= 0 || $screenNumber <= 0 || $theaterId <= 0 || !$date) {
    echo json_encode([
        "success" => false,
        "message" => "movieId, screenId(screenNumber), theaterId, and date are required"
    ]);
    exit;
}

/**
 * 1) Get Capacity + real ScreenID using TheaterId + ScreenNumber
 */
$capSql = "
    SELECT Capacity, ScreenID
    FROM screen
    WHERE TheaterId = ?
      AND ScreenNumber = ?
    LIMIT 1
";
$capStmt = $conn->prepare($capSql);
$capStmt->bind_param("ii", $theaterId, $screenNumber);
$capStmt->execute();
$capRes = $capStmt->get_result();
$capRow = $capRes->fetch_assoc();

if (!$capRow) {
    echo json_encode([
        "success" => false,
        "message" => "Screen not found for this theater."
    ]);
    exit;
}

$capacity     = (int)$capRow["Capacity"];
$realScreenId = (int)$capRow["ScreenID"];

/**
 * 2) Get all showtimes for that movie + theater + real ScreenID + date
 *    (no time filtering here, FE will handle disabling)
 */
$sql = "
    SELECT st.ShowTimeId, st.StartTime, st.EndTime
    FROM showtime st
    INNER JOIN screen s ON st.ScreenId = s.ScreenID
    WHERE st.MovieId  = ?
      AND st.ScreenId = ?
      AND s.TheaterId = ?
      AND st.ShowDate = ?
      AND st.Status = 'active'
    ORDER BY st.StartTime ASC
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiis", $movieId, $realScreenId, $theaterId, $date);
$stmt->execute();
$result = $stmt->get_result();

/**
 * 3) Sold seats (confirmed only)
 */
$soldSql = "
    SELECT COUNT(*) AS sold
    FROM booking b
    INNER JOIN ticketing tk ON tk.BookingId = b.BookingId
    WHERE b.ShowTimeId = ?
      AND b.PaymentStatus = 'confirmed'
";
$soldStmt = $conn->prepare($soldSql);

$times = [];

while ($row = $result->fetch_assoc()) {
    $showtimeId = (int)$row["ShowTimeId"];

    // build start datetime just to format time cleanly
    $startDT = DateTime::createFromFormat("Y-m-d H:i:s", $date . " " . $row["StartTime"]);
    if (!$startDT) continue;

    // count sold seats
    $soldStmt->bind_param("i", $showtimeId);
    $soldStmt->execute();
    $soldRes = $soldStmt->get_result();
    $soldRow = $soldRes->fetch_assoc();
    $soldCount = (int)$soldRow["sold"];

    $available = $soldCount < $capacity; // true = still has seats

    $times[] = [
        "id"        => $showtimeId,
        "time"      => $startDT->format("g:i A"), // e.g. "11:00 AM"
        "available" => $available
    ];
}

echo json_encode([
    "success"   => true,
    "times"     => $times,
    "capacity"  => $capacity,
    "screenId"  => $realScreenId
]);
