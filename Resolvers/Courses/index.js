const prisma = require("../../config/database");
const { readFile } = require("../../Middlewares/file");

const CourseQueries = {
  getCourseById: async (_, { id }) => {
    return await prisma.course.findUnique({ where: { id } });
  },
  getAllCourses: async () => {
    return await prisma.course.findMany();
  },

  getAllCoursesPaginated: async (_, { page = 1, perPage = 10, sortBy }) => {

    if (sortBy === "arabicName" || sortBy === "englishName") {
      const skip = (page - 1) * perPage;

      // Define allowed fields based on your actual model
      const allowedFields = ["arabicName", "englishName", "createdAt", "updatedAt"];

      // Only sort if valid field is provided
      const orderField = allowedFields.includes(sortBy) ? sortBy : null;

      const [data, total] = await Promise.all([
        prisma.course.findMany({
          ...(orderField && {
            orderBy: {
              [orderField]: "desc", // always descending
            },
          }),
          skip,
          take: perPage,
          include: {
            students: true,
          },
        }),
        prisma.course.count(),
      ]);

      return {
        data,
        total,
        per_page: perPage,
        current_page: page,
        last_page: Math.ceil(total / perPage),
      };
    }

    const courses = await prisma.course.findMany({
      include: { students: true },
    });

    // Step 1: Enrich data with derived fields
    const enriched = courses.map((course) => {
      const entranceCount = course.students.reduce(
        (sum, student) =>
          sum + student.numberOfAttempts + student.numberOfAttemptsOnTests,
        0
      );

      const totalSpendedHours = course.students.reduce(
        (sum, student) =>
          sum + student.timeSpentOnExams + student.timeSpentTraining,
        0
      );

      const numberOfTrainees = course.students.length;

      const numberOfPassedTrainees = course.students.filter(
        (student) => student.testResult > 0 || student.trainingResult > 0
      ).length;

      const precentage = course.students.length
        ? course.students.reduce((sum, student) => {
          const testResult = student.testResult || 0;
          const trainingResult = student.trainingResult || 0;
          return (
            sum +
            (testResult > 0 && trainingResult > 0
              ? (testResult + trainingResult) / 2
              : testResult || trainingResult)
          );
        }, 0) / course.students.length
        : 0;

      const gradeKey =
        precentage >= 90
          ? "excellent"
          : precentage >= 80
            ? "very_good"
            : precentage >= 70
              ? "good"
              : precentage >= 50
                ? "passed"
                : "failed";

      return {
        ...course,
        entranceCount,
        totalSpendedHours,
        numberOfTrainees,
        numberOfPassedTrainees,
        precentage,
        gradeKey,
      };
    });

    // Step 2: Sort by derived field if needed
    const validSorts = [
      "entranceCount",
      "precentage",
      "totalSpendedHours",
      "numberOfTrainees",
      "numberOfPassedTrainees",
      "grade",
    ];

    if (sortBy && validSorts.includes(sortBy)) {
      enriched.sort((a, b) => {
        if (sortBy === "grade") {
          const gradeOrder = {
            excellent: 5,
            very_good: 4,
            good: 3,
            passed: 2,
            failed: 1,
          };
          return gradeOrder[b.gradeKey] - gradeOrder[a.gradeKey];
        } else {
          return (b[sortBy] || 0) - (a[sortBy] || 0); // descending
        }
      });
    }

    // Step 3: Paginate manually
    const total = enriched.length;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    const paginated = enriched.slice(start, end);

    return {
      data: paginated,
      total,
      per_page: perPage,
      current_page: page,
      last_page: Math.ceil(total / perPage),
    };
  }


};

const CourseMutations = {
  createCourse: async (
    _,
    { arabicName, englishName, picture, numberOfExams, numberofAssignments }
  ) => {
    if (picture) picture = await readFile(picture);
    const course = prisma.course.create({
      data: {
        arabicName,
        englishName,
        picture,
        numberOfExams,
        numberofAssignments,
      },
    });
    return course;
  },
  updateCourse: async (
    _,
    { id, arabicName, englishName, picture, numberOfExams, numberofAssignments }
  ) => {
    if (picture) picture = await readFile(picture);
    const course = prisma.course.update({
      where: { id },
      data: {
        arabicName,
        englishName,
        picture,
        numberofAssignments,
        numberOfExams,
      },
    });
    return course;
  },
  deleteCourse: async (_, { id }) => {
    return await prisma.course.delete({ where: { id } });
  },
};

const CourseRelations = {
  Course: {
    students: async (parent) => {
      return prisma.studentCourse.findMany({ where: { courseId: parent.id } });
    },
  },
};

module.exports = {
  CourseQueries,
  CourseMutations,
  CourseRelations,
};
