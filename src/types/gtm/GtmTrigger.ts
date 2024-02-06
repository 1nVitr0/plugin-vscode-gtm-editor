import { GtmFilter } from "./GtmFilter";
import { GtmPropertyWithFolder } from "./GtmPropertyWithFolder";
import { GtmTriggerType } from "./enums/GtmtriggerType";
import { GtmAnyDeepParameter, GtmAnyParameter } from "./parameters/GtmAnyParameter";
import { GtmBooleanParameter } from "./parameters/GtmBooleanParameter";
import { GtmIntegerParameter } from "./parameters/GtmIntegerParameter";
import { GtmListParameter } from "./parameters/GtmListParameter";
import { GtmTemplateParameter } from "./parameters/GtmTemplateParameter";

export interface GtmTrigger extends GtmPropertyWithFolder {
  /** The Trigger ID uniquely identifies the GTM Trigger */
  triggerId: `${number}`;
  /** The Trigger ID uniquely identifies the GTM Trigger */
  type: GtmTriggerType;
  /** Used in the case of auto event tracking */
  autoEventFilter?: GtmFilter[];
  /**
   * Whether or not we should only fire tags if the form submit or link click event
   * is not cancelled by some other event handler (e.g. because of validation).
   * Only valid for Form Submission and Link Click triggers
   */
  checkValidation?: GtmBooleanParameter;
  /**
   * A visibility trigger minimum continuous visible time (in milliseconds).
   * Only valid for AMP Visibility trigger
   */
  continuousTimeMinMilliseconds?: GtmIntegerParameter;
  /** Used in the case of custom event, which is fired if all Conditions are true */
  customEventFilter?: GtmFilter[];
  /**
   * Name of the GTM event that is fired.
   * Only valid for Timer triggers
   */
  eventName?: GtmTemplateParameter;
  /** The trigger will only fire iff all Conditions are true */
  filter?: GtmFilter[];
  /**
   * List of integer percentage values for scroll triggers.
   * The trigger will fire when each percentage is reached when
   * the view is scrolled horizontally.
   * Only valid for AMP scroll triggers
   */
  horizontalScrollPercentageList?: GtmListParameter<GtmIntegerParameter>;
  /**
   * Time between triggering recurring Timer Events (in milliseconds).
   * Only valid for Timer triggers
   */
  interval?: GtmIntegerParameter;
  /**
   * Time between Timer Events to fire (in seconds).
   * Only valid for AMP Timer trigger
   */
  intervalSeconds?: GtmIntegerParameter;
  /**
   * Limit of the number of GTM events this Timer Trigger will fire.
   * If no limit is set, we will continue to fire GTM events until
   * the user leaves the page. Only valid for Timer triggers
   */
  limit?: GtmIntegerParameter;
  /**
   * Max time to fire Timer Events (in seconds).
   * Only valid for AMP Timer trigger
   */
  maxTimerLengthSeconds?: GtmIntegerParameter;
  /** Additional parameters */
  parameter: GtmAnyDeepParameter[];
  /**
   * A click trigger CSS selector (i.e. "a", "button" etc.).
   * Only valid for AMP Click trigger
   */
  selector?: GtmTemplateParameter;
  /**
   * A visibility trigger minimum total visible time (in milliseconds).
   * Only valid for AMP Visibility trigger
   */
  totalTimeMinMilliseconds?: GtmIntegerParameter;
  /**
   * Globally unique id of the trigger that auto-generates this
   * (a Form Submit, Link Click or Timer listener) if any.
   * Used to make incompatible auto-events work together with
   * trigger filtering based on trigger ids.
   * This value is populated during output generation since
   * the tags implied by triggers don't exist until then.
   * Only valid for Form Submit, Link Click and Timer triggers
   */
  uniqueTriggerId?: GtmTemplateParameter;
  /**
   * List of integer percentage values for scroll triggers.
   * The trigger will fire when each percentage is reached when
   * the view is scrolled vertically.
   * Only valid for AMP scroll triggers
   */
  verticalScrollPercentageList?: GtmListParameter<GtmIntegerParameter>;
  /**
   * A visibility trigger CSS selector (i.e. "#id").
   * Only valid for AMP Visibility trigger
   */
  visibilitySelector?: GtmTemplateParameter;
  /**
   * A visibility trigger maximum percent visibility.
   * Only valid for AMP Visibility trigger
   */
  visiblePercentageMax?: GtmIntegerParameter;
  /**
   * A visibility trigger minimum percent visibility.
   * Only valid for AMP Visibility trigger
   */
  visiblePercentageMin?: GtmIntegerParameter;
  /**
   * Whether or not we should delay the form submissions or link opening until
   * all of the tags have fired (by preventing the default action and
   * later simulating the default action).
   * Only valid for Form Submission and Link Click triggers
   */
  waitForTags?: GtmBooleanParameter;
  /**
   * How long to wait (in milliseconds) for tags to fire
   * when 'waits_for_tags' above evaluates to true.
   * Only valid for Form Submission and Link Click triggers
   */
  waitForTagsTimeout?: GtmIntegerParameter;
}
