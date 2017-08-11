"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = require("data/observable");
var User = (function (_super) {
    __extends(User, _super);
    function User(email, password, name) {
        var _this = _super.call(this) || this;
        _this.email = "";
        _this.password = "";
        _this.name = "";
        _this.email = email;
        _this.password = password;
        _this.name = name;
        return _this;
    }
    // You can add properties to observables on creation
    User.prototype.login = function () {
        console.log("Username " + this.name + ", \n            user email " + this.email + "\n            user pass " + this.password);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVzZXItbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBMkM7QUFFM0M7SUFBMEIsd0JBQVU7SUFPaEMsY0FBWSxLQUFjLEVBQUUsUUFBaUIsRUFBRSxJQUFhO1FBQTVELFlBQ0ksaUJBQU8sU0FJVjtRQVZPLFdBQUssR0FBVyxFQUFFLENBQUM7UUFDbkIsY0FBUSxHQUFXLEVBQUUsQ0FBQztRQUN0QixVQUFJLEdBQVcsRUFBRSxDQUFDO1FBS3RCLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLEtBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDOztJQUNyQixDQUFDO0lBRUQsb0RBQW9EO0lBRzdDLG9CQUFLLEdBQVo7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUNQLGNBQVksSUFBSSxDQUFDLElBQUksbUNBQ1IsSUFBSSxDQUFDLEtBQUssZ0NBQ1gsSUFBSSxDQUFDLFFBQVUsQ0FDOUIsQ0FBQztJQUNOLENBQUM7SUFBQSxDQUFDO0lBRUssdUJBQVEsR0FBZjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDOUIsQ0FBQztJQUFBLENBQUM7SUFFRiw0QkFBYSxHQUFiO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFBQSxDQUFDO0lBRU4sV0FBQztBQUFELENBQUMsQUFqQ0QsQ0FBMEIsdUJBQVUsR0FpQ25DO0FBakNZLG9CQUFJO0FBbUNqQixzQkFBc0IsUUFBUTtJQUMxQixFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdEMsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09ic2VydmFibGV9IGZyb20gXCJkYXRhL29ic2VydmFibGVcIjtcblxuZXhwb3J0IGNsYXNzIFVzZXIgZXh0ZW5kcyBPYnNlcnZhYmxlIHtcblxuICAgIHByaXZhdGUgZW1haWw6IHN0cmluZyA9IFwiXCI7XG4gICAgcHJpdmF0ZSBwYXNzd29yZDogc3RyaW5nID0gXCJcIjtcbiAgICBwcml2YXRlIG5hbWU6IHN0cmluZyA9IFwiXCI7XG5cblxuICAgIGNvbnN0cnVjdG9yKGVtYWlsPzogc3RyaW5nLCBwYXNzd29yZD86IHN0cmluZywgbmFtZT86IHN0cmluZykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmVtYWlsID0gZW1haWw7XG4gICAgICAgIHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICAvLyBZb3UgY2FuIGFkZCBwcm9wZXJ0aWVzIHRvIG9ic2VydmFibGVzIG9uIGNyZWF0aW9uXG5cblxuICAgIHB1YmxpYyBsb2dpbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBgVXNlcm5hbWUgJHt0aGlzLm5hbWV9LCBcbiAgICAgICAgICAgIHVzZXIgZW1haWwgJHt0aGlzLmVtYWlsfVxuICAgICAgICAgICAgdXNlciBwYXNzICR7dGhpcy5wYXNzd29yZH1gXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZWdpc3RlcigpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZWdpc3RlcmluZ1wiKVxuICAgIH07XG5cbiAgICByZXNldFBhc3N3b3JkKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlc2V0IHBhc3N3b3JkXCIpXG4gICAgfTtcblxufVxuXG5mdW5jdGlvbiBoYW5kbGVFcnJvcnMocmVzcG9uc2UpIHtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgICAgIHRocm93IEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbiJdfQ==