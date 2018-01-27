import {EventData} from "tns-core-modules/data/observable";
import {navigateTo} from "~/utils/nav";
import {logout} from "~/auth/util";

export function onLoaded() {

}

const routes = {
    "new": {
        path: "expense/add/add-expense",
    },
    "view_all": {
        path: "expense/list/list",
    },
    "settings": {
        path: "user/settings",
    },
    "logout": {
        path: "auth/login-view",
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
    let navigateFunc = navigateTo.bind({}, route.path, !!route.deleteHistory)

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