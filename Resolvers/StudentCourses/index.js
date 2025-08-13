const prisma = require("../../config/database");

const StudentCourseQueries = {
  getStudentCourseById: async (_, { id }) =>
    prisma.studentCourse.findUnique({ where: { id } }),
  getAllStudentCourses: () => prisma.studentCourse.findMany(),
  getStudentCourseByStudentIdAndCourseId: async (
    _,
    { studentId, courseId }
  ) => {
    // find the lastest record
    const record = await prisma.studentCourse.findFirst({
      where: {
        studentId,
        courseId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return record;
  },
};

const StudentCourseMutations = {
  createStudentCourse: async (
    _,
    {
      studentId,
      courseId,
      progress = 0.0,
      testResult = 0,
      trainingResult = 0,
      numberOfAttemptsOnTests = 0,
      timeSpentTraining = 0,
      timeSpentOnExams = 0,
    }
  ) =>
    prisma.studentCourse.create({
      data: {
        studentId,
        courseId,
        progress,
        testResult,
        trainingResult: 0,
        numberOfAttemptsOnTests,
        lastAttempt,
        timeSpentTraining,
        timeSpentOnExams,
      },
    }),
  updateStudentCourse: async (
    _,
    {
      studentId,
      courseId,
      progress,
      testResult,
      trainingResult,
      numberOfAttempts,
      numberOfAttemptsOnTests,
      timeSpentTraining,
      timeSpentOnExams,
    }
  ) => {
    // Check if a record already exists for the given studentId and courseId
    const existingRecord = await prisma.studentCourse.findFirst({
      where: {
        studentId,
        courseId,
      },
    });
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student) {
      prisma.student.update({
        where: { id: studentId },
        data: {
          lastAttempt: new Date(),
        },
      });
    }
    if (existingRecord) {
      // const isGradeUpdated =
      //   testResult !== undefined && testResult !== existingRecord.testResult;

      // Prepare data for update, incrementing numberOfAttempts and setting lastAttempt if needed
      const updateData = {
        numberOfAttemptsOnTests,
        numberOfAttempts,
        progress,
        testResult,
        trainingResult,
        timeSpentTraining,
        timeSpentOnExams,
      };

      // Update the existing record
      return prisma.studentCourse.update({
        where: { id: existingRecord.id },
        data: updateData,
      });
    } else {
      // If no record exists, create a new one
      return prisma.studentCourse.create({
        data: {
          studentId,
          courseId,
          progress,
          testResult,
          numberOfAttempts,
          trainingResult,
          numberOfAttemptsOnTests: 0,
          timeSpentTraining,
          timeSpentOnExams,
        },
      });
    }
  },
  updateStudentCourseMain: async (
    _,
    {
      id,
      progress,
      testResult,
      trainingResult,
      numberOfAttempts,
      numberOfAttemptsOnTests,
      timeSpentTraining,
      timeSpentOnExams,
    }
  ) => {
    // Check if a record already exists for the given studentId and courseId
    const existingRecord = await prisma.studentCourse.findFirst({
      where: {
        id,
      },
    });
    const student = await prisma.student.findUnique({ where: { id: existingRecord.studentId } });
    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          lastAttempt: new Date(),
        },
      });
    }
    if (existingRecord) {
      // const isGradeUpdated =
      //   testResult !== undefined && testResult !== existingRecord.testResult;

      // Prepare data for update, incrementing numberOfAttempts and setting lastAttempt if needed
      const updateData = {
        numberOfAttemptsOnTests,
        numberOfAttempts,
        progress,
        testResult,
        trainingResult,
        timeSpentTraining,
        timeSpentOnExams,
      };

      // Update the existing record
      return prisma.studentCourse.update({
        where: { id: existingRecord.id },
        data: updateData,
      });
    } else {
      throw new Error("Record not found");

    }
  },
};

const StudentCourseRelations = {
  StudentCourse: {
    student: (parent) =>
      prisma.student.findUnique({ where: { id: parent.studentId } }),
    course: (parent) =>
      prisma.course.findUnique({ where: { id: parent.courseId } }),
  },
};

module.exports = {
  StudentCourseQueries,
  StudentCourseMutations,
  StudentCourseRelations,
};
