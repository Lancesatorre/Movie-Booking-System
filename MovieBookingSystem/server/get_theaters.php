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

$movieId      = isset($_GET["movieId"]) ? (int)$_GET["movieId"] : 0;
$screenNumber = isset($_GET["screenId"]) ? (int)$_GET["screenId"] : 0;

// MODE A: If no filters provided, return ALL theaters (Add Movie use)
if ($movieId <= 0 || $screenNumber <= 0) {
    $sql = "SELECT TheaterId, Name, Location FROM theater ORDER BY Name ASC";
    $result = $conn->query($sql);

    $theaters = [];
    while ($row = $result->fetch_assoc()) {
        $theaters[] = [
            "id" => (int)$row["TheaterId"],
            "name" => $row["Name"],
            "location" => $row["Location"]
        ];
    }

    echo json_encode(["success" => true, "theaters" => $theaters]);
    exit;
}

// MODE B: If filters exist, return theaters by movie + screen number (Booking use)
$sql = "
    SELECT DISTINCT t.TheaterId, t.Name, t.Location
    FROM showtime st
    INNER JOIN screen s ON st.ScreenId = s.ScreenID
    INNER JOIN theater t ON s.TheaterId = t.TheaterId
    WHERE st.MovieId = ?
      AND s.ScreenNumber = ?
    ORDER BY t.Name ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $movieId, $screenNumber);
$stmt->execute();
$result = $stmt->get_result();

$theaters = [];
while ($row = $result->fetch_assoc()) {
    $theaters[] = [
        "id" => (int)$row["TheaterId"],
        "name" => $row["Name"],
        "location" => $row["Location"]
    ];
}

echo json_encode([
    "success" => true,
    "theaters" => $theaters
]);
