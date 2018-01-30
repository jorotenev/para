import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";

export function toggleActivityIndicator(component:ActivityIndicator, state: boolean) {
    //todo refactor - can include this logic in the XML and use an observable
    component.busy = state;
    component.visibility = state ? 'visible' : 'collapse'
}