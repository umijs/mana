import { ObservableProperties } from './utils';

/**
 * Define observable property
 */
export function prop() {
  return (target: Record<any, any>, propertyKey: string) => {
    ObservableProperties.add(target.constructor, propertyKey);
  };
}
