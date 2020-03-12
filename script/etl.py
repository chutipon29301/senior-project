import pandas as pd
from sqlalchemy import create_engine
import pymysql
import os
from datetime import datetime


class ETL:

    def __init__(self):
        self.HOLIDAY_CALENDAR = os.getenv('HOLIDAY_CALENDAR')
        self.fabricSqlEngine = create_engine(
            'mysql+pymysql://root:password@localhost:3306/fabric')
        self.analyticsSqlEngine = create_engine(
            'mysql+pymysql://root:password@localhost:3306/Analytics')
        self.sqlEngine = create_engine(
            'mysql+pymysql://root:password@localhost:3306')

    def loadDimTable(self):
        self.loadUserDim()
        self.loadRoundDim()
        self.loadDateDim()
        self.loadTimeDim()

    def loadUserDim(self):
        with self.fabricSqlEngine.connect() as fabricDbConnection, self.analyticsSqlEngine.connect() as analyticsDbConnection:
            frame = pd.read_sql(
                'SELECT id userId, name, organization FROM user', fabricDbConnection)
            frame.to_sql('User_Dim', con=analyticsDbConnection,
                         if_exists='append', index=False)

    def loadRoundDim(self):
        with self.fabricSqlEngine.connect() as fabricDbConnection, self.analyticsSqlEngine.connect() as analyticsDbConnection:
            frame = pd.read_sql(
                'SELECT id roundId, strategy marketClearType FROM round', fabricDbConnection)
            frame.to_sql('Round_Dim', con=analyticsDbConnection,
                         if_exists='append', index=False)

    def loadDateDim(self):
        with self.analyticsSqlEngine.connect() as analyticsDbConnection:
            frame = self.createDateDf()
            frame.to_sql('Date_Dim', con=analyticsDbConnection,
                         if_exists='append', index=False)

    def loadTimeDim(self):
        with self.analyticsSqlEngine.connect() as analyticsDbConnection:
            frame = self.createTimeDf()
            frame.to_sql('Time_Dim', con=analyticsDbConnection,
                         if_exists='append', index=False)

    def loadMarketRoundFact(self):
        with self.sqlEngine.connect() as dbConnection, self.analyticsSqlEngine.connect() as analyticsDbConnection:
            frame = pd.read_sql('''
            SELECT 
                roundDim.roundKey roundKey,
                dateDim.dateKey startDateKey,
                timeDim.timeKey startTimeKey,
                round.mti mti
            FROM fabric.round round
            LEFT JOIN
                Analytics.Date_Dim dateDim ON dateDim.fullDate = DATE(round.startDate)
            LEFT JOIN 
                Analytics.Time_Dim timeDim ON timeDim.time = TIME(round.startDate)
            LEFT JOIN
                Analytics.Round_Dim roundDim ON roundDim.roundId = round.id
            ''', dbConnection)
            frame.to_sql('Market_Round_Fact', con=analyticsDbConnection,
                         if_exists='append', index=False)

    def loadUserRoundFact(self):
        with self.sqlEngine.connect() as dbConnection, self.analyticsSqlEngine.connect() as analyticsDbConnection:
            frame = pd.read_sql('''
            SELECT 
                userDim.userKey userKey,
                roundDim.roundKey roundKey,
                dateDim.dateKey startDateKey,
                timeDim.timeKey startTimeKey,
                buy_transaction.bsi bsi,
                NULL ssi,
                buy_transaction.utilityIndex utilityIndex,
                buy_transaction.totalBoughtPrice totalPrice,
                SUM(invoice.quantity) totalQuantity,
                buy_transaction.averageBoughtPrice avaragePricePerUnit
            FROM fabric.buy_transaction buy_transaction
            LEFT JOIN
                fabric.invoice invoice ON invoice.buyTransactionId = buy_transaction.id
            LEFT JOIN
                fabric.round round ON round.id = buy_transaction.roundId
            LEFT JOIN
                Analytics.Round_Dim roundDim ON roundDim.roundId = buy_transaction.roundId
            LEFT JOIN
                Analytics.Date_Dim dateDim ON dateDim.fullDate = DATE(round.startDate)
            LEFT JOIN 
                Analytics.Time_Dim timeDim ON timeDim.time = TIME(round.startDate)
            LEFT JOIN
                Analytics.User_Dim userDim ON userDim.userId = buy_transaction.userId
            GROUP BY userDim.userKey, roundDim.roundKey ,userKey,roundKey,startDateKey,startTimeKey,
            bsi,utilityIndex,totalPrice,avaragePricePerUnit
            UNION SELECT 
                userDim.userKey userKey,
                roundDim.roundKey roundKey,
                dateDim.dateKey startDateKey,
                timeDim.timeKey startTimeKey,
                NULL bsi,
                sell_transaction.ssi ssi,
                sell_transaction.utilityIndex utilityIndex,
                sell_transaction.totalSoldPrice totalPrice,
                IFNULL(SUM(invoice.quantity), 0) totalQuantity,
                sell_transaction.averageSoldPrice avaragePricePerUnit
            FROM fabric.sell_transaction sell_transaction
            LEFT JOIN
                fabric.invoice invoice ON invoice.sellTransactionId = sell_transaction.id
            LEFT JOIN
                fabric.round round ON round.id = sell_transaction.roundId
            LEFT JOIN
                Analytics.Round_Dim roundDim ON roundDim.roundId = sell_transaction.roundId
            LEFT JOIN
                Analytics.Date_Dim dateDim ON dateDim.fullDate = DATE(round.startDate)
            LEFT JOIN 
                Analytics.Time_Dim timeDim ON timeDim.time = TIME(round.startDate)
            LEFT JOIN
                Analytics.User_Dim userDim ON userDim.userId = sell_transaction.userId
            GROUP BY userDim.userId,roundDim.roundId,userKey,roundKey,startDateKey,startTimeKey,
            ssi,utilityIndex,totalPrice,avaragePricePerUnit
            ''',dbConnection)
            frame.to_sql('User_Round_Fact', con=analyticsDbConnection,
                         if_exists='append', index=False)

    def loadTransactionFact(self):
        with self.sqlEngine.connect() as dbConnection, self.analyticsSqlEngine.connect() as analyticsDbConnection:
            frame = pd.read_sql('''
            SELECT 
                buyer.userKey buyerKey,
                seller.userKey sellerKey,
                roundDim.roundKey roundKey,
                dateDim.dateKey startDateKey,
                timeDim.timeKey startTimeKey,
                invoice.id invoiceId,
                invoice.price pricePerUnit,
                invoice.quantity quantity
            FROM fabric.invoice invoice
            LEFT JOIN
                fabric.buy_transaction buyTransaction ON buyTransaction.id = invoice.buyTransactionId 
            LEFT JOIN
                fabric.sell_transaction sellTransaction ON sellTransaction.id = invoice.sellTransactionId
            LEFT JOIN 
                Analytics.User_Dim seller ON sellTransaction.userId = seller.userId
            LEFT JOIN 
                Analytics.User_Dim buyer ON buyTransaction.userId = buyer.userId
            LEFT JOIN
                fabric.round round ON round.id = buyTransaction.roundId AND round.id = sellTransaction.roundId
            LEFT JOIN
                Analytics.Round_Dim roundDim ON roundDim.roundId = buyTransaction.roundId AND roundDim.roundId = sellTransaction.roundId
            LEFT JOIN
                Analytics.Date_Dim dateDim ON dateDim.fullDate = DATE(round.startDate)
            LEFT JOIN 
                Analytics.Time_Dim timeDim ON timeDim.time = TIME(round.startDate)
            ''', dbConnection)
            frame.to_sql('Transaction_Fact', con=analyticsDbConnection,
                         if_exists='append', index=False)

    def createDateDf(self, start='2020-01-01', end='2021-12-31'):
        df = pd.DataFrame({"fullDate": pd.date_range(start, end)})
        holidays = pd.read_csv(self.HOLIDAY_CALENDAR)['Date'].to_list()
        holidays_iso = [datetime.strptime(
            holiday, "%d/%m/%Y").date() for holiday in holidays]
        df["date"] = df.fullDate.dt.day
        df["day"] = df.fullDate.dt.weekday_name
        df["month"] = df.fullDate.dt.month
        df["monthName"] = df.fullDate.dt.month_name()
        df["year"] = df.fullDate.dt.year
        df["week"] = df.fullDate.dt.weekofyear
        df["isWeekend"] = df.apply(lambda x: x.fullDate.weekday() > 5, axis=1)
        df["isHoliday"] = df.apply(
            lambda x: x.fullDate.date() in holidays_iso, axis=1)
        df["isSemester"] = df.apply(
            lambda x: x.fullDate.month < 6 or x.fullDate.month > 7, axis=1)
        df["quarter"] = df.fullDate.dt.quarter
        return df

    def createTimeDf(self):
        df = pd.DataFrame(
            {"time": pd.timedelta_range(0, periods=24, freq='H')})
        df['time'] = pd.to_datetime(df['time']).dt.time
        df['hour'] = df.apply(lambda x: x.time.hour, axis=1)
        df['minute'] = df.apply(lambda x: x.time.minute, axis=1)
        df['timeOfDay'] = df.apply(
            lambda x: self.getTimeOfDay(x.time.hour), axis=1)
        return df

    def getTimeOfDay(self, time):
        if(time >= 6 and time < 12):
            return 'Morning'
        if(time >= 12 and time < 17):
            return 'Afternoon'
        if(time >= 17 and time < 20):
            return 'Evening'
        if(time >= 20 or time < 6):
            return 'Night'
