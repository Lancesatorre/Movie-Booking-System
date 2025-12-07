<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "mobook");
if ($conn->connect_error) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit;
}

/*
mobook table
booking(BookingId, CustomerId, ShowTimeId, PaymentStatus, TotalAmount, CreatedAt)
customer(CustomerId, FirstName, MiddleName, LastName, Email)
ticketing(TicketId, BookingId, SeatId)
seat(SeatId, ScreenId, Seatnumber)
showtime(ShowTimeId, MovieId, ScreenId, ShowDate, StartTime)
movie(MovieId, Title, PosterPath)
screen(ScreenID, ScreenNumber, TheaterId)
theater(TheaterId, Name, Location)
*/

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
  echo json_encode(["success" => false, "message" => "Query failed", "sql_error" => $conn->error]);
  exit;
}

$moviesMap = []; // movieId => movie object
$bookingMap = []; // BookingId => ref to booking detail (so seats can be pushed)

while ($row = $result->fetch_assoc()) {
  $movieId = (int)$row["MovieId"];
  $bookingId = (int)$row["BookingId"];

  // Build full name (customer middle name optional)
  $middle = trim($row["MiddleName"] ?? "");
  $fullName = trim(
    $row["FirstName"] . " " . ($middle !== "" ? $middle . " " : "") . $row["LastName"]
  );

  // Screen label like UI expects
  $screenLabel = "Screen " . $row["ScreenNumber"];

  // Status mapping
  $ps = strtolower(trim($row["PaymentStatus"]));
  $status = ($ps === "paid" || $ps === "pa id" || $ps === "paid ") ? "confirmed" : "cancelled";
  // If you add a real booking status later, change this mapping.

  // Format showtime: "Dec 5, 2025 - 2:30 PM"
  $showDate = $row["ShowDate"];
  $startTime = $row["StartTime"];
  $dtObj = DateTime::createFromFormat("Y-m-d H:i:s", "$showDate $startTime");
  if (!$dtObj) {
    $dtObj = DateTime::createFromFormat("Y-m-d H:i", "$showDate $startTime");
  }
  $dateTimeFormatted = $dtObj
    ? $dtObj->format("M j, Y - g:i A")
    : "$showDate $startTime";

  // Format booking date similar to UI: "Dec 4, 2025 10:30 AM"
  $createdObj = DateTime::createFromFormat("Y-m-d H:i:s", $row["CreatedAt"]);
  $bookingDateFormatted = $createdObj
    ? $createdObj->format("M j, Y g:i A")
    : $row["CreatedAt"];

  // --- Create movie group if not exists ---
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

  // Add screen to movie screens if not already there
  if (!in_array($screenLabel, $moviesMap[$movieId]["screens"])) {
    $moviesMap[$movieId]["screens"][] = $screenLabel;
  }

  // --- Create booking detail once per BookingId ---
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

    // store reference to the last inserted booking detail
    $lastIndex = count($moviesMap[$movieId]["bookingDetails"]) - 1;
    $bookingMap[$bookingId] = &$moviesMap[$movieId]["bookingDetails"][$lastIndex];
  }

  // --- Push seats ---
  if (!empty($row["Seatnumber"])) {
    $bookingMap[$bookingId]["seats"][] = $row["Seatnumber"];
  }
}

// finalize totalSeats
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
