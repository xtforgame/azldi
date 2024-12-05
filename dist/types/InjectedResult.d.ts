export default class InjectedResult<ClassBase> {
    constructor(metadataMap: any, depComponentNames: string[]);
    getDepsInfo(): any;
    setResults(results: any[]): void;
    getResults(): any;
    inject(results: any[], args: any[]): any[];
}
