<?php
include "db_connect.php";
header("Content-Type: application/json");

// Handle preflight (optional but good)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$sql = "SELECT * FROM movie ORDER BY ReleaseDate DESC, MovieId ASC";
$result = $conn->query($sql);

$movies = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $movies[] = [
            "id"          => (int)$row["MovieId"],
            "title"       => $row["Title"],
            "genre"       => $row["Genre"],
            // convert 132 -> "132m"
            "duration"    => $row["DurationMinutes"] . "m",
            "rating"      => $row["RatingCode"],
            "image"       => $row["PosterPath"],
            "description" => $row["Description"],
            // 2025-11-25 -> "Nov 25, 2025"
            "dateRelease" => date("M d, Y", strtotime($row["ReleaseDate"])),
            "price"       => (float)$row["BasePrice"]
        ];
    }
}

echo json_encode([
    "success" => true,
    "movies"  => $movies
]);
