import { markObservableProperty } from './utils';

/**
 * Define observable property
 */
export function prop() {
  return (target: Record<any, any>, propertyKey: string) => {
    markObservableProperty(target, propertyKey);
  };
}
