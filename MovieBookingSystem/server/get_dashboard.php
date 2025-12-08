<?php
include "db_connect.php";
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// helper for safe number output
function num($v) { return $v !== null ? (float)$v : 0; }

/**
 * TOTAL MOVIES (admin sees all)
 */
$qMovies = "SELECT COUNT(*) AS totalMovies FROM movie";
$totalMovies = $conn->query($qMovies)->fetch_assoc()["totalMovies"] ?? 0;

/**
 * TOTAL BOOKINGS TODAY
 */
$qBookingsToday = "
    SELECT COUNT(*) AS bookingsToday
    FROM booking
    WHERE BookingDate = CURDATE()
";
$bookingsToday = $conn->query($qBookingsToday)->fetch_assoc()["bookingsToday"] ?? 0;

/**
 * TOTAL USERS
 */
$qUsers = "SELECT COUNT(*) AS totalUsers FROM customer";
$totalUsers = $conn->query($qUsers)->fetch_assoc()["totalUsers"] ?? 0;

/**
 * TOTAL REVENUE (paid only)
 */
$qRevenue = "
    SELECT COALESCE(SUM(TotalAmount),0) AS totalRevenue
    FROM booking
    WHERE UPPER(TRIM(PaymentStatus)) = 'PAID'
";
$totalRevenue = num($conn->query($qRevenue)->fetch_assoc()["totalRevenue"] ?? 0);

/**
 * CURRENT MOVIES LIST
 * ✅ genres joined separately (no revenue multiplication)
 * ✅ showings/bookings/revenue computed in subquery
 * ✅ only published + not expired
 */
$qCurrentMovies = "
SELECT
  m.MovieId AS id,
  m.Title AS title,
  GROUP_CONCAT(DISTINCT g.Name ORDER BY g.Name SEPARATOR ', ') AS genre,

  COALESCE(x.showings, 0) AS showings,
  COALESCE(x.bookings, 0) AS bookings,
  COALESCE(x.revenue, 0)  AS revenue

FROM movie m
LEFT JOIN movie_genre mg ON m.MovieId = mg.MovieId
LEFT JOIN genre g ON mg.GenreId = g.GenreId

LEFT JOIN (
  SELECT
    st.MovieId,
    COUNT(DISTINCT st.ShowTimeId) AS showings,
    COUNT(DISTINCT b.BookingId) AS bookings,
    SUM(
      CASE 
        WHEN UPPER(TRIM(b.PaymentStatus))='PAID'
        THEN b.TotalAmount 
        ELSE 0 
      END
    ) AS revenue
  FROM showtime st
  LEFT JOIN booking b ON b.ShowTimeId = st.ShowTimeId
  GROUP BY st.MovieId
) x ON x.MovieId = m.MovieId

WHERE m.Published = 1
  AND CURDATE() <= DATE_ADD(m.ReleaseDate, INTERVAL m.ShowingDays DAY)

GROUP BY m.MovieId
ORDER BY showings DESC, bookings DESC
LIMIT 20
";

$currentMoviesRes = $conn->query($qCurrentMovies);
$currentMovies = [];

if ($currentMoviesRes) {
    while ($row = $currentMoviesRes->fetch_assoc()) {
        $currentMovies[] = [
            "id" => (int)$row["id"],
            "title" => $row["title"],
            "genre" => $row["genre"] ?? "",
            "showings" => (int)$row["showings"],
            "bookings" => (int)$row["bookings"],
            "revenue" => (float)$row["revenue"]
        ];
    }
}

$conn->close();

/**
 * OUTPUT JSON
 */
echo json_encode([
  "success" => true,
  "stats" => [
    "totalMovies" => (int)$totalMovies,
    "bookingsToday" => (int)$bookingsToday,
    "totalUsers" => (int)$totalUsers,
    "totalRevenue" => (float)$totalRevenue
  ],
  "currentMovies" => $currentMovies
]);
