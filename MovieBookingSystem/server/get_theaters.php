<?php
include "db_connect.php";
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$movieId      = isset($_GET["movieId"]) ? (int)$_GET["movieId"] : 0;
$screenNumber = isset($_GET["screenId"]) ? (int)$_GET["screenId"] : 0; // screenId = screenNumber now

if ($movieId <= 0 || $screenNumber <= 0) {
    echo json_encode(["success" => false, "message" => "movieId and screenId(screenNumber) are required"]);
    exit;
}

/*
  Find theaters that have showtimes for:
   - this movie
   - this ScreenNumber (across any theater)
*/
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
