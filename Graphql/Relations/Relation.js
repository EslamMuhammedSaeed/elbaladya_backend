const {
  AdminRelations,
  StudentRelations,
  DeviceRelations,
  CourseRelations,
  StudentCourseRelations,
  CertificateRelations,
  DashboardRelations,
} = require("../../Resolvers");

const Relations = {
  ...AdminRelations,
  ...StudentRelations,
  ...DeviceRelations,
  ...CourseRelations,
  ...StudentCourseRelations,
  ...CertificateRelations,
  ...DashboardRelations
};

module.exports = Relations;
