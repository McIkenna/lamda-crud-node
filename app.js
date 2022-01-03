const db = require("./db");
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand

} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall} = require("@aws-sdk/util-dynamodb");
const e = require("express");

const getPost = async (event) => {
  const response = {statusCode: 200};
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      key: marshall({postId: event.pathParameters.postid})
    };
    const {Item} = await db.send(new GetItemCommand(params));
    console.group({item});
    response.body = JSON.stringify({
      message: "Successfully retrieved post",
      data: (Item) ? unmarshall(Item) : {},
      rawData: Item,
    })
  }catch(err){
    console.error(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to get post.",
      errorMsg: err.message,
      errorStack: err.stack
    })
  }
  return response
};

const createPost = async (event) => {
  const response = {statusCode: 200};
  try {
    const body = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      key: marshall(body || {})
    };
    const createResult = await db.send(new PutItemCommand(params));
   
    response.body = JSON.stringify({
      message: "Successfully craeated post",
      createResult,
    })
  }catch(err){
    console.error(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to create post.",
      errorMsg: err.message,
      errorStack: err.stack
    })
  }
  return response
}

const updatePost = async (event) => {
  const response = {statusCode: 200};
  try {
    const body = JSON.parse(event.body);
    const objKeys = object.keys
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      key: marshall({postId: event.pathParameters.postId}),
      updateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`)}`,
      ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
        ...acc, [`#key${index}`]: key,
      }), {}),
      ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index)=>({
        ...acc,
        [`:value${index}`]: body[key],
      }), {})),

    };
    const updateResult = await db.send(new UpdateItemCommand(params));
   
    response.body = JSON.stringify({
      message: "Successfully updated post",
      updateResult,
    })
  }catch(err){
    console.error(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to update post.",
      errorMsg: err.message,
      errorStack: err.stack
    })
  }
  return response
}

const deletePost = async (event) => {
  const response = {statusCode: 200};
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      key: marshall({postId: event.pathParameters.postId})
      }
    const deleteResult = await db.send(new DeleteItemCommand(params));
   
    response.body = JSON.stringify({
      message: "Successfully deleted post",
      deleteResult,
    })
  }catch(err){
    console.error(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to delete post.",
      errorMsg: err.message,
      errorStack: err.stack
    })
  }
  return response
}

const getAllPost = async (event) => {
  const response = {statusCode: 200};
  try {
    const params = process.env.DYNAMODB_TABLE_NAME
      
    const {Items} = await db.send(new ScanCommand(params));
   
    response.body = JSON.stringify({
      message: "Successfully retrieved all post",
      data: Items.map((item) => unmarshall(item)),
      Items
    })
  }catch(err){
    console.error(err);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to retrieve post.",
      errorMsg: err.message,
      errorStack: err.stack
    })
  }
  return response
}

module.exports ={
  getPost,
  createPost,
  updatePost,
  deletePost,
  getAllPost
}