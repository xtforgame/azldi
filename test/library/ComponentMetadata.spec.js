/* eslint-disable no-unused-vars, no-undef */

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

const { expect } = chai;

describe('Main Test Cases', () => {
  describe('Basic', () => {
    it('Azldi should be a function', () => {
      expect(Azldi).to.be.an.instanceof(Function);
      return true;
    });

    it('Azldi should be a function', () => {
      expect(Azldi).to.be.an.instanceof(Function);
      return true;
    });

    it('ComponentMetadata Test', () => {
      const Classes = [
        MyService00,
        MyService01,
        MyService02,
      ];

      const metadataMap = {};
      const componentMetadataArray = [];
      Classes.forEach((Class) => {
        const componentMetadata = new ComponentMetadata({
          classInfo: new ClassInfo(Class),
          metadataMap,
        });
        metadataMap[componentMetadata.name] = componentMetadata;
        componentMetadataArray.push(componentMetadata);

        if (Class.$inject) {
          const injects = componentMetadata.classInfo.getDependencies();
          expect(injects).to.equal(Class.$inject);
        }

        if (Class.$startDep) {
          const startDeps = componentMetadata.classInfo.getDependencies('start');
          expect(startDeps).to.equal(Class.$startDep);
        }
      });

      // console.log('metadataMap :', metadataMap);

      return true;
    });
  });
});
