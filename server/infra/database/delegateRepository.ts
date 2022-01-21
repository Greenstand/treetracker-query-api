export function delegateRepository<Type>(method): (r: any) => any {
  return function (repo: Type) {
    return async function (...args) {
      const result = await repo[method](...args);
      return result;
    };
  };
}
