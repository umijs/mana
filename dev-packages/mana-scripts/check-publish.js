#!/usr/bin/env node

// @ts-check

const path = require('path');
const chalk = require('chalk').default;
const cp = require('child_process');

let code = 0;
const workspaces = JSON.parse(cp.execSync('yarn --silent workspaces info').toString());
for (const name in workspaces) {
  if (Object.prototype.hasOwnProperty.call(workspaces, name)) {
    const workspace = workspaces[name];
    const location = path.resolve(process.cwd(), workspace.location);
    const packagePath = path.resolve(location, 'package.json');
    const pck = require(packagePath);
    if (!pck.private) {
      const pckName = `${pck.name}@${pck.version}`;
      try {
        if (cp.execSync(`npm view ${pckName} version --json`).toString().trim()) {
          console.info(`${pckName}: published`);
        } else {
          console.error(`(${chalk.red('ERR')}) ${pckName}: ${chalk.red('NOT')} published`);
          code = 1;
        }
      } catch (error) {
        console.error(`(${chalk.red('ERR')}) ${pckName}: ${chalk.red('NOT')} found`);
      }
    }
  }
}
process.exit(code);
