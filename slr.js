var PiParser = (
    function() {
        var CODE = {
            ACTIONS: [
                {'11': ['shift', 3]},
                {'11': ['shift', 3], '-1': ['reduce', 0]},
                {'11': ['reduce', 2], '-1': ['reduce', 2]},
                {'9': ['shift', 6]},
                {'11': ['reduce', 1], '-1': ['reduce', 1]},
                {'6': ['shift', 7]},
                {'4': ['shift', 8]},
                {'12': ['shift', 13], '13': ['shift', 14], '15': ['shift', 15], '17': ['shift', 16], '6': ['shift', 17], '9': ['shift', 6]},
                {'5': ['shift', 18], '8': ['shift', 20]},
                {'7': ['shift', 21]},
                {'2': ['shift', 22], '7': ['reduce', 11], '7': ['reduce', 11], '7': ['reduce', 11]},
                {'3': ['shift', 23], '7': ['reduce', 13], '7': ['reduce', 13], '7': ['reduce', 13], '2': ['reduce', 13]},
                {'7': ['reduce', 4], '7': ['reduce', 4], '7': ['reduce', 4], '2': ['reduce', 4], '3': ['reduce', 4]},
                {'9': ['shift', 6]},
                {'8': ['shift', 20]},
                {'8': ['shift', 26]},
                {'8': ['shift', 27]},
                {'12': ['shift', 13], '13': ['shift', 14], '15': ['shift', 15], '17': ['shift', 16], '6': ['shift', 17], '9': ['shift', 6]},
                {'6': ['reduce', 14], '7': ['reduce', 14], '7': ['reduce', 14], '7': ['reduce', 14], '2': ['reduce', 14], '3': ['reduce', 14]},
                {'5': ['shift', 29], '1': ['shift', 30]},
                {'14': ['reduce', 17], '5': ['reduce', 17], '1': ['reduce', 17]},
                {'11': ['reduce', 3], '-1': ['reduce', 3]},
                {'12': ['shift', 13], '13': ['shift', 14], '15': ['shift', 15], '17': ['shift', 16], '6': ['shift', 17], '9': ['shift', 6]},
                {'12': ['shift', 13], '13': ['shift', 14], '15': ['shift', 15], '17': ['shift', 16], '6': ['shift', 17], '9': ['shift', 6]},
                {'7': ['reduce', 5], '7': ['reduce', 5], '7': ['reduce', 5], '2': ['reduce', 5], '3': ['reduce', 5]},
                {'14': ['shift', 33], '1': ['shift', 30]},
                {'16': ['shift', 34]},
                {'18': ['shift', 35]},
                {'7': ['shift', 36]},
                {'6': ['reduce', 15], '7': ['reduce', 15], '7': ['reduce', 15], '7': ['reduce', 15], '2': ['reduce', 15], '3': ['reduce', 15]},
                {'8': ['shift', 37]},
                {'7': ['reduce', 10], '7': ['reduce', 10], '7': ['reduce', 10]},
                {'7': ['reduce', 12], '7': ['reduce', 12], '7': ['reduce', 12], '2': ['reduce', 12]},
                {'6': ['shift', 38]},
                {'8': ['shift', 39]},
                {'8': ['shift', 40]},
                {'7': ['reduce', 9], '7': ['reduce', 9], '7': ['reduce', 9], '2': ['reduce', 9], '3': ['reduce', 9]},
                {'14': ['reduce', 16], '5': ['reduce', 16], '1': ['reduce', 16]},
                {'12': ['shift', 13], '13': ['shift', 14], '15': ['shift', 15], '17': ['shift', 16], '6': ['shift', 17], '9': ['shift', 6]},
                {'7': ['reduce', 7], '7': ['reduce', 7], '7': ['reduce', 7], '2': ['reduce', 7], '3': ['reduce', 7]},
                {'7': ['reduce', 8], '7': ['reduce', 8], '7': ['reduce', 8], '2': ['reduce', 8], '3': ['reduce', 8]},
                {'7': ['shift', 42]},
                {'7': ['reduce', 6], '7': ['reduce', 6], '7': ['reduce', 6], '2': ['reduce', 6], '3': ['reduce', 6]}],

            GOTOS: [
                {'Pdefs': ['goto', 1], 'Pdef': ['goto', 2]},
                {'Pdef': ['goto', 4]},
                {},
                {'Invoke': ['goto', 5]},
                {},
                {},
                {},
                {'Seq': ['goto', 9], 'Branch': ['goto', 10], 'P': ['goto', 11], 'Invoke': ['goto', 12]},
                {'Varlist': ['goto', 19]},
                {},
                {},
                {},
                {},
                {'Invoke': ['goto', 24]},
                {'Varlist': ['goto', 25]},
                {},
                {},
                {'Seq': ['goto', 28], 'Branch': ['goto', 10], 'P': ['goto', 11], 'Invoke': ['goto', 12]},
                {},
                {},
                {},
                {},
                {'Seq': ['goto', 31], 'Branch': ['goto', 10], 'P': ['goto', 11], 'Invoke': ['goto', 12]},
                {'Branch': ['goto', 32], 'P': ['goto', 11], 'Invoke': ['goto', 12]},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {'Seq': ['goto', 41], 'Branch': ['goto', 10], 'P': ['goto', 11], 'Invoke': ['goto', 12]},
                {},
                {},
                {},
                {}],


            GRAMMAR: [
                ['prime', [['nt', 'Pdefs']]],
                ['Pdefs', [['nt', 'Pdefs'], ['nt', 'Pdef']]],
                ['Pdefs', [['nt', 'Pdef']]],
                ['Pdef', [['t', 11], ['nt', 'Invoke'], ['t', 6], ['nt', 'Seq'], ['t', 7]]],
                ['P', [['nt', 'Invoke']]],
                ['P', [['t', 12], ['nt', 'Invoke']]],
                ['P', [['t', 13], ['nt', 'Varlist'], ['t', 14], ['t', 6], ['nt', 'Seq'], ['t', 7]]],
                ['P', [['t', 15], ['t', 8], ['t', 16], ['t', 8]]],
                ['P', [['t', 17], ['t', 8], ['t', 18], ['t', 8]]],
                ['P', [['t', 6], ['nt', 'Seq'], ['t', 7]]],
                ['Seq', [['nt', 'Branch'], ['t', 2], ['nt', 'Seq']]],
                ['Seq', [['nt', 'Branch']]],
                ['Branch', [['nt', 'P'], ['t', 3], ['nt', 'Branch']]],
                ['Branch', [['nt', 'P']]],
                ['Invoke', [['t', 9], ['t', 4], ['t', 5]]],
                ['Invoke', [['t', 9], ['t', 4], ['nt', 'Varlist'], ['t', 5]]],
                ['Varlist', [['nt', 'Varlist'], ['t', 1], ['t', 8]]],
                ['Varlist', [['t', 8]]]]
        };


        function parse(tokens, mode) {
            var stack = [[0, null]];
            var token = tokens[0];
            tokens = tokens.slice(1);

            while (true) {
                var state = stack.slice(-1)[0][0];
                var action = mode.ACTIONS[state][token[0]];

                if(action === undefined) {
                    return false;
                }

                if (action[0] === 'shift') {
                    stack.push([action[1], token[1]]);
                    token = tokens[0];
                    tokens = tokens.slice(1);
                } else if (action[0] === 'reduce') {
                    var rule_num = action[1];
                    var [name, prod] = mode.GRAMMAR[rule_num];

                    var found = stack.slice(-(prod.length));
                    stack = stack.slice(0, -(prod.length));

                    if (rule_num === 0) {
                        return found[0][1];
                    }

                    var next_state = mode.GOTOS[stack.slice(-1)[0][0]][name][1];

                    stack.push(
                        [next_state,
                         [rule_num,
                          found.map(f => f[1])]]);
                }
            }
        }

        function construct_code(ast) {
            if (ast[0] === 1) {
                return construct_code(ast[1][0]).concat([construct_code(ast[1][1])]);
            } else if (ast[0] === 2) {
                return [construct_code(ast[1][0])];
            } else if (ast[0] === 3) {
                return ['pdef', construct_code(ast[1][1]), construct_code(ast[1][3])];
            } else if (ast[0] === 4) {
                return ['invoke', construct_code(ast[1][0])];
            } else if (ast[0] === 5) {
                return ['when', construct_code(ast[1][1])];
            } else if (ast[0] === 6) {
                return ['new', construct_code(ast[1][1]), construct_code(ast[1][4])];
            } else if (ast[0] === 7) {
                return ['send', ast[1][1], ast[1][3]];
            } else if (ast[0] === 8) {
                return ['recv', ast[1][1], ast[1][3]];
            } else if (ast[0] === 9) {
                return construct_code(ast[1][1]);
            } else if (ast[0] === 10) {
                return ['seq', construct_code(ast[1][0]), construct_code(ast[1][2])];
            } else if (ast[0] === 11) {
                return construct_code(ast[1][0]);
            } else if (ast[0] === 12) {
                return ['branch', construct_code(ast[1][0]), construct_code(ast[1][2])];
            } else if (ast[0] === 13) {
                return construct_code(ast[1][0]);
            } else if (ast[0] === 14) {
                return [ast[1][0], []];
            } else if (ast[0] === 15) {
                return [ast[1][0], construct_code(ast[1][2])];
            } else if (ast[0] === 16) {
                return construct_code(ast[1][0]).concat([ast[1][2]]);
            } else if (ast[0] === 17) {
                return [ast[1][0]];
            }

            return undefined;
        }

        function parse_code(tokens) {
            var ast = parse(tokens, CODE);

            if (ast == false) {
                return false;
            }

            return construct_code(ast);
        }


        return {parse_code: parse_code};
    })();
