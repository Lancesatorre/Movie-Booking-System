<?php
include "db_connect.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

// ✅ Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// small helper to avoid null warnings
function num($v) {
    return $v !== null ? (float)$v : 0;
}

/**
 * 1) TOTAL MOVIES  (admin sees all published movies)
 */
$qMovies = "SELECT COUNT(*) AS totalMovies FROM movie";
$totalMoviesRow = $conn->query($qMovies);
$totalMovies = $totalMoviesRow ? ($totalMoviesRow->fetch_assoc()["totalMovies"] ?? 0) : 0;

/**
 * 2) TOTAL BOOKINGS TODAY  (only confirmed bookings)
 *    We treat 'confirmed' as PAID.
 */
$qBookingsToday = "
    SELECT COUNT(*) AS bookingsToday
    FROM booking
    WHERE BookingDate = CURDATE()
      AND LOWER(TRIM(PaymentStatus)) = 'confirmed'
";
$bookingsTodayRow = $conn->query($qBookingsToday);
$bookingsToday = $bookingsTodayRow ? ($bookingsTodayRow->fetch_assoc()["bookingsToday"] ?? 0) : 0;

/**
 * 3) TOTAL USERS
 */
$qUsers = "SELECT COUNT(*) AS totalUsers FROM customer";
$totalUsersRow = $conn->query($qUsers);
$totalUsers = $totalUsersRow ? ($totalUsersRow->fetch_assoc()["totalUsers"] ?? 0) : 0;

/**
 * 4) TOTAL REVENUE  (only confirmed bookings)
 *    Again: 'confirmed' = paid
 */
$qRevenue = "
    SELECT COALESCE(SUM(TotalAmount),0) AS totalRevenue
    FROM booking
    WHERE LOWER(TRIM(PaymentStatus)) = 'confirmed'
";
$totalRevenueRow = $conn->query($qRevenue);
$totalRevenue = num($totalRevenueRow ? ($totalRevenueRow->fetch_assoc()["totalRevenue"] ?? 0) : 0);

/**
 * 5) CURRENT MOVIES LIST
 *    - genre via GROUP_CONCAT
 *    - showings / bookings / revenue from subquery x
 *    - bookings + revenue only count 'confirmed'
 *    - only movies that actually have showtimes
 */
$qCurrentMovies = "
SELECT
  m.MovieId AS id,
  m.Title   AS title,
  GROUP_CONCAT(DISTINCT g.Name ORDER BY g.Name SEPARATOR ', ') AS genre,

  COALESCE(x.showings, 0) AS showings,
  COALESCE(x.bookings, 0) AS bookings,
  COALESCE(x.revenue, 0)  AS revenue

FROM movie m
LEFT JOIN movie_genre mg ON m.MovieId = mg.MovieId
LEFT JOIN genre g        ON mg.GenreId = g.GenreId

LEFT JOIN (
    SELECT
      st.MovieId,
      COUNT(DISTINCT st.ShowTimeId) AS showings,
      COUNT(DISTINCT CASE 
                       WHEN LOWER(TRIM(b.PaymentStatus)) = 'confirmed' 
                       THEN b.BookingId 
                     END) AS bookings,
      SUM(
        CASE 
          WHEN LOWER(TRIM(b.PaymentStatus)) = 'confirmed'
          THEN b.TotalAmount 
          ELSE 0 
        END
      ) AS revenue
    FROM showtime st
    LEFT JOIN booking b ON b.ShowTimeId = st.ShowTimeId
    GROUP BY st.MovieId
) x ON x.MovieId = m.MovieId

-- ✅ Only show movies that actually have showtimes
WHERE EXISTS (
    SELECT 1 FROM showtime st2 WHERE st2.MovieId = m.MovieId
)

GROUP BY m.MovieId
ORDER BY showings DESC, bookings DESC
LIMIT 20
";

$currentMoviesRes = $conn->query($qCurrentMovies);
$currentMovies = [];

if ($currentMoviesRes) {
    while ($row = $currentMoviesRes->fetch_assoc()) {
        $currentMovies[] = [
            "id"       => (int)$row["id"],
            "title"    => $row["title"],
            "genre"    => $row["genre"] ?? "",
            "showings" => (int)$row["showings"],
            "bookings" => (int)$row["bookings"],
            "revenue"  => (float)$row["revenue"],
        ];
    }
}

$conn->close();

/**
 * OUTPUT JSON — matches what Dashboard.jsx expects
 */
echo json_encode([
    "success" => true,
    "stats" => [
        "totalMovies"   => (int)$totalMovies,
        "bookingsToday" => (int)$bookingsToday,
        "totalUsers"    => (int)$totalUsers,
        "totalRevenue"  => (float)$totalRevenue,
    ],
    "currentMovies" => $currentMovies,
]);
