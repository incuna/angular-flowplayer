# 1.3.1

* Upgrade Angular compatibility to include 1.3, 1.4 and 1.5.
* Upgrade Angular-sanitize compatibility to include 1.3, 1.4 and 1.5.
* Upgrade Lodash compatibility to include 3 and 4.

# 1.3.0

* Improved the base template.
* Flowplayer now unloads when the video finishes, reverting back to
  the poster state.

# 1.2.2

 * Fix issue introduced in 1.2.1 where a jQuery dependency was required.

# 1.2.1

* We now replace the contents of the `flowplayer` directive with `.html(compiled)`
  rather than `.contents().replaceWith(compiled)`, as `.contents()` could return
  more than one element, resulting in multiple replacements.

# 1.2.0

* Improve flash support test for IE.
* Provide supportsFlash factory to test flash support.

# 1.1.0

* Set the clip's captionUrl based on the first captions track element.

# 1.0.2

* The template is now compiled once, outside of the linking function.
* Fixed an issue with angular.extend where it was joining objects between
  directives.
* Flowplayer is initialised inside a $timeout function so that the HTML it uses
  has already been bound to the scope.

# 1.0.1

* Fix issues specifying clip dynamically.
* Fix initialisation options issues.
* Make mp4 source not required.

# 1.0.0

* Clips can now be configured dynamically.
* The player can be initialised with a full set of options from the settings.
* Fixed an issue where the player would not fall back to HTML5 video if supported.

# 0.0.5

* Improve dependency matching in `bower.json` to reduce conflicts.

# 0.0.4
* Allow setting of Flowplayer configuration as attributes.
* Scope attributes are now set explicitly rather than added when checking the
  passed attributes.

# 0.0.3
* Pass global vars into anonymous wrapper function to work in strict mode.

# 0.0.2
* Create an isolate scope for the flowplayer directive.

# 0.0.1
* Initial release.
