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