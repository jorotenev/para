var path = require("path");
var fs = require("fs");
var git_sha = require("git-rev-sync");
var {render} = require("prettyjson");

module.exports = function ($logger, $projectData, $options, hookArgs) {

    console.log("setting git-sha of the current commit");
    try {


        let appFolder = $projectData.projectDir;
        let appPackageFile = appFolder + "/app/app_config.json";
        console.log(appPackageFile);
        let currentPackageFileContent = fs.readFileSync(appPackageFile, {encoding: "utf8"});
        currentPackageFileContent = JSON.parse(currentPackageFileContent);
        let git_sha_short = git_sha.short();

        currentPackageFileContent['git_sha'] = git_sha_short;
        let updatedPackage = JSON.stringify(currentPackageFileContent, null, 4);

        console.log(updatedPackage);
        fs.writeFileSync(appPackageFile, updatedPackage);
        console.log(git_sha_short)
    }
    catch (err) {
        console.log("Faield to set git-sha." + err)
    }
};
