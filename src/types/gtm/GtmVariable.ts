import { GtmFormatValue } from "./GtmFormatValue";
import { GtmPropertyWithFolder } from "./GtmPropertyWithFolder";
import { GtmAnyParameter } from "./parameters/GtmAnyParameter";

export interface GtmVariable extends GtmPropertyWithFolder {
  /** The Variable ID uniquely identifies the GTM Variable */
  variableId: string;
  /** GTM Variable Type */
  type: string; // TODO: enum
  /**
   * For mobile containers only: A list of trigger IDs for disabling conditional variables;
   * the variable is enabled if one of the enabling trigger is true
   * while all the disabling trigger are false.
   * Treated as an unordered set
   */
  disablingTriggerId?: string[];
  /**
   * For mobile containers only: A list of trigger IDs for enabling conditional variables;
   * the variable is enabled if one of the enabling triggers is true
   * while all the disabling triggers are false.
   * Treated as an unordered set
   */
  enablingTriggerId?: string[];
  /** Option to convert a variable value to other value */
  formatValue?: GtmFormatValue;
  /** The variable's parameters */
  parameter?: GtmAnyParameter[];
  /** The start timestamp in milliseconds to schedule a variable */
  scheduleStartMs?: `${number}`;
  /** The end timestamp in milliseconds to schedule a variable */
  scheduleEndMs?: `${number}`;
}
