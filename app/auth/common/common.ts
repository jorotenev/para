let l = require('nativescript-localize')

export function emailMetadata() {
    return {
        name: "email",
        displayName: "",
        index: 0,
        hintText: l("enter_email"),
        editor: "Email",
        required: true,
        validators: [
            {
                name: 'EmailValidator',
                params: {
                    errorMessage: l("invalid_email")
                }
            },
            {
                name: "NonEmpty",
                params:
                    {errorMessage: l("field_cant_be_empty")}
            }]
    }
}

type PasswordOpts = { name?: string, displayName?: string, index?: number, hintText?: string }

export function passwordMetadata(opts: PasswordOpts) {
    const options = {
        name: "password",
        displayName: "",
        hintText: l("enter_password"),
        index: 0,
        ...opts
    };
    return {
        name: options.name,
        index: options.index,
        displayName: options.displayName,
        editor: "Password",
        hintText: options.hintText,
        required: true,
        validators: [
            {name: "NonEmpty", params: {"errorMessage": l("field_cant_be_empty")}},
            {
                name: "MinimumLength",
                params: {length: 5, errorMessage: l("pwd_min_len_error", 5)},

            }]

    }
}

export function generateEmailPasswordMetadata() {
    return {
        commitMode: "OnLostFocus",
        validationMode: "OnLostFocus",
        propertyAnnotations: [
            emailMetadata()
            ,
            passwordMetadata({index: 1})
        ]
    }

}