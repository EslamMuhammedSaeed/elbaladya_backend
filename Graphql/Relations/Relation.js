const {
  AdminRelations,
  StudentRelations,
  DeviceRelations,
  CourseRelations,
  StudentCourseRelations,
  CertificateRelations,
} = require("../../Resolvers");

const Relations = {
  ...AdminRelations,
  ...StudentRelations,
  ...DeviceRelations,
  ...CourseRelations,
  ...StudentCourseRelations,
  ...CertificateRelations,
};

module.exports = Relations;
