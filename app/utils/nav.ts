let frameModule = require("tns-core-modules/ui/frame");

export function navigateTo(path: string, clearHistory: boolean = false, fromDrawer=true) {
    console.log("navigating to " + path);
    let topmost = frameModule.topmost();
    topmost.navigate({
        moduleName: path,
        clearHistory: clearHistory,
        context: {
            fromDrawer: fromDrawer
        }
    });
}