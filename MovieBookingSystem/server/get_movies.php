<?php
include "db_connect.php";
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Handle preflight
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
            "duration"    => $row["DurationMinutes"] . "m",
            "rating"      => $row["RatingCode"],
            "image"       => $row["PosterPath"],
            "trailer"     => $row["TrailerUrl"],
            "description" => $row["Description"],
            "dateRelease" => date("M d, Y", strtotime($row["ReleaseDate"])),
            "price"       => (float)$row["BasePrice"]
        ];
    }
}

echo json_encode([
    "success" => true,
    "movies"  => $movies
]);
