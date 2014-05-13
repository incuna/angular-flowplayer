(function (angular, navigator) {
    'use strict';

    var flowplayerModule = angular.module('flowplayer', [
        'ngSanitize'
    ]);

    flowplayerModule.constant('FLOWPLAYER', {});

    flowplayerModule.run(['$templateCache', function ($templateCache) {
        $templateCache.put('templates/flowplayer/video.html',
             '<div><div ng-bind-html="video" ng-show="!poster || playing"></div><img ng-if="poster && !playing" ng-src="{{ poster }}" ng-click="posterClick()"></div>'
        );
    }]);

    flowplayerModule.directive('flowplayer', [
        '$sce', 'FLOWPLAYER', 'PROJECT_SETTINGS',
        function ($sce, FLOWPLAYER, PROJECT_SETTINGS) {
            return {
                restrict: 'A',
                templateUrl: 'templates/flowplayer/video.html',
                replace: true,
                scope: {
                    flashSrc: '@',
                    poster: '@',
                    flashConfig: '=',
                    config: '='
                },
                link: function (scope, iElement, iAttrs) {
                    var SETTINGS = angular.extend({}, FLOWPLAYER, PROJECT_SETTINGS.FLOWPLAYER);

                    var supports = {
                        flash: 'application/x-shockwave-flash' in navigator.mimeTypes
                    };

                    if (supports.flash) {
                        var flowplayerConfig = {
                            clip: {
                                url: scope.flashSrc,
                                autoPlay: angular.isDefined(iAttrs.autoplay)
                            }
                        };
                        if (angular.isDefined(scope.config)) {
                            angular.extend(flowplayerConfig, scope.config);
                        }

                        if (angular.isDefined(SETTINGS.COMMERCIAL_KEY)) {
                            flowplayerConfig.key = SETTINGS.COMMERCIAL_KEY;
                        }

                        var flashConfig = {src: SETTINGS.PLAYER_SWF};
                        if (angular.isDefined(scope.flashConfig)) {
                            angular.extend(flashConfig, scope.flashConfig);
                        }

                        var el = angular.element('<div>');
                        scope.player = flowplayer(el[0], flashConfig, flowplayerConfig);
                        scope.video = $sce.trustAsHtml(el.html());

                        scope.posterClick = function () {
                            scope.playing = true;
                            scope.player.play();
                        };
                    }
                }
            };
        }
    ]);
}(window.angular, window.navigator));
