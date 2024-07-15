import * as childProcess from 'child_process';
import * as fs from 'fs';

export function compileBundles() {
  childProcess.execSync('pnpm build', {
    cwd: `${process.cwd()}/../app/`,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env },
    shell: 'bash',
  });
  fs.rmdirSync('../app/node_modules', {
    recursive: true,
  });
  childProcess.execSync('npm i --omit dev -f', {
    cwd: `${process.cwd()}/../app/`,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env },
    shell: 'bash',
  });
}
