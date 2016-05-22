const clone = require('git-clone');
const request = require('request');
const mkdirp = require('mkdirp');
const fs = require('fs');

const URGE_CONF = './urge.json';

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

function install(user, repo, save=false) {
    console.log(`Installing ${user}/${repo}`);
    return getPackageDetails(user, repo).then(({name, deps}) => {
        const dir = `./urges/${name}`;
        const subDeps = deps || [];
        return Promise.all(subDeps.map(dep => {
            let [user, repo] = dep.split('/');
            return install(user, repo);
        })).then(() => mkdirpPromise(dir));
    }).then(path => {
        return clonePromise(user, repo, path);
    }).then(() => new Promise((resolve, reject) => {
        if (save) {
            fs.access(URGE_CONF, fs.R_OK | fs.W_OK, err => {
                if (err) reject(err);
                fs.readFile(URGE_CONF, {encoding: 'utf8'}, (err, data) => {
                    if (err) reject(err);
                    let pkg = JSON.parse(data);
                    pkg.deps = (pkg.deps || []).concat([`${user}/${repo}`]);
                    fs.writeFile(URGE_CONF, JSON.stringify(pkg, null, 2), err => err ? reject(err) : resolve());
                });
            });
        } else resolve();
    })).then(() => console.log(`Installed ${user}/${repo}`));
}

function init(name) {
    return new Promise((resolve, reject) => fs.writeFile(URGE_CONF, JSON.stringify({
        name, deps: []
    }, null, 2), err => err ? reject(err) : resolve()));
}

function fetch() {
    return new Promise((resolve, reject) => {
        fs.readFile(URGE_CONF, {encoding: 'utf8'}, (err, data) => {
            if (err) reject(err);
            let pkg = JSON.parse(data);
            Promise.all((pkg.deps || []).map(dep => {
                let [user, repo] = dep.split('/');
                return install(user, repo);
            })).then(resolve);
        });
    });
}

module.exports = {install, init, fetch};