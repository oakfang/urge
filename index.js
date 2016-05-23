const clone = require('git-clone');
const request = require('request');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const fs = require('fs');

const URGE_CONF = './urge.json';
const unknownError = err => `Unknown Error: ${err}`;

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

const readPkg = () => new Promise((resolve, reject) => {
    fs.readFile(URGE_CONF, {encoding: 'utf8'}, (err, data) => {
        if (err) reject(err);
        resolve(JSON.parse(data));
    });
});

const writePkg = pkg => new Promise((resolve, reject) => {
    fs.writeFile(URGE_CONF, JSON.stringify(pkg, null, 2), err => err ? reject(err) : resolve());
});

const clonePromise = (user, repo, target) => 
    new Promise((resolve, reject) => 
        clone(`https://github.com/${user}/${repo}.git`, target, err => err ? reject(err) : resolve()));

const mkdirpPromise = path => new Promise((resolve, reject) => mkdirp(path, err => err ? reject(err) : resolve(path)));

const uninstall = name => new Promise(resolve => rimraf(`./urges/${name}`, resolve));

function install(user, repo, save=false) {
    return getPackageDetails(user, repo).then(({name, deps}) => {
        const dir = `./urges/${name}`;
        const subDeps = deps || [];
        return Promise.all(subDeps.map(dep => {
            let [user, repo] = dep.split('/');
            return install(user, repo);
        }))
        .then(() => uninstall(name))
        .then(() => mkdirpPromise(dir));
    }).then(path => {
        return clonePromise(user, repo, path);
    }).then(() => save ? readPkg().then(pkg => {
        pkg.deps = (pkg.deps || []).concat([`${user}/${repo}`]);
        return writePkg(pkg);
    }) : null);
}

function init(name) {
    return writePkg({name, deps: []});
}

function fetch() {
    return readPkg().then(({deps}) => deps || []);
}

module.exports = {install, init, fetch, uninstall};