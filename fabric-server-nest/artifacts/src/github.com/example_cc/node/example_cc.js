/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('========= example_cc Init =========');
    return shim.success();
  }

  async Invoke(stub) {
    console.info('========= example_cc Invoke =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.error('no method of name:' + ret.fcn + ' found');
      return shim.error('no method of name:' + ret.fcn + ' found');
    }

    console.info('\nCalling method : ' + ret.fcn);
    try {
      let payload = await method(stub, ret.params);
      // return shim.success('Hello')
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async createRound(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }
    const id = args[0];
    const modifyDate = args[1];
    await stub.putState(id, Buffer.from(JSON.stringify({
      buy: [],
      sell: [],
      result: [],
      modifyDate,
    })));
  }

  async addSellerBid(stub, args) {
    if (args.length != 4) {
      throw new Error('Incorrect number of arguments. Expecting 4');
    }
    const roundId = args[0];
    const sellerId = args[1];
    const price = args[2];
    const timestamp = args[3];
    const result = await stub.getState(roundId);
    if (!result) {
      throw new Error(`Result with id ${roundId} not found`);
    }
    const resultObject = JSON.parse(result.toString());
    resultObject.sell.push({
      id: sellerId,
      price,
      timestamp,
    });
    await stub.putState(roundId, Buffer.from(JSON.stringify(resultObject)));
  }

  async addBuyerBid(stub, args) {
    if (args.length != 4) {
      throw new Error('Incorrect number of arguments. Expecting 4');
    }
    const roundId = args[0];
    const buyerId = args[1];
    const price = args[2];
    const timestamp = args[3];
    const result = await stub.getState(roundId);
    if (!result) {
      throw new Error(`Result with id ${roundId} not found`);
    }
    const resultObject = JSON.parse(result.toString());
    resultObject.buy.push({
      id: buyerId,
      price,
      timestamp,
    });
    await stub.putState(roundId, Buffer.from(JSON.stringify(resultObject)));
  }

  async getRound(stub, args) {
    let id = args[0];
    let result = await stub.getState(id);
    return result;
  }
};

shim.start(new Chaincode());
