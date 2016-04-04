namespace blocks.util {
    'use strict';

    import Service = ngDecorators.Service;

    export interface IUtil {
        isObject(val: any): boolean;
        isFunction(val: any): boolean;
        isString(val: any): boolean;
        isBoolean(val: any): boolean;
        isNumber(val: any): boolean;
        isArray(val: any): boolean;
        isDefined(val: any): boolean;
        isEmpty(val: string|any[]|Object): boolean;
        clone(obj: any): any;
        getOwnProperties(obj: Object): string[];
        formatCurrency(num: number, places: number): string;
        round(num: number, places: number): number;
        pathJoin(parts: string[], sep?: string): string;
        detokenize(text: string, valueMap: Object): string;
        countProperties(obj: Object): number;
        arrayToString(arr: any[], prop?: string, sep?: string): string;
        sortCompareFunc<T>(prop: string, desc: boolean, primer: Function): (a:T, b:T) => number;
        getISO8601DateString(): string;
    }

    /**
     * A service that provides generic utility functions.
     */
    @Service('blocks.util', 'util')
    class Util implements IUtil {

        /**
         * Determines if the given value is an object.
         */
        isObject(val: any): boolean {
            return typeof val === 'object' && !Array.isArray(val);
        }

        /**
         * Determines if the given value is a function.
         */
        isFunction(val: any): boolean {
            return val && Object.prototype.toString.call(val) === '[object Function]';
        }

        /**
         * Determines if the given value is a string.
         */
        isString(val: any): boolean {
            return typeof val === 'string';
        }

        /**
         * Determines if the given value is a boolean.
         */
        isBoolean(val: any): boolean {
            return typeof val === 'boolean';
        }

        /**
         * Determines if the given value is a number.
         */
        isNumber(val: any): boolean {
            return typeof val === 'number';
        }

        /**
         * Determines if the given value is an array.
         */
        isArray(val: any): boolean {
            return Array.isArray(val);
        }

        /**
         * Determines if the given value is defined (e.g. not undefined, null or an empty string).
         */
        isDefined(val: any): boolean {
            return (val !== null && val !== undefined && val !== '');
        }

        /**
         * Determines if the given value is empty or consists only of whitespace characters.
         */
        isEmpty(val: string|any[]|Object): boolean {
            let str;

            if (!val) {
                return true;
            }

            if (this.isString(val)) {
                return String(val).trim().length === 0;
            } else if (this.isArray(val)) {
                return Array(val).length === 0;
            } else if (this.isObject(val)) {
                str = JSON.stringify(val);
                return (str === '{}' || str === '[]');
            }
            return false;
        }

        /**
         * Clones a javascript object.
         */
        clone(obj: Object): Object {
            if (!this.isArray(obj) && !this.isObject(obj)) {
                return obj;
            }

            return JSON.parse(JSON.stringify(obj));
        }

        /**
         * Retrieves an array containing the names of all properties owned by the given object.
         */
        getOwnProperties(obj: Object): string[] {
            let result = [];
            if (this.isObject(obj)) {
                for (let prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        result.push(prop);
                    }
                }
            }
            return result;
        }

        /**
        * Rounds and formats a number to a US currency value.
        * @param num  the number to convert to a currency value
        * @param places  the number of decimal places to round to
        */
        formatCurrency(num: number, places: number): string {
            let rounded = this.round(num, places);
            return '$' + String(rounded).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }

        /**
         * Rounds a number to the specified number of decimal places.
         * @param num  the number to round
         * @param places  the number of decimal places to round to
         */
        round(num: number, places: number): number {
            if (!places || places < 0) {
                return Math.round(num);
            }
            let m = Math.pow(10, places);
            return Math.round(num * m) / m;
        }

        /**
         * Joins two or more parts of a path.
         * @param parts  the parts of the path to join
         * @param sep  the separator to use (default: '/')
         */
        pathJoin(parts: string[], sep?: string): string {
            let separator = sep || '/';
            return parts.map((path) => {
                if (path[0] === separator) {
                    path = path.slice(1);
                }
                if (path[path.length - 1] === separator) {
                    path = path.slice(0, path.length - 1);
                }
                return path;
            }).join(separator);
        }

        /**
         * Replaces named tokens (surrounded by curly braces) with values from the given map.
         * @param text  the tokenized string
         * @param valueMap  the map containing token values
         */
        detokenize(text: string, valueMap: Object): string {
            for (let prop in valueMap) {
                if (valueMap.hasOwnProperty(prop)) {
                    text = text.replace('{' + prop + '}', valueMap[prop]);
                }
            }
            return text;
        }

        /**
         * Returns the number of properties (e.g. keys) in an object.
         */
        countProperties(obj: Object): number {
            let count = 0;
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    count++;
                }
            }
            return count;
        }

        /**
         * Returns a string that represents the contents of an array.
         * @param arr  the array
         * @param prop  the name of the property
         * @param sep  the separator to use between values
         */
        arrayToString(arr: any[], prop?: string, sep?: string): string {
            if (!this.isDefined(arr)) {
                return '';
            }

            sep = sep || ', ';

            let result = [];
            for (let item of arr) {
                result.push(this.isDefined(prop) ? item.prop : item);
            }
            return result.join(sep);
        }

        /**
         * Returns a compare function for use by the Array.sort() function to sort objects.
         * @param prop  the name of the property to sort by
         * @param desc  whether or not to sort in descending order
         * @param primer  a function that transforms the prop before comparing values
         */
        sortCompareFunc<T>(prop: string, desc: boolean, primer: Function): (a:T, b:T) => number {
            let key = function (x) {
                let val = prop ? x[prop] : x;
                return primer ? primer(val) : val
            };
            return function (a,b) {
                let A = key(a), B = key(b);
                return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!desc];
            }
        }

        /**
         * Gets the current date as a ISO-8601 date string.
         */
        getISO8601DateString(): string {
            let dateObj = new Date();
            let year = dateObj.getUTCFullYear().toString();
            let month = convert((dateObj.getUTCMonth()+1).toString());
            let date = convert(dateObj.getUTCDate().toString());
            let hours = convert(dateObj.getUTCHours().toString());
            let minutes = convert(dateObj.getUTCMinutes().toString());
            let seconds = convert(dateObj.getUTCSeconds().toString());
            return year + '-' + month + '-' + date + 'T' + hours + ':' + minutes + ':' + seconds + '.000Z';

            function convert(x) {
                return x.length === 1 ? '0' + x : x;
            }
        }
    }

}
