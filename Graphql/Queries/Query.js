const {
  AdminQueries,
  StudentQueries,
  DeviceQueries,
  CourseQueries,
  StudentCourseQueries,
  CertificateQueries,
  GroupQueries,
  DashboardQueries,
} = require("../../Resolvers");

const Query = {
  ...AdminQueries,
  ...StudentQueries,
  ...DeviceQueries,
  ...CourseQueries,
  ...StudentCourseQueries,
  ...CertificateQueries,
  ...GroupQueries,
  ...DashboardQueries
};

module.exports = Query;
