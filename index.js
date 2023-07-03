
import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { chdir } from 'process';

const BUNDLE_DIR_NAME = `bundle_${Date.now().toString()}`;

// Get the list of all dependencies with depth
const npmListJson = execFileSync("npm", ["ls", "--json", "--all"]);
const npmList = JSON.parse(npmListJson.toString());

mkdirSync(BUNDLE_DIR_NAME, {recursive: true});
chdir(BUNDLE_DIR_NAME);

// Download dependencies list recursive
const download = async (dependencies) => {
    for (const dep in dependencies) {

        if (dependencies[dep].resolved) {
            console.log(`Downloading: ${dependencies[dep].resolved}`);

            const depPath = dep.split('/').slice(0, dep.split('/').length - 1).join();
            if (depPath) {
                mkdirSync(join(depPath), {recursive: true});
                chdir(depPath);
            }

            const tmp = execFileSync("npm", ["pack", dependencies[dep].resolved]);

            if (depPath) {
                chdir('..');
            }
        }

        await download(dependencies[dep].dependencies);
    }
}

await download(npmList.dependencies);

chdir('..');

// Comprese the bundle directory
execFileSync("tar", ["-czvf", `${BUNDLE_DIR_NAME}.tar.gz`, BUNDLE_DIR_NAME]);

rmSync(BUNDLE_DIR_NAME, {force: true, recursive: true});

console.log('Done!');
