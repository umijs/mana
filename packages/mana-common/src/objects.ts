export function getPropertyDescriptor(o: any, propertyName: PropertyKey) {
  let proto: any = o;
  let descriptor: PropertyDescriptor | undefined = undefined;
  while (proto && !descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
    proto = Object.getPrototypeOf(proto);
  }
  return descriptor;
}

export function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.prototype.toString.call(obj) === '[object Object]';
}
