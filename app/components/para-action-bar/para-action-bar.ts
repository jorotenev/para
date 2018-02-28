import {EventData} from "tns-core-modules/data/observable";
import frame = require("tns-core-modules/ui/frame");
import {RadSideDrawer} from "nativescript-ui-sidedrawer";
import {Button} from "tns-core-modules/ui/button";

const topmost = require("ui/frame").topmost;

export function onLoad(args) {
    let container = args.object;
    let action = container.action;
    let actionBarTitle = container.title
    if (actionBarTitle){
        container.getViewById('action-bar').text = actionBarTitle
    }
    let btn = container.getViewById('nav-btn')

    if (action === "back") {
        enableBackFunctionality(btn)
    } else {
        enableSideDrawer(btn)
    }
}

function enableBackFunctionality(btn) {

    btn.text = 'Back';
    btn.on(Button.tapEvent, onBack)
    btn.android.systemIcon = "ic_menu_back";
}

function enableSideDrawer(btn) {
    btn.on(Button.tapEvent, toggleDrawer)
    btn.icon = "res://ic_menu"
}


export function onBack() {
    console.log('back pressed')
    topmost().goBack();
}

export function toggleDrawer(args: EventData) {
    console.log("Show SideDrawer tapped.");
    let drawer: RadSideDrawer = <RadSideDrawer> frame.topmost().getViewById("sideDrawer");
    drawer.toggleDrawerState();
}