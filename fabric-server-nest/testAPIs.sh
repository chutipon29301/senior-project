rm -r fabric-server-nest/fabric-client-kv-*

echo "POST enroll user on Org1"
echo
curl -s -X POST \
http://localhost:3000/user \
-H "content-type: application/json" \
  -d '{
	"username":"Jim",
	"organizationName":"Org1"
}'

echo "POST enroll user on Org2"
echo
curl -s -X POST \
http://localhost:3000/user \
-H "content-type: application/json" \
  -d '{
	"username":"Barry",
	"organizationName":"Org2"
}'


echo "POST request Create channel  ..."
echo
curl -s -X POST \
  http://localhost:3000/channel \
  -H "content-type: application/json" \
  -d '{
	"channelName":"mychannel",
	"username":"Jim",
	"organizationName":"Org1"
}'
echo
sleep 5

echo "POST request Join channel on Org1"
echo
curl -s -X POST \
  http://localhost:3000/channel/join \
  -H "content-type: application/json" \
  -d '{
	"channelName":"mychannel",
  "username":"Jim",
	"organizationName":"Org1",
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"]
}'
echo

echo "POST request Join channel on Org2"
echo
curl -s -X POST \
  http://localhost:3000/channel/join \
  -H "content-type: application/json" \
  -d '{
	"channelName":"mychannel",
  "username":"Barry",
	"organizationName":"Org2",
	"peers": ["peer0.org2.example.com","peer1.org2.example.com"]
}'
echo

echo "POST request Update anchor peers on Org1"
echo
curl -s -X POST \
  http://localhost:3000/channel/mychannel/anchorpeers \
  -H "content-type: application/json" \
  -d '{
	"configUpdatePath":"Org1MSPanchors.tx",
  "username":"Jim",
	"organizationName":"Org1"
}'
echo

echo "POST request Update anchor peers on Org2"
echo
curl -s -X POST \
  http://localhost:3000/channel/mychannel/anchorpeers \
  -H "content-type: application/json" \
  -d '{
	"configUpdatePath":"Org2MSPanchors.tx",
  "username":"Barry",
	"organizationName":"Org2"
}'
echo

echo "POST Install chaincode on Org1"
echo
curl -s -X POST \
  http://localhost:3000/chaincode \
  -H "content-type: application/json" \
  -d '{
  "username":"Jim",
	"organizationName":"Org1",
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"]
}'
echo

echo "POST Install chaincode on Org2"
echo
curl -s -X POST \
  http://localhost:3000/chaincode \
  -H "content-type: application/json" \
  -d '{
  "username":"Barry",
	"organizationName":"Org2",
	"peers": ["peer0.org2.example.com","peer1.org2.example.com"]
}'
echo


echo "POST instantiate chaincode on Org1"
echo
curl -s -X POST \
  http://localhost:3000/chaincode/instantiate/mychannel \
  -H "content-type: application/json" \
  -d '{
      "username":"Jim",
	    "organizationName":"Org1",
	    "args":["a","100","b","200"]
  }'
echo
echo

echo "POST invoke chaincode on peers of Org1 and Org2"
echo
curl -s -X POST \
  http://localhost:3000/chaincode/invoke/mychannel/mycc \
  -H "content-type: application/json" \
  -d '{
      "username":"Jim",
      "organizationName":"Org1",
      "peers": ["peer0.org1.example.com","peer0.org2.example.com"],
      "fcn":"move",
      "args":["a","b","10"]
  }'
echo


echo "GET query chaincode on peer1 of Org1"
echo
curl -s -X GET \
  "http://localhost:3000/chaincode/onPeer/mychannel/mycc?peer=peer0.org1.example.com&fcn=query&args=%5B%22a%22%5D&username=Jim&orgName=Org1" \
  -H "content-type: application/json"
echo
echo

# echo "GET query Block by blockNumber"
# echo
# BLOCK_INFO=$(curl -s -X GET \
#   "http://localhost:3000/chaincode/block/mychannel/1?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
#   -H "content-type: application/json")
# echo $BLOCK_INFO
# # Assign previous block hash to HASH
# HASH=$(echo $BLOCK_INFO | jq -r ".header.previous_hash")
# echo

# echo "GET query Transaction by TransactionID"
# echo
# curl -s -X GET "http://localhost:3000/chaincode/transaction/mychannel/$TRX_ID?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
#   -H "content-type: application/json"
# echo
# echo


# # echo "GET query Block by Hash - Hash is $HASH"
# # echo
# # curl -s -X GET \
# #   "http://localhost:3000/chaincode/mychannel/blocks?hash=$HASH&peer=peer0.org1.example.com" \
# #   -H "cache-control: no-cache" \
# #   -H "content-type: application/json" \
# # echo
# # echo

# echo "GET query ChainInfo"
# echo
# curl -s -X GET \
#   "http://localhost:3000/chaincode/info/mychannel?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
#   -H "content-type: application/json"
# echo
# echo

# echo "GET query Installed chaincodes"
# echo
# curl -s -X GET \
#   "http://localhost:3000/chaincode/installed/mychannel?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
#   -H "content-type: application/json"
# echo
# echo

# echo "GET query Instantiated chaincodes"
# echo
# curl -s -X GET \
#   "http://localhost:3000/chaincode/instantiated/mychannel?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
#   -H "content-type: application/json"
# echo
# echo

# echo "GET query Channels"
# echo
# curl -s -X GET \
#   "http://localhost:3000/channel?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
#   -H "content-type: application/json"
# echo
# echo