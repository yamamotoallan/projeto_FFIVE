const { spawn } = require('child_process');

function runCommand(args, stdinInput) {
    return new Promise((resolve) => {
        console.log(`Running: vercel ${args.join(' ')}`);
        const child = spawn('cmd', ['/c', 'vercel', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });

        if (stdinInput) {
            child.stdin.write(stdinInput);
            child.stdin.end();
        }

        child.on('close', (code) => {
            resolve(code);
        });
    });
}

async function setEnv(key, value) {
    // 1. Remove if exists (ignore errors if not exists)
    console.log(`Removing ${key}...`);
    await runCommand(['env', 'rm', key, 'production', '-y']);

    // 2. Add
    console.log(`Adding ${key}...`);
    const code = await runCommand(['env', 'add', key, 'production'], value);

    if (code !== 0) {
        throw new Error(`Failed to add ${key}`);
    }
    console.log(`✅ ${key} set successfully.`);
}

async function run() {
    try {
        await setEnv('CLOUDINARY_API_KEY', '655215535181411');
        await setEnv('CLOUDINARY_API_SECRET', 'guZ5XPfqv3VzZM2og9ixtVQi6s0');
        console.log('All variables updated cleanly.');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
