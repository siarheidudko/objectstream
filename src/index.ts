/**
 * Module for stream conversion Json to String and String to Json
 * @module sergdudko/objectstream
 * @author Siarhei Dudko <slavianich@gmail.com>
 * @copyright 2020
 * @license MIT
 * @version 2.0.0
 * @requires stream
 */

import { Parser } from "./classes/Parser";
import { Stringifer } from "./classes/Stringifer";

export = (module.exports = {
  /**
   * Object to String stream
   */
  Stringifer,
  /**
   * String to Object stream
   */
  Parser,
});
