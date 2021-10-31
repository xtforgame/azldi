class MyServiceBase {
  start(...args) {
    // console.log('start :', (<any>this.constructor).$name);
    // console.log('...args :', ...args);
    if (args[0] && args[0].getDepsInfo) {
      // console.log('args[0].getDepsInfo() :', args[0].getDepsInfo());
    }
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.onStart && this.onStart(...args));
      } catch (e) {
        return reject(e);
      }
    });
  }

  getName() {
    return '';
  }

  getNameAsync() {
    return this.getName();
  }

  onStart() {
    // console.log('Name :', (<any>this.constructor).$name);
  }
}

class MyService00 extends MyServiceBase {
  static $name = 'myService00';

  static $type = 'service';

  static $inject = [];

  static $funcDeps = {
    start: [],
  };

  getName() {
    return (<any>this.constructor).$name;
  }

  onStart() {
    // console.log('Name :', (<any>this.constructor).$name);
  }
}

class MyService01 extends MyServiceBase {
  static $name = 'myService01';

  static $type = 'service';

  static $inject = ['myService00'];

  static $funcDeps = {
    start: ['myService02'],
    getNameAsync: ['myService02'],
  };

  getName() {
    return (<any>this.constructor).$name;
  }

  onStart() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve((<any>this.constructor).$name);
      }, 200);
    });
  }
}

class MyService02 extends MyServiceBase {
  static $name = 'myService02';

  static $type = 'service';

  static $inject = ['myService00'];

  static $funcDeps = {
    start: ['myService00'],
    getNameAsync: ['myService00'],
  };

  // constructor(myService00, ...rest) {
  //   console.log('myService00, ...rest :', myService00, ...rest);
  // }

  getName() {
    return (<any>this.constructor).$name;
  }

  onStart() {
    // console.log('Name :', (<any>this.constructor).$name);
  }
}

class MyService03 extends MyServiceBase {
  static $name = 'myService03';

  static $type = 'service';

  static $inject = ['myService00'];

  static $runBefore = {
    start: ['myService00'],
    getNameAsync: ['myService00'],
  };

  // constructor(myService00, ...rest) {
  //   console.log('myService00, ...rest :', myService00, ...rest);
  // }

  getName() {
    return (<any>this.constructor).$name;
  }

  onStart() {
    // console.log('Name :', (<any>this.constructor).$name);
  }
}

export {
  MyServiceBase,
  MyService00,
  MyService01,
  MyService02,
  MyService03,
};
