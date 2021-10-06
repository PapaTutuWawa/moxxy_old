let
  pkgs = import <nixpkgs> { config.android_sdk.accept_license = true; };

  android = pkgs.androidenv.composeAndroidPackages {
    buildToolsVersions = [ "30.0.2" ];
    platformVersions = [ "30" ];
  };
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    gradle
    jdk8
    android.androidsdk
    nodePackages.react-native-cli
    nodePackages.npm
    nodejs
    git
  ];

  ANDROID_HOME = "${android.androidsdk}/libexec/android-sdk";
  GRADLE_OPTS = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${android.androidsdk}/libexec/android-sdk/build-tools/30.0.2/aapt2";
}
