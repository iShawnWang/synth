import findPackageJSON from 'find-package-json'
export const loadPlugin = () => {
  const packagejson = findPackageJSON(__dirname).value
  const deps: string[] = Object.keys(packagejson.dependencies ?? []).concat(
    Object.keys(packagejson.devDependencies ?? []),
  )
  const plugins = deps.filter((dep) => dep.startsWith('@synth'))
  plugins.forEach((p) => require(p)())
}

export const composePromise = (promises: Promise<any>[]) => {
  return promises.reduce((acce, current) => acce.then(() => current), Promise.resolve())
}

type ComposeableFunction = (params: any) => Promise<any>
export const composeFunctionPromise = (functionPromises: ComposeableFunction[]) => {
  return functionPromises.reduce(
    (acce, current) =>
      acce.then((resp) => {
        console.log(resp)
        return current(resp)
      }),
    Promise.resolve(),
  )
}
