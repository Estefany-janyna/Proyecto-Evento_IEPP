export type SessionKind='ADMIN'|'COLLABORATOR'|'STALL';export const permissions={ADMIN:['REPORTS'],COLLABORATOR:['DAILY_CODE','AVAILABLE_STALLS'],STALL:['REDEEM','HISTORY']} as const;
