let frameModule = require("tns-core-modules/ui/frame");

interface NavOpts {
    path: string
    clearHistory?: boolean
    // if true, after navigating to the page, a go back btn will be visible
    fromDrawer?: boolean
    backstackVisible?: boolean
    extraContext?: object
}

/**
 *
 * @param {NavOpts} options
 */
export function navigateTo(options: NavOpts) {
    let defaults = {
        clearHistory: false,
        fromDrawer: true,
        backstackVisible: true,
        extraContext: {}
    };
    let opts: NavOpts = {...defaults, ...options};
    console.log("navigating to " + options.path);
    let topmost = frameModule.topmost();
    topmost.navigate({
        moduleName: opts.path,
        clearHistory: opts.clearHistory,
        context: {
            fromDrawer: opts.fromDrawer,
            ...opts.extraContext
        }
    });
}