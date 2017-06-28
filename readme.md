## *Note:  This project is not yet finished!*



Node.js: Module-writer
======================

`module-writer` is a simple, lightweight utility for code generation.

[![build status](https://travis-ci.org/SmithPR/module-writer.svg?branch=master)](https://travis-ci.org/SmithPR/module-writer)
[![Coverage Status](https://coveralls.io/repos/github/SmithPR/module-writer/badge.svg?branch=master)](https://coveralls.io/github/SmithPR/module-writer?branch=master)

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


### Using `module.runProcedure(varName, wrappedFn)` for more creative use cases:
```js
const moduleWriter = require('module-writer');
const outputFilename = __dirname+'/greeter.js';

let newModule = moduleWriter.createModule();

newModule.addVar('supportedLanguages',() => {
    return {
        English: {
            basicGreeting: (name) => `Hello, ${name}.`,
            friendlyGreeting: (name) => `Yo, ${name}!`
        },
        French: {
            basicGreeting: (name) => `Bonjour, ${name}.`,
            friendlyGreeting: (name) => `Quoi de neuf, ${name}?`
        }
    };
});
newModule.addVar('defaultLanguage', ()=> 'English');

newModule.runProcedure('Greeter', (supportedLanguages)=>{
    class Greeter {
        constructor(lang){
            friends = {};
            this.phrases = supportedLanguages[lang] || supportedLanguages[defaultLang];
        }
        greet(nameToGreet){
            if(friends[friendName]){
                return this.phrases.friendlyGreeting(nameToGreet);
            }else{
                return this.phrases.greeting(nameToGreet);
            }
        }
        makeFriend(friendName){
            friends[friendName] = true;
        }
    }
    return Greeter;
});

newModule.addVar('createGreeter', (Greeter)=>{
    return function(lang){
        return new Greeter(lang);
    };
});

newModule.exportVars(['createGreeter']);

newModule.writeToFile(outputFilename, ()=>{
    console.log('Success!');
});
```

#### Output `greeter.js`:
```js
var supportedLanguages = {
    English: {
        basicGreeting: (name) => `Hello, ${name}.`,
        friendlyGreeting: (name) => `Yo, ${name}!`
    },
    French: {
        basicGreeting: (name) => `Bonjour, ${name}.`,
        friendlyGreeting: (name) => `Quoi de neuf, ${name}?`
    }
};

var defaultLanguage = 'English'

var Greeter = (function GreeterProcedure(){
    class Greeter {
        constructor(lang){
            friends = {};
            this.phrases = supportedLanguages[lang] || supportedLanguages[defaultLang];
        }
        greet(nameToGreet){
            if(friends[friendName]){
                return this.phrases.friendlyGreeting(nameToGreet);
            }else{
                return this.phrases.greeting(nameToGreet);
            }
        }
        makeFriend(friendName){
            friends[friendName] = true;
        }
    }
    return Greeter;
})();

var createGreeter = function(lang){
    return new Greeter(lang);
};

module.exports = { createGreeter };
```

### Specifying options:

You can pass an options object as the last argument to writeModule, createModule, or Module.writeToFile.


Caveats
-------

* Variables must be either functions, or types which can be expressed literally.  Those types are primitives (strings, chars, numbers, symbols, booleans, regular expressions, null, undefined), boxed primitives (Number, Boolean, etc), literal objects, Arrays with numeric keys.  *However, these objects can be nested, and functions can return any type on the module's scope.*

* Functions and variables passed into the module must not reference anything which will resolve to `undefined` in the module's scope.  (Just remember that your code will run in a different context!)

* This package only works in Node.js, not browsers.


Future plans
------------

* Add support for non-standard keys and property descriptors through IIFE substitution.
