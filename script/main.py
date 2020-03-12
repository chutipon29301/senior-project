import fire
import os
import shutil
import subprocess
from pathlib import Path
from user import User
from fabric import Fabric
from service import Service
from bid import Bid
from etl import ETL
class Pipeline(object):

    absPath = os.path.abspath(os.curdir)

    def __init__(self):
        dirname = os.path.dirname(__file__)

        # Script configuration
        os.environ['FABRIC_URL'] = 'http://localhost:3000/'
        os.environ['STORAGE_DIR'] = os.path.join(dirname, 'tmp')
        os.environ['USER_LIST'] = os.path.join(dirname, 'data/user.csv')
        os.environ['USER_STORAGE'] = os.path.join(os.getenv('STORAGE_DIR'), 'user.csv')
        os.environ['HOLIDAY_CALENDAR'] = os.path.join(dirname, 'data/thHoliday2563-64.csv')
       
        # Import Grouped command
        self.user = User()
        self.fabric = Fabric()
        self.service = Service()
        self.bid = Bid()
        self.etl = ETL()

    def cleanFabric(self):
        self.service.stop('fabric', 'nest')
        if os.path.exists(os.environ['STORAGE_DIR']):
            shutil.rmtree(os.environ['STORAGE_DIR'])
        if not os.path.exists(os.environ['STORAGE_DIR']):
            os.makedirs(os.environ['STORAGE_DIR'])
        if os.path.exists("%s/fabric-server-nest/fabric-client-kv-building" % self.absPath):
            shutil.rmtree("%s/fabric-server-nest/fabric-client-kv-building" % self.absPath)
        if os.path.exists("%s/fabric-server-nest/fabric-client-kv-pv" % self.absPath):
            shutil.rmtree("%s/fabric-server-nest/fabric-client-kv-pv" % self.absPath)
        if os.path.exists("%s/fabric-server-nest/fabric-client-kv-utility" % self.absPath):
            shutil.rmtree("%s/fabric-server-nest/fabric-client-kv-utility" % self.absPath)
        os.system('docker volume prune -f')
    
    def startFabric(self):
        self.service.start('nest', 'fabric')    
    
    def restartFabric(self):
        self.cleanFabric()
        self.startFabric()

if __name__ == '__main__':
    
    fire.Fire(Pipeline)
