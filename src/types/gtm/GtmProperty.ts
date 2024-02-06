export interface GtmProperty {
  /** GTM Account ID */
  accountId: `${number}`;
  /** The Container ID uniquely identifies the GTM Container */
  containerId: `${number}`;
  /** relative path */
  path?: string;
  /** Display name */
  name: string;
  /** Auto generated link to the tag manager UI */
  tagManagerUrl?: string;
  /**
   * The fingerprint of the property as computed at storage time.
   * This value is recomputed whenever the account is modified
   */
  fingerprint: string;
  /** User notes */
  notes?: string;
}
