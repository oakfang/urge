const clone = require('git-clone');
const request = require('request');
const mkdirp = require('mkdirp');

function getPackageDetails(user, repo) {
    const url = `https://raw.githubusercontent.com/${user}/${repo}/master/urge.json`;
    return new Promise((resolve, reject) => request(url, (error, response, body) => {
        if (!error && response.statusCode >= 200 && response.statusCode < 300) {
            resolve(JSON.parse(body));
        } else if (error) {
            reject({code: 500, error});
        } else {
            reject({code: response.statusCode, error: unknownError(response.statusCode)});
        }
    }));
}

const clonePromise = (user, repo, target) => 
    new Promise((resolve, reject) => 
        clone(`https://github.com/${user}/${repo}.git`, target, err => err ? reject(err) : resolve()));

const mkdirpPromise = path => new Promise((resolve, reject) => mkdirp(path, err => err ? reject(err) : resolve(path)));

function install(user, repo) {
    return getPackageDetails(user, repo).then(({name, deps}) => {
        const dir = `./urges/${name}`;
        const subDeps = deps || [];
        return Promise.all(subDeps.map(dep => {
            let [user, repo] = dep.split('/');
            return install(user, repo);
        })).then(() => mkdirpPromise(dir));
    }).then(path => {
        return clonePromise(user, repo, path);
    }).then(() => console.log(`Installed ${user}/${repo}`));
}

module.exports = install;