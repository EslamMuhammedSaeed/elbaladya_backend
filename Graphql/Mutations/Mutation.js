const {
  AdminMutations,
  StudentMutations,
  DeviceMutations,
  CourseMutations,
  StudentCourseMutations,
  CertificateMutations,
  GroupMutations
} = require("../../Resolvers");

const Mutation = {
  ...AdminMutations,
  ...StudentMutations,
  ...DeviceMutations,
  ...CourseMutations,
  ...StudentCourseMutations,
  ...CertificateMutations,
  ...GroupMutations
};

module.exports = Mutation;
