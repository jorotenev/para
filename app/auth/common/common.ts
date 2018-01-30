export function generateEmailPasswordMetadata() {
    return {
        commitMode:"Immediate",
        validationMode:"Immediate",
        propertyAnnotations: [
            {
                name: "email",
                displayName: "",
                index: 0,
                hintText: "Enter email",
                editorType: "Email",
                required: true,
                validators: [
                    {name: 'EmailValidator'},
                    {name: "NonEmpty"}]
            },
            {
                name: 'password',
                index: 1,
                displayName: "",
                editorType: "Password",
                hintText: "Enter password",
                required: true,
                validators: [{name: "NonEmpty"}, {name: "MinimumLength", params: {min: 5}}]

            }
        ]
    }

}