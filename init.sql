CREATE DATABASE Analytics;

USE Analytics;

CREATE TABLE IF NOT EXISTS Date_Dim(
    dateKey INT AUTO_INCREMENT,
    fullDate DATE,
    date INT,
    day NVARCHAR(10),
    month INT,
    monthName NVARCHAR(10),
    year INT,
    week INT,
    isWeekend BOOLEAN,
    isHoliday BOOLEAN,
    isSemester BOOLEAN,
    quarter INT,
    PRIMARY KEY (dateKey)
);

CREATE TABLE IF NOT EXISTS Time_Dim(
    timeKey INT AUTO_INCREMENT,
    time TIME,
    timeOfDay NVARCHAR(15),
    hour INT,
    minute INT,
    PRIMARY KEY (timeKey)
);

CREATE TABLE IF NOT EXISTS User_Dim(
    userKey INT AUTO_INCREMENT,
    userId NVARCHAR(36),
    name NVARCHAR(10),
    organization NVARCHAR(10),
    PRIMARY KEY (userKey)
);

CREATE TABLE IF NOT EXISTS Round_Dim(
    roundKey INT AUTO_INCREMENT,
    roundId NVARCHAR(36),
    marketClearType NVARCHAR(10),
    PRIMARY KEY(roundKey)
);

CREATE TABLE IF NOT EXISTS User_Round_Fact(
    userKey INT NOT NULL,
    roundKey INT NOT NULL,
    startDateKey INT NOT NULL,
    startTimeKey INT NOT NULL,
    bsi FLOAT(8, 5),
    ssi FLOAT(8, 5),
    utilityIndex FLOAT(8, 2),
    totalPrice FLOAT(8, 2),
    totalQuantity FLOAT(8, 2),
    avaragePricePerUnit FLOAT(4, 2),
    PRIMARY KEY(userKey, roundKey, startDateKey, startTimeKey),
    FOREIGN KEY(userKey) REFERENCES User_Dim(userKey),
    FOREIGN KEY(roundKey) REFERENCES Round_Dim(roundKey),
    FOREIGN KEY(startDateKey) REFERENCES Date_Dim(dateKey),
    FOREIGN KEY(startTimeKey) REFERENCES Time_Dim(timeKey)
);

CREATE TABLE IF NOT EXISTS Market_Round_Fact(
    roundKey INT NOT NULL,
    startDateKey INT NOT NULL,
    startTimeKey INT NOT NULL,
    mti FLOAT(6, 5),
    totalQuantityInSystem FLOAT(8, 2),
    totalPriceInSystem FLOAT(8, 2),
    totalQuantity FLOAT(8, 2),
    totalPrice FLOAT(8, 2),
    PRIMARY KEY(roundKey, startDateKey, startTimeKey),
    FOREIGN KEY(roundKey) REFERENCES Round_Dim(roundKey),
    FOREIGN KEY(startDateKey) REFERENCES Date_Dim(dateKey),
    FOREIGN KEY(startTimeKey) REFERENCES Time_Dim(timeKey)
);

CREATE TABLE IF NOT EXISTS Transaction_Fact(
    buyerKey INT NOT NULL,
    sellerKey INT NOT NULL,
    roundKey INT NOT NULL,
    startDateKey INT NOT NULL,
    startTimeKey INT NOT NULL,
    invoiceId NVARCHAR(36) NOT NULL,
    pricePerUnit FLOAT(4, 2),
    quantity FLOAT(8, 2),
    PRIMARY KEY(buyerKey, sellerKey, roundKey, startDateKey, startTimeKey),
    FOREIGN KEY(buyerKey) REFERENCES User_Dim(userKey),
    FOREIGN KEY(sellerKey) REFERENCES User_Dim(userKey),
    FOREIGN KEY(roundKey) REFERENCES Round_Dim(roundKey),
    FOREIGN KEY(startDateKey) REFERENCES Date_Dim(dateKey),
    FOREIGN KEY(startTimeKey) REFERENCES Time_Dim(timeKey)
);

-- CREATE USER 'grafana'@'%' IDENTIFIED BY 'password';
-- GRANT SELECT ON Analytics.* TO 'grafana'@'%';

-- CREATE DATABASE Metabase;
-- CREATE USER 'metabase'@'%' IDENTIFIED BY 'password';
-- GRANT ALL PRIVILEGES ON Metabase.* TO 'metabase'@'%';