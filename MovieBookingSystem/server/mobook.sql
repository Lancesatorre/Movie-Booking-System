-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 30, 2025 at 06:35 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mobook`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `BookingId` int(11) NOT NULL,
  `CustomerId` int(11) NOT NULL,
  `ShowTimeId` int(11) NOT NULL,
  `BookingDate` date NOT NULL,
  `PaymentStatus` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `CustomerId` int(11) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `MiddleName` varchar(50) DEFAULT NULL,
  `LastName` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Phone_Number` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`CustomerId`, `FirstName`, `MiddleName`, `LastName`, `Email`, `Password`, `Phone_Number`) VALUES
(1, 'Sergio', 'R', 'Neri', 'gioneri1022@gmail.com', '$2y$10$OWCVnhyLLMVvHxPG4ZGsCuxeI0UqRFa7E7SAbbcnG4jB2RYfw5t/C', '09638523852'),
(2, 'SampleOne', 'R', 'Neri', 'SampleOne@gmail.com', '$2y$10$K.nX3ql7mHnG8WOLR1VYPOkoe.phym2zixFEjTkYnRinTmfLZpcT.', '09638523853');

-- --------------------------------------------------------

--
-- Table structure for table `movie`
--

CREATE TABLE `movie` (
  `MovieId` int(11) NOT NULL,
  `Title` varchar(150) NOT NULL,
  `Genre` varchar(255) NOT NULL,
  `DurationMinutes` int(11) NOT NULL,
  `RatingCode` varchar(10) NOT NULL,
  `PosterPath` varchar(255) NOT NULL,
  `Description` text NOT NULL,
  `ReleaseDate` date NOT NULL,
  `BasePrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movie`
--

INSERT INTO `movie` (`MovieId`, `Title`, `Genre`, `DurationMinutes`, `RatingCode`, `PosterPath`, `Description`, `ReleaseDate`, `BasePrice`) VALUES
(1, 'Altered', 'Science Fiction, Action', 132, 'R-5', '/assets/Movies/altered.jpg', 'In an alternate present, genetically enhanced humans dominate society. Outcasts Leon and Chloe fight for justice against corrupt politicians exploiting genetic disparity, risking everything to challenge the oppressive system.', '2025-11-25', 250.00),
(2, 'Avengers: Endgame', 'Adventure, Science Fiction, Action', 153, 'R-5', '/assets/Movies/avengers-endgame.jpg', 'After Thanos, devastating snap leaves the universe in ruins, the remaining Avengers reunite to undo his actions and restore balance—no matter the cost.', '2025-11-25', 300.00),
(3, 'Frankenstein', 'Drama, Horror, Science Fiction', 125, 'R-5', '/assets/Movies/frankenstein.jpg', 'Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.', '2025-11-25', 250.00),
(4, 'In Your Dreams', 'Comedy, Adventure, Animation, Fantasy, Family', 81, 'R-5', '/assets/Movies/in-your-dreams.jpg', 'Stevie and her little brother Elliot journey into the wildly absurd landscape of their own dreams to ask the Sandman to grant them the perfect family.', '2025-11-25', 200.00),
(5, 'War of the Worlds', 'Science Fiction, Thriller', 145, 'R-5', '/assets/Movies/war-of-the-worlds.jpg', 'Will Radford, a top Homeland Security cyber-analyst, uncovers a mysterious attack that makes him question whether the government is hiding the truth from him—and the world.', '2025-11-25', 280.00),
(6, 'Wicked: For Good', 'Romance, Fantasy, Adventure', 137, 'R-5', '/assets/Movies/wicked-for-good.jpg', 'As an angry mob rises against the Wicked Witch, Glinda and Elphaba will need to come together one final time. With their singular friendship now the fulcrum of their futures, they will need to truly see each other, with honesty and empathy, if they are to change themselves, and all of Oz, for good.', '2025-11-25', 320.00);

-- --------------------------------------------------------

--
-- Table structure for table `screen`
--

CREATE TABLE `screen` (
  `ScreenID` int(11) NOT NULL,
  `ScreenNumber` int(11) NOT NULL,
  `TheaterId` int(11) NOT NULL,
  `Capacity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seat`
--

CREATE TABLE `seat` (
  `SeatId` int(11) NOT NULL,
  `ScreenId` int(11) NOT NULL,
  `Seatnumber` varchar(10) NOT NULL,
  `SeatType` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `showtime`
--

CREATE TABLE `showtime` (
  `ShowTimeId` int(11) NOT NULL,
  `MovieId` int(11) NOT NULL,
  `ScreenId` int(11) NOT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `theater`
--

CREATE TABLE `theater` (
  `TheaterId` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Location` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticketing`
--

CREATE TABLE `ticketing` (
  `TicketId` varchar(50) NOT NULL,
  `BookingId` int(11) NOT NULL,
  `SeatId` int(11) NOT NULL,
  `Price` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`BookingId`),
  ADD KEY `fk_booking_customer` (`CustomerId`),
  ADD KEY `fk_booking_showtime` (`ShowTimeId`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`CustomerId`);

--
-- Indexes for table `movie`
--
ALTER TABLE `movie`
  ADD PRIMARY KEY (`MovieId`);

--
-- Indexes for table `screen`
--
ALTER TABLE `screen`
  ADD PRIMARY KEY (`ScreenID`),
  ADD KEY `fk_screen_theater` (`TheaterId`);

--
-- Indexes for table `seat`
--
ALTER TABLE `seat`
  ADD PRIMARY KEY (`SeatId`),
  ADD KEY `fk_seat_screen` (`ScreenId`);

--
-- Indexes for table `showtime`
--
ALTER TABLE `showtime`
  ADD PRIMARY KEY (`ShowTimeId`),
  ADD KEY `fk_showtime_movie` (`MovieId`),
  ADD KEY `fk_showtime_screen` (`ScreenId`);

--
-- Indexes for table `theater`
--
ALTER TABLE `theater`
  ADD PRIMARY KEY (`TheaterId`);

--
-- Indexes for table `ticketing`
--
ALTER TABLE `ticketing`
  ADD PRIMARY KEY (`TicketId`),
  ADD KEY `fk_ticketing_booking` (`BookingId`),
  ADD KEY `fk_ticketing_seat` (`SeatId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `BookingId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `CustomerId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `movie`
--
ALTER TABLE `movie`
  MODIFY `MovieId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `screen`
--
ALTER TABLE `screen`
  MODIFY `ScreenID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seat`
--
ALTER TABLE `seat`
  MODIFY `SeatId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `showtime`
--
ALTER TABLE `showtime`
  MODIFY `ShowTimeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `theater`
--
ALTER TABLE `theater`
  MODIFY `TheaterId` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `fk_booking_customer` FOREIGN KEY (`CustomerId`) REFERENCES `customer` (`CustomerId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_booking_showtime` FOREIGN KEY (`ShowTimeId`) REFERENCES `showtime` (`ShowTimeId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `screen`
--
ALTER TABLE `screen`
  ADD CONSTRAINT `fk_screen_theater` FOREIGN KEY (`TheaterId`) REFERENCES `theater` (`TheaterId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `seat`
--
ALTER TABLE `seat`
  ADD CONSTRAINT `fk_seat_screen` FOREIGN KEY (`ScreenId`) REFERENCES `screen` (`ScreenID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `showtime`
--
ALTER TABLE `showtime`
  ADD CONSTRAINT `fk_showtime_movie` FOREIGN KEY (`MovieId`) REFERENCES `movie` (`MovieID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_showtime_screen` FOREIGN KEY (`ScreenId`) REFERENCES `screen` (`ScreenID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticketing`
--
ALTER TABLE `ticketing`
  ADD CONSTRAINT `fk_ticketing_booking` FOREIGN KEY (`BookingId`) REFERENCES `booking` (`BookingId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ticketing_seat` FOREIGN KEY (`SeatId`) REFERENCES `seat` (`SeatId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
