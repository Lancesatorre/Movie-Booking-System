<?php
include "db_connect.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Preflight support
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get customerId from GET (?customerId=1) or POST JSON
$customerId = null;

if (isset($_GET['customerId'])) {
    $customerId = (int)$_GET['customerId'];
} else {
    $raw = file_get_contents("php://input");
    if ($raw) {
        $data = json_decode($raw, true);
        if (isset($data["customerId"])) {
            $customerId = (int)$data["customerId"];
        }
    }
}

// Validate
if (!$customerId || $customerId <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "customerId is required"
    ]);
    exit;
}

/*
    Returns all booking details for a user, including:
    - movie info, seat list
    - total price
    - paymentMethod (NEW)
    - isExpired flag
*/
$sql = "
    SELECT 
        b.BookingId,
        m.Title AS movieTitle,
        m.PosterPath AS movieImage,
        m.RatingCode AS movieRating,
        CONCAT(st.ShowDate, 'T', st.StartTime) AS showDateTime,
        sc.ScreenNumber AS screenNumber,
        th.Name AS theaterName,
        th.Location AS theaterLocation,
        GROUP_CONCAT(se.Seatnumber ORDER BY se.Seatnumber SEPARATOR ',') AS seats,
        b.TotalAmount AS totalPrice,
        b.PaymentMethod AS paymentMethod,

        CASE
          WHEN st.ShowDate < CURDATE()
               OR (st.ShowDate = CURDATE() AND st.EndTime < CURTIME())
            THEN 1
          ELSE 0
        END AS isExpired

    FROM booking b
    INNER JOIN showtime st ON b.ShowTimeId = st.ShowTimeId
    INNER JOIN movie m ON st.MovieId = m.MovieId
    INNER JOIN screen sc ON st.ScreenId = sc.ScreenID
    INNER JOIN theater th ON sc.TheaterId = th.TheaterId
    LEFT JOIN ticketing t ON b.BookingId = t.BookingId
    LEFT JOIN seat se ON t.SeatId = se.SeatId
    WHERE b.CustomerId = ?
    GROUP BY b.BookingId
    ORDER BY st.ShowDate ASC, st.StartTime ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $customerId);
$stmt->execute();
$result = $stmt->get_result();

$tickets = [];

while ($row = $result->fetch_assoc()) {
    // Convert seat CSV -> array
    $seatArray = [];
    if (!empty($row["seats"])) {
        $seatArray = explode(",", $row["seats"]);
        $seatArray = array_map("trim", $seatArray);
    }

    $tickets[] = [
        "id"               => (int)$row["BookingId"],
        "movieTitle"       => $row["movieTitle"],
        "movieImage"       => $row["movieImage"],
        "movieRating"      => $row["movieRating"],
        "showDateTime"     => $row["showDateTime"],
        "screenNumber"     => (int)$row["screenNumber"],
        // keep key name consistent with existing frontend (typo included)
        "theatherLocation" => $row["theaterName"] . ", " . $row["theaterLocation"],
        "seats"            => $seatArray,
        "totalPrice"       => (float)$row["totalPrice"],
        "paymentMethod"    => $row["paymentMethod"], // 👈 NEW
        "isExpired"        => (int)$row["isExpired"]
    ];
}

echo json_encode([
    "success" => true,
    "tickets" => $tickets
]);
