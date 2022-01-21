export function delegateRepository<Type>(methodName: string): (r: any) => any {
  return function (repo: Type) {
    return async function (...args) {
      const result = await repo[methodName](...args);
      return result;
    };
  };
}
