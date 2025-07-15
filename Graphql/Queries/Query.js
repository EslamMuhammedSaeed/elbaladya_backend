const {
  AdminQueries,
  StudentQueries,
  DeviceQueries,
  CourseQueries,
  StudentCourseQueries,
  CertificateQueries,
} = require("../../Resolvers");

const Query = {
  ...AdminQueries,
  ...StudentQueries,
  ...DeviceQueries,
  ...CourseQueries,
  ...StudentCourseQueries,
  ...CertificateQueries,
};

module.exports = Query;
