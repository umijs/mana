#!/usr/bin/env node

// @ts-check
const path = require('path');
const cp = require('child_process');

const packageInfo = require(path.resolve(__dirname, 'package.json'));

function getCommand() {
  const args = process.argv.slice(2); // user args
  const scripts = packageInfo['mana-scripts'] || {};
  const script = args[0];
  const command = scripts[script];
  if (!script) {
    throw new Error(
      `[manarun] Please specify one of these supported  scripts, ${Object.keys(scripts).join('/')}`,
    );
  }
  if (!command) {
    throw new Error('[manarun] The script does not exist: ' + script);
  }
  return [command, ...args.slice(1, args.length)].join(' ');
}

/**
 * @param {string} command command line to run.
 */
function runCommand(command) {
  return new Promise((resolve, reject) => {
    const env = Object.assign({}, process.env);
    const scriptProcess = cp.exec(command, {
      cwd: process.cwd(),
      env,
    });
    if (scriptProcess.stdout) {
      scriptProcess.stdout.pipe(process.stdout);
    }
    if (scriptProcess.stderr) {
      scriptProcess.stderr.pipe(process.stderr);
    }
    scriptProcess.on('error', reject);
    scriptProcess.on('close', resolve);
  });
}

(async () => {
  let exitCode = 0;
  let error = undefined;
  let command = undefined;
  try {
    command = getCommand();
    console.debug(`[manarun] $ ${command}`);
    exitCode = await runCommand(command);
  } catch (err) {
    if (command) {
      console.error(`[manarun] Error occurred when executing: ${command}\n`);
    } else {
      console.error('[manarun] Error occurred.');
    }
    console.error(err);
    error = err;
  }
  if (error) {
    exitCode = 1; // without the process starting.
  } else if (exitCode) {
    console.error(`[manarun] Exit with code (${exitCode}): ${command}`);
  }
  process.exit(exitCode);
})();
