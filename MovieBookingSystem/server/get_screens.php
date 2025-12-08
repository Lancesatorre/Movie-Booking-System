<?php
include "db_connect.php";
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$movieId = isset($_GET["movieId"]) ? (int)$_GET["movieId"] : 0;

/**
 * MODE A (Add Movie use):
 * If no movieId provided, return ALL distinct ScreenNumbers.
 */
if ($movieId <= 0) {
    $sql = "
        SELECT DISTINCT ScreenNumber
        FROM screen
        ORDER BY ScreenNumber ASC
    ";

    $result = $conn->query($sql);
    $screens = [];

    while ($row = $result->fetch_assoc()) {
        $num = (int)$row["ScreenNumber"];
        $screens[] = [
            "id" => $num,               // screen NUMBER
            "name" => "Screen " . $num
        ];
    }

    echo json_encode([
        "success" => true,
        "screens" => $screens
    ]);
    exit;
}

/**
 * MODE B (Booking use):
 * Screens available for a given movieId based on showtime table.
 * We group by ScreenNumber (not ScreenID),
 * because ScreenNumber repeats across theaters.
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
        "id" => $num,
        "name" => "Screen " . $num
    ];
}

echo json_encode([
    "success" => true,
    "screens" => $screens
]);
