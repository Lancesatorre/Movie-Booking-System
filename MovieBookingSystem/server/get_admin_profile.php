<?php
include "db_connect.php";
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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
