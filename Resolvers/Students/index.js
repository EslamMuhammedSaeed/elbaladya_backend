const prisma = require("../../config/database");
const csv = require("csv-parser");
const {
  generatePassword,
  validatePassword,
} = require("../../Middlewares/password");
const { readFile } = require("../../Middlewares/file");
const StudentQueries = {
  getStudentById: async (_, { id }) =>
    prisma.student.findUnique({ where: { id } }),

  getAllStudents: () => prisma.student.findMany(),

  getAllStudentsPaginated: async (_, { page = 1, perPage = 10, sortBy, filters = {} }) => {
    const prismaFilters = {};

    if (filters.id) {
      prismaFilters.id = { contains: filters.id };
    }

    if (filters.name) {
      prismaFilters.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }
    if (filters.group) {
      prismaFilters.groupId = filters.group;
    }

    if (filters.stage) {
      prismaFilters.stage = filters.stage;
    }

    const students = await prisma.student.findMany({
      where: prismaFilters,
      include: { courses: true, group: true },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const enriched = students
      .map((student) => {
        const group = student.group;
        const totalNumberOfTraingings = student.courses.reduce(
          (sum, course) => sum + course.numberOfAttempts,
          0
        );

        const totalNumberOfHours = student.courses.reduce(
          (sum, course) => sum + course.timeSpentTraining,
          0
        );

        const percentage = student.courses.length
          ? student.courses.reduce((sum, course) => sum + course.testResult, 0) /
          student.courses.length
          : 0;

        const gradeKey =
          percentage >= 90
            ? "excellent"
            : percentage >= 80
              ? "very_good"
              : percentage >= 70
                ? "good"
                : percentage >= 50
                  ? "passed"
                  : "failed";

        return {
          ...student,
          group,
          totalNumberOfTraingings,
          totalNumberOfHours,
          percentage,
          gradeKey,
        };
      })
      .filter((student) => {
        const gradeMatch =
          !filters.grade || filters.grade === "all"
            ? true
            : student.gradeKey === filters.grade;

        const phaseMatch =
          !filters.phase || filters.phase === "all"
            ? true
            : student.phase === filters.phase; // adjust if phase is elsewhere

        return gradeMatch && phaseMatch;
      });

    const validSorts = [
      "name",
      "totalNumberOfTraingings",
      "percentage",
      "totalNumberOfHours",
      "lastAttempt",
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
        } else if (sortBy === "name") {
          return b.name.localeCompare(a.name);
        } else if (sortBy === "lastAttempt") {
          return new Date(b.lastAttempt || 0) - new Date(a.lastAttempt || 0);
        } else {
          return (b[sortBy] || 0) - (a[sortBy] || 0);
        }
      });
    }

    const total = enriched.length;
    const start = (page - 1) * perPage;
    const paginated = enriched.slice(start, start + perPage);

    return {
      data: paginated,
      total,
      per_page: perPage,
      current_page: page,
      last_page: Math.ceil(total / perPage),
    };
  },

  getAllStudentsNotPaginated: async (_, { sortBy, filters = {} }) => {
    const prismaFilters = {};

    if (filters.id) {
      prismaFilters.id = { contains: filters.id };
    }

    if (filters.name) {
      prismaFilters.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }
    if (filters.group) {
      prismaFilters.groupId = filters.group;
    }

    if (filters.stage) {
      prismaFilters.stage = filters.stage;
    }

    const students = await prisma.student.findMany({
      where: prismaFilters,
      include: { courses: true, group: true },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const enriched = students
      .map((student) => {
        const group = student.group;
        const totalNumberOfTraingings = student.courses.reduce(
          (sum, course) => sum + course.numberOfAttempts,
          0
        );

        const totalNumberOfHours = student.courses.reduce(
          (sum, course) => sum + course.timeSpentTraining,
          0
        );

        const percentage = student.courses.length
          ? student.courses.reduce((sum, course) => sum + course.testResult, 0) /
          student.courses.length
          : 0;

        const gradeKey =
          percentage >= 90
            ? "excellent"
            : percentage >= 80
              ? "very_good"
              : percentage >= 70
                ? "good"
                : percentage >= 50
                  ? "passed"
                  : "failed";

        return {
          ...student,
          group,
          totalNumberOfTraingings,
          totalNumberOfHours,
          percentage,
          gradeKey,
        };
      })
      .filter((student) => {
        const gradeMatch =
          !filters.grade || filters.grade === "all"
            ? true
            : student.gradeKey === filters.grade;

        const phaseMatch =
          !filters.phase || filters.phase === "all"
            ? true
            : student.phase === filters.phase; // adjust if phase is elsewhere

        return gradeMatch && phaseMatch;
      });

    const validSorts = [
      "name",
      "totalNumberOfTraingings",
      "percentage",
      "totalNumberOfHours",
      "lastAttempt",
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
        } else if (sortBy === "name") {
          return b.name.localeCompare(a.name);
        } else if (sortBy === "lastAttempt") {
          return new Date(b.lastAttempt || 0) - new Date(a.lastAttempt || 0);
        } else {
          return (b[sortBy] || 0) - (a[sortBy] || 0);
        }
      });
    }



    return {
      data: enriched,

    };
  }


};

const StudentMutations = {
  createStudent: async (
    _,
    {
      name,
      email,
      facultyId,
      hashedPassword,
      phone,
      adminId,
      profilePicture,
      hadTutorial,
      lastAttempt,
      badges,
      points,
    }
  ) => {
    hashedPassword = generatePassword(hashedPassword);
    if (profilePicture) profilePicture = await readFile(profilePicture);
    const student = prisma.student.create({
      data: {
        name,
        email,
        facultyId,
        hashedPassword,
        phone,
        adminId,
        hadTutorial,
        lastAttempt,
        profilePicture,
        badges,
        points,
      },
    });
    return student;
  },

  createStudentMain: async (_, { name, groupId, facultyId, phone, adminId, stage }) => {
    const checkExistsAndThrow = async (field, value, message) => {
      const exists = await prisma.student.findFirst({ where: { [field]: value } });
      if (exists) throw new Error(message);
    };

    // Run validations in parallel
    await Promise.all([
      checkExistsAndThrow("name", name, "Name already exists"),
      checkExistsAndThrow("facultyId", facultyId, "Faculty ID already exists"),
      checkExistsAndThrow("phone", phone, "Phone number already exists"),
    ]);

    // Create new student
    const student = await prisma.student.create({
      data: { name, groupId, facultyId, phone, adminId, stage },
    });

    return student;
  },

  bulkCreateStudents: async (_, { file }) => {
    const { createReadStream } = await file;
    const stream = createReadStream();

    const students = [];
    const failed = [];
    let rowNumber = 1;

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (row) => {
          rowNumber++;
          const { name, phone, facultyId, groupId, adminId, stage } = row;
          students.push({
            name: name?.trim(),
            phone: phone?.trim(),
            facultyId: facultyId?.trim(),
            groupId: groupId?.trim(),
            adminId: adminId?.trim(),
            stage: stage?.trim(),
            row: rowNumber,
          });
        })
        .on("end", async () => {
          const success = [];

          for (const s of students) {
            const { name, phone, facultyId, groupId, adminId, stage, row } = s;

            // Validate required fields
            if (!name || !phone || !facultyId || !groupId || !adminId || !stage) {
              failed.push({
                row,
                reason: "Missing required fields",
                name,
                phone,
                facultyId,
                stage
              });
              continue;
            }

            // Check for uniqueness
            const [existsName, existsPhone, existsFacultyId] = await Promise.all([
              prisma.student.findFirst({ where: { name } }),
              prisma.student.findFirst({ where: { phone } }),
              prisma.student.findFirst({ where: { facultyId } }),
            ]);

            if (existsName || existsPhone || existsFacultyId) {
              failed.push({
                row,
                reason:
                  (existsName && "Name exists") ||
                  (existsPhone && "Phone exists") ||
                  (existsFacultyId && "Faculty ID exists"),
                name,
                phone,
                facultyId,
              });
              continue;
            }

            // Insert student
            try {
              await prisma.student.create({
                data: { name, phone, facultyId, groupId, adminId, stage },
              });
              success.push(s);
            } catch (err) {
              failed.push({
                row,
                reason: "DB Error: " + err.message,
                name,
                phone,
                facultyId,
              });
            }
          }

          resolve({
            successCount: success.length,
            failed,
          });
        })
        .on("error", (error) => reject(error));
    });
  },



  updateStudent: async (
    _,
    {
      id,
      name,
      email,
      facultyId,
      hashedPassword,
      phone,
      profilePicture,
      hadTutorial,
      lastAttempt,
      badges,
      points,
    }
  ) => {
    if (hashedPassword) hashedPassword = generatePassword(hashedPassword);
    if (profilePicture) profilePicture = await readFile(profilePicture);
    const student = prisma.student.update({
      where: { id },
      data: {
        name,
        email,
        facultyId,
        hashedPassword,
        phone,
        profilePicture,
        hadTutorial,
        lastAttempt,
        badges,
        points,
      },
    });
    return student;
  },

  updateStudentMain: async (_, { id, name, groupId, facultyId, phone, adminId, stage, points, badges }) => {
    const checkExistsAndThrow = async (field, value, message) => {
      const exists = await prisma.student.findFirst({
        where: {
          [field]: value,
          NOT: { id }, // Exclude the current student
        },
      });
      if (exists) throw new Error(message);
    };

    // Run validations in parallel
    await Promise.all([
      checkExistsAndThrow("name", name, "Name already exists"),
      checkExistsAndThrow("facultyId", facultyId, "Faculty ID already exists"),
      checkExistsAndThrow("phone", phone, "Phone number already exists"),
    ]);

    // Create new student
    const student = prisma.student.update({
      where: { id },
      data: {
        name,
        facultyId,
        phone,
        groupId,
        adminId,
        stage,
        points,
        badges
      },

    });
    return student;
  },

  studentLoginWithPhone: async (_, { phone, macAddress }) => {
    // Step 1: Find the student by facultyId and include the associated device
    const student = await prisma.student.findFirst({
      where: { phone },
      include: { device: true },
    });

    if (!student) {
      throw new Error("Student not found");
    }




    // Step 3: If macAddress is provided, handle device linking
    if (macAddress) {
      // Step 3a: Find the device by macAddress
      const device = await prisma.device.findUnique({
        where: { macAddress },
      });

      if (!device) {
        throw new Error("Device not found");
      }

      // Step 3b: Check if the device is already linked to another student
      // if (device.studentId && device.studentId !== student.id) {
      //   throw new Error("Device is already linked to another student");
      // }

      // Step 3c: Check if the student is already linked to a different device
      if (student.deviceId && student.deviceId !== device.id) {
        // Unlink the student from the current device
        await prisma.device.update({
          where: { id: student.deviceId },
          data: { studentId: null },
        });

        await prisma.student.update({
          where: { id: student.id },
          data: { deviceId: null },
        });
      }

      // Step 3d: Link the device to the student within a transaction
      await prisma.$transaction([
        prisma.student.update({
          where: { id: student.id },
          data: { deviceId: device.id },
        }),
        prisma.device.update({
          where: { id: device.id },
          data: { studentId: student.id },
        }),
      ]);
    }

    // Step 4: Fetch and return the updated student data with relations
    const updatedStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        device: true,
        admin: true,
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    return updatedStudent;
  },
  // deleteStudent: async (_, { id }) => prisma.student.delete({ where: { id } }),
  studentLogin: async (_, { facultyId, password, macAddress }) => {
    // Step 1: Find the student by facultyId and include the associated device
    const student = await prisma.student.findUnique({
      where: { facultyId },
      include: { device: true },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Step 2: Validate the provided password against the stored hashed password
    const isValid = validatePassword(password, student.hashedPassword);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    // Step 3: If macAddress is provided, handle device linking
    if (macAddress) {
      // Step 3a: Find the device by macAddress
      const device = await prisma.device.findUnique({
        where: { macAddress },
      });

      if (!device) {
        throw new Error("Device not found");
      }

      // Step 3b: Check if the device is already linked to another student
      // if (device.studentId && device.studentId !== student.id) {
      //   throw new Error("Device is already linked to another student");
      // }

      // Step 3c: Check if the student is already linked to a different device
      if (student.deviceId && student.deviceId !== device.id) {
        // Unlink the student from the current device
        await prisma.device.update({
          where: { id: student.deviceId },
          data: { studentId: null },
        });

        await prisma.student.update({
          where: { id: student.id },
          data: { deviceId: null },
        });
      }

      // Step 3d: Link the device to the student within a transaction
      await prisma.$transaction([
        prisma.student.update({
          where: { id: student.id },
          data: { deviceId: device.id },
        }),
        prisma.device.update({
          where: { id: device.id },
          data: { studentId: student.id },
        }),
      ]);
    }

    // Step 4: Fetch and return the updated student data with relations
    const updatedStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        device: true,
        admin: true,
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    return updatedStudent;
  },

  studentLogout: async (_, { facultyId }) => {
    // Step 1: Find the student by facultyId and include the associated device
    const student = await prisma.student.findUnique({
      where: { facultyId },
      include: { device: true },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // If the student is not linked to any device, return the student as is
    if (!student.deviceId) {
      return student;
    }

    // Use a transaction to ensure atomicity of device unlinking operations
    try {
      await prisma.$transaction(async (tx) => {
        // Unlink the device from the student
        await tx.student.update({
          where: { id: student.id },
          data: { device: { disconnect: true } },
        });

        await tx.device.update({
          where: { id: student.deviceId },
          data: { student: { disconnect: true } },
        });
      });

      // Fetch and return the updated student data
      const updatedStudent = await prisma.student.findUnique({
        where: { id: student.id },
        include: {
          device: true,
          admin: true,
          courses: {
            include: {
              course: true,
            },
          },
        },
      });

      return updatedStudent;
    } catch (error) {
      console.error("Error during student logout:", error);
      throw new Error("Failed to logout student. Please try again.");
    }
  },

  deleteStudent: async (_, { id }) => prisma.student.delete({ where: { id } }),
};

const StudentRelations = {
  Student: {
    device: (parent) =>
      parent.deviceId
        ? prisma.device.findUnique({ where: { id: parent.deviceId } })
        : null,
    admin: (parent) =>
      prisma.admin.findUnique({ where: { id: parent.adminId } }),
    courses: (parent) =>
      prisma.studentCourse.findMany({
        where: { studentId: parent.id },
        include: { course: true },
      }),
    certificates: (parent) =>
      prisma.certificates.findMany({ where: { studentId: parent.id } }),
  },
};

module.exports = {
  StudentQueries,
  StudentMutations,
  StudentRelations,
};
