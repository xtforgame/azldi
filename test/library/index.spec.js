/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Azldi from '../../src/library';

import {
  MyService00,
  MyService01,
  MyService02,
} from '../test-data';

let expect = chai.expect;

describe('Main Test Cases', function(){
  describe('Basic', function(){
    it('azldi.register', () => {
      let Classes = [
        MyService00,
        MyService01,
        MyService02,
      ];

      let azldi = new Azldi();

      Classes.forEach(Class => {
        azldi.register(Class);
      });

      Classes.forEach(Class => {
        let classInfo = azldi.getClassInfo(Class.$name);
        expect(classInfo, 'classInfo').to.exist;
        expect(classInfo.Class, 'classInfo.Class').to.equal(Class);
      });

      return true;
    });

    it('azldi.digest', () => {
      let Classes = [
        MyService02,
        MyService01,
        MyService00,
      ];

      let azldi = new Azldi();

      // azldi.register(Classes);
      Classes.forEach(Class => {
        azldi.register(Class);
      });

      Classes.forEach(Class => {
        let classInfo = azldi.getClassInfo(Class.$name);
        expect(classInfo, 'classInfo').to.exist;
        expect(classInfo.Class, 'classInfo.Class').to.equal(Class);
      });

      let digestOrder = [
        MyService00,
        MyService02,
        MyService01,
      ];
      let digestIndex = 0;

      let results = azldi.digest({
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
      .then(results => {
        // console.log('results :', results);
        expect(digestIndex, 'digestIndex').to.equal(digestOrder.length);
        return azldi.runAsync('start', [1, 2, 3], {
          appendArgs: {
            myService02: [4, 5, 6],
          },
        })
        .then(results => {
          // console.log('results :', results);
          expect(digestIndex, 'digestIndex').to.equal(digestOrder.length);
        });
      });
    });
  });
});


