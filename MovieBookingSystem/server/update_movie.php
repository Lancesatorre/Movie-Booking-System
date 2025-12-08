<?php
// update_movie.php
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

    // --------- REQUIRED: movieId ---------
    $movieId = isset($_POST["movieId"]) ? (int)$_POST["movieId"] : 0;
    if ($movieId <= 0) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "movieId is required"]);
        exit;
    }

    // --------- fields ---------
    $title       = trim($_POST["title"] ?? "");
    $durationStr = trim($_POST["duration"] ?? "0");
    $ratingCode  = trim($_POST["rating"] ?? "");
    $trailerUrl  = trim($_POST["trailer"] ?? "");
    $description = trim($_POST["description"] ?? "");
    $releaseDate = trim($_POST["releaseDate"] ?? "");
    $showingDays = (int)($_POST["showingDays"] ?? 7);
    $basePrice   = (float)($_POST["price"] ?? 0);
    $published   = isset($_POST["published"]) ? (int)$_POST["published"] : 1;

    $genres   = $_POST["genres"] ?? [];
    $theaters = $_POST["theaters"] ?? [];
    $screens  = $_POST["screens"] ?? [];
    $times    = $_POST["times"] ?? [];

    if (!is_array($genres))   $genres = [$genres];
    if (!is_array($theaters)) $theaters = [$theaters];
    if (!is_array($screens))  $screens = [$screens];
    if (!is_array($times))    $times = [$times];

    $durationMinutes = (int)preg_replace('/\D/', '', $durationStr);

    // --------- validate required ---------
    if (
        $title === "" ||
        $durationMinutes <= 0 ||
        $ratingCode === "" ||
        $description === "" ||
        $releaseDate === "" ||
        $basePrice <= 0
    ) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    // --------- poster upload (optional) ---------
    $existingPosterPath = trim($_POST["existingPosterPath"] ?? "");
    $posterPath = $existingPosterPath;

    if (isset($_FILES["poster"]) && $_FILES["poster"]["error"] === UPLOAD_ERR_OK) {

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

        $uploadedAbsPath = $targetPath;

        // ✅ store RELATIVE
        $posterPath = "/assets/Movies/" . $safeName;
    }

    if ($posterPath === "") {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Poster is required"]);
        exit;
    }

    // --------- Trailer blank? keep old ---------
    if ($trailerUrl === "") {
        $oldStmt = $conn->prepare("SELECT TrailerUrl FROM movie WHERE MovieId=? LIMIT 1");
        $oldStmt->bind_param("i", $movieId);
        $oldStmt->execute();
        $oldRes = $oldStmt->get_result();
        $oldRow = $oldRes->fetch_assoc();
        $trailerUrl = $oldRow["TrailerUrl"] ?? "";
        $oldStmt->close();
    }

    // --------- update movie table ---------
    $sql = "
        UPDATE movie
        SET Title=?,
            DurationMinutes=?,
            RatingCode=?,
            PosterPath=?,
            TrailerUrl=?,
            Description=?,
            ReleaseDate=?,
            ShowingDays=?,
            BasePrice=?,
            Published=?
        WHERE MovieId=?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sisssssidii",
        $title,
        $durationMinutes,
        $ratingCode,
        $posterPath,
        $trailerUrl,
        $description,
        $releaseDate,
        $showingDays,
        $basePrice,
        $published,
        $movieId
    );

    if (!$stmt->execute()) {
        if ($uploadedAbsPath && file_exists($uploadedAbsPath)) unlink($uploadedAbsPath);
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Failed to update movie", "error" => $stmt->error]);
        exit;
    }
    $stmt->close();

    // --------- sync GENRES ---------
    $delG = $conn->prepare("DELETE FROM movie_genre WHERE MovieId=?");
    $delG->bind_param("i", $movieId);
    $delG->execute();
    $delG->close();

    if (count($genres) > 0) {
        $insG = $conn->prepare("INSERT INTO movie_genre (MovieId, GenreId) VALUES (?, ?)");
        foreach ($genres as $gid) {
            $gid = (int)$gid;
            if ($gid > 0) {
                $insG->bind_param("ii", $movieId, $gid);
                if (!$insG->execute()) {
                    if ($uploadedAbsPath && file_exists($uploadedAbsPath)) unlink($uploadedAbsPath);
                    $conn->rollback();
                    echo json_encode(["success" => false, "message" => "Failed syncing genres"]);
                    exit;
                }
            }
        }
        $insG->close();
    }

    // --------- sync THEATERS ---------
    $delT = $conn->prepare("DELETE FROM movie_theater WHERE MovieId=?");
    $delT->bind_param("i", $movieId);
    $delT->execute();
    $delT->close();

    if (count($theaters) > 0) {
        $insT = $conn->prepare("INSERT INTO movie_theater (MovieId, TheaterId) VALUES (?, ?)");
        foreach ($theaters as $tid) {
            $tid = (int)$tid;
            if ($tid > 0) {
                $insT->bind_param("ii", $movieId, $tid);
                if (!$insT->execute()) {
                    if ($uploadedAbsPath && file_exists($uploadedAbsPath)) unlink($uploadedAbsPath);
                    $conn->rollback();
                    echo json_encode(["success" => false, "message" => "Failed syncing theaters"]);
                    exit;
                }
            }
        }
        $insT->close();
    }

    // --------- OPTIONAL showtime resync ---------
    $hasShowtimePayload = (count($screens) > 0 && count($times) > 0 && count($theaters) > 0);

    if ($hasShowtimePayload) {

        $delS = $conn->prepare("DELETE FROM showtime WHERE MovieId=?");
        $delS->bind_param("i", $movieId);
        $delS->execute();
        $delS->close();

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
                        echo json_encode(["success" => false, "message" => "Failed syncing showtimes"]);
                        exit;
                    }
                }
            }
        }

        $screenLookup->close();
        $showStmt->close();
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Movie updated successfully"
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
