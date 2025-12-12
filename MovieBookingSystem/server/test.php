<?php
// test.php — simple readable schedule viewer
include "db_connect.php";
date_default_timezone_set("Asia/Manila");

$sql = "
    SELECT
        st.ShowTimeId,
        st.MovieId,
        m.Title AS MovieTitle,
        st.ScreenId,
        s.ScreenNumber,
        s.TheaterId,
        t.Name AS TheaterName,
        st.ShowDate,
        st.StartTime,
        st.EndTime,
        st.Status
    FROM showtime st
    INNER JOIN movie m   ON st.MovieId = m.MovieId
    INNER JOIN screen s  ON st.ScreenId = s.ScreenID
    INNER JOIN theater t ON s.TheaterId = t.TheaterId
    ORDER BY st.ShowDate ASC, st.StartTime ASC
";
$result = $conn->query($sql);

if (!$result) {
    die("Query failed: " . $conn->error);
}

function fmtTime($timeStr) {
    $dt = DateTime::createFromFormat("H:i:s", $timeStr);
    return $dt ? $dt->format("g:i A") : $timeStr;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MoBook API Test - Schedules</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0f0f10;
      color: #eee;
      margin: 0;
      padding: 24px;
    }
    h1 {
      margin: 0 0 16px;
      font-size: 22px;
      font-weight: 700;
    }
    .table-wrap {
      background: #16181b;
      border: 1px solid #2a2d33;
      border-radius: 10px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid #23262b;
      text-align: left;
      vertical-align: top;
      white-space: nowrap;
    }
    th {
      background: #1e2126;
      font-weight: 700;
      color: #ffcccb;
    }
    tr:hover td {
      background: #1a1d22;
    }
    .status {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
    }
    .active { background: #123b1c; color: #8bff9f; }
    .inactive { background: #3b1212; color: #ff9b9b; }
    .muted { color: #aaa; }
  </style>
</head>
<body>
  <h1>All Movie Schedules (Showtimes)</h1>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>ShowTimeId</th>
          <th>Movie</th>
          <th>Theater</th>
          <th>Screen</th>
          <th>Date</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <?php $i=1; while($row = $result->fetch_assoc()): 
          $status = strtolower($row["Status"]);
          $statusClass = $status === "active" ? "active" : "inactive";
        ?>
        <tr>
          <td class="muted"><?= $i++ ?></td>
          <td><?= (int)$row["ShowTimeId"] ?></td>
          <td>
            <?= htmlspecialchars($row["MovieTitle"]) ?>
            <div class="muted">MovieId: <?= (int)$row["MovieId"] ?></div>
          </td>
          <td>
            <?= htmlspecialchars($row["TheaterName"]) ?>
            <div class="muted">TheaterId: <?= (int)$row["TheaterId"] ?></div>
          </td>
          <td>
            Screen #<?= (int)$row["ScreenNumber"] ?>
            <div class="muted">ScreenId: <?= (int)$row["ScreenId"] ?></div>
          </td>
          <td><?= htmlspecialchars($row["ShowDate"]) ?></td>
          <td><?= fmtTime($row["StartTime"]) ?></td>
          <td><?= fmtTime($row["EndTime"]) ?></td>
          <td><span class="status <?= $statusClass ?>"><?= htmlspecialchars($row["Status"]) ?></span></td>
        </tr>
        <?php endwhile; ?>
      </tbody>
    </table>
  </div>
</body>
</html>
