import os

class Service():
    """Sets of command to manage docker services"""

    absPath = os.path.abspath(os.curdir)
    services = ['jupyter', 'nest', 'smartcontract', 'fabric', 'smartmeter', 'forecast']

    def list(self):
        """
        List available services; Usage: python main.py service list
        """        
        print("\n".join(self.services))

    def start(*argv):
        """
        Start docker service; Usage: python main.py service start <<service names, ...>>
        """
        self, *selectedServices = argv
        self.__checkServiceArgument(selectedServices)
        print('Starting services...\n')
        for service in selectedServices:
            self.__startService(service)

    def stop(*argv):
        """
        Stop docker service; Usage: python main.py service stop <<service names, ...>>
        """
        self, *selectedServices = argv
        self.__checkServiceArgument(selectedServices)
        print('Stopping services...\n')
        for service in selectedServices:
            self.__stopService(service)
    
    def startAll(self):
        """
        Start services; Usage: python main.py service startAll
        """
        print('Starting services...\n')
        for service in self.services:
            self.start(service)

    def stopAll(self):
        """
        Stop services; Usage: python main.py service stopAll
        """
        for service in self.services:
            self.stop(service)

    def __checkServiceArgument(self, services):
        undefinedService = [item for item in services if item not in self.services]
        if len(undefinedService) != 0:
            raise Exception('%s is/are not defined as service' % ",".join(undefinedService))
        
        
    def __startService(self, serviceName):
        if serviceName == 'jupyter':
            os.system('docker-compose -f %s/docker-compose.jupyter.yml up -d' % self.absPath)
        elif serviceName == 'nest':
            os.system('docker-compose -f %s/docker-compose.nest.yml up -d' % self.absPath)
        elif serviceName == 'smartcontract':
            os.system('docker-compose -f %s/docker-compose.smartcontract.yml up -d' % self.absPath)
        elif serviceName == 'smartmeter':
            os.system('docker-compose -f %s/docker-compose.smartmeter.yml up -d' % self.absPath)
        elif serviceName == 'forecast':
            os.system('docker-compose -f %s/docker-compose.forecast.yml up -d' % self.absPath)
        elif serviceName == 'fabric':
            os.system('docker-compose -f %s/fabric-server-nest/artifacts/docker-compose.yaml up -d' % self.absPath)
        
    def __stopService(self, serviceName):
        if serviceName == 'jupyter':
            os.system('docker-compose -f %s/docker-compose.jupyter.yml down' % self.absPath)
        elif serviceName == 'nest':
            os.system('docker-compose -f %s/docker-compose.nest.yml down' % self.absPath)
        elif serviceName == 'smartcontract':
            os.system('docker-compose -f %s/docker-compose.smartcontract.yml down' % self.absPath)
        elif serviceName == 'smartmeter':
            os.system('docker-compose -f %s/docker-compose.smartmeter.yml down' % self.absPath)
        elif serviceName == 'forecast':
            os.system('docker-compose -f %s/docker-compose.forecast.yml down' % self.absPath)
        elif serviceName == 'fabric':
            os.system('docker-compose -f %s/fabric-server-nest/artifacts/docker-compose.yaml down' % self.absPath)        
