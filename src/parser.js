
// Parser for syntatic analysis that builds an ast and evaluates code
// Web based assembly language generator for a BASIC-like programming language
// Graham Briggs
// April 2016


//import {TokenType} from 'lexer.js'

function errorRowColumn(obj, msg) {
    throw msg + ": " + obj.getCurrentToken().column + "," + obj.getCurrentToken().row;
}


var TokenType = {
    L_PAREN : 0,
    R_PAREN : 1,
    EQUALS  : 2,
    PLUS    : 3,
    MINUS   : 4,
    DIVISION: 5,
    MULTIPLICATION: 6,
    MODULUS : 7,
    INTEGER : 8,
    REAL    : 9,
    IDENTIFIER : 10,
    KEYWORD_IF    : 11,
    KEYWORD_ELSE  : 12,
    KEYWORD_THEN  : 13,
    KEYWORD_WHILE : 14,
    KEYWORD_TRUE  : 15,
    KEYWORD_FALSE : 16,
    KEYWORD_DO    : 17,
    KEYWORD_SKIP  : 18,
    OP_ASSIGNMENT : 19,
    OP_EQUIVALENT : 20,
    OP_LESS_THAN  : 21,
    OP_GREATER_THAN : 22,
    OP_GREATER_THAN_EQUAL_TO : 23,
    OP_LESS_THAN_EQUAL_TO    : 24,
    OP_NOT        : 25,
    SCOPE_START   : 26,
    SCOPE_END     : 27,
    LINE_TERMINATOR : 28,
    EOF : 29
}

/////////////////////////////////////
/////////////////////////////////////

// Identifier binding


var identMap = (function(){
    var identifiers = {};
    
    return {
        dbgPrintIdentMap() {
            console.log(identifiers);
        },
        addIdent: function(name, value) {
            identifiers[name] = value;
        },
        getIdentValue: function(name) {
            return identifiers[name];
        }
    }
}());

////////////////////////////////////
////////////////////////////////////

// Parser

function parser(tokenList) {
    
    console.log("--- Parsing ---");
    var analyzer = new SyntaxAnalysis(tokenList);
    // start
    analyzer.block();
    //analyzer.expression();
    //console.log(analyzer.tokens);
}

function SyntaxAnalysis(tokenList) {
    
    this.tokens = tokenList;
    this.currentSymbolNumber = 0;
    this.currentToken = this.tokens[this.currentSymbolNumber];
    console.log("Starting SYMBOL: " + this.tokens[0].id);
}

SyntaxAnalysis.prototype.getCurrentToken = function() {
    return this.currentToken;
}

SyntaxAnalysis.prototype.getCurrentTokenType = function() {
    return this.currentToken.type;
}

SyntaxAnalysis.prototype.nextSymbol = function(sym) {
    
    this.currentSymbolNumber++;
    var sym = this.tokens[this.currentSymbolNumber];
    
    this.currentToken = sym;
    
    console.log("CURRENT SYMBOL: " + this.getCurrentToken().id);
           
}

SyntaxAnalysis.prototype.accept = function(symType) {
    
    if (this.getCurrentToken().type === symType) {
        this.nextSymbol();
        return true;
    }
    else
        return false;
}

SyntaxAnalysis.prototype.expect = function(symType) {
    
    if (this.getCurrentTokenType() === symType) {
        return true;
    }
    else {
        return false;
    }
}

SyntaxAnalysis.prototype.getPreviousToken = function() {
    
    return this.tokens[this.currentSymbolNumber - 1].id;
}

SyntaxAnalysis.prototype.tokenLookahead = function(howMany) {
    return this.tokens[this.currentSymbolNumber + howMany];
}

SyntaxAnalysis.prototype.factor = function() {
    
    // optional
    if (this.expect(TokenType.MINUS)) {
        this.accept(TokenType.MINUS);

        this.factor();
    }
    
    if (this.accept(TokenType.INTEGER)) {
        return new Integer(parseInt(this.getPreviousToken()));
    }
    else if (this.accept(TokenType.REAL)) {
        return new Real(parseFloat(this.getPreviousToken()))
    }
    else if (this.accept(TokenType.IDENTIFIER)) {
        
        console.log("ident: " + this.getPreviousToken());
        
        console.log("IDENT");
        console.log(identMap.dbgPrintIdentMap());
        
        //var idVal = getIdentValue(this.getPreviousToken());
        var idVal = identMap.getIdentValue(this.getPreviousToken());
        console.log("Idval: " + idVal);
        
        return new Integer(idVal); 
        
        
    }
    else if (this.accept(TokenType.L_PAREN)) {
        console.log("L_PAREN");
        
        var exp = this.expression();
        
        this.accept(TokenType.R_PAREN);
        console.log("R_PAREN");
        return exp;
    }
    else if (this.accept(TokenType.EOF)) {
        //throw "Reached EOF";
        console.log("Reached EOF");
        return;
    }
    else {
        throw "Impossible...";
    }
    
}

SyntaxAnalysis.prototype.term = function() {
    
    var lhs = this.factor();
    var operator = null;
    
    if (!this.expect(TokenType.EOF)) {
        
        while (this.expect(TokenType.MULTIPLICATION) || this.expect(TokenType.DIVISION)
                                                     || this.expect(TokenType.MODULUS)) {
                                                        
            if (this.accept(TokenType.MULTIPLICATION)) {
                var rhs = this.term();
                operator = new Multiplication(lhs.result(), rhs.result());
            }
            else if (this.accept(TokenType.DIVISION)) {
                var rhs = this.term();
                
                operator = new Division(lhs, rhs);
            }
            else if (this.accept(TokenType.MODULUS)) {
                var rhs = this.term();
                
                operator = new Modulus(lhs, rhs);
            }                                                                
        }
        
        if (operator === null) {
            return lhs;
        }
        else {
            return operator;
        }
    }
    else {
        return lhs;
    }
}

SyntaxAnalysis.prototype.expression = function() {
    
    var lhs = this.term();
    var operator = null;
    
    if (!this.expect(TokenType.EOF)) {
        
        while (this.expect(TokenType.PLUS) || this.expect(TokenType.MINUS)) {
            
            if (this.accept(TokenType.PLUS)) {
                var rhs = this.expression();

                operator = new Addition(lhs.result(), rhs.result());
            }
            else if (this.accept(TokenType.MINUS)) {
                var rhs = this.expression();
                operator = new Subtraction(lhs, rhs);
            }
        }
            
        if (operator === null) {
            console.log(lhs);
            return lhs;
        }
        else {
            console.log("expression result [operator]: " + operator.result());
            return operator;
        }
    }
    else {
        console.log("expression result [return]: " + lhs.result());
        return lhs;
    }
}

SyntaxAnalysis.prototype.variableAssignment = function() {
    
    if (this.accept(TokenType.IDENTIFIER)) {
        console.log("var lhs is: " + this.getPreviousToken());
        var identTokenName = this.getPreviousToken();
        
        if (this.accept(TokenType.OP_ASSIGNMENT)) {
            var expResult = this.expression();
            
            if(!this.accept(TokenType.LINE_TERMINATOR)) {
                errorRowColumn(this, "Missing terminator at");
            }
            console.log("Well formed variable assignment.");
            identMap.addIdent(identTokenName, expResult.result());
        }
        else {
            errorRowColumn(this, "Expected assignment at");
        }
    }
    else {
        errorRowColumn(this, "Missing terminator at");
    }

    return identTokenName;
}

SyntaxAnalysis.prototype.booleanExpression = function() {
    
    var lhs = null;
    var operator = null;

    if (!this.expect(TokenType.EOF)) {

        if (this.accept(TokenType.KEYWORD_TRUE)) {
            lhs = BooleanExpression(true);
        }
        else if (this.accept(TokenType.KEYWORD_FALSE)) {
            lhs = BooleanExpression(false);
        }
        else if (this.accept(TokenType.INTEGER) || this.accept(TokenType.IDENTIFIER)) {
            lhs = this.expression();
        }
        else {
            lhs = booleanExpression();
        }

        while (this.expect(TokenType.OP_EQUIVALENT) || this.expect(TokenType.OP_EQUIVALENT)
                                                    || this.expect(TokenType.OP_LESS_THAN)
                                                    || this.expect(TokenType.OP_LESS_THAN_EQUAL_TO)
                                                    || this.expect(TokenType.OP_GREATER_THAN)
                                                    || this.expect(TokenType.OP_GREATER_THAN_EQUAL_TO) {

            if (this.accept(TokenType.OP_EQUIVALENT)) {
                operator = new BooleanEquivalent( );
            }
            else if (this.expect(TokenType.OP_LESS_THAN)) {
                operator = new BooleanLessThan( );
            }
            else if (this.expect(TokenType.OP_LESS_THAN_EQUAL_TO)) {
                operator = new BooleanLessThanEqualTo( );
            }
            else if (this.expect(TokenType.OP_GREATER_THAN)) {
                operator = new BooleanGreaterThan( );
            }
            else if (this.expect(TokenType.OP_GREATER_THAN_EQUAL_TO)) {
                operator = new BooleanGreaterThanEqualTo( );
            }

        }
    }
    return lhs;
}

SyntaxAnalysis.prototype.ifStatement = function() {
    
    /*
     *  if (a > b) {
     *     // block ...
     *  }
     *  // optional
     *  else {
     *     // block ...
     *  }
     */
    
    if (this.accept(TokenType.KEYWORD_IF)) {
        this.accept(TokenType.L_PAREN);
        
        //this.booleanExpression();
        this.expression();
        
        this.accept(TokenType.R_PAREN);
        
        this.accept(TokenType.SCOPE_START);
        
        this.block();
        
        this.accept(TokenType.SCOPE_END);
        console.log("ACCEPTED IF STATEMENT");
    }
    
    if (this.expect(TokenType.KEYWORD_ELSE)) {
        this.elseStatement();
    }
}

SyntaxAnalysis.prototype.elseStatement = function() {
    
    this.accept(TokenType.KEYWORD_ELSE);
    
    this.accept(TokenType.SCOPE_START);
    
    this.block();
    
    this.accept(TokenType.SCOPE_END);
    console.log("ACCEPTED ELSE STATEMENT");
}

SyntaxAnalysis.prototype.whileStatement = function() {
    
    this.accept(TokenType.KEYWORD_WHILE);
    this.accept(TokenType.L_PAREN);
    
    //this.booleanExpression();
    this.expression();
    
    this.accept(TokenType.R_PAREN);
    
    this.accept(TokenType.SCOPE_START);
    
    this.block();
    
    this.accept(TokenType.SCOPE_END);
}

SyntaxAnalysis.prototype.skipStatement = function() {
    
    this.accept(TokenType.KEYWORD_SKIP);
    if (!this.accept(TokenType.LINE_TERMINATOR))
        errorRowColumn(this, "Expected terminator after skip");
}

SyntaxAnalysis.prototype.block = function() {
    
    console.log("In BLOCK");
    
    while (this.expect(TokenType.IDENTIFIER) || this.expect(TokenType.KEYWORD_IF)
                                             || this.expect(TokenType.KEYWORD_WHILE)
                                             || this.expect(TokenType.KEYWORD_SKIP)
                                             || this.expect(TokenType.INTEGER)
                                             || this.expect(TokenType.REAL)
                                             || this.expect(TokenType.IDENTIFIER)
                                             || this.expect(TokenType.L_PAREN)) {
                                                 
        if (this.expect(TokenType.IDENTIFIER) && this.tokenLookahead(1).type === TokenType.OP_ASSIGNMENT) {
            console.log("Doing variable assignment");
            var assTokenId = this.variableAssignment();
            block.addBlock(assTokenId, ident.getIdentValue(assTokenId));

        }
        else if (this.expect(TokenType.KEYWORD_IF)) {
            console.log("If statement");
            var ifResult = this.ifStatement();
            block.addBlock(IfStatement(ifResult));
        }
        else if (this.expect(TokenType.KEYWORD_WHILE)) {
            console.log("while statement");
            var whileResult = this.whileStatement();
            block.addBlock(WhileLoop(whileResult));
        }
        // reserved for interpreter only
        /*
        else if (this.expect(TokenType.KEYWORD_SKIP)) {
            this.accept(TokenType.KEYWORD_SKIP);
        }
        else {
            var res = this.expression();
            console.log(res);
        }
        */
    }
    
}


/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

/*
 * AST objects
 */
// The fundamental types store the raw values of the data
// the operations execute the behaviour of those raw values.

function Integer(val) {
    
    this.value = val;
    
    this.result = function() {
        return this.value;
    }
}

function Real(val) {
    
    this.value = val;
    
    this.result = function() {
        return this.value;
    }
}

function Addition(lhs, rhs) {
    
    this.lhs = lhs;
    this.rhs = rhs;
    
    this.result = function() {
        return this.lhs + this.rhs;
    }
}

function Subtraction(lhs, rhs) {
    
    this.lhs = lhs;
    this.rhs = rhs;
    
    this.result = function() {
        return this.lhs - this.rhs;
    }
}

function Multiplication(lhs, rhs) {
    
    this.lhs = lhs;
    this.rhs = rhs;
    
    this.result = function() {
        return this.lhs * this.rhs;
    }
}

function Division(lhs, rhs) {
    
    this.lhs = lhs;
    this.rhs = rhs;
    
    this.result = function() {
        return this.lhs / this.rhs;
    }
}

function Modulus(lhs, rhs) {
    
    this.lhs = lhs;
    this.rhs = rhs;
    
    this.result = function() {
        return this.lhs % this.rhs;
    }
}

/////////////////

function BooleanExpression(expr) {

    this.expression = expr; 
}

function BooleanLessThan(expr) {

    this.boolExpr = expr;
}

function BooleanLessThanEqualTo(expr) {

    this.boolExpr = expr;
}

function BooleanGreaterThan(expr) {

    this.boolExpr = expr;
}

function BooleanGreaterThanEqualTo(expr) {

    this.boolExpr = expr;
}

/////////////////

function Identifier(name) {
    this.name = name;
    
    this.result = function() {
        
    }
}

////////////////

function Assignment(id, expr) {

	this.identifier = id;
	this.expression = expr;
}


////////////////

function WhileLoop(cond, body) {

	this.condition = cond; // boolExpr
	this.body = body
}

////////////////

function IfStatement(cond, body) {

	this.condition = cond; // boolExpr
	this.body = body;
}

////////////////

function IfElseStatement(cond, body1, body2) {

	this.condition = cond; // boolExpr

	this.bodyIf = body1;
	this.bodyElse = body2;
}

///////////////

function Block() {
	this.subBlock = [];
}

Block.prototype.addBlock(block) {
	this.subBlock.push(block);
}


///////////////
