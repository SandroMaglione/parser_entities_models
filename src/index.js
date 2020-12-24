const fs = require("fs");
const { parser } = require("./parser");

if (!fs.existsSync("dist")){
  fs.mkdirSync("dist");
}

const getDirectories = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

getDirectories("sources").forEach((dir) => {
  fs.readdir("sources/" + dir, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach((file) => {
      console.log(file);
      const source = fs.readFileSync("sources/" + dir + "/" + file);
      parser(source, dir);
    });
  });
});

