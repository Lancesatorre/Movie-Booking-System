<?php
include "db_connect.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$sql = "SELECT GenreId AS id, Name AS name FROM genre ORDER BY Name ASC";
$result = $conn->query($sql);

$genres = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $genres[] = [
            "id" => (int)$row["id"],
            "name" => $row["name"]
        ];
    }
}

echo json_encode([
    "success" => true,
    "genres" => $genres
]);
