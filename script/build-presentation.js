const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
process.env.PATH = `${process.env.PATH}:node_modules/.bin`;

const bs = path.join(process.cwd(), "node_modules/.bin/bs");
const SRC_DIR = "src/";
const OUT_DIR = "dist/";

const targetList = fs
  .readdirSync(SRC_DIR, { withFileTypes: true })
  .map((node) => {
    if (node.isDirectory)
      return {
        name: `${node.name}.md`,
        path: path.join(process.cwd(), SRC_DIR, node.name),
        outdir: path.join(process.cwd(), OUT_DIR),
      };
  });

console.log(`[BUILD]`, `found target node : ${targetList.length}`);

const exec_cmd = (cmd, cwd) =>
  new Promise((resolve, reject) => {
    console.log(`[EXEC]`, cmd, cwd);
    try {
      const out = execSync(cmd, {
        cwd,
        env: process.env,
      });
      console.log(`[OUT]`, out.toString());
      resolve(out);
    } catch (error) {
      console.log(`[ERROR]`, error);
      reject(error);
    }
  });

const buildBackSlide = async (target) => {
  console.log(`[START]`, target.name);
  const cmds = [
    `node ${bs} export ${target.name} --strip-notes -o ${target.outdir}`,
    `node ${bs} pdf ${path.join(target.name)} --strip-notes -o ${
      target.outdir
    }`,
  ];
  try {
    await Promise.all(cmds.map((cmd) => exec_cmd(cmd, target.path)));
  } catch (error) {
    console.log(`[ERROR]`, target.name);
    return;
  }
  console.log(`[END]`, target.name);
};

targetList.forEach(async (target) => await buildBackSlide(target));
