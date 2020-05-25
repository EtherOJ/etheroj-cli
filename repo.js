const ch = require('child_process');
const spawn = ch.spawn;
const fs = require('fs');
const os = require('os');

async function execi(cmd){
    const exe = cmd.split(' ');
    return await new Promise((resolve, reject) => {
        const shell = spawn(exe[0], exe.slice(1), { stdio: 'inherit' });
        shell.on('close', code => {
            code === 0 ? resolve(code) : reject(code);
        });
    });
}

class RepoManager {

    constructor(problemRepo, submissionRepo) {
        this.prepo = problemRepo;
        this.srepo = submissionRepo;
    }

    async prepareWorkRepo () {
        const dir = await fs.promises.mkdtemp(os.tmpdir() + '/crp-');
        console.log(':: clone work repo');
        await execi(`git clone -b master --depth=1 https://github.com/${this.prepo} ${dir}`);
        this.pdir = dir;
    }
}

module.exports = RepoManager;