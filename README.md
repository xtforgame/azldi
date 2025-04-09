# AZLDI - A Lightweight Dependency Injection Implementation

AZLDI is a lightweight Dependency Injection (DI) implementation designed specifically for TypeScript projects. It provides a simple yet powerful way to manage dependencies between classes.

## Features

- Support for both synchronous and asynchronous dependency injection
- TypeScript-based type safety
- Flexible dependency management
- Customizable injection options
- Dependency sorting capabilities
- Callback function support for handling injection results
- Ability to append additional arguments to specific classes
- Immediate result processing with onResult and onCreate callbacks

## Installation

Using npm:
```bash
npm install azldi
```

Using yarn:
```bash
yarn add azldi
```

## Usage

### Basic Usage

```typescript
import Azldi from 'azldi';

// Create an Azldi instance
const di = new Azldi();

// Define services with minimal required configuration
class UserService {
  // Only $name is required - it's the unique identifier for the class
  static $name = 'userService';
  
  // Optional: specify dependencies to be injected into the constructor
  static $inject = [];
  
  constructor() {
    // Initialization logic
  }
  
  getUser(id: string) {
    // Implementation
    return { id, name: 'John Doe' };
  }
}

class AuthService {
  // Required unique identifier (lowercase)
  static $name = 'authService';
  
  // Specify that this service depends on userService
  static $inject = ['userService'];
  
  constructor(private userService: UserService) {
    // Initialization logic
  }
  
  login(username: string, password: string) {
    // Implementation using injected userService
    const user = this.userService.getUser(username);
    return { success: true, user };
  }
}

// Register services
di.register([UserService, AuthService]);

// Get instances - use class.$name instead of hardcoded strings
const userServiceInstance = di.get<UserService>(UserService.$name);
const authServiceInstance = di.get<AuthService>(AuthService.$name);

// Use the services
const loginResult = authServiceInstance.login('user123', 'password');
```

### Advanced Usage

#### Method-Level Dependency Injection

AZLDI supports method-level dependency injection, allowing you to specify dependencies for specific methods:

```typescript
// Define an interface for the component system
interface ComponentInterface {
  getName: () => string;
  initialize: () => void;
}

// Create an Azldi instance with the component interface
const di = new Azldi<ComponentInterface>();

// Define components with method-level dependencies
class DataProcessor {
  static $name = 'dataProcessor';
  static $inject = [];
  
  // This method depends on the dataCollector
  static $funcDeps = {
    processData: ['dataCollector']
  };
  
  constructor() {
    // Initialization logic
  }
  
  getName() {
    return 'Data Processor';
  }
  
  initialize() {
    console.log('Data Processor initialized');
  }
  
  // This method will receive the dataCollector's result as a dependency
  processData(injectedResult: InjectedResult<ComponentInterface>) {
    const deps = injectedResult.getDepsInfo();
    // Get the result from dataCollector's collectData method
    const collectedData = deps.dataCollector.result;
    
    console.log(`Processing data: ${JSON.stringify(collectedData)}`);
    return { 
      success: true, 
      component: 'Data Processor',
      processedData: {
        ...collectedData,
        processed: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}

class DataCollector {
  static $name = 'dataCollector';
  static $inject = [];
  
  constructor() {
    // Initialization logic
  }
  
  getName() {
    return 'Data Collector';
  }
  
  initialize() {
    console.log('Data Collector initialized');
  }
  
  collectData() {
    console.log('Data Collector gathering data');
    return { 
      success: true, 
      component: 'Data Collector',
      rawData: { 
        temperature: 25, 
        humidity: 60, 
        pressure: 1013 
      }
    };
  }
}

// Register components
di.register([DataProcessor, DataCollector]);

// Run the processData method on all components that have it
// Results will be returned in dependency order (DataCollector first, then DataProcessor)
const results = di.run<any>('processData', [], {
  sortResultsByDeps: true
});

// Results will be: [
//   { success: true, component: 'Data Collector', rawData: { temperature: 25, humidity: 60, pressure: 1013 } },
//   { success: true, component: 'Data Processor', processedData: { temperature: 25, humidity: 60, pressure: 1013, processed: true, timestamp: '2023-06-15T12:34:56.789Z' } }
// ]
console.log(results);
```

#### Correct Usage of $runBefore

The `$runBefore` property is the opposite of `$funcDeps`. It specifies that this class's method should run BEFORE the specified services:

```typescript
class DataValidator {
  static $name = 'dataValidator';
  static $inject = [];
  
  // This method should run BEFORE the dataProcessor's processData method
  static $runBefore = {
    processData: ['dataProcessor']
  };
  
  constructor() {
    // Initialization logic
  }
  
  getName() {
    return 'Data Validator';
  }
  
  initialize() {
    console.log('Data Validator initialized');
  }
  
  processData() {
    console.log('Data Validator checking data before processing');
    return { 
      success: true, 
      component: 'Data Validator',
      validationResult: { isValid: true }
    };
  }
}

// When running processData, the execution order will be:
// 1. DataValidator.processData
// 2. DataCollector.collectData
// 3. DataProcessor.processData
```

#### Accessing All Previous Results

The `deps` object contains all results from services that run before the current class, including those specified in `$runBefore`:

```typescript
class DataAggregator {
  static $name = 'dataAggregator';
  static $inject = [];
  
  // This method depends on the dataProcessor
  static $funcDeps = {
    aggregateData: ['dataProcessor']
  };
  
  constructor() {
    // Initialization logic
  }
  
  getName() {
    return 'Data Aggregator';
  }
  
  initialize() {
    console.log('Data Aggregator initialized');
  }
  
  aggregateData(injectedResult: InjectedResult<ComponentInterface>) {
    const deps = injectedResult.getDepsInfo();
    
    // Access results from all previous services
    const validatorResult = deps.dataValidator.result;
    const collectorResult = deps.dataCollector.result;
    const processorResult = deps.dataProcessor.result;
    
    // All these results are available because they run before this component
    console.log('Validator result:', validatorResult);
    console.log('Collector result:', collectorResult);
    console.log('Processor result:', processorResult);
    
    // Aggregate all the data
    return {
      success: true,
      component: 'Data Aggregator',
      aggregatedData: {
        validation: validatorResult.validationResult,
        raw: collectorResult.rawData,
        processed: processorResult.processedData
      }
    };
  }
}
```

#### Appending Additional Arguments to Specific Classes

AZLDI allows you to append additional arguments to specific classes when using `run`, `runAsync`, or `digest` methods. This is useful when you need to pass extra parameters to certain classes without modifying their method signatures:

```typescript
class MyService01 {
  static $name = 'myService01';
  static $inject = [];
  
  constructor() {
    // Initialization logic
  }
  
  processData(data: any) {
    console.log('MyService01 processing data:', data);
    return { processed: true, service: 'MyService01' };
  }
}

class MyService02 {
  static $name = 'myService02';
  static $inject = [];
  
  constructor() {
    // Initialization logic
  }
  
  processData(data: any, extraArg1: number, extraArg2: string, extraArg3: number) {
    console.log('MyService02 processing data:', data);
    console.log('Extra arguments:', extraArg1, extraArg2, extraArg3);
    return { 
      processed: true, 
      service: 'MyService02',
      extraArgs: [extraArg1, extraArg2, extraArg3]
    };
  }
}

// Register services
di.register([MyService01, MyService02]);

// Run the processData method with appendArgs
const results = di.run<any>('processData', [{ id: 123, value: 'test' }], {
  appendArgs: {
    myService02: [4, 'some test', 6],
  },
});

// For MyService01, only the data argument will be passed
// For MyService02, the data argument plus the three extra arguments will be passed
console.log(results);
```

You can also use `appendArgs` with `runAsync`:

```typescript
const asyncResults = await di.runAsync<any>('processData', [{ id: 123, value: 'test' }], {
  appendArgs: {
    myService02: [4, 'some test', 6],
  },
});
```

And with `digest` to add arguments to constructors:

```typescript
di.digest({
  appendArgs: {
    myService02: [4, 'some test', 6],
  },
});
```

This feature is particularly useful when:
- You need to pass different arguments to different implementations of the same interface
- You want to add context-specific parameters without modifying the class definition
- You need to pass configuration or environment-specific values to certain services

#### Immediate Result Processing with onResult and onCreate Callbacks

AZLDI provides callback functions that allow you to process results immediately after each class execution, without waiting for all classes to complete. This is useful for scenarios like finding the first matching component or implementing early termination logic.

##### Using onResult with run and runAsync

The `onResult` callback is called immediately after each class's method execution, providing access to the result and metadata:

```typescript
// Define an interface for the plugin system
interface ServerPluginBase {
  getName: () => string;
  initialize: () => void;
}

// Create an Azldi instance with the plugin interface
const di = new Azldi<ServerPluginBase>();

// Define plugins with findOne method
class UserPlugin {
  static $name = 'userPlugin';
  static $inject = [];
  
  constructor() {
    // Initialization logic
  }
  
  getName() {
    return 'User Plugin';
  }
  
  initialize() {
    console.log('User Plugin initialized');
  }
  
  findOne(injectedResult: InjectedResult<ServerPluginBase>, { isFound }) {
    // Skip if already found
    if (isFound()) {
      return null;
    }
    
    // Simulate finding a user
    return { id: 'user1', name: 'John Doe', type: 'user' };
  }
}

class ProductPlugin {
  static $name = 'productPlugin';
  static $inject = [];
  
  constructor() {
    // Initialization logic
  }
  
  getName() {
    return 'Product Plugin';
  }
  
  initialize() {
    console.log('Product Plugin initialized');
  }
  
  findOne(injectedResult: InjectedResult<ServerPluginBase>, { isFound }) {
    // Skip if already found
    if (isFound()) {
      return null;
    }
    
    // Simulate finding a product
    return { id: 'prod1', name: 'Laptop', type: 'product' };
  }
}

// Register plugins
di.register([UserPlugin, ProductPlugin]);

// Variable to store the found item
let foundItem = null;
const isFound = () => !!foundItem;

// Run the findOne method with onResult callback
di.run<any>('findOne', [{
  isFound,
}], {
  onResult: ({ result, name }) => {
    // If we haven't found an item yet and this result is not null
    if (!foundItem && result) {
      console.log(`Found item in ${name}:`, result);
      foundItem = result;
    }
  },
  sortResultsByDeps: true,
});

// foundItem will contain the first non-null result
console.log('Final found item:', foundItem);
```

You can also use `onResult` with `runAsync`:

```typescript
let foundItem = null;
const isFound = () => !!foundItem;

await di.runAsync<any>('findOne', [{
  isFound,
}], {
  onResult: ({ result, name }) => {
    if (!foundItem && result) {
      console.log(`Found item in ${name}:`, result);
      foundItem = result;
    }
  },
  sortResultsByDeps: true,
});
```

##### Using onCreate with digest

The `onCreate` callback is called immediately after each class is instantiated during the `digest` process:

```typescript
// Define an interface for the component system
interface ComponentInterface {
  getName: () => string;
  initialize: () => void;
}

// Create an Azldi instance with the component interface
const di = new Azldi<ComponentInterface>();

// Define components
class ConfigComponent {
  static $name = 'configComponent';
  static $inject = [];
  
  constructor() {
    console.log('ConfigComponent instantiated');
  }
  
  getName() {
    return 'Config Component';
  }
  
  initialize() {
    console.log('Config Component initialized');
  }
}

class DatabaseComponent {
  static $name = 'databaseComponent';
  static $inject = ['configComponent'];
  
  constructor(private configComponent: ConfigComponent) {
    console.log('DatabaseComponent instantiated');
  }
  
  getName() {
    return 'Database Component';
  }
  
  initialize() {
    console.log('Database Component initialized');
  }
}

// Register components
di.register([ConfigComponent, DatabaseComponent]);

// Track instantiated components
const instantiatedComponents: string[] = [];

// Run digest with onCreate callback
di.digest({
  onCreate: ({ instance, name }) => {
    console.log(`Component ${name} created`);
    instantiatedComponents.push(name);
  },
});

// instantiatedComponents will contain ['configComponent', 'databaseComponent']
console.log('Instantiated components:', instantiatedComponents);
```

These callbacks are particularly useful for:
- Finding the first matching component without waiting for all components to execute
- Implementing early termination logic based on results
- Tracking component instantiation order
- Logging or monitoring component execution
- Implementing custom caching or memoization strategies

#### Asynchronous Execution with Dependency Ordering

```typescript
// Asynchronous execution with dependency tracking
let resultInfo: any[] = [];

const getNameAsyncResult = await di.runAsync<string>('getNameAsync', [], {
  onResultsInfoByDeps: (args) => {
    resultInfo = args;
  },
  sortResultsByDeps: true,
});

// resultInfo will contain information about the execution order
console.log('Execution order:', resultInfo.map(info => info.name));
```

#### Complex Event System Example

Here's a more complex example showing how to use AZLDI in an event system:

```typescript
// Define interfaces for the event system
interface EventHandlerBase {
  getName: () => string;
  initialize: () => void;
}

interface EventContext {
  getEventType: () => string;
  getEventData: () => any;
  setEventData: (data: any) => void;
}

// Create an Azldi instance with the event handler interface
const di = new Azldi<EventHandlerBase>();

// Define event handlers with dependencies
class LoggingHandler {
  static $name = 'loggingHandler';
  static $inject = [];
  
  constructor() {
    // Initialization logic
  }
  
  getName() {
    return 'Logging Handler';
  }
  
  initialize() {
    console.log('Logging Handler initialized');
  }
  
  handleEvent(context: EventContext) {
    console.log(`[${context.getEventType()}] Logging event:`, context.getEventData());
    return { 
      success: true, 
      handler: 'Logging Handler',
      logged: true
    };
  }
}

class ValidationHandler {
  static $name = 'validationHandler';
  static $inject = [];
  
  // This handler should run before the processingHandler
  static $runBefore = {
    handleEvent: ['processingHandler']
  };
  
  constructor() {
    // Initialization logic
  }
  
  getName() {
    return 'Validation Handler';
  }
  
  initialize() {
    console.log('Validation Handler initialized');
  }
  
  handleEvent(context: EventContext) {
    const data = context.getEventData();
    const isValid = data && typeof data === 'object';
    
    console.log(`[${context.getEventType()}] Validating event:`, isValid);
    return { 
      success: true, 
      handler: 'Validation Handler',
      isValid
    };
  }
}

class ProcessingHandler {
  static $name = 'processingHandler';
  static $inject = ['loggingHandler'];
  
  // This handler depends on the loggingHandler
  static $funcDeps = {
    handleEvent: ['loggingHandler']
  };
  
  constructor(private loggingHandler: LoggingHandler) {
    // Initialization logic
  }
  
  getName() {
    return 'Processing Handler';
  }
  
  initialize() {
    console.log('Processing Handler initialized');
  }
  
  handleEvent(injectedResult: InjectedResult<EventHandlerBase>, context: EventContext) {
    const deps = injectedResult.getDepsInfo();
    // Get the result from loggingHandler's handleEvent method
    const loggingResult = deps.loggingHandler.result;
    
    // Process the event data
    const data = context.getEventData();
    const processedData = {
      ...data,
      processed: true,
      processedAt: new Date().toISOString()
    };
    
    // Update the event data
    context.setEventData(processedData);
    
    console.log(`[${context.getEventType()}] Processing event with logging result:`, loggingResult);
    return { 
      success: true, 
      handler: 'Processing Handler',
      processedData
    };
  }
}

// Register handlers
di.register([LoggingHandler, ValidationHandler, ProcessingHandler]);

// Create an event context
const eventContext: EventContext = {
  getEventType: () => 'userCreated',
  getEventData: () => ({ userId: '123', name: 'John Doe' }),
  setEventData: (data) => { /* update event data */ }
};

// Run the handleEvent method on all handlers
const results = di.run<any>('handleEvent', [eventContext], {
  sortResultsByDeps: true,
});

// The results will be in dependency order:
// 1. LoggingHandler.handleEvent
// 2. ValidationHandler.handleEvent
// 3. ProcessingHandler.handleEvent
console.log('Event handling results:', results);
```

### Static Configuration Properties

AZLDI uses static properties to configure classes for dependency injection. The only required property is `$name`:

```typescript
class MyService {
  // Required: Unique identifier for the class (should start with lowercase)
  static $name = 'myService';
  
  // Optional: Type of the component (e.g., 'service', 'controller', etc.)
  static $type = 'service';
  
  // Optional: Dependencies to be injected into the constructor
  static $inject = [];
  
  // Optional: Function dependencies - specifies which methods depend on which services
  static $funcDeps = {
    start: [], // The 'start' method has no dependencies
  };
  
  // Optional: Run order configuration - specifies that this service's method should run BEFORE the specified services
  static $runBefore = {
    start: ['otherService'], // This service's 'start' method should run BEFORE 'otherService'
  };
}
```

#### Configuration Properties Explained

- **$name** (Required): A unique identifier for the class. This is used when retrieving instances with `di.get()`. Should start with lowercase.
- **$type** (Optional): Categorizes the component (e.g., 'service', 'controller'). Useful for organizing and filtering components.
- **$inject** (Optional): An array of dependencies that should be injected into the constructor. These are resolved automatically by the DI container.
- **$funcDeps** (Optional): An object that maps method names to their dependencies. This allows for method-level dependency injection, where specific methods can declare their own dependencies.
- **$runBefore** (Optional): An object that maps method names to arrays of service names. This defines the execution order, ensuring that this service's method runs BEFORE the specified services.

## API Reference

### Azldi Class

#### Constructor
```typescript
constructor(options: AzldiOptions<ClassBase> = {})
```

#### Main Methods

- `register(Classes: ClassType<ClassBase>[] | ClassType<ClassBase>)`: Register one or more classes
- `get<T>(name: string)`: Get an instance of a registered class
- `run<T>(functionName, args, options)`: Synchronously execute dependency injection
- `runAsync<T>(functionName, args, options)`: Asynchronously execute dependency injection
- `digest(options)`: Handle dependency injection initialization

#### Options for run, runAsync, and digest

- `sortResultsByDeps`: Sort results by dependency order
- `onResultsInfoByDeps`: Callback function to receive information about the execution order
- `appendArgs`: Object mapping class names to arrays of additional arguments to append
- `onResult`: Callback function called immediately after each class's method execution (for run and runAsync)
- `onCreate`: Callback function called immediately after each class is instantiated (for digest)

## Development

### Project Structure

- `/src` - Source code directory
  - `index.ts` - Main implementation
  - `ClassInfo.ts` - Class information handling
  - `ComponentMetadata.ts` - Component metadata
  - `InjectedResult.ts` - Injection result handling
  - `interfaces.ts` - Type definitions
  - `/utils` - Utility functions

- `/test` - Test directory

### Building

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build project
npm run build
```

## License

ISC License

## Author

Rick Chen <xtforgame@gmail.com>
