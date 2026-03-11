fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android dev

```sh
[bundle exec] fastlane android dev
```

dev

### android real

```sh
[bundle exec] fastlane android real
```

real

### android upload_to_pgyer_dev

```sh
[bundle exec] fastlane android upload_to_pgyer_dev
```

Upload dev build to Pgyer

### android upload_to_pgyer_real

```sh
[bundle exec] fastlane android upload_to_pgyer_real
```

Upload real build to Pgyer

### android clean

```sh
[bundle exec] fastlane android clean
```

清理构建产物（安全清理，先生成 codegen 再清理）

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
