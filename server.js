import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs";

dotenv.config();

//!graphql의 sdl!
//Apollo 서버는 서버 생성 이전에 반드시 type의 형태에 대해서 미리 알려줘야 한다.
//사용자가 요청하는 모든 것이 type Query안에 있어야한다.
//scalar 타입: 유저가 요청가능한 타입들 type typeName{...}
//scalar 타입 내부에 key의 타입 지정은 key:keyType으로 한다. 이때 keyType!라고 쓰면 non nullable variable이 된다.(반드시 null이 안된다는 판단이 선다면 사용할 것)
//type Mutation: 유저가 보낸 데이터로 수행하는 동작들을 모두 넣는 곳(rest의 post, put, delete 등등)
//Mutation들을 Query에 넣어도 문제는 없다. 하지만 graphql의 의도를 맞추기 위해서 Mutation에 넣어주는 것이 좋다.
//type Query: root type으로 반드시 존재해야한다.(rest의 get)
const typeDefs = `
  type User{
    id:ID!
    username:String!
  }
  type Tweet{
    id:ID!
    text:String!
    creator:User!
  }
  type Query {
    allTweets:[Tweet!]!
    tweet(id:ID!):Tweet
  }
  type Mutation{
    postTweet(text:String!, userId:ID!):Tweet!
    deleteTweet(id:ID!):Boolean!
  }
`;

//위 함수에 대한 내부 로직 구현
const resolvers = {
  Query: {
    tweet() {
      console.log("I'm called");
      return null;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  playground: true,
});
await server.start();

const app = express();
app.use(
  "/graphql",
  cors(),
  express.json(),
  express.urlencoded({ extended: true }),
  expressMiddleware(server)
);
let httpsServer = https.createServer(
  {
    key: fs.readFileSync(`${process.env.SSL_KEY}`),
    cert: fs.readFileSync(process.env.SSL_CERT),
  },
  app
);

await new Promise((resolve) =>
  httpsServer.listen({ port: process.env.PORT }, resolve)
);
console.log(
  `Server ready at ${process.env.HOST_NAME}:${process.env.PORT}/graphql`
);
