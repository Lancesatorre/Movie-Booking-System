<?php
include "db_connect.php";
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

while ($row = $result->fetch_assoc()) {
    $showtimeId = (int)$row["ShowTimeId"];

    // count sold seats
    $soldStmt->bind_param("i", $showtimeId);
    $soldStmt->execute();
    $soldRes = $soldStmt->get_result();
    $soldRow = $soldRes->fetch_assoc();
    $soldCount = (int)$soldRow["sold"];

    $available = $soldCount < $capacity;

    // format StartTime to "10:00 AM"
    $startObj = DateTime::createFromFormat("H:i:s", $row["StartTime"]);
    $displayTime = $startObj ? $startObj->format("g:i A") : $row["StartTime"];

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
    "screenId"  => $realScreenId // optional info if you need it later
]);
