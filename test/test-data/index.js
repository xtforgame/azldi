class MyService00 {
  static $name = 'myService00';
  static $type = 'service';
  static $inject = [];
  static $startDeps = [];

  constructor(){
  }

  start(...args) {
    console.log('...args :', ...args);
    if(args[0] && args[0].getDepsInfo){
      console.log('args[0].getDepsInfo() :', args[0].getDepsInfo());
    }
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.onStart && this.onStart(...args));
      } catch (e) {
        return reject(e);
      }
    });
  }

  onStart(){
    return this.constructor.$name;
  }
}

class MyService01 {
  static $name = 'myService01';
  static $type = 'service';
  static $inject = ['myService00'];
  static $startDeps = ['myService00'];

  constructor(myService00){
  }

  start(...args) {
    console.log('...args :', ...args);
    if(args[0] && args[0].getDepsInfo){
      console.log('args[0].getDepsInfo() :', args[0].getDepsInfo());
    }
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.onStart && this.onStart(...args));
      } catch (e) {
        return reject(e);
      }
    });
  }

  onStart(){
    return this.constructor.$name;
  }
}

class MyService02 {
  static $name = 'myService02';
  static $type = 'service';
  static $inject = ['myService00'];
  static $startDeps = ['myService01'];

  constructor(myService00){
  }

  start(...args) {
    console.log('...args :', ...args);
    if(args[0] && args[0].getDepsInfo){
      console.log('args[0].getDepsInfo() :', args[0].getDepsInfo());
    }
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.onStart && this.onStart(...args));
      } catch (e) {
        return reject(e);
      }
    });
  }

  onStart(){
    return this.constructor.$name;
  }
}

export {
  MyService00,
  MyService01,
  MyService02,
};
