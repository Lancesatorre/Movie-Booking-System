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

if ($movieId <= 0 || $screenNumber <= 0 || $theaterId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "movieId, screenId(screenNumber), and theaterId are required"
    ]);
    exit;
}

/*
  Return distinct show dates for:
   - given movie
   - given theater
   - given screen number (1/2/3)
*/
$sql = "
    SELECT DISTINCT st.ShowDate
    FROM showtime st
    INNER JOIN screen s ON st.ScreenId = s.ScreenID
    WHERE st.MovieId = ?
      AND s.ScreenNumber = ?
      AND s.TheaterId = ?
    ORDER BY st.ShowDate ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iii", $movieId, $screenNumber, $theaterId);
$stmt->execute();
$result = $stmt->get_result();

$dates = [];
while ($row = $result->fetch_assoc()) {
    $dates[] = ["date" => $row["ShowDate"]]; // yyyy-mm-dd
}

echo json_encode([
    "success" => true,
    "dates"   => $dates
]);
