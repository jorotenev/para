import {EventData, Observable} from "tns-core-modules/data/observable";

class AuthObservable extends Observable {
    public readonly loginEvent = 'login_event';
    public readonly logoutEvent = 'logout_event';

    public loginOccurred() {
        this.notify(<EventData>{eventName: this.loginEvent})
    }

    public logoutOccurred() {
        this.notify(<EventData>{eventName: this.logoutEvent})
    }
}


export const authObservable = new AuthObservable();
