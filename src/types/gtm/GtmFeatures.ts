export interface GtmFeatures {
  /** Whether this Container supports built-in variables */
  supportBuiltInVariables?: boolean;
  /** Whether this Container supports clients */
  supportClients?: boolean;
  /** Whether this Container supports environments */
  supportEnvironments?: boolean;
  /** Whether this Container supports folders */
  supportFolders?: boolean;
  /** Whether this Container supports Google tag config */
  supportGtagConfigs?: boolean;
  /** Whether this Container supports tags */
  supportTags?: boolean;
  /** Whether this Container supports templates */
  supportTemplates?: boolean;
  /** Whether this Container supports transformations */
  supportTransformations?: boolean;
  /** Whether this Container supports triggers */
  supportTriggers?: boolean;
  /** Whether this Container supports user permissions managed by GTM */
  supportUserPermissions?: boolean;
  /** Whether this Container supports variables */
  supportVariables?: boolean;
  /** Whether this Container supports Container versions */
  supportVersions?: boolean;
  /** Whether this Container supports workspaces */
  supportWorkspaces?: boolean;
  /** Whether this Container supports zones */
  supportZones?: boolean;
}
