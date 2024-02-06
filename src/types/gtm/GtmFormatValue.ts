import { GtmCaseConversionType } from "./enums/GtmCaseConversionType";
import { GtmAnyValueParameter } from "./parameters/GtmAnyParameter";

export interface GtmFormatValue {
  /** The option to convert a string-type variable value to either lowercase or uppercase */
  caseConversionType?: GtmCaseConversionType;
  /** The value to convert if a variable value is false */
  convertFalseToValue?: GtmAnyValueParameter;
  /** The value to convert if a variable value is null */
  convertNullToValue?: GtmAnyValueParameter;
  /** The value to convert if a variable value is true */
  convertTrueToValue?: GtmAnyValueParameter;
  /** The value to convert if a variable value is undefined */
  convertUndefinedToValue?: GtmAnyValueParameter;
}
