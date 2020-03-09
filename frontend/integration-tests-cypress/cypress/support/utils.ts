export enum timeouts {
  default = 4000,
  pageLoad = 18000,
}
export const testName = `test-${Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, '')
  .substr(0, 5)}`;
export const appHost = `${process.env.BRIDGE_BASE_ADDRESS || 'http://localhost:9000'}${(
  process.env.BRIDGE_BASE_PATH || '/'
).replace(/\/$/, '')}`;
export const submitButton = 'button[type=submit]';
export const errorMessage = '.pf-c-alert.pf-m-inline.pf-m-danger';
