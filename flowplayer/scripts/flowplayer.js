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

    flowplayerModule.directive('flowplayer', [
        '$compile', '$sce', '$timeout', '$templateCache', 'FLOWPLAYER', 'PROJECT_SETTINGS',
        function ($compile, $sce, $timeout, $templateCache, FLOWPLAYER, PROJECT_SETTINGS) {
            var supports = {
                flash: 'application/x-shockwave-flash' in navigator.mimeTypes
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

                            // We need to use the `.mp4` file for flowplayer.
                            var mp4Source = _.find(sources, function (source) {
                                return source.src.split('.').pop() === 'mp4';
                            });

                            compiled(scope, function (clonedElement, scope) {
                                iElement.contents().replaceWith(clonedElement);
                            });

                            scope.$watch('clip', function (newVal, oldVal) {
                                if (angular.isDefined(newVal)) {
                                    // Using `update` as neither `player.addClip()` nor `player.setClip()` worked
                                    setClip(newVal);
                                }
                            }, true);

                            if (angular.isUndefined(scope.clip) && angular.isDefined(mp4Source) && angular.isDefined(mp4Source.src)) {
                                setClip({
                                    url: mp4Source.src
                                });
                            }
                        };
                    }
                }
            };
        }
    ]);
}(window.angular, window.navigator));
