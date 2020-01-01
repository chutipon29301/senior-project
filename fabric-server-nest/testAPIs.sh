echo "POST request Enroll on Org1  ..."
echo
ORG1_TOKEN=$(curl -s -X POST \
  http://localhost:3000/user \
  -H "content-type: application/x-www-form-urlencoded" \
  -d 'username=Jim&orgName=Org1')
echo $ORG1_TOKEN
ORG1_TOKEN=$(echo $ORG1_TOKEN | jq ".token" | sed "s/\"//g")
echo
echo "ORG1 token is $ORG1_TOKEN"
echo

echo "POST request Enroll on Org2 ..."
echo
ORG2_TOKEN=$(curl -s -X POST \
  http://localhost:3000/user \
  -H "content-type: application/x-www-form-urlencoded" \
  -d 'username=Barry&orgName=Org2')
echo $ORG2_TOKEN
ORG2_TOKEN=$(echo $ORG2_TOKEN | jq ".token" | sed "s/\"//g")
echo
echo "ORG2 token is $ORG2_TOKEN"
echo
echo

echo "POST request Create channel  ..."
echo
curl -s -X POST \
  http://localhost:3000/channel \
  -H "content-type: application/json" \
  -d '{
	"channelName":"mychannel",
	"username":"Jim",
	"orgName":"Org1"
}'
echo
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
	"orgName":"Org1",
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"]
}'
echo
echo

echo "POST request Join channel on Org2"
echo
curl -s -X POST \
  http://localhost:3000/channel/join \
  -H "content-type: application/json" \
  -d '{
	"channelName":"mychannel",
    "username":"Barry",
	"orgName":"Org2",
	"peers": ["peer0.org2.example.com","peer1.org2.example.com"]
}'
echo
echo


echo "POST request Update anchor peers on Org1"
echo
curl -s -X POST \
  http://localhost:3000/channel/mychannel/anchorpeers \
  -H "content-type: application/json" \
  -d '{
	"configUpdatePath":"Org1MSPanchors.tx",
    "username":"Jim",
	"orgName":"Org1"
}'
echo
echo

echo "POST request Update anchor peers on Org2"
echo
curl -s -X POST \
  http://localhost:3000/channel/mychannel/anchorpeers \
  -H "content-type: application/json" \
  -d '{
	"configUpdatePath":"Org2MSPanchors.tx",
    "username":"Barry",
	"orgName":"Org2"
}'
echo
echo

echo "POST Install chaincode on Org1"
echo
curl -s -X POST \
  http://localhost:3000/chaincode \
  -H "content-type: application/json" \
  -d '{
    "username":"Jim",
	"orgName":"Org1",
	"peers": ["peer0.org1.example.com","peer1.org1.example.com"]
}'
echo
echo

echo "POST Install chaincode on Org2"
echo
curl -s -X POST \
  http://localhost:3000/chaincode \
  -H "content-type: application/json" \
  -d '{
    "username":"Barry",
	"orgName":"Org2",
	"peers": ["peer0.org2.example.com","peer1.org2.example.com"]
}'
echo
echo


echo "POST instantiate chaincode on Org1"
echo
curl -s -X POST \
  http://localhost:3000/chaincode/instantiate/mychannel \
  -H "content-type: application/json" \
  -d '{
      "username":"Jim",
	    "orgName":"Org1",
	    "args":["a","100","b","200"]
  }'
echo
echo

echo "POST invoke chaincode on peers of Org1 and Org2"
echo
VALUES=$(curl -s -X POST \
  http://localhost:3000/chaincode/invoke/mychannel/mycc \
  -H "content-type: application/json" \
  -d "{
  \"username\":\"Jim\",
	\"orgName\":\"Org1\",
  \"peers\": [\"peer0.org1.example.com\",\"peer0.org2.example.com\"],
  \"fcn\":\"move\",
  \"args\":[\"a\",\"b\",\"10\"]
}")
echo $VALUES
# Assign previous invoke transaction id  to TRX_ID
MESSAGE=$(echo $VALUES | jq -r ".message")
TRX_ID=${MESSAGE#*ID:}
echo $TRX_ID
echo


echo "GET query chaincode on peer1 of Org1"
echo
curl -s -X GET \
  "http://localhost:3000/chaincode/onPeer/mychannel/mycc?peer=peer0.org1.example.com&fcn=query&args=%5B%22a%22%5D&username=Jim&orgName=Org1" \
  -H "content-type: application/json"
echo
echo

echo "GET query Block by blockNumber"
echo
BLOCK_INFO=$(curl -s -X GET \
  "http://localhost:3000/chaincode/block/mychannel/1?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
  -H "content-type: application/json")
echo $BLOCK_INFO
# Assign previous block hash to HASH
HASH=$(echo $BLOCK_INFO | jq -r ".header.previous_hash")
echo

echo "GET query Transaction by TransactionID"
echo
curl -s -X GET "http://localhost:3000/chaincode/transaction/mychannel/$TRX_ID?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
  -H "content-type: application/json"
echo
echo


# echo "GET query Block by Hash - Hash is $HASH"
# echo
# curl -s -X GET \
#   "http://localhost:3000/chaincode/mychannel/blocks?hash=$HASH&peer=peer0.org1.example.com" \
#   -H "cache-control: no-cache" \
#   -H "content-type: application/json" \
# echo
# echo

echo "GET query ChainInfo"
echo
curl -s -X GET \
  "http://localhost:3000/chaincode/info/mychannel?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
  -H "content-type: application/json"
echo
echo

echo "GET query Installed chaincodes"
echo
curl -s -X GET \
  "http://localhost:3000/chaincode/installed/mychannel?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
  -H "content-type: application/json"
echo
echo

echo "GET query Instantiated chaincodes"
echo
curl -s -X GET \
  "http://localhost:3000/chaincode/instantiated/mychannel?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
  -H "content-type: application/json"
echo
echo

echo "GET query Channels"
echo
curl -s -X GET \
  "http://localhost:3000/channel?peer=peer0.org1.example.com&username=Jim&orgName=Org1" \
  -H "content-type: application/json"
echo
echo