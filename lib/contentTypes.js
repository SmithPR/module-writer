/**
 * contentTypes
 * Simple Classes to enforce the shape of module content objects
 */

class CVar {
    constructor(varName, payload){
        this.varName = varName;
        this.payload = payload;
    }
}
class CVarExpression {
    constructor(varName, payload){
        this.varName = varName;
        this.payload = payload;
    }
}
class CProcedure {
    constructor(payload){
        this.payload = payload;
    }
}

module.exports = { CVar, CVarExpression, CProcedure };