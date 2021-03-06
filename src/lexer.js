

'use strict';

Compiler.Lexer = function() {

	console.log("Starting lexer...");

	this.originalString = null;
	this.tokens = [];

};

Compiler.Lexer.prototype = {

	constructor: Compiler.Lexer,
	

	scanner: function(data) {

		this.originalString = data;

		this.extractTokens();

		//this.tokens.forEach(printTokens);

		for (var i = 0; i < this.tokens.length; i++) {
			console.log(this.tokens[i]);
		}
	},

	printTokens: function(element, index, array) {
		console.log(element);
	},

	/// Interface with the parser ///

	getTokens: function() {
		return this.tokens;
	},

	///

	extractTokens: function() {
			        
	    var row = 0;
	    var column = 0;
	    
	    var i = 0;

	    while (i < this.originalString.length) {

	        //console.log(this.originalString.substr(i));

	        if (this.originalString[i] === '\n') {
	            i++;
	            row++;
	            column = 0;
	            continue;
	        }
	    
	        switch (this.originalString[i]) {
	        case ' ':
	            //console.log("whitespace");
	            column++;
	            i++;
	            break;
	        case ')':
	            //console.log(")");
	            this.tokens.push({id: ')', type: Tokens.Tokentype.R_PAREN, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case '(':
				//console.log(")");
	            this.tokens.push({id: '(', type: Tokens.Tokentype.L_PAREN, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case '+':
		        //console.log("+");
	            this.tokens.push({id: '+', type: Tokens.Tokentype.PLUS, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case '-':
	            //console.log("-");
	            this.tokens.push({id: '-', type: Tokens.Tokentype.MINUS, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case '*':
	            //console.log("*");
	            this.tokens.push({id: '*', type: Tokens.Tokentype.MULTIPLICATION, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case '/':
	            //console.log("/");
	            this.tokens.push({id: '/', type: Tokens.Tokentype.DIVISION, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case '%':
	            //console.log("%");
	            this.tokens.push({id: '%', type: Tokens.Tokentype.MODULUS, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case ',':
	        	this.tokens.push({id: ',', type: Tokens.Tokentype.COMMA_SEPARATOR, row: row, col: column});
	        	column++;
	        	i++;
	        	break;
	        case '{':
	            //console.log("{");
	            this.tokens.push({id: '{', type: Tokens.Tokentype.SCOPE_START, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case '}':
	            //console.log("}");
	            this.tokens.push({id: '}', type: Tokens.Tokentype.SCOPE_END, row: row, col: column});
	            column++;
	            i++;
	            break;
	        case ';':
	            //console.log(";");
	            this.tokens.push({id: ';', type: Tokens.Tokentype.LINE_TERMINATOR, row: row, col: column});
	            column++;
	            i++;
	            break;
	        default:
	            //console.log("in default");
	            var a = this.getAtom(this.originalString, i);       
	            //console.log("a is: " + a);
	            
	            if (a === "") {
	                throw "Unrecognized token at: " + column + "," + row;
	            }
	            else if (this.isAssignmentOperator(a)) {
	                this.tokens.push({id: a, type: Tokens.Tokentype.OP_ASSIGNMENT, row: row, col: column});
	            }
	            else if (this.isEquivalenceOperator(a)) {
	                this.tokens.push({id: a, type: Tokens.Tokentype.OP_EQUIVALENT, row: row, col: column});
	            }
	            else if (this.isNotEquivalentOperator(a)) {
	            	this.tokens.push({id: a, type: Tokens.Tokentype.OP_NOT_EQUIVALENT, row: row, col: column});
	            }
	            else if (this.isReal(a)) {
	                this.tokens.push({id: a, type: Tokens.Tokentype.REAL, row: row, col: column});
	            }
	            else if (this.isInteger(a)) {
	                this.tokens.push({id: a, type: Tokens.Tokentype.INTEGER, row: row, col: column});
	            }
	            else if (this.isKeyword(a)) {
	                if (a === "if")
	                	this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_IF, row: row, col: column});
	                else if (a === "else")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_ELSE, row: row, col: column});
	                else if (a === "then")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_THEN, row: row, col: column});
	                else if (a === "while")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_WHILE, row: row, col: column});
	                else if (a === "true")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_TRUE, row: row, col: column});
	                else if (a === "false")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_FALSE, row: row, col: column});
	                else if (a === "do")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_DO, row: row, col: column});
	                else if (a === "skip")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_SKIP, row: row, col: column});
	                else if (a === "not")
	                	this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_NOT, row: row, col: column});
	                else if (a === "call")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_CALL, row: row, col: column});
	                else if (a === "function")
	                    this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_FUNCTION, row: row, col: column});
	                else if (a === "return")
	                	this.tokens.push({id: a, type: Tokens.Tokentype.KEYWORD_RETURN, row: row, col: column});
	                else 
	                    throw "Uhh...";
	                
	            }
	            else if (this.isIdentifier(a)) {
	                this.tokens.push({id: a, type: Tokens.Tokentype.IDENTIFIER, row: row, col: column});
	            }
	            else if (this.isGreaterThanEqualToOperator(a)) {
	                this.tokens.push({id: a, type: Tokens.Tokentype.OP_GREATER_THAN_EQUAL_TO, row: row, col: column});
	            }
	            else if (this.isLessThanEqualToOperator(a)) {
	                this.tokens.push({id: a, type: Tokens.Tokentype.OP_LESS_THAN_EQUAL_TO, row: row, col: column});
	            } 
	            else if (this.isGreaterThanOperator(a)) {
	            	this.tokens.push({id: a, type: Tokens.Tokentype.OP_GREATER_THAN, row: row, col: column});
	            }
	            else if (this.isLessThanOperator(a)) {
	                this.tokens.push({id: a, type: Tokens.Tokentype.OP_LESS_THAN, row: row, col: column});
	            }           
	            else {
	                throw "Unidentified token: " + column + "," + row;
	            }
	            column += a.length;
	            i += a.length;   
	        }
	    }
		this.tokens.push({id: "EOF", type: Tokens.Tokentype.EOF, row: row, col: column});
	 
	},


	getAtom: function(syntax, pos) {

	    var atomLength = 0;
	    
	    for (var i = pos; i < syntax.length; i++) {
	        if (Utility.isAlphaNum(syntax[i]) || syntax[i] === '_' || syntax[i] === '>'
	                                    || syntax[i] === '<' || syntax[i] === '.'
	                                    || syntax[i] === ':' || syntax[i] === '=') {
	            atomLength++;                
	        }
	        else {
	            break;
	        }
	    }
	    return syntax.substring(pos, pos + atomLength);
	},

	isInteger: function(syntax) {
	    
	    for (var i = 0; i < syntax.length; i++) {
	        if (!Utility.isNum(syntax[i]))
	            return false;
	    }
	    return true;
	},   

	isReal: function(syntax) {
    
	    for (var i = 0; i < syntax.length; i++) {
	        if (syntax[i] === ".") {
	            
	            var lhs = syntax.substring(0, i);
	            var rhs = syntax.substring(i + 1, syntax.length);

	            if (this.isInteger(lhs) && this.isInteger(rhs)) {
	                return true;
	            }
	            else
	                return false;
	        }
	    }
	    return false;
	},

	isKeyword: function(syntax) {
	    switch (syntax) {
	    case "if":
	        return true;
	    case "else":
	        return true;
	    case "then":
	        return true;
	    case "while":
	        return true;
	    case "true":
	        return true;
	    case "false":
	        return true;
	    case "do":
	        return true;
	    case "skip":
	        return true;
	    case "not":
	    	return true;
	    case "call":
	    	return true;
	   	case "function":
	   		return true;
	   	case "return":
	   		return true;
	    default:
	        break;
	        
	    }
	    return false;
	},
	isIdentifier: function(syntax) {
	        
	    if (Utility.isAlpha(syntax[0]) || syntax[0] === '_') {
	        for (var i = 1; i < syntax.length; i++) {
	            if (!Utility.isAlphaNum(syntax[i]) && syntax[i] !== '_') {
	                return false;
	            }
	        }
	    }
	    else {
	        return false;
	    }
	    return true;
	},

	isAssignmentOperator: function(syntax) {
		if (syntax[0] === ':' && syntax[1] === '=')
        	return true;
    	else
        	return false;
	},

	isEquivalenceOperator: function(syntax) {
	    if (syntax[0] === '=' && syntax[1] === '=')
	        return true;
	    else
	        return false;
	},

	isNotEquivalentOperator: function(syntax) {
		if (syntax[0] === '<' && syntax[1] === '>')
			return true;
		else
			return false;
	
	},
	    
	isGreaterThanOperator: function(syntax) {
	    if (syntax[0] === '>')
	        return true;
	    else
	        return false;
	},
	    
	isLessThanOperator: function(syntax) {
	    if (syntax[0] === '<')
	        return true;
	    else
	        return false;
	},
	    
	isGreaterThanEqualToOperator: function(syntax) {
	    if (syntax[0] === '>' && syntax[1] === '=')
	        return true;
	    else
	        return false;
	},  

	isLessThanEqualToOperator: function(syntax) {
	    if (syntax[0] === '<' && syntax[1] === '=')
	        return true;
	    else
	        return false;
	},
};


//Compiler.Lexer.Token = function(id, tt, row, col) {
Compiler.Lexer.Token = function(args) {

	this.id = args.id;
	this.type = args.tt;
	this.row = args.row;
	this.column = args.col;

};
