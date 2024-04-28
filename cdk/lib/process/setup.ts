import * as childProcess from 'child_process';

// eslint-disable-next-line import/prefer-default-export
export function compileBundles() {
  childProcess.execSync('pnpm build', {
    cwd: `${process.cwd()}/../app/`,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env },
    shell: 'bash',
  });
}
