
import os
import random
import numpy as np
import pandas as pd
import math

#correlation library
from scipy.stats.stats import pearsonr

# deep learning libraries
import tensorflow as tf
from keras import optimizers
from keras import backend as K
from keras.models import Sequential
from keras.layers import Dense
from keras.layers.recurrent import LSTM
from keras.layers.core import Dense, Activation, Flatten
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error

class LSTM():
    def __init__(self):
        # def setting_seed_value():
        seed_value = 17
        os.environ['PYTHONHASHSEED'] = str(seed_value)
        random.seed(seed_value)
        np.random.seed(seed_value)
        tf.set_random_seed(seed_value)
        session_conf = tf.ConfigProto(intra_op_parallelism_threads = 1, inter_op_parallelism_threads = 1)
        sess = tf.Session(graph = tf.get_default_graph(), config = session_conf)
        K.set_session(sess)
        
    def read_data(self,filename):
        global df, minimum, maximum, length_of_col, look_back, X, y, temp1, temp2, X_train, X_val, X_test
        global y_train, y_val, y_test
        df = pd.read_csv(filename)
        df['Time'] = pd.to_datetime(df['Time'])
        df['Hour'] = df['Time'].dt.hour
        df['Weekday'] = df['Time'].dt.dayofweek
        df.drop(['Time','Windspeed','Pressure','Humidity'],axis=1,inplace=True)
        df = df.round(2)

        minimum = []
        maximum = []
        minimum.append(df['Load'].min())
        maximum.append(df['Load'].max())

        minimum.append(df['Outdoor'].min())
        maximum.append(df['Outdoor'].max())

        scaler = MinMaxScaler(feature_range=(0, 1))
        df[['Load', 'Outdoor', 'Hour', 'Weekday']] = scaler.fit_transform(df[['Load', 'Outdoor', 'Hour', 'Weekday']])

        length_of_col = len(df.columns)
        look_back = 1
        df1 = df.copy()
        df1.drop(['Outdoor', 'Hour', 'Weekday'], axis = 1, inplace = True)

        for i in range(1,look_back+1):
            SHIFT = i
            df_copy = df1.copy()
            df_copy.rename(columns = {'Load': 'Load_(t-{})'.format(SHIFT)}, inplace = True)
            df = pd.concat([df,df_copy.shift(SHIFT)], axis = 1)
        df.dropna(axis = 0, inplace=True)
        df = df.reset_index(drop = True)

        corr = df.corr()
        
        X = np.array(df.as_matrix(columns = df.columns[1:]))
        y = np.array(df["Load"])

        temp1 = int(0.8 * len(X))
        temp2 = int(0.1 * len(X))
        X_train = X[:temp1]
        X_val = X[temp1:temp1+temp2]
        X_test = X[temp1+temp2:]

        y_train = y[:temp1]
        y_val = y[temp1:temp1+temp2]
        y_test = y[temp1+temp2:]

        X_train = X_train.reshape((X_train.shape[0], look_back, length_of_col))
        X_test = X_test.reshape((X_test.shape[0], look_back, length_of_col))
        X_val = X_val.reshape((X_val.shape[0], look_back, length_of_col))

        return # Please  


    def load_model(self):
        epoch = 20
        batch_size = 24
        lr = 0.005
        global model, history

        model = Sequential()

        model.add((LSTM(units=20, return_sequences=True, input_shape=(look_back, X_train.shape[2]), activation='relu')))
        model.add((LSTM(units=10, return_sequences=True, activation='relu')))
        model.add(Flatten())
        model.add(Dense(units = 1,activation='sigmoid'))

        adam = optimizers.Adam(lr=lr)
        model.compile(loss = 'mean_squared_error', optimizer = adam)

        history = model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=epoch, batch_size=batch_size,verbose=1, shuffle = False)
        return model.summary()

    def mean_absolute_percentage_error(self,y_true, y_pred):
        y_true, y_pred = np.array(y_true), np.array(y_pred)
        return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

    def cv_error(self,y_true, y_pred):
        y_true, y_pred = np.array(y_true), np.array(y_pred)
        return (np.sqrt(np.sum(np.square(y_pred-y_true))/(len(y_true)-1))/np.mean(y_true))*100

    def predict(self):
        global trainPredict,testPredict, y_train, y_test
        
        trainPredict = model.predict(X_train)
        testPredict = model.predict(X_test)

        trainPredict = trainPredict*(maximum[0]-minimum[0]) + minimum[0]
        y_train = y_train*(maximum[0]-minimum[0]) + minimum[0]

        testPredict = testPredict*(maximum[0]-minimum[0]) + minimum[0]
        y_test = y_test*(maximum[0]-minimum[0]) + minimum[0]

        trainPredict = trainPredict.reshape(trainPredict.shape[0])
        testPredict = testPredict.reshape(testPredict.shape[0])

        trainScore = round(math.sqrt(mean_squared_error(y_train[:-168], trainPredict[:-168])),2)
        testScore = round(math.sqrt(mean_squared_error(y_test[:-504], testPredict[:-504])),2)

        mape_score_train = round(mean_absolute_percentage_error(y_train[:-168], trainPredict[:-168]),2)
        mape_score_test = round(mean_absolute_percentage_error(y_test[:-504], testPredict[:-504]),2)

        cv_score_train = round(cv_error(y_train[:-168], trainPredict[:-168]),2)
        cv_score_test = round(cv_error(y_test[:-504], testPredict[:-504]),2)

        train_pearson = round(pearsonr(y_train[:-168], trainPredict[:-168])[0],3)
        test_pearson = round(pearsonr(y_test[:-504], testPredict[:-504])[0],3)
        return testPredict
        
    # if __name__ == "__main__":
    #     filename = 'MA_Boston_1hr.csv'
    #     read_data(filename)
    #     load_model()
    #     predict()
        
