/* eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Azldi from '../../src/library';

import {
  MyService00,
  MyService01,
  MyService02,
} from '../test-data';

const { expect } = chai;

describe('Main Test Cases', () => {
  describe('Basic', () => {
    it('azldi.register', () => {
      const Classes = [
        MyService00,
        MyService01,
        MyService02,
      ];

      const azldi = new Azldi();

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

    it('azldi.digest', () => {
      const Classes = [
        MyService02,
        MyService01,
        MyService00,
      ];

      const azldi = new Azldi();

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

      // console.log('results :', results);

      return azldi.runAsync('start', [])
      .then((/* r */) => {
        // console.log('r :', r);
        expect(digestIndex, 'digestIndex').to.equal(digestOrder.length);
        return azldi.runAsync('start', [1, 2, 3], {
          appendArgs: {
            myService02: [4, 5, 6],
          },
        })
        .then((/* r */) => {
          // console.log('r :', r);
          expect(digestIndex, 'digestIndex').to.equal(digestOrder.length);
        });
      });
    });
  });
});
