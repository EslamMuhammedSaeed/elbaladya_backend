// Import queries, mutations, and relations from each model's resolver file
const { AdminQueries, AdminMutations, AdminRelations } = require("./Admin");

const {
  StudentQueries,
  StudentMutations,
  StudentRelations,
} = require("./Students");

const {
  DeviceQueries,
  DeviceMutations,
  DeviceRelations,
} = require("./Devices");

const {
  CourseQueries,
  CourseMutations,
  CourseRelations,
} = require("./Courses");

const {
  StudentCourseQueries,
  StudentCourseMutations,
  StudentCourseRelations,
} = require("./StudentCourses");

const {
  CertificateQueries,
  CertificateMutations,
  CertificateRelations,
} = require("./Certificates");

// Export queries, mutations, and relations for centralized use
module.exports = {
  // Queries
  AdminQueries,
  StudentQueries,
  DeviceQueries,
  CourseQueries,
  StudentCourseQueries,
  CertificateQueries,

  // Mutations
  AdminMutations,
  StudentMutations,
  DeviceMutations,
  CourseMutations,
  StudentCourseMutations,
  CertificateMutations,

  // Relations
  AdminRelations,
  StudentRelations,
  DeviceRelations,
  CourseRelations,
  StudentCourseRelations,
  CertificateRelations,
};
