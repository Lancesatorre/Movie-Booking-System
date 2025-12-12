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
        $trailerUrl === ""
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

    if ($showingDays < 1) $showingDays = 1;

    // ------- handle poster upload (NO RENAME) ------
    $posterPath = "";

    if (isset($_FILES["poster"]) && $_FILES["poster"]["error"] === UPLOAD_ERR_OK) {

        $uploadDir = "C:/xampp/htdocs/mobook/Movie-Booking-System/MovieBookingSystem/client/public/assets/Movies/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // get original name
        $originalName = basename($_FILES["poster"]["name"]);

        // sanitize: keep letters, numbers, dot, dash, underscore
        $safeName = preg_replace("/[^a-zA-Z0-9._-]/", "_", $originalName);

        $targetPath = $uploadDir . $safeName;

        // move + overwrite if exists (no new copy name)
        if (!move_uploaded_file($_FILES["poster"]["tmp_name"], $targetPath)) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "Poster upload failed"]);
            exit;
        }

        // store RELATIVE path
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
                $conn->rollback();
                echo json_encode(["success" => false, "message" => "Failed inserting theaters"]);
                exit;
            }
        }
    }
    $mtStmt->close();

    // ------- prepared statements for showtimes -------
    $screenLookup = $conn->prepare("
        SELECT ScreenID
        FROM screen
        WHERE TheaterId = ?
          AND ScreenNumber = ?
        LIMIT 1
    ");

    $theaterLookup = $conn->prepare("
        SELECT Name, Location
        FROM theater
        WHERE TheaterId = ?
        LIMIT 1
    ");

    // 30-min gap rule on same Screen + ShowDate
    $conflictCheck = $conn->prepare("
        SELECT
            m.Title      AS conflictMovieTitle,
            s.StartTime  AS conflictStart,
            s.EndTime    AS conflictEnd
        FROM showtime s
        JOIN movie m ON m.MovieId = s.MovieId
        WHERE s.ScreenId = ?
        AND s.ShowDate = ?
        AND (
            TIMESTAMP(s.ShowDate, s.StartTime) < DATE_ADD(TIMESTAMP(?, ?), INTERVAL 30 MINUTE)
            AND TIMESTAMP(s.ShowDate, s.EndTime) > DATE_SUB(TIMESTAMP(?, ?), INTERVAL 30 MINUTE)
        )
        LIMIT 1
    ");

    $showStmt = $conn->prepare("
        INSERT INTO showtime (MovieId, ScreenId, ShowDate, StartTime, EndTime)
        VALUES (?, ?, ?, ?, ?)
    ");

    // ✅ build release DateTime once
    $releaseObj = DateTime::createFromFormat("Y-m-d", $releaseDate);
    if (!$releaseObj) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Invalid release date"]);
        exit;
    }

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

                // ✅ INSERT SHOWTIMES FOR EACH SHOWING DAY
                for ($day = 0; $day < $showingDays; $day++) {
                    $showDateObj = clone $releaseObj;
                    $showDateObj->modify("+{$day} day");
                    $showDate  = $showDateObj->format("Y-m-d");

                    // conflict check per date
                    $conflictCheck->bind_param(
                        "isssss",
                        $screenId,
                        $showDate,
                        $showDate,
                        $endTime,
                        $showDate,
                        $startTime
                    );
                    $conflictCheck->execute();
                    $conflictRes = $conflictCheck->get_result();

                    if ($conflictRow = $conflictRes->fetch_assoc()) {

                        // existing movie details from conflict query
                        $conflictMovieTitle = $conflictRow["conflictMovieTitle"] ?? "Unknown Movie";
                        $conflictStart = $conflictRow["conflictStart"] ?? "";
                        $conflictEnd   = $conflictRow["conflictEnd"] ?? "";

                        // theater lookup (you already have this)
                        $theaterName = "Theater {$tid}";
                        $theaterLoc  = "";

                        $theaterLookup->bind_param("i", $tid);
                        $theaterLookup->execute();
                        $tRes = $theaterLookup->get_result();
                        if ($tRow = $tRes->fetch_assoc()) {
                            $theaterName = $tRow["Name"];
                            $theaterLoc  = $tRow["Location"];
                        }

                        $conn->rollback();

                        $prettyLoc = $theaterLoc ? ", {$theaterLoc}" : "";
                        $screenLabel = "Screen {$sn}";

                        // Nice message format (your “Option B” style)
                        $message =
                            "Schedule Conflict\n" .
                            "Less than 30-minute gap between other movie.\n\n" .
                            "{$conflictMovieTitle} ({$screenLabel})\n" .
                            "{$theaterName}{$prettyLoc}\n" .
                            "{$showDate} {$conflictStart} - {$conflictEnd}";

                        echo json_encode([
                            "success" => false,
                            "code" => "SCHEDULE_CONFLICT",
                            "conflict" => [
                                "title" => "Schedule Conflict",
                                "subtitle" => "Less than 30-minute gap between other movie",
                                "movie" => $conflictMovieTitle,
                                "screen" => "Screen {$sn}",
                                "theater" => "{$theaterName}{$prettyLoc}",
                                "date" => $showDate,
                                "time" => "{$conflictStart} - {$conflictEnd}"
                            ]
                        ]);
                        exit;
                    }

                    // insert per date
                    $showStmt->bind_param("iisss", $movieId, $screenId, $showDate, $startTime, $endTime);
                    if (!$showStmt->execute()) {
                        $conn->rollback();
                        echo json_encode(["success" => false, "message" => "Failed inserting showtimes"]);
                        exit;
                    }
                }
            }
        }
    }

    $screenLookup->close();
    $theaterLookup->close();
    $conflictCheck->close();
    $showStmt->close();

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Movie added successfully",
        "movieId" => $movieId
    ]);

} catch (Exception $e) {
    if ($conn) $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "error" => $e->getMessage()
    ]);
}
