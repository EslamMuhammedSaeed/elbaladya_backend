const prisma = require("../../config/database");
// const { readFile } = require("../../Middlewares/file");

const DashboardQueries = {

  // getDashboardData: async () => {

  //   // 1. Number of students
  //   const totalStudents = await prisma.student.count();

  //   // 2. Students with courses progress > 0
  //   const studentsWithProgress = await prisma.studentCourse.findMany({
  //     where: { progress: { gt: 0 } },
  //     select: { studentId: true },
  //     distinct: ['studentId']
  //   });
  //   const studentsWithProgressCount = studentsWithProgress.length;
  //   const studentsWithProgressPercentage = totalStudents > 0
  //     ? (studentsWithProgressCount / totalStudents) * 100
  //     : 0;

  //   // 3. Total timeSpentTraining for all courses
  //   const totalTimeSpentTraining = await prisma.studentCourse.aggregate({
  //     _sum: { timeSpentTraining: true }
  //   });

  //   // 4. Number of studentcourses with progress = 100
  //   const completedCoursesCount = await prisma.studentCourse.count({
  //     where: { progress: 1 }
  //   });
  //   const completedCoursesPercentage = await prisma.studentCourse.count().then(totalSC =>
  //     totalSC > 0 ? (completedCoursesCount / totalSC) * 100 : 0
  //   );

  //   // 5. All courses with stats
  //   const coursesData = await prisma.studentCourse.groupBy({
  //     by: ['courseId'],
  //     _count: { studentId: true },
  //     _sum: { timeSpentTraining: true, numberOfAttempts: true, trainingResult: true },
  //   });

  //   // Get course names
  //   const courses = await prisma.course.findMany({
  //     select: { id: true, arabicName: true, englishName: true }
  //   });

  //   // Map with percentage of trainingResult
  //   const totalTrainingResultByCourse = coursesData.map(courseStat => {
  //     const course = courses.find(c => c.id === courseStat.courseId);
  //     const avgTrainingResult = courseStat._count.studentId > 0
  //       ? (courseStat._sum.trainingResult ?? 0) / courseStat._count.studentId
  //       : 0;
  //     return {
  //       id: course?.id,
  //       arabicName: course?.arabicName,
  //       englishName: course?.englishName,
  //       studentCount: courseStat._count.studentId,
  //       totalTimeSpentTraining: courseStat._sum.timeSpentTraining ?? 0,
  //       totalNumberOfAttempts: courseStat._sum.numberOfAttempts ?? 0,
  //       averageTrainingResultPercentage: avgTrainingResult
  //     };
  //   });

  //   // 6. Training Result Categories
  //   const totalStudentCourses = await prisma.studentCourse.count({
  //     where: {
  //       trainingResult: { gte: 0, lte: 100 }
  //     }
  //   });

  //   const trainingCategories = {
  //     excellent: 0,
  //     veryGood: 0,
  //     good: 0,
  //     passed: 0,
  //     failed: 0
  //   };

  //   const categorizedResults = await prisma.studentCourse.groupBy({
  //     by: ['trainingResult'],
  //     _count: { trainingResult: true },
  //     where: {
  //       trainingResult: { gte: 0, lte: 100 }
  //     }
  //   });

  //   categorizedResults.forEach(item => {
  //     const result = item.trainingResult;
  //     if (result >= 90) trainingCategories.excellent += item._count.trainingResult;
  //     else if (result >= 80) trainingCategories.veryGood += item._count.trainingResult;
  //     else if (result >= 70) trainingCategories.good += item._count.trainingResult;
  //     else if (result >= 60) trainingCategories.passed += item._count.trainingResult;
  //     else trainingCategories.failed += item._count.trainingResult;
  //   });

  //   const trainingResultCategoryPercentages = {
  //     excellent: totalStudentCourses > 0 ? (trainingCategories.excellent / totalStudentCourses) * 100 : 0,
  //     veryGood: totalStudentCourses > 0 ? (trainingCategories.veryGood / totalStudentCourses) * 100 : 0,
  //     good: totalStudentCourses > 0 ? (trainingCategories.good / totalStudentCourses) * 100 : 0,
  //     passed: totalStudentCourses > 0 ? (trainingCategories.passed / totalStudentCourses) * 100 : 0,
  //     failed: totalStudentCourses > 0 ? (trainingCategories.failed / totalStudentCourses) * 100 : 0
  //   };

  //   return {
  //     totalStudents,
  //     studentsWithProgressCount,
  //     studentsWithProgressPercentage,
  //     totalTimeSpentTraining: totalTimeSpentTraining._sum.timeSpentTraining ?? 0,
  //     completedCoursesCount,
  //     completedCoursesPercentage,
  //     trainingResultCategoryPercentages,
  //     courses: totalTrainingResultByCourse,
  //   };
  // }
  getDashboardData: async () => {
    const totalStudents = await prisma.student.count();

    const studentsWithProgress = await prisma.studentCourse.findMany({
      where: { progress: { gt: 0 } },
      select: { studentId: true },
      distinct: ['studentId']
    });
    const studentsWithProgressCount = studentsWithProgress.length;
    const studentsWithProgressPercentage = totalStudents > 0
      ? (studentsWithProgressCount / totalStudents) * 100
      : 0;

    const totalTimeSpentTraining = await prisma.studentCourse.aggregate({
      _sum: { timeSpentTraining: true }
    });

    const completedCoursesCount = await prisma.studentCourse.count({
      where: { progress: 1 }
    });
    const completedCoursesPercentage = await prisma.studentCourse.count().then(totalSC =>
      totalSC > 0 ? (completedCoursesCount / totalSC) * 100 : 0
    );

    const coursesData = await prisma.studentCourse.groupBy({
      by: ['courseId'],
      _count: { studentId: true },
      _sum: { timeSpentTraining: true, numberOfAttempts: true, trainingResult: true },
    });

    const courses = await prisma.course.findMany({
      select: { id: true, arabicName: true, englishName: true }
    });

    const totalTrainingResultByCourse = coursesData.map(courseStat => {
      const course = courses.find(c => c.id === courseStat.courseId);
      const avgTrainingResult = courseStat._count.studentId > 0
        ? (courseStat._sum.trainingResult ?? 0) / courseStat._count.studentId
        : 0;
      return {
        id: course?.id,
        arabicName: course?.arabicName,
        englishName: course?.englishName,
        studentCount: courseStat._count.studentId,
        totalTimeSpentTraining: courseStat._sum.timeSpentTraining ?? 0,
        totalNumberOfAttempts: courseStat._sum.numberOfAttempts ?? 0,
        averageTrainingResultPercentage: avgTrainingResult
      };
    });

    // 👇 Add this part for category percentages
    const trainingResults = await prisma.studentCourse.findMany({
      where: { trainingResult: { gte: 0, lte: 100 }, progress: { gte: 1 }, },
      select: { trainingResult: true }
    });

    const categoryCounts = {
      excellent: 0,
      veryGood: 0,
      good: 0,
      passed: 0,
      failed: 0
    };

    for (const { trainingResult } of trainingResults) {
      if (trainingResult >= 85) categoryCounts.excellent++;
      else if (trainingResult >= 75) categoryCounts.veryGood++;
      else if (trainingResult >= 65) categoryCounts.good++;
      else if (trainingResult >= 50) categoryCounts.passed++;
      else categoryCounts.failed++;
    }

    const total = trainingResults.length || 1;

    const trainingResultCategories = Object.entries(categoryCounts).map(
      ([label, count]) => ({
        label,
        percentage: (count / total) * 100
      })
    );

    return {
      totalStudents,
      studentsWithProgressCount,
      studentsWithProgressPercentage,
      totalTimeSpentTraining: totalTimeSpentTraining._sum.timeSpentTraining ?? 0,
      completedCoursesCount,
      completedCoursesPercentage,
      courses: totalTrainingResultByCourse,
      trainingResultCategories
    };
  },
  getVisionData: async (_, { groupId = null }) => {

    if (groupId === "all") {
      groupId = null;
    }

    const totalTrainingsWithStudents = await prisma.course.count({
      where: { students: { some: { student: { groupId: groupId || undefined } } } },
    });

    const totalCourses = await prisma.course.count();

    const totalTrainingsWithStudentsPercentage = totalTrainingsWithStudents / totalCourses * 100;


    const activeTrainings = await prisma.course.count({
      where: {
        students: {
          some: {
            progress: { gt: 0 },
            student: {
              groupId: groupId || undefined
            }
          }
        }
      }
    });

    const activeTrainingsPercentage = activeTrainings / totalCourses * 100;

    const overallTrainingsSuccessPercentage = await prisma.studentCourse.count({
      where: {
        trainingResult: { gte: 50, lte: 100 },
        student: {
          groupId: groupId || undefined
        }
      }
    }) / await prisma.studentCourse.count() * 100;

    const overallTrainingsCompletedPercentage = await prisma.studentCourse.count({
      where: {
        progress: { gte: 1 },
        student: {
          groupId: groupId || undefined
        }
      }
    }) / await prisma.studentCourse.count() * 100;



    return {
      totalTrainingsWithStudents,
      activeTrainings,
      overallTrainingsSuccessPercentage,
      overallTrainingsCompletedPercentage,
      totalTrainingsWithStudentsPercentage,
      activeTrainingsPercentage
    }



  },

  getUsersData: async (_, { groupId = null }) => {
    if (groupId === "all") {
      groupId = null;
    }

    const totalAdmins = await prisma.admin.count();
    const totalStudents = await prisma.student.count({
      where: {
        groupId: groupId || undefined
      }
    });
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const totalStudentsLastMonthIncrease = await prisma.student.count({
      where: {
        groupId: groupId || undefined,
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    const totalStudentsLastMonthIncreasePercentage =
      totalStudents > 0
        ? (totalStudentsLastMonthIncrease / totalStudents) * 100
        : 0;
    const totalUsers = totalAdmins + totalStudents;

    return {
      totalUsers,
      totalAdmins,
      totalStudents,
      totalStudentsLastMonthIncreasePercentage
    }
  },

  getCoursesData: async (_, { groupId = null }) => {
    if (groupId === "all") {
      groupId = null;
    }
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const totalCourses = await prisma.course.count();

    const totalCoursesLastMonthIncrease = await prisma.course.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    const totalCoursesLastMonthIncreasePercentage =
      totalCourses > 0
        ? (totalCoursesLastMonthIncrease / totalCourses) * 100
        : 0;

    const totalGroups = await prisma.group.count();

    const totalGroupsLastMonthIncrease = await prisma.group.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    const totalGroupsLastMonthIncreasePercentage =
      totalGroups > 0
        ? (totalGroupsLastMonthIncrease / totalGroups) * 100
        : 0;

    const totalExamsAgg = await prisma.course.aggregate({
      _sum: { numberOfExams: true }
    });
    const totalAssignmentsAgg = await prisma.course.aggregate({
      _sum: { numberofAssignments: true }
    });

    const totalExams = totalExamsAgg._sum.numberOfExams || 0;
    const totalAssignments = totalAssignmentsAgg._sum.numberofAssignments || 0;

    return {
      totalCourses,
      totalCoursesLastMonthIncreasePercentage,
      totalGroups,
      totalGroupsLastMonthIncreasePercentage,
      totalExams,
      totalAssignments
    }


  },
  getStudentCoursesTimeSpentTrainingData: async (_, { groupId = null }) => {
    if (groupId === "all") {
      groupId = null;
    }

    const timeSpentTraining = await prisma.studentCourse.aggregate({
      _sum: { timeSpentTraining: true },
      where: {
        student: {
          groupId: groupId || undefined
        }
      }
    });

    // Top 5 courses by time spent
    const topCourses = await prisma.studentCourse.groupBy({
      by: ["courseId"],
      _sum: { timeSpentTraining: true },
      where: {
        student: {
          groupId: groupId || undefined
        }
      },
      orderBy: {
        _sum: {
          timeSpentTraining: "desc"
        }
      },
      take: 5
    });

    // Fetch course details
    const courseIds = topCourses.map(c => c.courseId);
    const coursesDetails = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, arabicName: true, englishName: true }
    });

    // Merge details with summed time
    const topCoursesWithDetails = topCourses.map(tc => {
      const course = coursesDetails.find(c => c.id === tc.courseId);
      return {
        id: tc.courseId,
        arabicName: course?.arabicName || "Unknown",
        englishName: course?.englishName || "Unknown",
        timeSpentTraining: tc._sum.timeSpentTraining || 0
      };
    });

    return {
      timeSpentTraining: timeSpentTraining._sum.timeSpentTraining || 0,
      topCourses: topCoursesWithDetails
    };
  },
  getStudentCoursesData: async (_, { groupId = null }) => {
    if (groupId === "all") {
      groupId = null;
    }
    const totalCourses = await prisma.studentCourse.count({
      where: {
        student: {
          groupId: groupId || undefined
        }
      }
    });

    const totalSuccessfulCourses = await prisma.studentCourse.count({
      where: {
        trainingResult: { gte: 50, lte: 100 },
        progress: { gte: 1 },
        student: {
          groupId: groupId || undefined
        }
      }
    });
    const totalFailedCourses = await prisma.studentCourse.count({
      where: {
        trainingResult: { lt: 50 },
        progress: { gte: 1 },
        student: {
          groupId: groupId || undefined
        }
      }
    });
    const totalOnGoingCourses = await prisma.studentCourse.count({
      where: {
        progress: { lt: 1 },
        student: {
          groupId: groupId || undefined
        }
      }
    });

    const totalSuccessfulCoursesPercentage = totalCourses > 0 ? ((totalSuccessfulCourses || 0) / totalCourses) * 100 : 0;
    const totalFailedCoursesPercentage = totalCourses > 0 ? ((totalFailedCourses || 0) / totalCourses) * 100 : 0;

    const totalOnGoingCoursesPercentage = totalCourses > 0 ? ((totalOnGoingCourses || 0) / totalCourses) * 100 : 0;
    return {
      totalCourses,
      totalSuccessfulCourses,
      totalSuccessfulCoursesPercentage,
      totalFailedCourses,
      totalFailedCoursesPercentage,
      totalOnGoingCourses,
      totalOnGoingCoursesPercentage
    }
  },
  getTopStudentsData: async (_, { groupId = null }) => {
    if (groupId === "all") {
      groupId = null;
    }

    const topStudentsRaw = await prisma.student.findMany({
      where: {
        groupId: groupId || undefined
      },
      orderBy: {
        points: "desc"
      },
      select: {
        id: true,
        name: true,
        points: true,
        badges: true,
        _count: {
          select: { certificates: true }
        }
      },
      take: 3
    });

    // Map to match GraphQL expected fields
    const topStudents = topStudentsRaw.map(student => ({
      id: student.id,
      name: student.name,
      points: student.points,
      badges: student.badges,
      certificates: student._count.certificates // flatten the count
    }));

    return {
      topStudents
    }
  },
  searchModel: async (_, { search }) => {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        facultyId: true,
      },
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { facultyId: { contains: search, mode: 'insensitive' } },
        ],
      },
    });
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        arabicName: true,
        englishName: true,
      },
      where: {
        OR: [
          { arabicName: { contains: search, mode: 'insensitive' } },
          { englishName: { contains: search, mode: 'insensitive' } },
        ],
      }
    });
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }
    });
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        OR: [
          { id: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }
    });
    return { students, courses, groups, admins };
  }

};

const DashboardMutations = {
};

const DashboardRelations = {

};

module.exports = {
  DashboardQueries,
  DashboardMutations,
  DashboardRelations,
};
