echo "\n\n=========== Stopping docker-compose services ===========\n"

docker-compose -f fabric-server-nest/artifacts/docker-compose.yaml down
docker-compose -f docker-compose.nest.yml down 


echo "============== Removing fabric user files ==============\n"

if [  -d "./fabric-server-nest/fabric-client-kv-building"  ]; then
  rm -r ./fabric-server-nest/fabric-client-kv-building
fi

if [  -d "./fabric-server-nest/fabric-client-kv-pv"  ]; then
  rm -r ./fabric-server-nest/fabric-client-kv-pv
fi

if [  -d "./fabric-server-nest/fabric-client-kv-utility"  ]; then
  rm -r ./fabric-server-nest/fabric-client-kv-utility
fi


echo "=============== Removing docker volumes ================\n"

docker volume prune -f


echo "=========== Starting docker-compose services ===========\n"

docker-compose -f docker-compose.nest.yml up -d
docker-compose -f fabric-server-nest/artifacts/docker-compose.yaml up -d
