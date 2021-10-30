/* eslint-disable no-underscore-dangle */

export type Injects = string[];

export type DepsMap = {
  [s: string]: Injects;
};

export type ClassType<ClassBase> = {
  new(...args: any): ClassBase;
  $name: string;

  $inject?: Injects;

  $funcDeps?: DepsMap;

  $runBefore?: DepsMap;
}
