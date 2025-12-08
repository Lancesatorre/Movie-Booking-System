<?php
// add_movie.php
include "db_connect.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}

$uploadedAbsPath = ""; // for cleanup if rollback happens

try {
    $conn->begin_transaction();

    // ------- read fields (matching React FormData) -------
    $title       = trim($_POST["title"] ?? "");
    $durationStr = trim($_POST["duration"] ?? "0");
    $ratingCode  = trim($_POST["rating"] ?? "");
    $trailerUrl  = trim($_POST["trailer"] ?? "");
    $description = trim($_POST["description"] ?? "");
    $releaseDate = trim($_POST["releaseDate"] ?? "");
    $showingDays = (int)($_POST["showingDays"] ?? 7);
    $basePrice   = (float)($_POST["price"] ?? 0);
    $published   = isset($_POST["published"]) ? (int)$_POST["published"] : 1;

    // arrays from React
    $genres   = $_POST["genres"] ?? [];
    $theaters = $_POST["theaters"] ?? [];
    $screens  = $_POST["screens"] ?? []; // screen NUMBERS
    $times    = $_POST["times"] ?? [];   // "HH:MM"

    if (!is_array($genres))   $genres = [$genres];
    if (!is_array($theaters)) $theaters = [$theaters];
    if (!is_array($screens))  $screens = [$screens];
    if (!is_array($times))    $times = [$times];

    // Convert duration like "120 min" -> 120
    $durationMinutes = (int)preg_replace('/\D/', '', $durationStr);

    // ------- validate required -------
    if (
        $title === "" ||
        $durationMinutes <= 0 ||
        $ratingCode === "" ||
        $description === "" ||
        $releaseDate === "" ||
        $basePrice <= 0 ||
        $trailerUrl === "" // required on ADD
    ) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    if (
        count($genres) === 0 ||
        count($theaters) === 0 ||
        count($screens) === 0 ||
        count($times) === 0
    ) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Genres, theaters, screens, and times are required"]);
        exit;
    }

    // ------- handle poster upload ------
    $posterPath = "";

    if (isset($_FILES["poster"]) && $_FILES["poster"]["error"] === UPLOAD_ERR_OK) {

        // ✅ Save inside client/public so React can serve it
        $uploadDir = "C:/xampp/htdocs/mobook/Movie-Booking-System/MovieBookingSystem/client/public/assets/Movies/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = pathinfo($_FILES["poster"]["name"], PATHINFO_EXTENSION);
        $safeName = uniqid("movie_", true) . "." . $ext;
        $targetPath = $uploadDir . $safeName;

        if (!move_uploaded_file($_FILES["poster"]["tmp_name"], $targetPath)) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "Poster upload failed"]);
            exit;
        }

        // save absolute path for rollback cleanup
        $uploadedAbsPath = $targetPath;

        // ✅ store RELATIVE path in DB (NOT mobook_api URL)
        $posterPath = "/assets/Movies/" . $safeName;
    }

    if ($posterPath === "") {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Poster is required"]);
        exit;
    }

    // ------- insert movie -------
    $stmt = $conn->prepare("
        INSERT INTO movie
        (Title, DurationMinutes, RatingCode, PosterPath,
         TrailerUrl, Description, ReleaseDate,
         ShowingDays, BasePrice, Published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "sisssssidi",
        $title,
        $durationMinutes,
        $ratingCode,
        $posterPath,
        $trailerUrl,
        $description,
        $releaseDate,
        $showingDays,
        $basePrice,
        $published
    );

    if (!$stmt->execute()) {
        if ($uploadedAbsPath && file_exists($uploadedAbsPath)) unlink($uploadedAbsPath);
        $conn->rollback();
        echo json_encode([
            "success" => false,
            "message" => "Movie insert failed",
            "error"   => $stmt->error
        ]);
        exit;
    }

    $movieId = $stmt->insert_id;
    $stmt->close();

    // ------- insert genres -------
    $mgStmt = $conn->prepare("INSERT INTO movie_genre (MovieId, GenreId) VALUES (?, ?)");
    foreach ($genres as $genreId) {
        $gid = (int)$genreId;
        if ($gid > 0) {
            $mgStmt->bind_param("ii", $movieId, $gid);
            if (!$mgStmt->execute()) {
                if ($uploadedAbsPath && file_exists($uploadedAbsPath)) unlink($uploadedAbsPath);
                $conn->rollback();
                echo json_encode(["success" => false, "message" => "Failed inserting genres"]);
                exit;
            }
        }
    }
    $mgStmt->close();

    // ------- insert theaters -------
    $mtStmt = $conn->prepare("INSERT INTO movie_theater (MovieId, TheaterId) VALUES (?, ?)");
    foreach ($theaters as $theaterId) {
        $tid = (int)$theaterId;
        if ($tid > 0) {
            $mtStmt->bind_param("ii", $movieId, $tid);
            if (!$mtStmt->execute()) {
                if ($uploadedAbsPath && file_exists($uploadedAbsPath)) unlink($uploadedAbsPath);
                $conn->rollback();
                echo json_encode(["success" => false, "message" => "Failed inserting theaters"]);
                exit;
            }
        }
    }
    $mtStmt->close();

    // ------- insert showtimes -------
    $screenLookup = $conn->prepare("
        SELECT ScreenID
        FROM screen
        WHERE TheaterId = ?
          AND ScreenNumber = ?
        LIMIT 1
    ");

    $showStmt = $conn->prepare("
        INSERT INTO showtime (MovieId, ScreenId, ShowDate, StartTime, EndTime)
        VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($theaters as $theaterId) {
        $tid = (int)$theaterId;
        if ($tid <= 0) continue;

        foreach ($screens as $screenNumber) {
            $sn = (int)$screenNumber;
            if ($sn <= 0) continue;

            $screenLookup->bind_param("ii", $tid, $sn);
            $screenLookup->execute();
            $screenRes = $screenLookup->get_result();
            $screenRow = $screenRes->fetch_assoc();
            if (!$screenRow) continue;

            $screenId = (int)$screenRow["ScreenID"];

            foreach ($times as $timeStr) {
                $t = trim($timeStr);
                if ($t === "") continue;

                $startObj = DateTime::createFromFormat("H:i", $t);
                if (!$startObj) continue;

                $endObj = clone $startObj;
                $endObj->modify("+{$durationMinutes} minutes");

                $startTime = $startObj->format("H:i:s");
                $endTime   = $endObj->format("H:i:s");
                $showDate  = $releaseDate;

                $showStmt->bind_param("iisss", $movieId, $screenId, $showDate, $startTime, $endTime);

                if (!$showStmt->execute()) {
                    if ($uploadedAbsPath && file_exists($uploadedAbsPath)) unlink($uploadedAbsPath);
                    $conn->rollback();
                    echo json_encode(["success" => false, "message" => "Failed inserting showtimes"]);
                    exit;
                }
            }
        }
    }

    $screenLookup->close();
    $showStmt->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Movie added successfully",
        "movieId" => $movieId
    ]);

} catch (Exception $e) {
    if ($uploadedAbsPath && file_exists($uploadedAbsPath)) unlink($uploadedAbsPath);
    if ($conn) $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "error" => $e->getMessage()
    ]);
}
