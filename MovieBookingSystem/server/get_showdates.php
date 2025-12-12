<?php
include "db_connect.php";
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

date_default_timezone_set("Asia/Manila");

// from FE: screenId = ScreenNumber (NOT ScreenID)
$movieId      = isset($_GET["movieId"]) ? (int)$_GET["movieId"] : 0;
$screenNumber = isset($_GET["screenId"]) ? (int)$_GET["screenId"] : 0; // ScreenNumber
$theaterId    = isset($_GET["theaterId"]) ? (int)$_GET["theaterId"] : 0;

if ($movieId <= 0 || $screenNumber <= 0 || $theaterId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "movieId, screenId(screenNumber), and theaterId are required"
    ]);
    exit;
}

/**
 * 1) Resolve real ScreenID using TheaterId + ScreenNumber
 */
$screenSql = "
    SELECT ScreenID
    FROM screen
    WHERE TheaterId = ?
      AND ScreenNumber = ?
    LIMIT 1
";
$screenStmt = $conn->prepare($screenSql);
$screenStmt->bind_param("ii", $theaterId, $screenNumber);
$screenStmt->execute();
$screenRes = $screenStmt->get_result();
$screenRow = $screenRes->fetch_assoc();

if (!$screenRow) {
    echo json_encode([
        "success" => false,
        "message" => "Screen not found for this theater."
    ]);
    exit;
}

$realScreenId = (int)$screenRow["ScreenID"];

/**
 * 2) Only return TODAY and FUTURE dates
 */
$today = date("Y-m-d");

$sql = "
    SELECT DISTINCT st.ShowDate
    FROM showtime st
    INNER JOIN screen s ON st.ScreenId = s.ScreenID
    WHERE st.MovieId  = ?
      AND st.ScreenId = ?
      AND s.TheaterId = ?
      AND st.ShowDate >= ?
      AND st.Status = 'active'
    ORDER BY st.ShowDate ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiis", $movieId, $realScreenId, $theaterId, $today);
$stmt->execute();
$result = $stmt->get_result();

$dates = [];
while ($row = $result->fetch_assoc()) {
    // FE expects: [{ "date": "YYYY-MM-DD" }, ...]
    $dates[] = [
        "date" => $row["ShowDate"]
    ];
}

echo json_encode([
    "success" => true,
    "dates"   => $dates
]);
