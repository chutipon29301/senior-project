jq --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
	echo "Please Install 'jq' https://stedolan.github.io/jq/ to execute this script"
	echo
	exit 1
fi

URL="http://localhost:3000"

echo "=============== Create user ================\n"

BUILDING_ID=$(echo $(curl -s -X POST \
  $URL/user \
  -H "content-type: application/json" \
  -d '{
    "name": "Building1",
    "organizationName": "Building"
  }') | jq ".id" | sed "s/\"//g")

echo "BuildingID:\t $BUILDING_ID"

PV_ID=$(echo $(curl -s -X POST \
  $URL/user \
  -H "content-type: application/json" \
  -d '{
    "name": "Pv1",
    "organizationName": "PV"
  }') | jq ".id" | sed "s/\"//g")

echo "PVID:\t\t $PV_ID"

UTILITY_ID=$(echo $(curl -s -X POST \
  $URL/user \
  -H "content-type: application/json" \
  -d '{
    "name": "Utility1",
    "organizationName": "Utility"
  }') | jq ".id" | sed "s/\"//g")

echo "UtilityID:\t $UTILITY_ID"

echo "\n\n================= Get Token ================\n"

BUILDING_TOKEN=$(echo $(curl -s -X POST \
  $URL/auth/token \
  -H "content-type: application/json" \
  -d '{
    "id": "'$BUILDING_ID'"
  }') | jq ".token" | sed "s/\"//g")

echo "BuildingToken:\n$BUILDING_TOKEN\n"

PV_TOKEN=$(echo $(curl -s -X POST \
  $URL/auth/token \
  -H "content-type: application/json" \
  -d '{
    "id": "'$PV_ID'"
  }') | jq ".token" | sed "s/\"//g")

echo "PVToken:\n$PV_TOKEN\n"

UTILITY_TOKEN=$(echo $(curl -s -X POST \
  $URL/auth/token \
  -H "content-type: application/json" \
  -d '{
    "id": "'$UTILITY_ID'"
  }') | jq ".token" | sed "s/\"//g")

echo "UtilityToken:\n$UTILITY_TOKEN"

echo "\n\n============== Config channel ==============\n"

CREATE_CHANNEL_RESPONSE=$(curl -o /dev/null -s -w "%{http_code}\n" -s -X POST \
  $URL/fabric/channel \
  -H "content-type: application/json" \
  -H "authorization: Bearer $BUILDING_TOKEN"
)

echo "Create channel:\t\t\t\t $CREATE_CHANNEL_RESPONSE"

BUILDING_JOIN_CHANNEL_RESPONSE=$(curl -o /dev/null -s -w "%{http_code}\n" -s -X POST \
  $URL/fabric/channel/join \
  -H "content-type: application/json" \
  -H "authorization: Bearer $BUILDING_TOKEN"
)
echo "Building org join channel:\t\t $BUILDING_JOIN_CHANNEL_RESPONSE"

PV_JOIN_CHANNEL_RESPONSE=$(curl -o /dev/null -s -w "%{http_code}\n" -s -X POST \
  $URL/fabric/channel/join \
  -H "content-type: application/json" \
  -H "authorization: Bearer $PV_TOKEN"
)

echo "PV org join channel:\t\t\t $PV_JOIN_CHANNEL_RESPONSE"

UTILITY_JOIN_CHANNEL_RESPONSE=$(curl -o /dev/null -s -w "%{http_code}\n" -s -X POST \
  $URL/fabric/channel/join \
  -H "content-type: application/json" \
  -H "authorization: Bearer $UTILITY_TOKEN"
)

echo "Utility org join channel:\t\t $UTILITY_JOIN_CHANNEL_RESPONSE"

echo "\n\n============ Install chaincode =============\n"

BUILDING_INSTALL_CHAINCODE_RESPONSE=$(curl -o /dev/null -s -w "%{http_code}\n" -s -X POST \
  $URL/fabric/chaincode/install \
  -H "content-type: application/json" \
  -H "authorization: Bearer $BUILDING_TOKEN" \
)

echo "Building org install chaincode:\t\t $BUILDING_INSTALL_CHAINCODE_RESPONSE"

PV_INSTALL_CHAINCODE_RESPONSE=$(curl -o /dev/null -s -w "%{http_code}\n" -s -X POST \
  $URL/fabric/chaincode/install \
  -H "content-type: application/json" \
  -H "authorization: Bearer $PV_TOKEN" \
)

echo "PV org install chaincode:\t\t $PV_INSTALL_CHAINCODE_RESPONSE"

UTILITY_INSTALL_CHAINCODE_RESPONSE=$(curl -o /dev/null -s -w "%{http_code}\n" -s -X POST \
  $URL/fabric/chaincode/install \
  -H "content-type: application/json" \
  -H "authorization: Bearer $UTILITY_TOKEN" \
)

echo "PV org install chaincode:\t\t $UTILITY_INSTALL_CHAINCODE_RESPONSE"

echo "\n\n========== Instantiate chaincode ===========\n"

INSTANTIATE_CHAINCODE_RESPONSE=$(curl -o /dev/null -s -w "%{http_code}\n" -s -X POST \
  $URL/fabric/chaincode/instantiate \
  -H "content-type: application/json" \
  -H "authorization: Bearer $UTILITY_TOKEN"
)
echo "Instantiate chaincode:\t\t\t $INSTANTIATE_CHAINCODE_RESPONSE"

echo "\n\n================= Summary ==================\n"
echo "BuildingID:\t $BUILDING_ID"
echo "BuildingToken:\n$BUILDING_TOKEN\n"
echo "PVID:\t\t $PV_ID"
echo "PVToken:\n$PV_TOKEN\n"
echo "UtilityID:\t $UTILITY_ID"
echo "UtilityToken:\n$UTILITY_TOKEN"