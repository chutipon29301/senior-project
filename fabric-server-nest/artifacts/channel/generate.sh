#!/bin/sh
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
export PATH=$GOPATH/src/github.com/hyperledger/fabric/build/bin:${PWD}/../../../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
CHANNEL_NAME=mychannel

# remove previous crypto material and config transactions
# rm -fr config/*
rm -fr crypto-config/*

# generate crypto material
cryptogen generate --config=./cryptogen.yaml
if [ "$?" -ne 0 ]; then
  echo "Failed to generate crypto material..."
  exit 1
fi

# generate genesis block for orderer
configtxgen -profile ThreeOrgsOrdererGenesis -outputBlock ./genesis.block
if [ "$?" -ne 0 ]; then
  echo "Failed to generate orderer genesis block..."
  exit 1
fi

# generate channel configuration transaction
configtxgen -profile ThreeOrgsChannel -outputCreateChannelTx ./mychannel.tx -channelID $CHANNEL_NAME
if [ "$?" -ne 0 ]; then
  echo "Failed to generate channel configuration transaction..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./BuildingMSPanchors.tx -channelID $CHANNEL_NAME -asOrg BuildingMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for BuildingMSP..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./PVMSPanchors.tx -channelID $CHANNEL_NAME -asOrg PVMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for PVMSP..."
  exit 1
fi

# generate anchor peer transaction
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./UtilityMSPanchors.tx -channelID $CHANNEL_NAME -asOrg UtilityMSP
if [ "$?" -ne 0 ]; then
  echo "Failed to generate anchor peer update for UtilityMSP..."
  exit 1
fi
