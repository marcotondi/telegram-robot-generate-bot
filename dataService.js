"use strict";
const config = require("./config");

var AWS = require("aws-sdk"),
  documentClient = new AWS.DynamoDB.DocumentClient();

function registerUser(msg) {
  let user_id = msg.chat.id;

  var paramsPut = {
    TableName: process.env.TABLE_NAME,
    Item: {
      user_id: user_id,
      name_bot: config.nameBot,
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
      username: msg.from.username,
      language_code: msg.from.language_code,
      chat_id: msg.chat.id,
    },
  };

  documentClient.put(paramsPut, function (err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });
}

async function getUser(uid) {
  let params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      user_id: uid,
      name_bot: config.nameBot,
    },
  };

  let user = {};

  await documentClient
    .get(params, function (err, data) {
      if (err) {
        console.log("GET DynamoDB ERROR: \n" + JSON.stringify(err, null, 2));
      } else {
        user = data.Item;
        console.log("User:\n" + JSON.stringify(user));
      }
    })
    .promise();

  return user;
}

async function getUserList() {
  let users = [];

  var params = {
    TableName: process.env.TABLE_NAME,
  };

  await documentClient
    .scan(params, function (err, data) {
      if (err) {
        console.log("GET DynamoDB ERROR: \n" + JSON.stringify(err, null, 2));
      } else {
        data.Items.forEach(function (item) {
          users.push(item);
        });
      }
    })
    .promise();

  return users.map(function (user) {
    return user.user_id;
  });
}

module.exports = {
  registerUser,
  getUser,
  getUserList,
};
