(function () {
    'use strict';

    angular
        .module('TabeebApp')
        .factory('webSocketService', webSocketService);

    webSocketService.$inject = ['$window', '$rootScope', 'CONFIG', 'sessionService', '$q', 'logger', '$state'];

    function webSocketService($window, $rootScope, CONFIG, sessionService, $q, logger, $state) {
        var hub;
        var self = this;

        var isInitializing = false;
		/**
         * The user ID that was the current user's id when the websocket was initialized
         * @type {String}
         */
        var currentUserId = null;

        var callbacksWhenReady = [];

        var service = {
            addChatMessage: addChatMessage,
            clearAnnotations: clearAnnotations,
            deleteAnnotation: deleteAnnotation,
            disconnect: disconnect,
            isConnected: isConnected,
            initialize: initialize,
            joinMedia: joinMedia,
            joinContent: joinContent,
            leaveMedia: leaveMedia,
            leaveContent: leaveContent,
            notifyContent: notifyContent,
            point: point,
            restoreAnnotation: restoreAnnotation,
            sendAudio: sendAudio,
            sendInvite: sendInvite,
            sendParticipantAction: sendParticipantAction,
            sendPresenterAction: sendPresenterAction,
            sendStroke: sendStroke,
            sendText: sendText,
            setPresenter: setPresenter,
            setSessionMode: setSessionMode,
            setOffer: setOffer, 
            addCandidate: addCandidate,
            setAnswer: setAnswer,
            takeRemoteSnapshot: takeRemoteSnapshot,
            notifyContentDeleted: notifyContentDeleted,
            updateAnnotation: updateAnnotation,
            getPresentationState: getPresentationState,
            updatePresentationState: updatePresentationState,
            confirmPresentationState: confirmPresentationState,
            addFormAnswer: addFormAnswer,
            onReady: onReady,
            updateChargeLevel: updateChargeLevel,
            attachForm: attachForm
        };

        return service;

        function onReady(callback) {
            if (isConnected() === true) {
                callback();
            }
            else {
                if (isInitializing !== true) {
                    initialize();
                }
                callbacksWhenReady.push(callback);
            }
        }

        // WHITEBOARD SESSIONS
    
    
        function confirmPresentationState (roomId) {
            return invokeHubCall("ConfirmPresenterState", roomId);
        }
        /**
         * @param {String} contentId
         * @param {TabeebPresenterState} presenterState
         * @param {Boolean} fullState
         */
        function updatePresentationState (contentId, presenterState, fullState) {
            return invokeHubCall("UpdatePresenterState", contentId, presenterState, fullState);
        }

        /**
         * @param {String} contentId
         * @returns {*}
         */
        function getPresentationState(contentId) {
            return invokeHubCall("GetPresentationState", contentId);
        }

        function updateAnnotation(annotation, contentId, pageId) {
            annotation.PageId = pageId;
            annotation.ContentId = contentId;
            return invokeHubCall('UpdateAnnotation', annotation);
        }

        function joinContent(contentId) {
            return invokeHubCall('JoinContent', contentId);
        }

        function leaveContent(contentId) {
            return invokeHubCall('LeaveContent', contentId);
        }

        function notifyContentDeleted (contentId)
        {
            return invokeHubCall('NotifyContentDeleted', contentId);
        }

        // WHITEBOARD ANNOTATIONS
        function sendStroke(stroke) {
            console.log("Sending stroke", stroke);
            if (stroke.Type == 2) return point(stroke); // laser
            else return invokeHubCall('AddStroke', stroke);
        }

        function sendText(text) {
            return invokeHubCall('AddText', text);
        }

        function sendAudio(audio) {
            return invokeHubCall('AddAudio', audio);
        }

        function deleteAnnotation(annotation) {
            return invokeHubCall('DeleteAnnotation', annotation.Id);
        }

        function restoreAnnotation(annotation) {
            return invokeHubCall('RestoreAnnotation', annotation.Id);
        }

        function clearAnnotations(pagetId, contentId) {
            return invokeHubCall('ClearAnnotations', pagetId, contentId);
        }

        // WHITEBOARD PRESENTER
        function setPresenter(contentId, presenterId) {
            return invokeHubCall('SetPresenter', contentId, presenterId);
        }
        
        function setSessionMode (contentId, sessionMode) {
            return invokeHubCall('SetSessionMode', contentId, sessionMode);
        }
        
        function updateChargeLevel (contentId, userId, level) {
            return invokeHubCall('UpdateChargeLevel', contentId, userId, level);
        }     
        
        function attachForm (contentId) {
            return invokeHubCall('AttachForm', contentId);
        }           

		/**
         * @param {String} contentId
         * @param {String} pageId
         * @param {String} formId
         * @param {Number} timestamp
         * @returns {*}
         */
        function addFormAnswer (contentId, pageId, answersForAnnotations, timestamp) {
            return invokeHubCall('AnswerQuestion', contentId, pageId, answersForAnnotations, timestamp);
        }

        function setOffer (contentId, description, recipientId) {
            return invokeHubCall('SetOffer', contentId, description, recipientId);
        }

        function addCandidate (contentId, ice, recipientId) {
            return invokeHubCall('AddCandidate', contentId, ice, recipientId);
        }

        function setAnswer (contentId, description, offererId) {
            return invokeHubCall('SetAnswer', contentId, description, offererId);
        }

        function takeRemoteSnapshot (contentId, userId) {
            return invokeHubCall('TakeRemoteSnapshot', contentId, userId);
        }

        function sendPresenterAction(contentId, model) {

            if (!model.type)
            {
                console.error(model);
                return false;
            }

            return invokeHubCall('PresenterAction', contentId, model);
        }

        function sendParticipantAction(contentId, model) {
            if (!model.type) {
                console.error(model);
                return false;
            }

            return invokeHubCall('ParticipantAction', contentId, model);
        }

        // WHITEBOARD POINTER
        function point(stroke) {
            return invokeHubCall('Point', stroke);
        }

        // WHITEBOARD SESSION CHAT
        function addChatMessage(chatMessage) {
            return invokeHubCall('AddChatMessage', chatMessage);
        }

        // WHITEBOARD NOTIFICATIONS
        function notifyContent(id, model) {
            return invokeHubCall('NotifyContent', id, model);
        }

        // WHITEBOARD SESSION INVITE
        function sendInvite(invite) {
            return invokeHubCall('SendInvite', invite);
        }

        // WHITEBOARD SESSION MEDIA ROOM
        function joinMedia (contentId) {
            console.log("Joining Media");
            return invokeHubCall('JoinMedia', contentId);
        }

        function leaveMedia (contentId) {
            return invokeHubCall('LeaveMedia', contentId);
        }

        // INITIALIZE
        function isConnected() {
            return typeof self.hub !== 'undefined' && self.hub.connection.state == 1 && isInitializing !== true;
        }

        function initialize() {
            if (isInitializing === true || isConnected())
                return;

            isInitializing = true;

            // hub/connection setup
            var session = sessionService.getSession();
            var accessToken = session.accessToken;
            currentUserId = session.user.id;
            var connection = $window.jQuery.hubConnection(CONFIG.apiServiceBaseUri + 'signalr', { useDefaultPath: false });
            connection.qs = { 'token': accessToken };
            connection.logging = true;
            self.hub = connection.createHubProxy('tabeeb');

            // ERROR HANDLING
            connection.error(function (error) {
                //logger.error('SignalR error: ' + error);
                if (error && error.context)
                {
                    var sessionUser = sessionService.getSessionUser();
                    if (error.context.status === 401)
                    {
                        if (sessionUser && sessionUser.tenantRole === "Guest")
                        {
                            $state.go("login");
                            logger.info("The token has expired.");
                        }
                    }
                }
                console.error('SignalR error: ' + error);
            });
            connection.stateChanged(function (change) { });
            connection.reconnected(function () { });

            // NOTIFICATIONS
            self.hub.on('onAnnotation',/**@param {Service_Annotation} annotation*/ function (annotation) {
                logger.debug('webSocketService.onAnnotation', annotation);
                $rootScope.$broadcast('onAnnotationReceived', annotation);
            });

            self.hub.on('onAnnotationDeleted', function (pagetId, annotationId) {
                //logger.debug('webSocketService.onAnnotationDeleted', annotationId);
                $rootScope.$broadcast('onAnnotationDeleted', pagetId, annotationId);
            });

            self.hub.on('onAnnotationRestored', function (annotationId) {
                //logger.debug('webSocketService.onAnnotationRestored', annotationId);
                $rootScope.$broadcast('onAnnotationRestored', annotationId);
            });

            self.hub.on('onClearAnnotations', function (pagetId) {
                logger.debug('webSocketService.onClearAnnotations', pagetId);
                $rootScope.$broadcast('onClearAnnotationsReceived', pagetId);
            });

            self.hub.on('onChatMessage',/**@param {ChatMessage} chatMessage*/ function (chatMessage) {
                logger.debug('webSocketService.onChatMessage', chatMessage);
                $rootScope.$broadcast('onChatMessage', chatMessage);
            });

            self.hub.on('onNotification', function (notification) {
                logger.debug('webSocketService.onNotification', notification);
                $rootScope.$broadcast('onNotification', notification);
            });

            self.hub.on('onNotifyContent', function (model) {
                logger.debug('webSocketService.onNotifyContent', model);
                $rootScope.$broadcast('onNotifyContent', model);
            });

            self.hub.on('onParticipantAction', function (model) {
                logger.debug('webSocketService.onParticipantAction', model);
                $rootScope.$broadcast('onParticipantAction', model);
            });

            self.hub.on('onPresenterChanged', function (presenterId) {
                logger.debug('webSocketService.onPresenterChanged', presenterId);
                $rootScope.$broadcast('onPresenterChanged', presenterId);
            });

            self.hub.on('onPresenterAction', function (model) {
                logger.debug('webSocketService.onPresenterAction', model);
                $rootScope.$broadcast('onPresenterAction', model);
            });

            self.hub.on('onExistingMediaUsers', /**@param {Service_User[]} participants*/  function (participants) {
                logger.debug('webSocketService.onExistingMediaUsers', participants);
                $rootScope.$broadcast('onExistingMediaUsers', participants);
            });

            self.hub.on('onPresenterState', /**@param {TabeebPresenterState} presenterState*/  function (presenterState) {
                logger.debug('webSocketService.onPresenterState', presenterState);
                $rootScope.$broadcast('onPresenterState', presenterState);
            });

            self.hub.on('onMediaUserJoined', /**@param {Service_User} participant*/ function (participant) {
                logger.debug('webSocketService.onMediaUserJoined', participant);
                $rootScope.$broadcast('onMediaUserJoined', participant);
            });

            self.hub.on('onMediaUserLeft', /**@param {Service_User} participant*/ function (participant) {
                logger.debug('webSocketService.onMediaUserLeft', participant);
                $rootScope.$broadcast('onMediaUserLeft', participant);
            });

            self.hub.on('onExistingSessionUsers', /**@param {Service_User[]} participants*/ function (participants) {
                logger.debug('webSocketService.onExistingSessionUsers', participants);
                $rootScope.$broadcast('onExistingSessionUsers', participants);
            });

            self.hub.on('onSessionUserJoined', /**@param {Service_User} user*/ function (user) {
                logger.debug('webSocketService.onSessionUserJoined', user);
                $rootScope.$broadcast('onSessionUserJoined', user);
            });

            self.hub.on('onSessionUserLeft', /**@param {Service_User} user*/ function (user) {
                logger.debug('webSocketService.onSessionUserLeft', user);
                $rootScope.$broadcast('onSessionUserLeft', user);
            });

            self.hub.on('onNotifyContentDeleted', function (contentId) {
                logger.debug('webSocketService.onNotifyContentDeleted', contentId);
                $rootScope.$broadcast('onNotifyContentDeleted', contentId);
            });

            self.hub.on('onAssetUpdated', /**@param {Asset} asset*/ function (asset) {
                logger.debug('webSocketService.onAssetUpdated', asset);
                $rootScope.$broadcast('onAssetUpdated', asset);
            });

            self.hub.on('onRemoteChargeUpdated', function (contentId, userId, level) {              
                $rootScope.$broadcast('onRemoteChargeUpdated', contentId, userId, level);
            });
            
            self.hub.on('onFormAttached', function (contentId, userId) {              
                $rootScope.$broadcast('onFormAttached', contentId, userId);
            });
            
            self.hub.on('onAnnotationUpdate',/**@param {Service_Annotation} annotation*/ function (annotation) {
                //logger.debug('webSocketService.onAnnotationUpdate', annotation);
                $rootScope.$broadcast('onAnnotationUpdate', annotation);
            });

            self.hub.on('onOfferReceived', function (description, userId) {
                $rootScope.$broadcast('onOfferReceived', description, userId);
            });

            self.hub.on('onCandidateReceived', function (candidate, userId) {
                $rootScope.$broadcast('onCandidateReceived', candidate, userId);
            });

            self.hub.on('onAnswerReceived', function (description, userId) {
                $rootScope.$broadcast('onAnswerReceived', description, userId);
            });

            self.hub.on('onSnapshotRequestReceived', function (userId) {
                $rootScope.$broadcast('onSnapshotRequestReceived', userId);
            });

            $rootScope.$broadcast('onHubReady', true);

            // START CONNECTION
            return connection.start().done(function () {
                logger.debug('webSocketService.initialize', connection);
                isInitializing = false;
                callbacksWhenReady.forEach(function (callback) {
                    callback();
                });
                callbacksWhenReady.length = 0;
            });
        }

        function disconnect() {
            if (isConnected()) {
                self.hub.connection.stop();
            }
        }

        // private
        function invokeHubCall() {
            if (sessionService.exists() !== true)
            {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            }

            var sessionUser = sessionService.getSession().user;
            if (sessionUser.id != currentUserId) {
                console.warn("SignalR has user id mismatch.");
            }

            if (self.hub.connection.state == 1) // connected
                return safeInvoke.apply(null, arguments);
            else if (self.hub.connection.state == 0 || self.hub.connection.state == 2) { // connecting or reconnecting ... wait 1 second
                var fails = 0;
                var allowedFails = 5;
                deferred = $q.defer();
                var args = arguments;
                var time = 1000;
                var interval = setInterval(function() {
                    safeInvoke.apply(null, args).then(
                        function (result) {
                            clearInterval(interval);
                            deferred.resolve(result);
                        },
                        function (result) {
                            fails++;
                            if (fails >= allowedFails)
                            {
                                clearInterval(interval);
                                deferred.reject(result);
                            }
                        }
                    );
                    time *= 2;
                } , time);
//                return setTimeout(function () { return safeInvoke.apply(null, arguments); }, 1000);
                return deferred.promise;
            }
            else if (self.hub.connection.state == 4) { // closed
                console.warn('Reconnecting signalR hub...');
                if (isInitializing) {
                    fails = 0;
                    allowedFails = 5;
                    deferred = $q.defer();
                    args = arguments;
                    time = 1000;
                    interval = setInterval(function() {
                        invokeHubCall.apply(null, args).then(
                            function (result) {
                                clearInterval(interval);
                                deferred.resolve(result);
                            },
                            function (result) {
                                fails++;
                                if (fails >= allowedFails)
                                {
                                    clearInterval(interval);
                                    deferred.reject(result);
                                }
                            }
                        );
                        time *= 2;
                    } , time);
                    return deferred.promise;
                }
                else
                {
                    return self.hub.connection.start()
                        .done(function () {
                            return safeInvoke.apply(null, arguments);
                        })
                        .fail(function () {
                            logger.error('Failed to establish websocket connection with server.');
                        });
                }
            }
            else logger.error('Failed to establish websocket connection with server.');
        }

        function safeInvoke() {
            var args = [].slice.call(arguments);
            args[0] = 'webSocketService.' + args[0];
            logger.debug.apply(null, args);

            var defer = $q.defer();
            self.hub.invoke.apply(self.hub, arguments)
                .done(
                    function (result) {
                        if (result.Succeeded) {
                            args.push(result.Result);
                            args.push('Succeeded!');
                            logger.debug.apply(null, args);
                            defer.resolve(result.Result);
                        }
                        else {
                            console.log(result);
                            args.concat(result.Errors);
                            logger.error.apply(null, args);
                            defer.reject(result);
                        }
                    })
                .fail(
                    function (error) {
                        console.error("ERROR", error);
                        args.concat(error.Errors);
                        logger.error.apply(null, args);
                        defer.reject(error);
                    });
            return defer.promise;

        }
    }
})();