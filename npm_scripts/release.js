const path = require("path");
const u = require("underscore");
const {spawn, spawnSync} = require('child_process');
const moment = require("moment");

let path_keystore = process.argv[2];
let keystore_pass = process.argv[3];
let keystore_alias = process.argv[4];
let keystore_alias_pass = process.argv[5];

function checks() {
    // TODO check git is clean before releasing

    const addrIsAllowed = (addr) => u.some(['staging-para-api', 'production-para-api'], (valid) => addr.indexOf(valid) !== -1);
    const appSettingsFile = path.join(__dirname, "..", "app", "app_config.json");

    let settings = require(appSettingsFile);
    if (!settings.api_address) {
        throw new Error("api address is missing!")
    }
    if (!addrIsAllowed(settings.api_address)) {
        throw new Erorr("ugh oh. Using non production API address.")
    }
}

if (!u.every([path_keystore, keystore_pass, keystore_alias, keystore_alias_pass], (arg) => !!arg)) {
    throw new Error("not all args avaialable")
}

function build_android() {
    // tns build android --release --key-store-path <path-to-your-keystore> --key-store-password <your-key-store-password> --key-store-alias <your-alias-name> --key-store-alias-password <your-alias-password> --copy-to <apk-location>.apk
    let args = [
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
        `release-${moment().format()}.apk`
    ];
    console.log(args);
    run('tns', args);
}

function run(command, args) {
    let child = spawn(command, args);

    child.stdout.on('data', data => {
        console.log(`[tns build]: ${data}`);
    });

    child.stderr.on('data', data => {
        console.log(`[tns build ERR]: ${data}`);
    });

    child.on('close', code => {
        console.log(`child process exited with code ${code}`);
    });
}


// RUN
checks();
build_android();