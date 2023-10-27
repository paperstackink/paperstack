# Changelog

All notable changes to this project will be documented in this file.

## [0.6.0] - 2023-10-27

### Fixed

-   Various issues with `paper create` command
-   Fix issue where `pages`, `allPages` weren't properly set on nested records

### Added

-   Markdown support
-   Better error messages
-   Config files

## [0.5.0] - 2023-08-30

### Added

-   Added `$data` record
-   Added all properties of `$page` as global variables
-   Upgraded to `0.4.0` of Stencil

## [0.4.0] - 2023-08-10

### Fixed

-   Fixed issue where it would rebuild multiple times when starting the dev server

### Added

-   Added global `$pages` variable
-   Added `$page` variable for each page
-   Added @each directive
-   Upgraded to `0.3.0` of Stencil

## [0.3.0] - 2023-07-09

### Added

-   Added `make:page` command
-   Added `make:component` command
-   Upgraded to `0.2.0` of Stencil

## [0.2.0] - 2023-07-02

### Added

-   Added a new 'create' command

## [0.1.2] - 2023-06-30

### Fixed

-   Fix path resolution

## [0.1.1] - 2023-06-30

### Fixed

-   Included the correct files in the released bundle
