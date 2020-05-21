const axios = require('axios').default;
const fs = require('fs');
const os = require('os');
const extract = require('extract-zip');
const ProgressBar = require('progress');

const $ax = axios.create({
    baseURL: 'https://loj.ac/'
});

async function downloadDatapack(pid) {
    console.log(':: download datapack');
    const dir = await fs.promises.mkdtemp(os.tmpdir() + '/cov-');

    const resp = await $ax.get(`/problem/${pid}/testdata/download`, {
        responseType: 'stream'
    });

    const totLen = +resp.headers['content-length'];

    const casePath = `${dir}/testcase.zip`;
    const writer = fs.createWriteStream(casePath);
    resp.data.pipe(writer);

    const bar = new ProgressBar(':: datapack [:bar] :percent eta :etas', {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: totLen
    });

    resp.data.on('data', chunk => bar.tick(chunk.length));
    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    console.log(':: extract datapack');
    await extract(casePath, {
        dir: `${dir}/tc`
    });

    for await (const f of await fs.promises.opendir(`${dir}/tc`)) {
        const fname = `${dir}/tc/${f.name}`;
        if (!/\.(in|out)$/.test(f.name)) {
            await fs.promises.unlink(fname);
        } else {
            if (f.name.endsWith('.out')) {
                await fs.promises.rename(fname, fname.replace(/.out$/g,'.ans'));
            }
        }
    }
    return dir + '/tc';
}

function genDesc(desc) {
    console.log(':: generate README');
    return `# ${desc.title}
## Description
${desc.description}
## Input Format
${desc.input_format}
## Output Format
${desc.output_format}
## Example
${desc.example}
## Limit and Hint
${desc.limit_and_hint}
`;
}

async function fetchProblem(pid) {
    console.log(':: fetch problem info');
    const ex = (await $ax.get(`/problem/${pid}/export`)).data;
    const exo = ex.obj;
    const dataDir = await downloadDatapack(pid);

    return {
        dataDir,
        raw: exo,
        desc: {
            name: exo.title,
            source: 'LibreOJ',
            time_limit: exo.time_limit,
            space_limit: exo.memory_limit
        },
        readme: genDesc(exo)
    };
    // console.log(desc, downloadDatapack(1));
}

module.exports = {
    source: 'LibreOJ',
    sourceLink: 'https://loj.ac',
    fetchProblem
};