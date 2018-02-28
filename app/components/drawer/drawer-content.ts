import {EventData} from "tns-core-modules/data/observable";
import {navigateTo} from "~/utils/nav";
import {logout} from "~/auth/util";

export function onLoaded() {

}

const routes = {
    "new": {
        path: "expense/add/add-expense",
        backstackVisible: false,
        deleteHistory: false,
    },
    "view_all": {
        path: "expense/list/list",
        backstackVisible: true,
        deleteHistory: false,
    },
    "settings": {
        path: "user/settings",
        backstackVisible: true,
        deleteHistory: false,
    },
    "logout": {
        path: "auth/login/login-view",
        backstackVisible: true,
        deleteHistory: true,
        promise: logout
    }
};

export function onTap(args: EventData) {
    let id = args.object.get('id');
    console.log(`${id} pressed`);
    let route = routes[id];
    if (!route) {
        console.log('no route for btn with id ' + id)
        return;
    }
    let opts = {
        path: route.path,
        clearHistory: route.deleteHistory
    };

    let navigateFunc = navigateTo.bind({}, {
        path: route.path,
        clearHistory: route.deleteHistory,
        backstackVisible: route.backstackVisible
    });

    let promise = route.promise;
    if (promise) {
        promise().then(navigateFunc, () => {
            console.log("Navigation promise was rejected")
        });
        return;
    } else {
        navigateFunc();
        return;
    }
}