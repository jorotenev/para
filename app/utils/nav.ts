let frameModule = require("tns-core-modules/ui/frame");

export function navigateTo(path: string, clearHistory: boolean = false) {
    console.log("navigating to " + path);
    let topmost = frameModule.topmost();
    topmost.navigate({
        moduleName: path,
        clearHistory: clearHistory,
        context: {
            fromDrawer: true
        }
    });
}