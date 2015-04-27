#!/usr/bin/env node
var exec = require('child_process').execSync;

// Create a user token otherwise you'll hit API rate limit pretty fast
// Link: https://github.com/settings/applications
var token = process.env.ghkey || '',
    tokenStr;

if (token) {
    tokenStr = ' -H "Authorization: token ' + token + '" ';
} else {
    console.log('\n\x1B[31mWarning: ghkey not set, you might hit API rate limit.\x1B[39m\n');
    tokenStr = ' ';
}

function travisStatus(owner, project) {
    var result = [];
    //curl -i https://api.travis-ci.org/repos/apache/cordova-lib/builds
    var builds = exec('curl -s "https://api.travis-ci.org/repos/' + owner +
        '/' + project + '/builds"', {encoding: 'utf8'});
    try {
        builds = JSON.parse(builds);
        if (builds.message) throw Error(builds.message);
    } catch (e) {
        return ['err: ' + e.message];
    }

    builds = builds.sort(function(a,b) {
        return parseInt(b.number, 10) - parseInt(a.number, 10);
    });

    var build = builds[0];

    if (builds.length === 0) {
        console.log('\x1B[31mTravis not set for ' + project + '.\x1B[39m');
        return;
    }

    if (build.state === "finished") {
        if (parseInt(build.result, 10) === 0) {
            console.log('\x1B[32mBuild successful ✓\x1B[39m');
        } else {
            // console.log(build.number + ',' + build.state + ','
            // + build.result);
            console.log('\x1B[31mBuild failed X\x1B[39m');
        }
    } else {
        console.log('\x1B[33mTests are currently running for ' + project + '.\x1B[39m');
    }
}

console.log('Fetching project list from github..');

// get list of msopentech cordova repos
var apachePages = exec('curl -s -I' + tokenStr + 'https://api.github.com/users/apache/repos', {encoding: 'utf8'});

apachePages = apachePages.split('\n').filter(function(line){
    return ~line.indexOf('Link: ');
})[0];

if (!apachePages) {
    console.log('Probably hit api limit, please add your key.');
    process.exit(1);
}

apachePages = apachePages.split(',')[1];
apachePages = apachePages.match(/page=(\d+)/i)[1];

var apacheRepos = [];

for (var i = 1; i <= apachePages; i++) {
    try {
        var repos = exec('curl -s' + tokenStr + '"https://api.github.com/orgs/apache/repos?page=' + i + '"');
        repos = JSON.parse(repos);
        if (repos.message) throw Error(repos.message);
    } catch (e) {
        console.log('err: ' + e.message);
        break;
    }
    repos = repos.filter(function(repo) {
        return !!~repo.name.indexOf('cordova');
    }).map(function(repo) {
        return repo.name;
    });
    apacheRepos = apacheRepos.concat(repos);
}

// Sort elements
apacheRepos = apacheRepos.sort();

apacheRepos.forEach(function(project) {
    console.log('Checking travis status for \x1B[32m' + project + '\x1B[39m');
    travisStatus('apache', project);
});
