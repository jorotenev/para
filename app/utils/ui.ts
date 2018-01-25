import {ActivityIndicator} from "tns-core-modules/ui/activity-indicator";

export function toggleActivityIndicator(component:ActivityIndicator, state: boolean) {
    component.busy = state;
    component.visibility = state ? 'visible' : 'collapse'
}