/*
 * Copyright 2016 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
const toString = Object.prototype.toString

/**
 * @public
 * @function isObject
 * @param {any} val
 * @return {val is Object}
 * false if null, Array, Date, RegExp, String, Number, Function, or primitive
 */
export function isObject (val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

/**
 * @public
 * @function isString
 * @param {any} val
 * @return {val is string}
 */
export function isString (val: any): val is String|string {
  return typeof (val && val.valueOf()) === 'string'
}

/**
 * @public
 * @function isFunction
 * @param {any} val
 * @return {val is Function}
 */
export function isFunction (val: any): val is Function {
  return typeof val === 'function'
}

/**
 * @public
 * @function isNumber
 * @param {any} val
 * @return {val is Number}
 */
export function isNumber (val: any): val is Number|number {
  return typeof (val && val.valueOf()) === 'number'
}
