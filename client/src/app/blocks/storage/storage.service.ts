namespace blocks.storage {
    'use strict';

    import Service = ngDecorators.Service;
    import IUtil = blocks.util.IUtil;

    export interface IStorageService {
        setItem(key: string, value: string|Object): boolean;
        getItem(key: string): string|Object;
        removeItem(key: string): boolean;
        clear(): void;
        containsKey(key: string): boolean;
    }

    /**
     * The Storage Service provides wrapper functions for working with session and local storage.
     */
    abstract class StorageService implements IStorageService {
        constructor(private _storage: Storage, private _util: IUtil) { }

        /**
         * Adds an item to storage.
         * @returns true if the value was successfully stored, otherwise false
         */
        setItem(key: string, value: string|Object|any[]): boolean {
            if (key === '') {
                return false;
            }

            if (value instanceof String) {
                this._storage.setItem(key, value);
            } else {
                this._storage.setItem(key, JSON.stringify(value));
            }
            return true;
        }

        /**
         * Gets an item from storage.
         */
        getItem(key: string): string|Object|any[] {
            if (key === '') {
                return null;
            }

            let value = this._storage.getItem(key);
            try {
                //try to convert to object or array
                return JSON.parse(value);
            }
            catch (err) {}

            return value;
        }

        /**
         * Removes an item from storage.
         * @returns true if the value was successfully removed, otherwise false
         */
        removeItem(key: string): boolean {
            if (key === '') {
                return false;
            }
            this._storage.removeItem(key);
            return true;
        }

        /**
         * Clears all values from storage.
         */
        clear(): void {
            this._storage.clear();
        }

        /**
         * Determines if the specified key is in storage.
         */
        containsKey(key: string): boolean {
            if (key === '') {
                return false;
            }

            for (let i = 0; i < this._storage.length; i++) {
                if (this._storage.key(i) === key) {
                    return true;
                }
            }
            return false;
        }
    }

    @Service('blocks.storage', 'sessionStorageService')
    class SessionStorageService extends StorageService {
        static $inject = ['util'];
        constructor(util: IUtil) {
            super(sessionStorage, util);
        }
    }

    @Service('blocks.storage', 'localStorageService')
    class LocalStorageService extends StorageService {
        static $inject = ['util'];
        constructor(util: IUtil) {
            super(localStorage, util);
        }
    }

}
