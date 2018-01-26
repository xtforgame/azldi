/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Azldi, {
  ClassInfo,
  ComponentMetadata,
} from '../../src/library';

import {
  MyService00,
  MyService01,
  MyService02,
} from '../test-data';

let expect = chai.expect;

describe('Main Test Cases', function(){
  describe('Basic', function(){

    it('Azldi should be a function', () => {
      expect(Azldi).to.be.an.instanceof(Function);
      return true;
    });

    it('Azldi should be a function', () => {
      expect(Azldi).to.be.an.instanceof(Function);
      return true;
    });

    it('ComponentMetadata Test', () => {
      let Classes = [
        MyService00,
        MyService01,
        MyService02,
      ];

      let componentMetadataMap = {};
      let componentMetadataArray = [];
      Classes.forEach(Class => {
        let componentMetadata = new ComponentMetadata({
          classInfo: new ClassInfo(Class),
          componentMetadataMap,
        });
        componentMetadataMap[componentMetadata.name] = componentMetadata;
        componentMetadataArray.push(componentMetadata);
        
        if(Class.$inject){
          let injects = componentMetadata.classInfo.getDependencies();
          expect(injects).to.equal(Class.$inject);
        }

        if(Class.$startDep){
          let startDeps = componentMetadata.classInfo.getDependencies('start');
          expect(startDeps).to.equal(Class.$startDep);
        }
      });

      // console.log('componentMetadataMap :', componentMetadataMap);

      return true;
    });
  });
});


