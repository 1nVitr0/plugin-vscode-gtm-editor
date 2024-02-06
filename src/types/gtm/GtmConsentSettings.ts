import { GtmConsentStatus } from "./enums/GtmConsentStatus";

export interface GtmConsentSettings {
  /**
   * The tag's consent status.
   * If set to NEEDED, the runtime will check that the consent types specified
   * by the consent_type field have been granted
   */
  consentStatus: GtmConsentStatus;
  /**
   * The type of consents to check for during tag firing if in the consent NEEDED state.
   * TODO: Add a list of valid values
   */
  consentType?: string[];
}
