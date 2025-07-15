const Query = require("./Queries/Query");
const Mutation = require("./Mutations/Mutation");
const Relations = require("./Relations/Relation");
const { GraphQLUpload } = require("graphql-upload");

const resolvers = {
  Upload: GraphQLUpload,
  Query,
  Mutation,
  ...Relations,
};

module.exports = resolvers;
