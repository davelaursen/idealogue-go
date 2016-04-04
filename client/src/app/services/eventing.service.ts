namespace app.services {
    'use strict';

    import Service = ngDecorators.Service;
    import IUtil = blocks.util.IUtil;

    export interface IEventingService {
        registerListener(event: string, name: string, callback: Function): void;
        deregisterListener(event: string, name: string): boolean;
        fireEvent(event: string, data: any): void;
        getListeners(event: string): Function[];
    }

    /**
     * A service that provides custom eventing functionality.
     */
    @Service('app.services', 'eventingService')
    class EventingServicee {
        private _listeners = {};

        static $inject = ['util'];
        constructor(private _util: IUtil) {
        }

        /**
         * Registers an event listener.
         * @param event  the name of the event to listen for
         * @param name  the name of the listener to register
         * @param callback  the listener function to execute when the event fires
         */
        registerListener(event: string, name: string, callback: Function): void {
            if (!this._listeners[event]) {
                this._listeners[event] = {};
            }
            this._listeners[event][name] = callback;
        }

        /**
         * De-registers a listener from an event.
         * @param event  the name of the event
         * @param name  the name of the listener to de-register
         * @returns whether the listener was found and removed
         */
        deregisterListener(event: string, name: string): boolean {
            if (this._listeners[event] && this._listeners[event][name]) {
                delete this._listeners[event][name];
                return true;
            }
            return false;
        }

        /**
         * Fires an event.
         * @param event  the name of th event to fire
         * @param data  the data to pass into the event listeners
         */
        fireEvent(event: string, data: any): void {
            for (let item of this.getListeners(event)) {
                if (this._util.isFunction(item)) {
                    item(data);
                }
            }
        }

        /**
         * Retrieves all of the listeners registered for an event.
         * @param event  the name of the event to retrieve listeners for
         * @returns an array of listener functions
         */
        getListeners(event: string): Function[] {
            var result, eventObj, prop;

            result = [];
            eventObj = this._listeners[event];
            if (eventObj) {
                for (prop in eventObj) {
                    if (eventObj.hasOwnProperty(prop)) {
                        result.push(eventObj[prop]);
                    }
                }
            }
            return result;
        }
    }

}
