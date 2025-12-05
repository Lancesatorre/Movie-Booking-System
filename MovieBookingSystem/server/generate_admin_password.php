<?php
// Simple password hasher for testing
// Usage: Run this file and it will output a hashed password

$password = "admin123"; // Change this to your desired password

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

echo "Plain Password: " . $password . "\n";
echo "Hashed Password: " . $hashedPassword . "\n";
echo "\n";
echo "SQL Insert Statement:\n";
echo "INSERT INTO admin (AdminId, Username, Email, PasswordHash) VALUES (1, 'admin', 'admin@mobook.com', '" . $hashedPassword . "');\n";
?>
