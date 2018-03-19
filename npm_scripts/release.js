const path = require("path");
const u = require("underscore");
const {spawn, spawnSync} = require('child_process');
const moment = require("moment");

let path_keystore = process.argv[2];
let keystore_pass = process.argv[3];
let keystore_alias = process.argv[4];
let keystore_alias_pass = process.argv[5];

const appSettingsFile = path.join(__dirname, "..", "app", "app_config.json");
const releaseFirebaseSettingsFile = path.join(__dirname, "..", "platforms", "android", "app", "google-services.json");
const settings = require(appSettingsFile);

function postBuildChecks() {
    const releaseFirebaseSettings = require(releaseFirebaseSettingsFile);
    if (releaseFirebaseSettings['project_info']['project_id'] !== 'para-72573') {
        throw new Error("Wrong Firebase project ended up in the build.");
    }
}

function checks() {
    // TODO check git is clean before releasing

    const addrIsAllowed = (addr) => u.some(['staging-para-api', 'production-para-api'], (valid) => addr.indexOf(valid) !== -1);

    let apiAddress = settings.api_address;

    if (!apiAddress) {
        throw new Error("api address is missing!")
    }
    if (!addrIsAllowed(apiAddress)) {
        throw new Erorr("ugh oh. Using non production API address.")
    }
    if (apiAddress.charAt(apiAddress.length - 1) !== "/") {
        throw new Error("API address should end with '/'")
    }
}

if (!u.every([path_keystore, keystore_pass, keystore_alias, keystore_alias_pass], (arg) => !!arg)) {
    throw new Error("not all args avaialable")
}

function release_android() {
    // tns build android --release --key-store-path <path-to-your-keystore> --key-store-password <your-key-store-password> --key-store-alias <your-alias-name> --key-store-alias-password <your-alias-password> --copy-to <apk-location>.apk
    let buildArgs = [
        'build',
        'android',
        '--release',
        '--key-store-path',
        path_keystore,
        '--key-store-password',
        keystore_pass,
        '--key-store-alias',
        keystore_alias,
        '--key-store-alias-password',
        keystore_alias_pass,
        '--copy-to',
        `para-release-${settings.git_sha}-${moment().format()}.apk`
    ];
    console.log(buildArgs);

    run('tns', ['prepare', 'android', '--force', '--release'])
        .then(() => {
            return run('tns', buildArgs)
        })
        .then(postBuildChecks)
        .catch(err => {
            console.error(err)
        })
}

function run(command, args) {
    return new Promise((resolve, reject) => {
        let child = spawn(command, args);

        child.stdout.on('data', data => {
            console.log(`[tns build]: ${data}`);
        });

        child.stderr.on('data', data => {
            console.log(`[tns build ERR]: ${data}`);
        });

        child.on('close', code => {
            if (Number(code) === 0) {
                resolve()
            } else {
                reject()
            }
            console.log(`child process exited with code ${code}`);
        });
    })

}


// RUN
checks();
release_android();
