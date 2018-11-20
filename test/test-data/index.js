class MyService00 {
  static $name = 'myService00';

  static $type = 'service';

  static $inject = [];

  static $funcDeps = {
    start: [],
  };

  start(...args) {
    // console.log('start :', this.constructor.$name);
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

  onStart() {
    // console.log('Name :', this.constructor.$name);
  }
}

class MyService01 {
  static $name = 'myService01';

  static $type = 'service';

  static $inject = ['myService00'];

  static $funcDeps = {
    start: ['myService02'],
  };

  start(...args) {
    // console.log('start :', this.constructor.$name);
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

  onStart() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.constructor.$name);
      }, 200);
    });
  }
}

class MyService02 {
  static $name = 'myService02';

  static $type = 'service';

  static $inject = ['myService00'];

  static $funcDeps = {
    start: ['myService00'],
  };

  // constructor(myService00, ...rest) {
  //   console.log('myService00, ...rest :', myService00, ...rest);
  // }

  start(...args) {
    // console.log('start :', this.constructor.$name);
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

  onStart() {
    // console.log('Name :', this.constructor.$name);
  }
}

class MyService03 {
  static $name = 'myService03';

  static $type = 'service';

  static $inject = ['myService00'];

  static $runBefore = {
    start: ['myService00'],
  };

  // constructor(myService00, ...rest) {
  //   console.log('myService00, ...rest :', myService00, ...rest);
  // }

  start(...args) {
    // console.log('start :', this.constructor.$name);
    // console.log('...args :', ...args);
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.onStart && this.onStart(...args));
      } catch (e) {
        return reject(e);
      }
    });
  }

  onStart() {
    // console.log('Name :', this.constructor.$name);
  }
}

export {
  MyService00,
  MyService01,
  MyService02,
  MyService03,
};
