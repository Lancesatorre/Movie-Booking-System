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

/**
 * AUTO-EXPIRE
 * If movie is past ReleaseDate + ShowingDays => unpublish
 */
$autoExpireSql = "
    UPDATE movie
    SET Published = 0
    WHERE Published = 1
      AND CURDATE() > DATE_ADD(ReleaseDate, INTERVAL ShowingDays DAY)
";
$conn->query($autoExpireSql);

/**
 * MODE SWITCH:
 *  - default (booking): only published + not expired
 *  - admin=1: return all movies
 */
$isAdmin = isset($_GET["admin"]) && (int)$_GET["admin"] === 1;

$whereClause = "";
if (!$isAdmin) {
    // booking-safe filter
    $whereClause = "
        WHERE m.Published = 1
          AND CURDATE() <= DATE_ADD(m.ReleaseDate, INTERVAL m.ShowingDays DAY)
    ";
}

/**
 * Fetch movies + genres + theaters (grouped)
 */
$sql = "
    SELECT 
        m.MovieId,
        m.Title,
        m.DurationMinutes,
        m.RatingCode,
        m.PosterPath,
        m.TrailerUrl,
        m.Description,
        m.ReleaseDate,
        m.ShowingDays,
        m.BasePrice,
        m.Published,

        GROUP_CONCAT(DISTINCT g.Name ORDER BY g.Name SEPARATOR ', ') AS Genres,
        GROUP_CONCAT(DISTINCT t.Name ORDER BY t.Name SEPARATOR ', ') AS TheaterNames,
        GROUP_CONCAT(DISTINCT t.TheaterId ORDER BY t.TheaterId SEPARATOR ',') AS TheaterIds

    FROM movie m

    LEFT JOIN movie_genre mg ON m.MovieId = mg.MovieId
    LEFT JOIN genre g ON mg.GenreId = g.GenreId

    LEFT JOIN movie_theater mt ON m.MovieId = mt.MovieId
    LEFT JOIN theater t ON mt.TheaterId = t.TheaterId

    $whereClause

    GROUP BY m.MovieId
    ORDER BY m.ReleaseDate DESC, m.MovieId ASC
";

$result = $conn->query($sql);
$movies = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {

        $releaseRaw = $row["ReleaseDate"] ?? "";
        $releasePretty = $releaseRaw
            ? date("M d, Y", strtotime($releaseRaw))
            : "";

        // Genres as string + optional array
        $genreStr = $row["Genres"] ?? "";
        $genreNames = array_values(
            array_filter(
                array_map("trim", explode(",", $genreStr))
            )
        );

        // Theaters
        $theaterNameStr = $row["TheaterNames"] ?? "";
        $theaterIdsStr  = $row["TheaterIds"] ?? "";

        $theaterIds = array_values(
            array_filter(
                array_map("intval", explode(",", $theaterIdsStr))
            )
        );

        $movies[] = [
            // Existing keys (DON'T BREAK UI)
            "id"          => (int)$row["MovieId"],
            "title"       => $row["Title"],
            "genre"       => $genreStr,
            "duration"    => $row["DurationMinutes"] . "m",
            "rating"      => $row["RatingCode"],
            "image"       => $row["PosterPath"],
            "trailer"     => $row["TrailerUrl"],
            "description" => $row["Description"],
            "dateRelease" => $releasePretty,
            "price"       => (float)$row["BasePrice"],
            "showingDays" => (int)$row["ShowingDays"],
            "published"   => (int)$row["Published"],

            // Safe extra keys
            "location"       => $theaterNameStr,
            "releaseDateRaw" => $releaseRaw,
            "genreNames"     => $genreNames,
            "theaterIds"     => $theaterIds
        ];
    }
}

echo json_encode([
    "success" => true,
    "movies"  => $movies
]);
