<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// 1. DB CONNECTION
$conn = new mysqli("localhost", "root", "", "mobook");
if ($conn->connect_error) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit;
}

// helper for safe number output
function num($v) { return $v ? (float)$v : 0; }

// 2. TOTAL MOVIES
$qMovies = "SELECT COUNT(*) AS totalMovies FROM movie";
$totalMovies = $conn->query($qMovies)->fetch_assoc()["totalMovies"] ?? 0;

// 3. TOTAL BOOKINGS TODAY
// booking.BookingDate is a DATE column in your schema【turn4file0†L11-L12】
$qBookingsToday = "SELECT COUNT(*) AS bookingsToday 
                   FROM booking 
                   WHERE BookingDate = CURDATE()";
$bookingsToday = $conn->query($qBookingsToday)->fetch_assoc()["bookingsToday"] ?? 0;

// 4. TOTAL USERS (customers)
$qUsers = "SELECT COUNT(*) AS totalUsers FROM customer";
$totalUsers = $conn->query($qUsers)->fetch_assoc()["totalUsers"] ?? 0;

// 5. TOTAL REVENUE
// PaymentStatus values in dump look like Paid/PAID【turn4file0†L22-L32】
$qRevenue = "SELECT SUM(TotalAmount) AS totalRevenue
             FROM booking
             WHERE UPPER(PaymentStatus) = 'PAID' OR UPPER(PaymentStatus) = 'PAID ' OR UPPER(PaymentStatus) = 'PAID'";
$totalRevenue = num($conn->query($qRevenue)->fetch_assoc()["totalRevenue"] ?? 0);

// 6. CURRENT MOVIES LIST
// We compute:
// - showings = number of showtime rows per movie
// - bookings = number of bookings linked to those showtimes
// - revenue = sum booking.TotalAmount for PAID bookings linked to those showtimes
$qCurrentMovies = "
  SELECT 
    m.MovieId AS id,
    m.Title AS title,
    m.Genre AS genre,
    COUNT(DISTINCT s.ShowTimeId) AS showings,
    COUNT(DISTINCT b.BookingId) AS bookings,
    COALESCE(SUM(
      CASE 
        WHEN UPPER(b.PaymentStatus) = 'PAID' THEN b.TotalAmount
        ELSE 0
      END
    ), 0) AS revenue
  FROM movie m
  LEFT JOIN showtime s ON s.MovieId = m.MovieId
  LEFT JOIN booking b ON b.ShowTimeId = s.ShowTimeId
  GROUP BY m.MovieId
  ORDER BY showings DESC, bookings DESC
  LIMIT 20
";

$currentMoviesRes = $conn->query($qCurrentMovies);
$currentMovies = [];
while ($row = $currentMoviesRes->fetch_assoc()) {
  $currentMovies[] = [
    "id" => (int)$row["id"],
    "title" => $row["title"],
    "genre" => $row["genre"],
    "showings" => (int)$row["showings"],
    "bookings" => (int)$row["bookings"],
    "revenue" => (float)$row["revenue"]
  ];
}

$conn->close();

// 7. OUTPUT JSON
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
