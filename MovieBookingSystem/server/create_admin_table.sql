-- Create admin table
CREATE TABLE IF NOT EXISTS `admin` (
  `AdminId` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(100) NOT NULL UNIQUE,
  `Email` varchar(100) NOT NULL UNIQUE,
  `PasswordHash` varchar(255) NOT NULL,
  PRIMARY KEY (`AdminId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert test admin account
-- Email: admin@mobook.com
-- Password: admin123
-- This hash is: $2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DRcT36
INSERT INTO `admin` (`Username`, `Email`, `PasswordHash`) VALUES 
('admin', 'admin@mobook.com', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DRcT36');
