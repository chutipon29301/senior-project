CREATE DATABASE Analytics;

USE Analytics;

CREATE TABLE IF NOT EXISTS Date_Dim(
    dateKey INT AUTO_INCREMENT,
    datetime DATETIME,
    date INT,
    day VARCHAR(10),
    month VARCHAR(15),
    year INT(5),
    isWeekend BOOLEAN,
    isHoliday BOOLEAN,
    isSemester BOOLEAN,
    quarter VARCHAR(7),
    hour INT(2),
    minute INT(2),
    PRIMARY KEY (dateKey)
);

CREATE TABLE IF NOT EXISTS User_Dim(
    userKey INT AUTO_INCREMENT,
    userId VARCHAR(36),
    name VARCHAR(10),
    organization VARCHAR(10),
    PRIMARY KEY (userKey)
);

CREATE TABLE IF NOT EXISTS Round_Dim(
    roundKey INT AUTO_INCREMENT,
    roundId VARCHAR(36),
    marketClearType VARCHAR(10),
    PRIMARY KEY(roundKey)
);

CREATE TABLE IF NOT EXISTS User_Round_Fact(
    userKey INT NOT NULL,
    roundKey INT NOT NULL,
    dateKey INT NOT NULL,
    bsi FLOAT(6,3),
    ssi FLOAT(6,3),
    utilityIndex FLOAT(8,3),
    totalPrice FLOAT(8,3),
    totalQuantity FLOAT(8,3),
    avarageBoughtPricePerUnit FLOAT(8,3),
    PRIMARY KEY(userKey, roundKey, dateKey),
    FOREIGN KEY(userKey) REFERENCES User_Dim(userKey),
    FOREIGN KEY(roundKey) REFERENCES Round_Dim(roundKey),
    FOREIGN KEY(dateKey) REFERENCES Date_Dim(dateKey)
);

CREATE TABLE IF NOT EXISTS Market_Round_Fact(
    roundKey INT NOT NULL,
    dateKey INT NOT NULL,
    mti FLOAT(8,3),
    PRIMARY KEY(roundKey,dateKey),
    FOREIGN KEY(roundKey) REFERENCES Round_Dim(roundKey),
    FOREIGN KEY(dateKey) REFERENCES Date_Dim(dateKey)
);

CREATE TABLE IF NOT EXISTS Transaction_Fact(
    buyerKey INT NOT NULL,
    sellerKey INT NOT NULL,
    roundKey INT NOT NULL,
    dateKey INT NOT NULL,
    pricePerUnit FLOAT(8,3),
    quantity FLOAT(8,3),
    PRIMARY KEY(buyerKey, sellerKey, roundKey, dateKey),
    FOREIGN KEY(buyerKey) REFERENCES User_Dim(userKey),
    FOREIGN KEY(sellerKey) REFERENCES User_Dim(userKey),
    FOREIGN KEY(roundKey) REFERENCES Round_Dim(roundKey),
    FOREIGN KEY(dateKey) REFERENCES Date_Dim(dateKey)
);

