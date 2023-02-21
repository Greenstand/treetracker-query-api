type RepoFunction<RepoType, ResultType> = (
  repo: RepoType,
) => (...args: unknown[]) => Promise<ResultType>;

export function delegateRepository<T, T2>(
  methodName: string,
): RepoFunction<T, T2> {
  return function (repo: T) {
    return async function (...args) {
      const result = await repo[methodName](...args);
      return result;
    };
  };
}
