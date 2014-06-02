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
             '<div><div ng-bind-html="video" ng-show="!poster || playing"></div><img ng-if="poster && !playing" ng-src="{{ poster }}" ng-click="play()"></div>'
        );
    }]);

    flowplayerModule.directive('flowplayer', [
        '$compile', '$sce', '$templateCache', 'FLOWPLAYER', 'PROJECT_SETTINGS',
        function ($compile, $sce, $templateCache, FLOWPLAYER, PROJECT_SETTINGS) {
            return {
                restrict: 'A',
                scope: {
                    clip: '@',
                    poster: '@',
                    flowplayerConfigKey: '&',
                    flashConfigKey: '&'
                },
                link: function (scope, iElement, iAttrs) {
                    var SETTINGS = angular.extend({}, FLOWPLAYER, PROJECT_SETTINGS.FLOWPLAYER);

                    var supports = {
                        flash: 'application/x-shockwave-flash' in navigator.mimeTypes
                    };

                    if (supports.flash) {
                        var player;
                        var flashConfig = {};
                        var flowplayerConfig = {
                            clip: {}
                        };

                        if (angular.isUndefined(iAttrs.flashConfigKey)) {
                            scope.flashConfigKey = 'default';
                        }

                        if (angular.isUndefined(iAttrs.flowplayerConfigKey)) {
                            scope.flowplayerConfigKey = 'default';
                        }

                        if (angular.isDefined(SETTINGS.FLASH_CONFIG[scope.flashConfigKey])) {
                            angular.extend(flashConfig, SETTINGS.FLASH_CONFIG[scope.flashConfigKey]);
                        }

                        if (angular.isDefined(SETTINGS.FLOWPLAYER_CONFIG[scope.flowplayerConfigKey])) {
                            angular.extend(flowplayerConfig, SETTINGS.FLASH_CONFIG[scope.flowplayerConfigKey]);
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

                        if (angular.isDefined(mp4Source.src)) {
                            angular.extend(flowplayerConfig.clip, {
                                url: mp4Source.src,
                                autoPlay: angular.isDefined(iAttrs.autoplay)
                            });
                        }

                        // Define events for all clips.
                        angular.extend(flowplayerConfig.clip, {
                            onFinish: function () {
                                scope.stop();
                            },
                            onStop: function () {
                                scope.stop();
                            }
                        });

                        scope.$watch('clip', function (newVal, oldVal) {
                            // Initialise flowplayer.
                            if (angular.isUndefined(player)) {
                                var el = angular.element('<div>');
                                player = flowplayer(el[0], flashConfig, flowplayerConfig);
                                scope.video = $sce.trustAsHtml(el.html());
                                iElement.contents().replaceWith($compile($templateCache.get('templates/flowplayer/video.html'))(scope));
                            }

                            if (angular.isDefined(iAttrs.clip)) {
                                // Add all clips to flowplayer.
                                var clips = [].concat(newVal);
                                angular.forEach(clips, function (clip, index) {
                                    player.addClip(clip, index);
                                });
                            }
                        }, true);

                        scope.play = function () {
                            flowplayer('*').each(function () {
                                this.stop();
                            });
                            scope.playing = true;
                            player.play();
                        };

                        scope.stop = function () {
                            player.stop();
                            scope.playing = false;
                        };
                    }
                }
            };
        }
    ]);
}(window.angular, window.navigator));
