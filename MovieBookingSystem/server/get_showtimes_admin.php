<?php
include "db_connect.php";
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

date_default_timezone_set("Asia/Manila"); // ensure consistent time rules

$movieId      = isset($_GET["movieId"]) ? (int)$_GET["movieId"] : 0;
$screenNumber = isset($_GET["screenId"]) ? (int)$_GET["screenId"] : 0; // screenId = ScreenNumber
$theaterId    = isset($_GET["theaterId"]) ? (int)$_GET["theaterId"] : 0;
$date         = isset($_GET["date"]) ? $_GET["date"] : "";

if ($movieId <= 0 || $screenNumber <= 0 || $theaterId <= 0 || !$date) {
    echo json_encode([
        "success" => false,
        "message" => "movieId, screenId(screenNumber), theaterId, and date are required"
    ]);
    exit;
}

/*
  1) Get capacity (and real ScreenID) for this theater+screenNumber
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
$capacity = (int)$capRow["Capacity"];
$realScreenId = (int)$capRow["ScreenID"];

/*
  2) Get showtimes for:
   - movie
   - theater
   - screen number
   - date
*/
$sql = "
    SELECT st.ShowTimeId, st.StartTime, st.EndTime
    FROM showtime st
    INNER JOIN screen s ON st.ScreenId = s.ScreenID
    WHERE st.MovieId = ?
      AND s.ScreenNumber = ?
      AND s.TheaterId = ?
      AND st.ShowDate = ?
    ORDER BY st.StartTime ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiis", $movieId, $screenNumber, $theaterId, $date);
$stmt->execute();
$result = $stmt->get_result();

/*
  3) Prepare sold-seat counter per showtime
*/
$soldSql = "
    SELECT COUNT(*) AS sold
    FROM booking b
    INNER JOIN ticketing tk ON tk.BookingId = b.BookingId
    WHERE b.ShowTimeId = ?
";
$soldStmt = $conn->prepare($soldSql);

$times = [];

$todayYMD = date("Y-m-d");
$now = new DateTime(); // server time Asia/Manila
$nowPlus5 = (clone $now)->modify("+5 minutes");

$requestedDateObj = DateTime::createFromFormat("Y-m-d", $date);
if (!$requestedDateObj) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid date format. Use YYYY-MM-DD."
    ]);
    exit;
}

// If date is already past, no showtimes
if ($date < $todayYMD) {
    echo json_encode([
        "success"   => true,
        "times"     => [],
        "capacity"  => $capacity,
        "screenId"  => $realScreenId
    ]);
    exit;
}

while ($row = $result->fetch_assoc()) {
    $showtimeId = (int)$row["ShowTimeId"];

    // Build DateTime objects for comparisons
    $startDT = DateTime::createFromFormat("Y-m-d H:i:s", $date . " " . $row["StartTime"]);
    $endDT   = DateTime::createFromFormat("Y-m-d H:i:s", $date . " " . $row["EndTime"]);
    if (!$startDT || !$endDT) continue;

    // ✅ CUSTOMER FILTERS:
    if ($date === $todayYMD) {
        // 1) hide finished showtimes today
        if ($endDT <= $now) {
            continue;
        }
        // 2) hide showtimes starting within 5 minutes
        if ($startDT <= $nowPlus5) {
            continue;
        }
    }

    // count sold seats
    $soldStmt->bind_param("i", $showtimeId);
    $soldStmt->execute();
    $soldRes = $soldStmt->get_result();
    $soldRow = $soldRes->fetch_assoc();
    $soldCount = (int)$soldRow["sold"];

    $available = $soldCount < $capacity;

    // format StartTime to "10:00 AM"
    $displayTime = $startDT->format("g:i A");

    $times[] = [
        "id"        => $showtimeId,
        "time"      => $displayTime,
        "available" => $available
    ];
}

echo json_encode([
    "success"   => true,
    "times"     => $times,
    "capacity"  => $capacity,
    "screenId"  => $realScreenId
]);
