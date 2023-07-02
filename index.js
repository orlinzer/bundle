
import fs, { rmSync } from 'fs';
import https from 'https';
import path from 'path';
import { execFileSync } from 'child_process';
import { chdir } from 'process';

const BUNDLE_DIR = `bundle_${Date.now().toString()}`;

const tmp = execFileSync("npm", ["ls", "--json"]);
const NpmLs = JSON.parse(tmp.toString());

const download = async () => {
    fs.mkdirSync(BUNDLE_DIR, {recursive: true});
    chdir(BUNDLE_DIR);
    if (NpmLs.dependencies) {
        
        for (const dep in NpmLs.dependencies) {
            // console.log(NpmLs.dependencies);

            if (NpmLs.dependencies[dep].resolved) {
                console.log(`Downloading: ${NpmLs.dependencies[dep].resolved}`);

                const depPath = dep.split('/').slice(0, dep.split('/').length - 1).join();
                if (depPath) {
                    fs.mkdirSync(path.join(depPath), {recursive: true});
                    chdir(depPath);
                }


                const tmp = execFileSync("npm", ["pack", NpmLs.dependencies[dep].resolved]);

                if (depPath) {
                    chdir('..');
                }
            }
        }
        
    }
    chdir('..');
}


await download();

execFileSync("tar", ["-czvf", `${BUNDLE_DIR}.tar.gz`, BUNDLE_DIR]);

rmSync(BUNDLE_DIR, {force: true, recursive: true});

console.log('Done!');
