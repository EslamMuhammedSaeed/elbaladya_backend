const { parse, join } = require("path");
const { createWriteStream, unlink, promises } = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(require("fs").unlink);
module.exports.readFile = async (file) => {
  const { createReadStream, filename } = await file;
  const stream = createReadStream();
  var { ext, name } = parse(filename);
  name = `image${Math.floor(Math.random() * 10000 + 1)}`;
  let url = join(__dirname, `../public/${name}-${Date.now()}${ext}`);
  const imageStream = await createWriteStream(url);
  await stream.pipe(imageStream);
  return url;
};

module.exports.readFileS3 = async (file) => {
  const { createReadStream, filename } = await file;
  const stream = createReadStream();
  const { ext } = parse(filename);
  const pathname = filename.split(".");
  const name = `${pathname[0]}-${
    ext === ".png" ? "image" : "video"
  }${Math.floor(Math.random() * 10000 + 1)}-${Date.now()}${ext}`;
  const url = join(__dirname, `../public/${name}`);
  const imageStream = createWriteStream(url);

  // Promisify the stream pipe operation
  const pipePromise = new Promise((resolve, reject) => {
    stream.pipe(imageStream).on("finish", resolve).on("error", reject);
  });

  await pipePromise; // Wait for the pipe operation to finish

  const fileBuffer = await promises.readFile(url);
  unlinkAsync(url);
  return { fileBuffer, name };
};

module.exports.readFileExcel = async (file) => {
  const { createReadStream, filename } = await file;
  const stream = createReadStream();
  const { ext, name } = parse(filename);
  const randomNum = Math.floor(Math.random() * 10000 + 1);
  const newName = `file${randomNum}-${Date.now()}${ext}`;
  const filePath = join(__dirname, `../excel/${newName}`);

  return new Promise((resolve, reject) => {
    const fileStream = createWriteStream(filePath);

    fileStream.on("error", (err) => {
      reject(err);
    });

    fileStream.on("finish", () => {
      const url = `excel${filePath.split("excel")[1]}`;
      resolve(url);
    });

    stream.pipe(fileStream);
  });
};
