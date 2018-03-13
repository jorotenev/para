# Para
Para is a simple & and easy to use mobile application to track expenses.
This repo contains the source code of the mobile app. The backend API is located in [para_api](https://github.com/jorotenev/para_api)

# Development & Testing
### Prerequisites
* You need a `app/App_Resources/Android/google-services.dev.json` [how to get it](https://github.com/EddyVerbruggen/nativescript-plugin-firebase#prerequisites)
    * (essentially you need a firebase project's `google-services.json`, file obtained in the process of setting up an android sdk through the Firebase Console)
* You need an emulator or an Android phone (with developer mode ON & USB Debugging enabled)

### Run locally
* You need the IP of a running [para_api](https://github.com/jorotenev/para_api) server set in `app/app_config.json`
* `tns run android`

### Test locally
* No `para_api` server is needed (it's mocked)
* `tns test android`

# Build a release .apk
* you need to have a `app/App_Resources/Android/google-services.release.json` file.
* set env vars required in package.json -> scripts-> release
    * You need the key to sign the package
* npm run release