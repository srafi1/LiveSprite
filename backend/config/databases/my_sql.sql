DROP TABLE user;
CREATE TABLE user (
    id       INT         NOT NULL AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    PRIMARY KEY (ID)
);
