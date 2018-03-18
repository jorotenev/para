const path = require("path");
const fs = require("fs");
const sourceGoogleJsonPath = (fileName) => path.join(__dirname, "..", "..", "app", "App_Resources", "Android", fileName);

module.exports = function ($logger, $projectData, $options, hookArgs) {
    let isRelease = $options.argv.release;
    console.dir("IS RELEASE " + isRelease);
    let googleFile = isRelease ? "google-services.release.json" : "google-services.dev.json";
    let sourceGoogleFile = sourceGoogleJsonPath(googleFile);
    let targetGoogleFile = sourceGoogleJsonPath('google-services.json');

    if (!fs.existsSync(sourceGoogleFile)) {
        throw new Error(`${sourceGoogleFile} doesn't exist`)
    }
    if (fs.existsSync(targetGoogleFile)) {
        fs.unlinkSync(targetGoogleFile)
    }

    fs.writeFileSync(targetGoogleFile, fs.readFileSync(sourceGoogleFile));
    console.log(`${sourceGoogleFile} is used as a Firebase's config google-services.json`)
};
