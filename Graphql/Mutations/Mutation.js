const {
  AdminMutations,
  StudentMutations,
  DeviceMutations,
  CourseMutations,
  StudentCourseMutations,
  CertificateMutations,
} = require("../../Resolvers");

const Mutation = {
  ...AdminMutations,
  ...StudentMutations,
  ...DeviceMutations,
  ...CourseMutations,
  ...StudentCourseMutations,
  ...CertificateMutations,
};

module.exports = Mutation;
