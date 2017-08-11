"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("data/observable");
var User = (function (_super) {
    __extends(User, _super);
    function User(email, password, name) {
        var _this = _super.call(this) || this;
        _this._email = "";
        _this._password = "";
        _this._name = "";
        _this._email = email;
        _this._password = password;
        _this._name = name;
        return _this;
    }
    Object.defineProperty(User.prototype, "email", {
        // You can add properties to observables on creation
        get: function () {
            return this._email;
        },
        set: function (email) {
            this._email = email;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "password", {
        get: function () {
            return this._password;
        },
        set: function (pass) {
            this._password = pass;
        },
        enumerable: true,
        configurable: true
    });
    User.prototype.login = function () {
        console.log("Username " + this._name + ", \n            user email " + this._email + "\n            user pass " + this._password);
    };
    ;
    User.prototype.register = function () {
        console.log("Registering");
    };
    ;
    User.prototype.resetPassword = function () {
        console.log("Reset password");
    };
    ;
    return User;
}(observable_1.Observable));
exports.User = User;
function handleErrors(response) {
    if (!response.ok) {
        console.log(JSON.stringify(response));
        throw Error(response.statusText);
    }
    return response;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVzZXItbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBMkM7QUFFM0M7SUFBMEIsd0JBQVU7SUFPaEMsY0FBWSxLQUFjLEVBQUUsUUFBaUIsRUFBRSxJQUFhO1FBQTVELFlBQ0ksaUJBQU8sU0FJVjtRQVZPLFlBQU0sR0FBVyxFQUFFLENBQUM7UUFDcEIsZUFBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixXQUFLLEdBQVcsRUFBRSxDQUFDO1FBS3ZCLEtBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLEtBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLEtBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDOztJQUN0QixDQUFDO0lBSUQsc0JBQVcsdUJBQUs7UUFGaEIsb0RBQW9EO2FBRXBEO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDdEIsQ0FBQzthQUVELFVBQWlCLEtBQWE7WUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDeEIsQ0FBQzs7O09BSkE7SUFNRCxzQkFBVywwQkFBUTthQUFuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7YUFFRCxVQUFvQixJQUFZO1lBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQzFCLENBQUM7OztPQUpBO0lBTU0sb0JBQUssR0FBWjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQ1AsY0FBWSxJQUFJLENBQUMsS0FBSyxtQ0FDVCxJQUFJLENBQUMsTUFBTSxnQ0FDWixJQUFJLENBQUMsU0FBVyxDQUMvQixDQUFDO0lBQ04sQ0FBQztJQUFBLENBQUM7SUFFSyx1QkFBUSxHQUFmO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBQUEsQ0FBQztJQUVGLDRCQUFhLEdBQWI7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDakMsQ0FBQztJQUFBLENBQUM7SUFFTixXQUFDO0FBQUQsQ0FBQyxBQWhERCxDQUEwQix1QkFBVSxHQWdEbkM7QUFoRFksb0JBQUk7QUFrRGpCLHNCQUFzQixRQUFRO0lBQzFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN0QyxNQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUNELE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDcEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSBcImRhdGEvb2JzZXJ2YWJsZVwiO1xuXG5leHBvcnQgY2xhc3MgVXNlciBleHRlbmRzIE9ic2VydmFibGUge1xuXG4gICAgcHJpdmF0ZSBfZW1haWw6IHN0cmluZyA9IFwiXCI7XG4gICAgcHJpdmF0ZSBfcGFzc3dvcmQ6IHN0cmluZyA9IFwiXCI7XG4gICAgcHJpdmF0ZSBfbmFtZTogc3RyaW5nID0gXCJcIjtcblxuXG4gICAgY29uc3RydWN0b3IoZW1haWw/OiBzdHJpbmcsIHBhc3N3b3JkPzogc3RyaW5nLCBuYW1lPzogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX2VtYWlsID0gZW1haWw7XG4gICAgICAgIHRoaXMuX3Bhc3N3b3JkID0gcGFzc3dvcmQ7XG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIC8vIFlvdSBjYW4gYWRkIHByb3BlcnRpZXMgdG8gb2JzZXJ2YWJsZXMgb24gY3JlYXRpb25cblxuICAgIHB1YmxpYyBnZXQgZW1haWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbWFpbFxuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZW1haWwoZW1haWw6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9lbWFpbCA9IGVtYWlsO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcGFzc3dvcmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXNzd29yZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHBhc3N3b3JkKHBhc3M6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9wYXNzd29yZCA9IHBhc3M7XG4gICAgfVxuXG4gICAgcHVibGljIGxvZ2luKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIGBVc2VybmFtZSAke3RoaXMuX25hbWV9LCBcbiAgICAgICAgICAgIHVzZXIgZW1haWwgJHt0aGlzLl9lbWFpbH1cbiAgICAgICAgICAgIHVzZXIgcGFzcyAke3RoaXMuX3Bhc3N3b3JkfWBcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlZ2lzdGVyKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlZ2lzdGVyaW5nXCIpXG4gICAgfTtcblxuICAgIHJlc2V0UGFzc3dvcmQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUmVzZXQgcGFzc3dvcmRcIilcbiAgICB9O1xuXG59XG5cbmZ1bmN0aW9uIGhhbmRsZUVycm9ycyhyZXNwb25zZSkge1xuICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICAgICAgdGhyb3cgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZTtcbn1cblxuIl19