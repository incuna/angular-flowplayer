(function (angular, navigator) {
    'use strict';

    var flowplayerModule = angular.module('flowplayer', [
        'ngSanitize'
    ]);

    flowplayerModule.constant('FLOWPLAYER', {
        FLASH_CONFIG: {},
        FLOWPLAYER_CONFIG: {}
    });

    flowplayerModule.run(['$templateCache', function ($templateCache) {
        $templateCache.put('templates/flowplayer/video.html',
             '<a ng-href="url" ng-show="url" ><img ng-show="poster" ng-src="{{ poster }}" ></a>'
        );
    }]);

    flowplayerModule.factory('supportsFlash', [
        function () {
            if (navigator.plugins && navigator.plugins.length > 0) {
                var type = 'application/x-shockwave-flash';
                var mimeTypes = navigator.mimeTypes;
                return (mimeTypes &&
                        mimeTypes[type] &&
                        mimeTypes[type].enabledPlugin &&
                        mimeTypes[type].enabledPlugin.description && 1);
            } else {
                var flashObj = null;
                try {
                    flashObj = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                } catch (ex) {
                    return false;
                }
                if (flashObj !== null) {
                    try {
                        if (flashObj.GetVariable('$version')) {
                            return true;
                        }
                    } catch (err) {
                        return false;
                    }
                }
            }
            return false;
        }
    ]);

    flowplayerModule.directive('flowplayer', [
        'supportsFlash', '$compile', '$sce', '$timeout', '$templateCache', 'FLOWPLAYER', 'PROJECT_SETTINGS',
        function (supportsFlash, $compile, $sce, $timeout, $templateCache, FLOWPLAYER, PROJECT_SETTINGS) {
            var supports = {
                flash: supportsFlash
            };

            return {
                restrict: 'A',
                scope: {
                    clip: '=',
                    poster: '@',
                    flowplayerConfigKey: '@',
                    flashConfigKey: '@'
                },
                compile: function (tElement, tAttrs) {
                    if (supports.flash) {
                        var compiled = $compile($templateCache.get('templates/flowplayer/video.html'));

                        return function (scope, iElement, iAttrs) {
                            var SETTINGS = angular.extend({}, FLOWPLAYER, PROJECT_SETTINGS.FLOWPLAYER);

                            var flashConfig = {};
                            var flowplayerConfig = {};

                            var setClip = function (clip) {
                                $timeout(function () {
                                    // Initialise flowplayer.
                                    flowplayerConfig.clip = flowplayerConfig.clip || {};
                                    angular.extend(flowplayerConfig.clip, clip);
                                    flowplayer(iElement[0], flashConfig, flowplayerConfig);
                                }, 0);
                                scope.url = clip.url;
                            };

                            if (angular.isUndefined(iAttrs.flashConfigKey)) {
                                scope.flashConfigKey = 'default';
                            }

                            if (angular.isUndefined(iAttrs.flowplayerConfigKey)) {
                                scope.flowplayerConfigKey = 'default';
                            }

                            if (angular.isDefined(SETTINGS.FLASH_CONFIG[scope.flashConfigKey])) {
                                angular.extend(flashConfig, angular.copy(SETTINGS.FLASH_CONFIG[scope.flashConfigKey]));
                            }

                            if (angular.isDefined(SETTINGS.FLOWPLAYER_CONFIG[scope.flowplayerConfigKey])) {
                                angular.extend(flowplayerConfig, angular.copy(SETTINGS.FLOWPLAYER_CONFIG[scope.flowplayerConfigKey]));
                            }

                            // A dictionary of sources information.
                            var sources = _.map(iElement.find('source'), function (source) {
                                return {
                                    src: source.getAttribute('src'),
                                    type: source.getAttribute('type')
                                };
                            });

                            var tracks = _.map(iElement.find('track'), function (source) {
                                return {
                                    src: source.getAttribute('src'),
                                    kind: source.getAttribute('kind'),
                                    label: source.getAttribute('label'),
                                    srclang: source.getAttribute('srclang')
                                };
                            });

                            // We need to use the `.mp4` file for flowplayer.
                            var mp4Source = _.find(sources, function (source) {
                                return source.src.split('.').pop() === 'mp4';
                            });


                            var captions = _.find(tracks, function (track) {
                                return track.kind === 'captions';
                            });

                            compiled(scope, function (clonedElement, scope) {
                                iElement.html(clonedElement);
                            });

                            scope.$watch('clip', function (newVal, oldVal) {
                                if (angular.isDefined(newVal)) {
                                    // Using `update` as neither `player.addClip()` nor `player.setClip()` worked
                                    setClip(newVal);
                                }
                            }, true);

                            if (angular.isUndefined(scope.clip) && angular.isDefined(mp4Source) && angular.isDefined(mp4Source.src)) {
                                var clip = {
                                    url: mp4Source.src
                                };
                                if (captions && captions.src) {
                                    clip.captionUrl = captions.src;
                                }
                                setClip(clip);
                            }
                        };
                    }
                }
            };
        }
    ]);
}(window.angular, window.navigator));
