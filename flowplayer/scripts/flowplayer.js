(function () {
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
                link: function (scope, iElement, iAttrs) {
                    var SETTINGS = angular.extend({}, FLOWPLAYER, PROJECT_SETTINGS.FLOWPLAYER);

                    var supports = {
                        flash: 'application/x-shockwave-flash' in navigator.mimeTypes
                    };

                    if (angular.isDefined(iAttrs.srcset)) {
                        var sources = JSON.parse(iAttrs.srcset);
                    }

                    if (supports.flash) {
                        var flowplayerParams = {
                            clip: {
                                url: iAttrs.flashSrc,
                                autoPlay: angular.isDefined(iAttrs.autoplay)
                            }
                        };

                        if (angular.isDefined(SETTINGS.COMMERCIAL_KEY)) {
                            flowplayerParams.key = SETTINGS.COMMERCIAL_KEY;
                        }

                        var el = angular.element('<div>');
                        scope.player = flowplayer(el[0], SETTINGS.PLAYER_SWF, flowplayerParams);
                        scope.video = $sce.trustAsHtml(el.html());

                        if (angular.isDefined(iAttrs.poster)) {
                            scope.poster = iAttrs.poster;
                        }

                        scope.posterClick = function () {
                            scope.playing = true;
                            scope.player.play();
                        };
                    }
                }
            };
        }
    ]);
}());
