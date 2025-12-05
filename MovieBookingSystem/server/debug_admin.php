<?php
include "db_connect.php";
header("Content-Type: application/json");

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Check if admin table exists
$tableCheckSql = "SHOW TABLES LIKE 'admin'";
$tableResult = $conn->query($tableCheckSql);

if ($tableResult->num_rows === 0) {
    echo json_encode(["error" => "Admin table does not exist! Run the create_admin_table.sql first."]);
    exit;
}

echo "Admin table exists!\n\n";

// Get admin table structure
echo "=== ADMIN TABLE STRUCTURE ===\n";
$structureSql = "DESCRIBE admin";
$structureResult = $conn->query($structureSql);

while ($row = $structureResult->fetch_assoc()) {
    echo $row["Field"] . " | " . $row["Type"] . " | " . $row["Null"] . " | " . $row["Key"] . "\n";
}

// Get all admin records
echo "\n=== ALL ADMIN RECORDS ===\n";
$dataSql = "SELECT * FROM admin";
$dataResult = $conn->query($dataSql);

if ($dataResult->num_rows === 0) {
    echo "No admin records found!\n";
} else {
    while ($row = $dataResult->fetch_assoc()) {
        echo "AdminId: " . $row["AdminId"] . "\n";
        echo "Username: " . $row["Username"] . "\n";
        echo "Email: " . $row["Email"] . "\n";
        echo "PasswordHash: " . $row["PasswordHash"] . "\n";
        echo "---\n";
    }
}

// Test the query with email
echo "\n=== TEST QUERY WITH EMAIL admin@mobook.com ===\n";
$testEmail = "admin@mobook.com";
$testSql = "SELECT * FROM admin WHERE Email = ?";
$testStmt = $conn->prepare($testSql);
if (!$testStmt) {
    echo "Prepare failed: " . $conn->error . "\n";
    exit;
}
$testStmt->bind_param("s", $testEmail);
$testStmt->execute();
$testResult = $testStmt->get_result();

echo "Rows found: " . $testResult->num_rows . "\n";

if ($testResult->num_rows > 0) {
    $admin = $testResult->fetch_assoc();
    echo "Found admin record:\n";
    print_r($admin);
    
    // Test password verification
    echo "\n=== PASSWORD VERIFICATION ===\n";
    $testPassword = "admin123";
    $hash = $admin["PasswordHash"];
    $isValid = password_verify($testPassword, $hash);
    echo "Testing password 'admin123'\n";
    echo "Hash from DB: " . $hash . "\n";
    echo "Result: " . ($isValid ? "VALID ✓" : "INVALID ✗") . "\n";
} else {
    echo "Email not found in admin table\n";
}
?>
