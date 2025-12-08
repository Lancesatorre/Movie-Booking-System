<?php
include "db_connect.php";
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$movieId = isset($input["movieId"]) ? (int)$input["movieId"] : 0;

if ($movieId <= 0) {
    echo json_encode(["success" => false, "message" => "movieId is required"]);
    exit;
}

try {
    $conn->begin_transaction();

    // delete dependents first
    $stmt = $conn->prepare("DELETE FROM showtime WHERE MovieId=?");
    $stmt->bind_param("i", $movieId);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("DELETE FROM movie_genre WHERE MovieId=?");
    $stmt->bind_param("i", $movieId);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("DELETE FROM movie_theater WHERE MovieId=?");
    $stmt->bind_param("i", $movieId);
    $stmt->execute();
    $stmt->close();

    // now delete movie
    $stmt = $conn->prepare("DELETE FROM movie WHERE MovieId=?");
    $stmt->bind_param("i", $movieId);

    if (!$stmt->execute()) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Failed to delete movie"]);
        exit;
    }
    $stmt->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Movie deleted successfully"
    ]);
} catch (Exception $e) {
    if ($conn) $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "error" => $e->getMessage()
    ]);
}
