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
    groupId: String
    group: Group
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Group {
    id: ID!
    name: String!
    category: String!
    students: [Student!]!
    admins: [Admin!]!
    usersCount: Int!  
  }

  type Student {
    id: ID!
    name: String!
    email: String
    facultyId: String!
    hashedPassword: String
    phone: String!
    profilePicture: String
    deviceId: String
    device: Device
    adminId: String!
    groupId: String
    group: Group
    admin: Admin!
    stage: String
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
  type BulkStudentResult {
    successCount: Int!
    failed: [FailedStudent!]!
  }

  type FailedStudent {
    row: Int!
    reason: String!
    name: String
    phone: String
    facultyId: String
  }
  type BulkAdminResult {
    successCount: Int!
    failed: [FailedAdmin!]!
  }
  type FailedAdmin {
    row: Int!
    reason: String!
    name: String
    email: String
  }

  input StudentFilters {
    id: String
    name: String
    grade: String
    phase: String
    group: String
    stage: String
  }
  input AdminFilters {
    id: String
    name: String
    group: String
    email: String
  }
  input GroupFilters {
    id: String
    name: String
  }
  # Custom Scalar Type
  scalar DateTime

  # Define the queries for fetching data
  type Query {
    getAdminById(id: ID!): Admin
    getAllAdminsPaginated(
      page: Int
      perPage: Int
      sortBy: String
      filters: AdminFilters
    ): AdminPagination!
    getAllAdminsNotPaginated(
      sortBy: String
      filters: AdminFilters
    ): AdminList!
    getAllGroupsPaginated(
      page: Int
      perPage: Int
      sortBy: String
      filters: GroupFilters
    ): GroupPagination!
    getAllGroups(
      sortBy: String
      filters: GroupFilters
    ): GroupList!
    getAllStudentGroups(
      sortBy: String
      filters: GroupFilters
    ): GroupList!
    getAllAdminGroups(
      sortBy: String
      filters: GroupFilters
    ): GroupList!
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
    getAllStudentsNotPaginated(
      sortBy: String
      filters: StudentFilters
    ): StudentList!
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
  type StudentList {
    data: [Student!]!
  }
  type AdminPagination {
    data: [Admin!]!
    total: Int!
    per_page: Int!
    current_page: Int!
    last_page: Int!
  }
  type AdminList {
    data: [Admin!]!
  }
  type GroupPagination {
    data: [Group!]!
    total: Int!
    per_page: Int!
    current_page: Int!
    last_page: Int!
  }   
  type GroupList {
    data: [Group!]!
  }   
  # Define mutations for creating, updating, and deleting data
  type Mutation {
    # Admin mutations
    createAdmin(name: String!, email: String!, hashedPassword: String!, groupId: String): Admin!
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
    adminLoginMain(
      email: String!
      hashedPassword: String!
    ): Admin!
    # Group mutations
    createGroup(name: String!, category: String): Group!
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
    createStudentMain(
      name: String!
      groupId: String!
      facultyId: String!
      phone: String!
      adminId: String!
      stage: String
      hadTutorial: Boolean
      lastAttempt: DateTime
      badge: Int
      ponits: Int
    ): Student!
    bulkCreateStudents(file: Upload!): BulkStudentResult!
    bulkCreateAdmins(file: Upload!): BulkAdminResult!

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
    updateStudentMain(
      id: ID!
      name: String
      groupId: String
      adminId: String
      facultyId: String
      phone: String
      stage: String  
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
    updateStudentCourseMain(
      id: ID!
      progress: Float
      testResult: Float
      trainingResult: Float
      numberOfAttempts: Int
      numberOfAttemptsOnTests: Int
      timeSpentTraining: Float
      timeSpentOnExams: Float
    ): StudentCourse!
    deleteStudentCourse(id: ID!): StudentCourse!

    # Certificates mutations
    createCertificate(studentId: String!): Certificates!
    deleteCertificate(id: ID!): Certificates!
  }
`;

module.exports = typeDefs;
