/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Azldi, { ClassInfoRunCallbackArg } from '../../src/library';

import {
  MyServiceBase,
  MyService00,
  MyService01,
  MyService02,
  MyService03,
} from '../test-data';

declare const describe;
declare const beforeEach;
declare const afterEach;
declare const it;

const { expect } = <any>chai;

describe('Main Test Cases', () => {
  describe('Basic', () => {
    it('azldi.register', () => {
      const Classes = [
        MyService00,
        MyService01,
        MyService02,
        MyService03,
      ];

      const azldi = new Azldi<MyServiceBase>();

      Classes.forEach((Class) => {
        azldi.register(Class);
      });

      Classes.forEach((Class) => {
        const classInfo = azldi.getClassInfo(Class.$name);
        expect(classInfo, 'classInfo').to.exist;
        expect(classInfo.Class, 'classInfo.Class').to.equal(Class);
      });

      return true;
    });

    it('azldi.digest', async () => {
      const Classes = [
        MyService03,
        MyService02,
        MyService01,
        MyService00,
      ];

      const azldi = new Azldi<MyServiceBase>();

      // azldi.register(Classes);
      Classes.forEach((Class) => {
        azldi.register(Class);
      });

      Classes.forEach((Class) => {
        const classInfo = azldi.getClassInfo(Class.$name);
        expect(classInfo, 'classInfo').to.exist;
        expect(classInfo.Class, 'classInfo.Class').to.equal(Class);
      });

      const digestOrder = [
        MyService00,
        MyService03,
        MyService02,
        MyService01,
      ];
      let digestIndex = 0;

      const results = azldi.digest({
        onCreate: (obj) => {
          expect(obj.result, 'obj.result').to.exist;
          expect(obj.result.constructor, 'obj.result.constructor').to.equal(digestOrder[digestIndex]);
          digestIndex++;
        },
        appendArgs: {
          myService02: [4, 5, 6],
        },
      });
      expect(digestIndex, 'digestIndex').to.equal(digestOrder.length);
        
      // console.log('results :', results);

      let resultInfo = azldi.getEmptyRunResultsInfo<string>();
      const getNameAsyncResult = await azldi.runAsync<string>('getNameAsync', [], {
        onResultsInfoByDeps: (args) => {
          resultInfo = args;
        },
        sortResultsByDeps: true,
      });
      // console.log('getNameAsyncResult :', getNameAsyncResult);
      // console.log('resultInfo :', resultInfo);

      await azldi.runAsync('start', []);
      await azldi.runAsync('start', [1, 2, 3], {
        appendArgs: {
          myService02: [4, 5, 6],
        },
      });

      await azldi.runAsync('start', [1, 2, 3], {
        appendArgs: {
          myService02: [4, 5, 6],
        },
      });
    });
  });
});
