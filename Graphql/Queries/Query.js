const {
  AdminQueries,
  StudentQueries,
  DeviceQueries,
  CourseQueries,
  StudentCourseQueries,
  CertificateQueries,
  GroupQueries,
} = require("../../Resolvers");

const Query = {
  ...AdminQueries,
  ...StudentQueries,
  ...DeviceQueries,
  ...CourseQueries,
  ...StudentCourseQueries,
  ...CertificateQueries,
  ...GroupQueries,
};

module.exports = Query;
