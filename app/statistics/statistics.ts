import {Page} from "tns-core-modules/ui/page";
import {EventData} from "tns-core-modules/data/observable";
import {
    currentTimeLocal,
    startOfWeek,
    startOfMonth,
    startOfPreviousMonth,
    startOfPreviousWeek,

} from "~/utils/time";
import {StackLayout} from "tns-core-modules/ui/layouts/stack-layout";
import {Label} from "tns-core-modules/ui/label";
import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";
import {DataStore} from "~/expense_datastore/datastore";
import {DockLayout} from "tns-core-modules/ui/layouts/dock-layout";
import {View} from "tns-core-modules/ui/core/view";
import {Layout} from "tns-core-modules/ui/layouts/layout";
import {hideKeyboard} from "~/utils/ui";
import {localize as l} from "nativescript-localize";

let page: Page;
let container: Layout;


export function navigatingTo(args: EventData) {
    hideKeyboard()

    page = <Page> args.object;
    container = page.getViewById('statistics-container');
    container.removeChildren()
    populate()
}

function populate() {
    getEntries().forEach(add_single)
}

function add_single(entry: Entry) {
    let singleEntryContainer = new StackLayout();
    singleEntryContainer.className = "statistics-entry-container";
    singleEntryContainer.id = entry.id;

    let heading = new Label();
    heading.text = entry.name;
    heading.className = "h3";

    let activityIndicator = new ActivityIndicator();
    activityIndicator.id = entry.id + "activity";
    activityIndicator.busy = true;

    singleEntryContainer.addChild(heading);
    singleEntryContainer.addChild(activityIndicator);
    container.addChild(singleEntryContainer);

    DataStore.getInstance().get_statistics({from_dt_local: entry.from, to_dt_local: entry.to}).then(response => {
        if (Object.keys(response).length === 0) {
            let emptyResponseLbl = new Label();
            emptyResponseLbl.text = l('no_expenses_current_period');
            singleEntryContainer.addChild(emptyResponseLbl)
        } else {
            Object.keys(response).forEach(currencyName => {
                let line = new DockLayout();
                line.stretchLastChild = false;

                let currencylbl = new Label();
                currencylbl.text = currencyName;
                let totalAmountLbl = new Label();
                totalAmountLbl.text = response[currencyName];

                line.addChild(currencylbl);
                line.addChild(totalAmountLbl);
                singleEntryContainer.addChild(line)
            })
        }
        activityIndicator.busy = false;

    }, err => {
        activityIndicator.busy = false;
        let err_lbl = new Label();
        err_lbl.text = l("failed_to_fetch_data");
        singleEntryContainer.addChild(err_lbl)
    })


}

type periodName = string;
type Entry = { name: string, id: string, from: string, to: string, };


function getEntries(): Entry[] {
    let now = currentTimeLocal();
    return [
        {
            name: l('current_week'),
            id: "current_week",
            from: startOfWeek(now),
            to: now,
        },
        {
            name: l('previous_week'),
            id: "previous_week",
            from: startOfPreviousWeek(now),
            to: startOfWeek(now)
        },
        {
            name: l('current_month'),
            id: "current_month",
            from: startOfMonth(now),
            to: now
        },
        {
            name: l('previous_month'),
            id: "previous_month",
            from: startOfPreviousMonth(now),
            to: startOfMonth(now)
        }]

}

export function refresh() {
    console.log("refreshing")
    container.removeChildren()
    populate()
}