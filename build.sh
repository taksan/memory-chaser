rm -rf platforms/*
rm -rf plugins/*
cordova platform add android
#cordova plugin add com.ludei.webview.plus
#cordova plugin add cordova-plugin-crosswalk-webview
cordova build
