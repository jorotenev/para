# Para
Para is a simple & and easy to use mobile application to track expenses.
This repo contains the source code of the mobile app. The backend API is located in [para_api](https://github.com/jorotenev/para_api)

# Development & Testing
### Prerequisites
* [Install NativeScript](https://docs.nativescript.org/start/quick-setup). If on Linux, note the [advanced steps](https://docs.nativescript.org/start/ns-setup-linux) from __Step 3__
* You need a `app/App_Resources/Android/google-services.dev.json` ([how to get it](https://github.com/EddyVerbruggen/nativescript-plugin-firebase#prerequisites))
    * (essentially you need a firebase project's `google-services.json`, file obtained in the process of setting up an android sdk through the Firebase Console)
* You need an emulator or an Android phone (with developer mode ON & USB Debugging enabled)

### Run locally
* You need the IP of a running [para_api](https://github.com/jorotenev/para_api) server set in `app/app_config.json`
    * [api documentation](github.com/jorotenev/para_api/app/expenses_api/README.md) of `para_api`
* `tns run android`

### Test locally
* No `para_api` server is needed (it's mocked)
* `tns test android`

# Build a release .apk
* you need to have a `app/App_Resources/Android/google-services.release.json` file (available to collaborators only).
* set env vars required in package.json -> scripts-> release
    * You need the key to sign the package
* npm run release

Building without the --release flag requires just the `google-services.dev.json`.