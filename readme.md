## *Note:  This project is not yet finished!*



Node.js: Module-writer
======================

`module-writer` is a simple, lightweight utility for code generation.


What can I do with this?
---

* Generate Node or UMD modules as part of a build script
* Store data which contains functions
* Write your own CLI tool


Installation
------------

    npm install --save module-writer


Basic Usage
-----------

### Using `writeModule(obj, filename, callback)` for simple module writing:

```js
const moduleWriter = require('module-writer');
const outputFilename = __dirname+'/greeter.js';

let exportsObject = {
    greeter: function(nameToGreet){
        return 'Hello, '+nameToGreet;
    },
    favoritePeople: ['Fred', 'George']
};

moduleWriter.writeModule(exportsObject, outputFilename, ()=>{
    console.log('Success!');
})
```

#### Output `greeter.js`:
```js
module.exports = {
    greeter: function(nameToGreet){
        return 'Hello, '+nameToGreet;
    },
    favoritePeople: ['Fred', 'George']
};
```

Advanced Usage
--------------

### Using `createModule()` and `Module` methods to compose more advanced modules:

```js
const moduleWriter = require('module-writer');
const outputFilename = __dirname+'/greeter.js';

let newModule = moduleWriter.createModule();

// Module.require simply adds a require statement to the generated file.
newModule.require('_', 'lodash');

// Module.addVar adds a variable to the generated module,
// by executing the supplied expression.
newModule.addVar('favoritePeople', () => ['Fred', 'George']);

newModule.addVar('greeter', (favoritePeople)=>{
    // This scope is here to help you use other variable names
    // in a variable defininition, without causing LINT errors.

    return function(nameToGreet){
        // This is the actual "greeter" function.
        if( _.includes(favoritePeople, nameToGreet) ){
            return 'Hello '+nameToGreet', my friend!';
        }else{
            return 'Hello, '+nameToGreet;
        }
    }
});

// Specifies which module-scoped variables should be exported.
newModule.exportVars(['greeter']);

newModule.writeToFile(outputFilename, ()=>{
    console.log('Success!');
});
```

#### Output `greeter.js`:
```js
const _ = require('lodash');

var favoritePeople = ['Fred', 'George'];

var greeter = function(nameToGreet){
    // This is the actual "greeter" function.
    if( _.includes(favoritePeople, nameToGreet) ){
        return 'Hello, '+nameToGreet', my friend!';
    }else{
        return 'Hello, '+nameToGreet;
    }
};

module.exports = { greeter };
```


### Specifying options:

You can pass an options object as the last argument to writeModule, createModule, or Module.writeToFile.