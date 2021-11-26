export function getPropertyDescriptor(o: any, propertyName: PropertyKey) {
  let proto: any = o;
  let descriptor: PropertyDescriptor | undefined = undefined;
  while (proto && !descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
    proto = Object.getPrototypeOf(proto);
  }
  return descriptor;
}
