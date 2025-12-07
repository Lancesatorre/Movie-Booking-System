<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "mobook");
if ($conn->connect_error) {
  echo json_encode(["success" => false, "message" => "DB connection failed"]);
  exit;
}

/*
  If later you store admin id in localStorage/session,
  you can change this to WHERE AdminID = $_GET['id']
*/
$q = "SELECT AdminID, FirstName, MiddleName, LastName, Email, Phone, CreatedAt
      FROM admin
      ORDER BY AdminID ASC
      LIMIT 1";

$res = $conn->query($q);

if ($res && $res->num_rows > 0) {
  $row = $res->fetch_assoc();

  $fullName = trim($row["FirstName"] . " " . ($row["MiddleName"] ?? "") . " " . $row["LastName"]);

  echo json_encode([
    "success" => true,
    "admin" => [
      "id" => (int)$row["AdminID"],
      "name" => $fullName,
      "email" => $row["Email"],
      "mobile" => $row["Phone"] ?? "",
      "role" => "System Administrator",
      "createdAt" => $row["CreatedAt"]
    ]
  ]);
} else {
  echo json_encode(["success" => false, "message" => "No admin found"]);
}

$conn->close();
