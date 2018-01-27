import {EventData} from "tns-core-modules/data/observable";
import frame = require("tns-core-modules/ui/frame");
import {RadSideDrawer} from "nativescript-pro-ui/sidedrawer";

export function toggleDrawer(args: EventData) {
    console.log("Show SideDrawer tapped.");
    let drawer: RadSideDrawer = <RadSideDrawer> frame.topmost().getViewById("sideDrawer");
    drawer.toggleDrawerState();

}