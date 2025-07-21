const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # Define the main types
  scalar Upload
  type Admin {
    id: ID!
    name: String!
    email: String!
    hashedPassword: String!
    devices: [Device!]!
    students: [Student!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Student {
    id: ID!
    name: String!
    email: String!
    facultyId: String!
    hashedPassword: String!
    phone: String!
    profilePicture: String
    deviceId: String
    device: Device
    adminId: String!
    admin: Admin!
    hadTutorial: Boolean!
    lastAttempt: DateTime
    courses: [StudentCourse!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    badge: Int
    ponits: Int
    certificates: [Certificates!]!
  }
  type Certificates {
    id: ID!
    studentId: String!
    student: Student
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Device {
    id: ID!
    name: String!
    macAddress: String!
    studentId: String
    adminId: String
    student: Student
    admin: Admin
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Course {
    id: ID!
    arabicName: String!
    englishName: String!
    picture: String!
    students: [StudentCourse!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    numberOfExams: Int
    numberofAssignments: Int
  }

  type StudentCourse {
    id: ID!
    studentId: String!
    courseId: String!
    progress: Float!
    testResult: Int!
    trainingResult: Int!
    numberOfAttempts: Int!
    numberOfAttemptsOnTests: Int!
    timeSpentTraining: Int!
    timeSpentOnExams: Int!
    student: Student!
    course: Course!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input StudentFilters {
    id: String
    name: String
    grade: String
    phase: String
  }
  # Custom Scalar Type
  scalar DateTime

  # Define the queries for fetching data
  type Query {
    getAdminById(id: ID!): Admin
    getStudentById(id: ID!): Student
    getDeviceById(id: ID!): Device
    getCourseById(id: ID!): Course
    getStudentCourseById(id: ID!): StudentCourse

    getAllAdmins: [Admin!]!
    getAllStudents: [Student!]!
    getAllStudentsPaginated(
      page: Int
      perPage: Int
      sortBy: String
      filters: StudentFilters
    ): StudentPagination!
    getAllDevices: [Device!]!
    getAllCourses: [Course!]!
    getAllCoursesPaginated(page: Int, perPage: Int, sortBy: String): CoursePagination!
    getAllStudentCourses: [StudentCourse!]!
    getStudentCourseByStudentIdAndCourseId(
      studentId: String!
      courseId: String!
    ): StudentCourse
    getAlllCertificates: [Certificates!]!
    getCertificateById(id: ID!): Certificates
  }
  type CoursePagination {
    data: [Course!]!
    total: Int!
    per_page: Int!
    current_page: Int!
    last_page: Int!
  }
  type StudentPagination {
    data: [Student!]!
    total: Int!
    per_page: Int!
    current_page: Int!
    last_page: Int!
  }  
  # Define mutations for creating, updating, and deleting data
  type Mutation {
    # Admin mutations
    createAdmin(name: String!, email: String!, hashedPassword: String!): Admin!
    updateAdmin(
      id: ID!
      name: String
      email: String
      hashedPassword: String
    ): Admin!
    deleteAdmin(id: ID!): Admin!
    adminLogin(
      email: String!
      hashedPassword: String!
      macAddress: String
      deviceName: String
    ): Admin!

    # Student mutations
    createStudent(
      name: String!
      email: String!
      facultyId: String!
      hashedPassword: String!
      phone: String!
      adminId: String!
      profilePicture: Upload
      hadTutorial: Boolean
      lastAttempt: DateTime
      badge: Int
      ponits: Int
    ): Student!
    updateStudent(
      id: ID!
      name: String
      email: String
      facultyId: String
      hashedPassword: String
      phone: String
      profilePicture: Upload
      hadTutorial: Boolean
      lastAttempt: DateTime
      badge: Int
      ponits: Int
    ): Student!
    deleteStudent(id: ID!): Student!
    studentLogin(
      facultyId: String!
      password: String!
      macAddress: String!
    ): Student!
    studentLoginWithPhone(
      phone: String!
      macAddress: String!
    ): Student!
    studentLogout(facultyId: String!): Student!

    # Device mutations
    createDevice(
      name: String!
      macAddress: String!
      studentId: String
      adminId: String
    ): Device!
    updateDevice(
      id: ID!
      name: String
      macAddress: String
      studentId: String
      adminId: String
    ): Device!
    deleteDevice(id: ID!): Device!

    # Course mutations
    createCourse(
      arabicName: String!
      englishName: String!
      picture: Upload!
      numberOfExams: Int
      numberofAssignments: Int
    ): Course!
    updateCourse(
      id: ID!
      arabicName: String
      englishName: String
      picture: Upload
      numberOfExams: Int
      numberofAssignments: Int
    ): Course!
    deleteCourse(id: ID!): Course!

    # StudentCourse mutations
    createStudentCourse(
      studentId: String!
      courseId: String!
      progress: Float
      grade: Int
      testResult: Int
      trainingResult: Int
      numberOfAttempts: Int
      lastAttempt: DateTime
      timeSpentTraining: Int
      timeSpentOnExams: Int
    ): StudentCourse!
    updateStudentCourse(
      studentId: String!
      courseId: String!
      progress: Float
      testResult: Int
      trainingResult: Int
      numberOfAttempts: Int
      numberOfAttemptsOnTests: Int
      lastAttempt: DateTime
      timeSpentTraining: Int
      timeSpentOnExams: Int
    ): StudentCourse!
    deleteStudentCourse(id: ID!): StudentCourse!

    # Certificates mutations
    createCertificate(studentId: String!): Certificates!
    deleteCertificate(id: ID!): Certificates!
  }
`;

module.exports = typeDefs;
