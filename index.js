'use strict';

const libreoj = require('./libreoj');
const fs = require('fs').promises;
const yaml = require('yaml');

const srcid = '2319';
const pid = `lo${srcid.padStart(4,'0')}`;

(async () => {
    console.log(`:: convert LibreOJ ${srcid} to ${pid}`);
    const rst = await libreoj.fetchProblem(srcid);
    const dir = `${__dirname}/out/${pid}/`;
    
    await fs.mkdir(`${dir}/testcase`, { recursive: true } );
    await fs.writeFile(`${dir}/README.md`, rst.readme);
    await fs.writeFile(`${dir}/problem.yml`, yaml.stringify(rst.desc));
    for await (const f of await fs.opendir(`${rst.dataDir}`)) {
        await fs.copyFile(`${rst.dataDir}/${f.name}`, `${dir}/testcase/${f.name}`);
    }
})();

