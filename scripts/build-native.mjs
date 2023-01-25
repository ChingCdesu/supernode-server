import CMakeJs from 'cmake-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { BuildSystem } = CMakeJs;

const { NATIVE_BUILD_TYPE } = process.env;

const projectRoot = path.join(__dirname, '../native');
const buildDir = path.join(projectRoot, 'build');
const buildType = NATIVE_BUILD_TYPE || 'Release';

const bs = new BuildSystem({
  directory: projectRoot,
  config: buildType,
});

bs.configure()
  .then(() => bs.compile())
  .then(() => {
    const targetFile = path.resolve(bs.cmake.buildDir, 'node-supernode.node');
    const exists = fs.existsSync(targetFile);
    if (exists) {
      console.log('copying files...');
      fs.copyFileSync(
        targetFile,
        path.resolve(buildDir, 'node-supernode.node'),
      );
    }
  });
