const axios = require('axios').default;
const base64 = require('./base64');
const yaml = require('yaml');
// https://api.github.com/repos/pcovellite/problem/branches

const $ax = axios.create({
    baseURL: 'https://api.github.com/',
    headers: {
        Authorization: `Bearer ${process.env['GITHUB_TOKEN']}`
    }
});

async function getTitle(repo, pid){
    const k = (await $ax.get(`/repos/${repo}/contents/problem.yml?ref=${pid}`))
        .data
        .content;
    const d = yaml.parse(base64.decode(k));
    return { name: pid, title: d.name };
}

module.exports = async function createIndex(repo){
    console.log(':: create problem index');
    const brs = (await $ax.get(`/repos/${repo}/branches`))
        .data
        .map(e => e.name)
        .filter(e => !/^(master|index)$/.test(e));
    console.log(brs);
    const result = [];
    for (const i of brs) {
        const r = await getTitle(repo, i);
        result.push(r);
        console.log(r);
    }
    return result;
};