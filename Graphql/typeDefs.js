const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # Define the main types
  scalar Upload
  
  # Authentication types
  type AuthPayload {
    token: String!
    admin: Admin!
  }
  
  # Custom directives
  directive @auth on FIELD_DEFINITION
  directive @admin on FIELD_DEFINITION
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
    badges: Int
    points: Int
    certificates: [Certificates!]!
  }
  type Certificates {
    id: ID!
    studentId: String!
    courseId: String
    course: Course
    student: Student
    date: String
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
  type CourseDashboard {
    id: ID!
    arabicName: String!
    englishName: String!
    studentCount: Int!                    
    totalTimeSpentTraining: Float!       
    totalNumberOfAttempts: Int!          
    averageTrainingResultPercentage: Float!
  }
  type TrainingResultCategory {
    label: String!
    percentage: Float!
  }

  type Dashboard {
    totalStudents: Int!
    studentsWithProgressCount: Int!
    studentsWithProgressPercentage: Float!
    totalTimeSpentTraining: Float!
    completedCoursesCount: Int!
    completedCoursesPercentage: Float!
    courses: [CourseDashboard!]
    trainingResultCategories: [TrainingResultCategory!]!
  }

  type VisionData {
    totalTrainingsWithStudents: Int!
    activeTrainings: Int!
    overallTrainingsSuccessPercentage: Float!
    overallTrainingsCompletedPercentage: Float!
    totalTrainingsWithStudentsPercentage: Float!
    activeTrainingsPercentage: Float!
  }

  type UsersData {
    totalUsers: Int!
    totalAdmins: Int!
    totalStudents: Int!
    totalStudentsLastMonthIncreasePercentage: Float!
  }

  type CoursesData {

    totalCourses: Int!
    totalCoursesLastMonthIncreasePercentage: Float!
    totalGroups: Int!
    totalGroupsLastMonthIncreasePercentage: Float!
    totalExams: Int!
    totalAssignments: Int!
  }

  type StudentCoursesTimeSpentTrainingData {
    timeSpentTraining: Int!
    topCourses: [TopCourse!]!
  }

  type TopCourse {
    id: ID!
    arabicName: String!
    englishName: String!
    timeSpentTraining: Int!
  }

  type StudentCoursesData {
    totalCourses: Int!
    totalSuccessfulCourses: Int!
    totalSuccessfulCoursesPercentage: Float!
    totalFailedCourses: Int!
    totalFailedCoursesPercentage: Float!
    totalOnGoingCourses: Int!
    totalOnGoingCoursesPercentage: Float!
  }

  type TopStudentsData {
    topStudents: [TopStudent!]!
  }

  type TopStudent {
    id: ID!
    name: String!
    points: Int!
    badges: Int!
    certificates: Int!
  }

  type SearchModel {
    students: [Student!]!
    courses: [Course!]!
    groups: [Group!]!
    admins: [Admin!]!
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
    getDashboardData: Dashboard @auth
    getVisionData(groupId: String): VisionData @auth
    getUsersData(groupId: String): UsersData @auth
    getCoursesData(groupId: String): CoursesData @auth
    getStudentCoursesTimeSpentTrainingData(groupId: String): StudentCoursesTimeSpentTrainingData @auth
    getStudentCoursesData(groupId: String): StudentCoursesData @auth
    getTopStudentsData(groupId: String): TopStudentsData @auth
    getAdminById(id: ID!): Admin @auth
    searchModel(search: String): SearchModel @auth
    getAllAdminsPaginated(
      page: Int
      perPage: Int
      sortBy: String
      filters: AdminFilters
    ): AdminPagination! @auth
    getAllAdminsNotPaginated(
      sortBy: String
      filters: AdminFilters
    ): AdminList! @auth
    getAllGroupsPaginated(
      page: Int
      perPage: Int
      sortBy: String
      filters: GroupFilters
    ): GroupPagination! @auth
    getAllGroups(
      sortBy: String
      filters: GroupFilters
    ): GroupList! @auth
    getAllStudentGroups(
      sortBy: String
      filters: GroupFilters
    ): GroupList! @auth
    getAllAdminGroups(
      sortBy: String
      filters: GroupFilters
    ): GroupList! @auth
    getStudentById(id: ID!): Student @auth
    getDeviceById(id: ID!): Device @auth
    getCourseById(id: ID!): Course @auth
    getStudentCourseById(id: ID!): StudentCourse @auth

    getAllAdmins: [Admin!]! @auth
    getAllStudents: [Student!]! @auth
    getAllStudentsPaginated(
      page: Int
      perPage: Int
      sortBy: String
      filters: StudentFilters
    ): StudentPagination! @auth
    getAllStudentsNotPaginated(
      sortBy: String
      filters: StudentFilters
    ): StudentList! @auth
    getAllDevices: [Device!]! @auth
    getAllCourses: [Course!]! @auth
    getAllCoursesPaginated(page: Int, perPage: Int, sortBy: String): CoursePagination! @auth
    getAllStudentCourses: [StudentCourse!]! @auth
    getStudentCourseByStudentIdAndCourseId(
      studentId: String!
      courseId: String!
    ): StudentCourse @auth
    getAlllCertificates: [Certificates!]! @auth
    getCertificateById(id: ID!): Certificates @auth
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
    createAdmin(name: String!, email: String!, hashedPassword: String!, groupId: String): Admin! @auth
    updateAdmin(
      id: ID!
      name: String
      email: String
      hashedPassword: String
    ): Admin! @auth
    deleteAdmin(id: ID!): Admin! @auth
    adminLogin(
      email: String!
      hashedPassword: String!
      macAddress: String
      deviceName: String
    ): Admin!
    adminLoginMain(
      email: String!
      hashedPassword: String!
      macAddress: String
      deviceName: String
    ): AuthPayload!
    # Group mutations
    createGroup(name: String!, category: String): Group! @auth
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
      points: Int
    ): Student! @auth
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
      points: Int
    ): Student! @auth
    bulkCreateStudents(file: Upload!): BulkStudentResult! @auth
    bulkCreateAdmins(file: Upload!): BulkAdminResult! @auth

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
      points: Int
    ): Student! @auth
    updateStudentMain(
      id: ID!
      name: String
      groupId: String
      adminId: String
      facultyId: String
      phone: String
      stage: String  
      points: Int
      badges: Int
    ): Student! @auth
    deleteStudent(id: ID!): Student! @auth
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
    ): Device! @auth
    updateDevice(
      id: ID!
      name: String
      macAddress: String
      studentId: String
      adminId: String
    ): Device! @auth
    deleteDevice(id: ID!): Device! @auth

    # Course mutations
    createCourse(
      arabicName: String!
      englishName: String!
      picture: Upload!
      numberOfExams: Int
      numberofAssignments: Int
    ): Course! @auth
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
    createCertificateMain(studentId: String!, courseId: String!, date: String): Certificates!
    deleteCertificate(id: ID!): Certificates!
  }
`;

module.exports = typeDefs;
