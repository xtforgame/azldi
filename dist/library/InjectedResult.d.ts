import ClassInfo from './ClassInfo';
export default class InjectedResult<ClassBase> {
    privateData2: {
        depComponentNames: {
            classInfo: ClassInfo<ClassBase>;
            instance: ClassBase;
        };
    };
    constructor(metadataMap: any, depComponentNames: any);
    getDepsInfo(): any;
    setResults(results: any): void;
    getResults(): any;
    inject(results: any, args: any): any[];
}
