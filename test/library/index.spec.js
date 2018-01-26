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

      Classes.forEach(Class => {
        azldi.register(Class);
      });

      Classes.forEach(Class => {
        let classInfo = azldi.getClassInfo(Class.$name);
        expect(classInfo, 'classInfo').to.exist;
        expect(classInfo.Class, 'classInfo.Class').to.equal(Class);
      });

      let results = azldi.digest({
        // onCreate: (obj) => {console.log('obj :', obj);},
      });

      console.log('results :', results);

      azldi.start()
      .then(results => {
        console.log('results :', results);
      });

      return true;
    });
  });
});


