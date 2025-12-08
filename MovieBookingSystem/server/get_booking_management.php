<?php
include "db_connect.php";
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

// ✅ Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$sql = "
SELECT 
  b.BookingId,
  b.PaymentStatus,
  b.TotalAmount,
  b.CreatedAt,

  c.FirstName,
  c.MiddleName,
  c.LastName,
  c.Email AS CustomerEmail,

  m.MovieId,
  m.Title AS MovieTitle,
  m.PosterPath AS MovieImage,

  s.ScreenNumber,
  t.Name AS TheaterName,

  st.ShowDate,
  st.StartTime,

  se.Seatnumber
FROM booking b
JOIN customer c ON b.CustomerId = c.CustomerId
JOIN showtime st ON b.ShowTimeId = st.ShowTimeId
JOIN movie m ON st.MovieId = m.MovieId
JOIN screen s ON st.ScreenId = s.ScreenID
JOIN theater t ON s.TheaterId = t.TheaterId
LEFT JOIN ticketing tk ON b.BookingId = tk.BookingId
LEFT JOIN seat se ON tk.SeatId = se.SeatId
ORDER BY m.MovieId, b.BookingId
";

$result = $conn->query($sql);
if (!$result) {
  echo json_encode([
    "success" => false,
    "message" => "Query failed",
    "sql_error" => $conn->error
  ]);
  exit;
}

$moviesMap = [];   // movieId => grouped movie object
$bookingMap = [];  // bookingId => ref to booking detail

while ($row = $result->fetch_assoc()) {
  $movieId = (int)$row["MovieId"];
  $bookingId = (int)$row["BookingId"];

  // Build full name
  $middle = trim($row["MiddleName"] ?? "");
  $fullName = trim(
    $row["FirstName"] . " " . ($middle !== "" ? $middle . " " : "") . $row["LastName"]
  );

  $screenLabel = "Screen " . $row["ScreenNumber"];

  // ✅ Status mapping (safe)
  $ps = strtolower(trim($row["PaymentStatus"] ?? ""));
  $status = ($ps === "paid") ? "confirmed" : "cancelled";

  // ✅ ShowDate + StartTime safe parse
  $showDate = $row["ShowDate"];
  $startTime = $row["StartTime"];

  $dtObj = DateTime::createFromFormat("Y-m-d H:i:s", "$showDate $startTime")
        ?: DateTime::createFromFormat("Y-m-d H:i", "$showDate $startTime");

  $dateTimeFormatted = $dtObj
    ? $dtObj->format("M j, Y - g:i A")
    : "$showDate $startTime";

  // ✅ Booking date safe parse
  $createdRaw = $row["CreatedAt"] ?? "";
  $createdObj = DateTime::createFromFormat("Y-m-d H:i:s", $createdRaw);
  $bookingDateFormatted = $createdObj
    ? $createdObj->format("M j, Y g:i A")
    : $createdRaw;

  // Create movie group
  if (!isset($moviesMap[$movieId])) {
    $moviesMap[$movieId] = [
      "movieId" => $movieId,
      "movieTitle" => $row["MovieTitle"],
      "movieImage" => $row["MovieImage"],
      "screens" => [],
      "totalBookings" => 0,
      "bookingDetails" => []
    ];
  }

  // Add screen label
  if (!in_array($screenLabel, $moviesMap[$movieId]["screens"])) {
    $moviesMap[$movieId]["screens"][] = $screenLabel;
  }

  // Create booking detail once
  if (!isset($bookingMap[$bookingId])) {
    $bookingDetail = [
      "id" => "B" . str_pad($bookingId, 3, "0", STR_PAD_LEFT),
      "userName" => $fullName,
      "email" => $row["CustomerEmail"],
      "seats" => [],
      "totalSeats" => 0,
      "screen" => $screenLabel,
      "dateTime" => $dateTimeFormatted,
      "location" => $row["TheaterName"],
      "status" => $status,
      "totalAmount" => (float)$row["TotalAmount"],
      "bookingDate" => $bookingDateFormatted
    ];

    $moviesMap[$movieId]["bookingDetails"][] = $bookingDetail;
    $moviesMap[$movieId]["totalBookings"]++;

    $lastIndex = count($moviesMap[$movieId]["bookingDetails"]) - 1;
    $bookingMap[$bookingId] = &$moviesMap[$movieId]["bookingDetails"][$lastIndex];
  }

  // Push seats
  if (!empty($row["Seatnumber"])) {
    $bookingMap[$bookingId]["seats"][] = $row["Seatnumber"];
  }
}

// Finalize totalSeats and unique seats
foreach ($moviesMap as &$movie) {
  foreach ($movie["bookingDetails"] as &$bd) {
    $bd["seats"] = array_values(array_unique($bd["seats"]));
    $bd["totalSeats"] = count($bd["seats"]);
  }
}

$conn->close();

echo json_encode([
  "success" => true,
  "bookings" => array_values($moviesMap)
]);
