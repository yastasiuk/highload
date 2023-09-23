USE projector;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    date_of_birth DATE
);

DELIMITER //
CREATE PROCEDURE populate_data(n INT)
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE random_date DATE;

  WHILE i < n DO
    SET random_date = DATE_ADD('1970-01-01', INTERVAL FLOOR(0 + (RAND() * 18250)) DAY);
    INSERT INTO users(name, date_of_birth) VALUES (CONCAT('User', i), random_date);
    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;

CALL populate_data(40000000);

