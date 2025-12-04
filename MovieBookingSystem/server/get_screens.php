<?php
include "db_connect.php";
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$movieId = isset($_GET["movieId"]) ? (int)$_GET["movieId"] : 0;

if ($movieId <= 0) {
    echo json_encode(["success" => false, "message" => "movieId is required"]);
    exit;
}

/*
  We group by ScreenNumber (not ScreenID),
  because ScreenNumber repeats across theaters.
*/
$sql = "
    SELECT DISTINCT s.ScreenNumber
    FROM showtime st
    INNER JOIN screen s ON st.ScreenId = s.ScreenID
    WHERE st.MovieId = ?
    ORDER BY s.ScreenNumber ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $movieId);
$stmt->execute();
$result = $stmt->get_result();

$screens = [];
while ($row = $result->fetch_assoc()) {
    $num = (int)$row["ScreenNumber"];
    $screens[] = [
        "id" => $num,              // IMPORTANT: id is the screen NUMBER now
        "name" => "Screen " . $num
    ];
}

echo json_encode([
    "success" => true,
    "screens" => $screens
]);
