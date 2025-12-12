<?php
include "db_connect.php";
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$movieId = isset($_GET["movieId"]) ? (int)$_GET["movieId"] : 0;

if ($movieId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "movieId is required"
    ]);
    exit;
}

/**
 * We return distinct ScreenNumber values for this movie
 * FE expects:
 *  - id   = ScreenNumber (NOT ScreenID)
 *  - name = label to show (e.g. "Screen 1")
 */
$sql = "
    SELECT DISTINCT s.ScreenNumber
    FROM showtime st
    INNER JOIN screen s ON st.ScreenId = s.ScreenID
    WHERE st.MovieId = ?
      AND st.Status = 'active'
    ORDER BY s.ScreenNumber ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $movieId);
$stmt->execute();
$result = $stmt->get_result();

$screens = [];
while ($row = $result->fetch_assoc()) {
    $screens[] = [
        "id"   => (int)$row["ScreenNumber"],              // <-- used as selectedScreen.id in React
        "name" => "Screen " . (int)$row["ScreenNumber"],  // <-- shown in the UI
    ];
}

echo json_encode([
    "success" => true,
    "screens" => $screens
]);
