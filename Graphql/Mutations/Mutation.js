const {
  AdminMutations,
  StudentMutations,
  DeviceMutations,
  CourseMutations,
  StudentCourseMutations,
  CertificateMutations,
  GroupMutations,
  DashboardMutations
} = require("../../Resolvers");

const Mutation = {
  ...AdminMutations,
  ...StudentMutations,
  ...DeviceMutations,
  ...CourseMutations,
  ...StudentCourseMutations,
  ...CertificateMutations,
  ...GroupMutations,
  ...DashboardMutations
};

module.exports = Mutation;
