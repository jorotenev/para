let l = require('nativescript-localize')

export function generateEmailPasswordMetadata() {
    return {
        commitMode: "Immediate",
        validationMode: "Immediate",
        propertyAnnotations: [
            {
                name: "email",
                displayName: "",
                index: 0,
                hintText: l("Enter email"),
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
            },
            {
                name: 'password',
                index: 1,
                displayName: "",
                editor: "Password",
                hintText: l("Enter password"),
                required: true,
                validators: [{name: "NonEmpty", params: {"errorMessage": l("field_cant_be_empty")}}, {
                    name: "MinimumLength",
                    params: {min: 5, errorMessage: l("pwd_min_len_error", 5)},

                }]

            }
        ]
    }

}