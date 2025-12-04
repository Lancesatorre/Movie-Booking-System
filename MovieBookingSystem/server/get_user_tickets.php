<?php
include "db_connect.php";
header("Content-Type: application/json");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$customerId = isset($_GET['customerId']) ? (int)$_GET['customerId'] : 0;
if ($customerId <= 0) {
    echo json_encode(["success" => false, "message" => "Missing customerId"]);
    exit;
}

/*
booking -> showtime -> movie + screen + theater
ticketing -> seat (for seat numbers)
*/
$sql = "
SELECT
  b.BookingId AS id,
  m.Title AS movieTitle,
  m.PosterPath AS movieImage,
  m.RatingCode AS movieRating,
  CONCAT(st.ShowDate, 'T', st.StartTime) AS showDateTime,
  sc.ScreenNumber AS screenNumber,
  CONCAT(th.Name, ', ', th.Location) AS theatherLocation,
  GROUP_CONCAT(se.Seatnumber ORDER BY se.Seatnumber SEPARATOR ',') AS seats,
  b.TotalAmount AS totalPrice
FROM booking b
JOIN showtime st ON b.ShowTimeId = st.ShowTimeId
JOIN movie m ON st.MovieId = m.MovieId
JOIN screen sc ON st.ScreenId = sc.ScreenID
JOIN theater th ON sc.TheaterId = th.TheaterId
JOIN ticketing tk ON tk.BookingId = b.BookingId
JOIN seat se ON tk.SeatId = se.SeatId
WHERE b.CustomerId = ?
GROUP BY b.BookingId
ORDER BY st.ShowDate DESC, st.StartTime DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $customerId);
$stmt->execute();
$result = $stmt->get_result();

$tickets = [];
while ($row = $result->fetch_assoc()) {
    $tickets[] = [
        "id" => (int)$row["id"],
        "movieTitle" => $row["movieTitle"],
        "movieImage" => $row["movieImage"],
        "movieRating" => $row["movieRating"],
        "showDateTime" => $row["showDateTime"],
        "screenNumber" => (int)$row["screenNumber"],
        "theatherLocation" => $row["theatherLocation"],
        "seats" => $row["seats"] ? explode(",", $row["seats"]) : [],
        "totalPrice" => (float)$row["totalPrice"]
    ];
}

echo json_encode([
  "success" => true,
  "tickets" => $tickets
]);
