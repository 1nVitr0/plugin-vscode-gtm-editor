import { GtmPropertyWithFolder } from "./GtmPropertyWithFolder";
import { GtmConsentStatus } from "./enums/GtmConsentStatus";
import { GtmAnyDeepParameter } from "./parameters/GtmAnyParameter";
import { GtmIntegerParameter } from "./parameters/GtmIntegerParameter";
import { GtmListParameter } from "./parameters/GtmListParameter";
import { GtmMapParameter } from "./parameters/GtmMapParameter";
import { GtmTemplateParameter } from "./parameters/GtmTemplateParameter";

export interface GtmTag extends GtmPropertyWithFolder {
  /** The Tag ID uniquely identifies the GTM Tag */
  tagId: `${number}`;
  /** GTM Tag Type */
  type: string; // TODO: enum
  /** Consent settings of a tag */
  consentSettings?: {
    /**
     * The tag's consent status. If set to NEEDED, the runtime will check that
     * the consent types specified by the consent_type field have been granted
     */
    consentStatus: GtmConsentStatus;
    /**
     * The type of consents to check for during tag firing if in
     * the consent NEEDED state
     */
    consentType: GtmListParameter<GtmTemplateParameter>;
  };
  /**
   * Firing rule IDs. A tag will fire when any of the listed rules are true and
   * all of its blockingRuleIds (if any specified) are false
   */
  firingRuleId?: string[];
  /**
   * Blocking rule IDs. If any of the listed rules evaluate to true,
   * the tag will not fire
   */
  blockingRuleId?: string[];
  /**
   * Firing trigger IDs. A tag will fire when any of the listed triggers are true
   * and all of its blockingTriggerIds (if any specified) are false
   */
  firingTriggerId?: string[];
  /**
   * If set to true, this tag will only fire in the live environment
   * (e.g. not in preview or debug mode)
   */
  liveOnly?: boolean;
  /**
   * A map of key-value pairs of tag metadata to be included
   * in the event data for tag monitoring
   */
  monitoringMetadata?: GtmMapParameter<GtmTemplateParameter>;
  /** The tag's parameters */
  parameter: GtmAnyDeepParameter[];
  /** Indicates whether the tag is paused, which prevents the tag from firing */
  paused?: boolean;
  /**
   * User defined numeric priority of the tag.
   * Tags are fired asynchronously in order of priority.
   * Tags with higher numeric value fire first.
   * A tag's priority can be a positive or negative value.
   * The default value is 0
   */
  priority?: GtmIntegerParameter;
  /** The start timestamp in milliseconds to schedule a tag */
  scheduleStartMs?: `${number}`;
  /** The end timestamp in milliseconds to schedule a tag */
  scheduleEndMs?: `${number}`;
  /** The list of setup tags. Currently we only allow one */
  setupTag?: [
    {
      /** The name of the setup tag */
      tagName: string;
      /**
       * If true, fire the main tag if and only if the setup tag fires successfully.
       * If false, fire the main tag regardless of setup tag firing status
       */
      stopOnSetupFailure: boolean;
    }
  ];
  /** The list of teardown tags. Currently we only allow one */
  teardownTag?: [
    {
      /** The name of the teardown tag */
      tagName: string;
      /**
       * If true, fire the teardown tag if and only if the main tag fires successfully.
       * If false, fire the teardown tag regardless of main tag firing status
       */
      stopTeardownOnFailure: boolean;
    }
  ];
}
