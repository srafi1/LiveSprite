CREATE DATABASE hibernatedb;
USE hibernatedb;

CREATE TABLE user (
    user_id INT AUTO_INCREMENT, 
    username VARCHAR(20) NOT NULL, 
    password VARCHAR(20) NOT NULL, 
    PRIMARY KEY (user_id)
);

CREATE TABLE animation (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(20) NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT
    FOREIGN KEY (user_id)
    REFERENCES user (user_id)
) ENGINE=InnoDB;
