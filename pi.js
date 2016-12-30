function ProcScope() {
    this.count = 0;
    this.varnames = [];
    this.varnums = [];
}

ProcScope.prototype.contains = function(name) {
    return (this.varnames.indexOf(name) !== -1);
};

ProcScope.prototype.get = function(name) {
    var index = this.varnames.indexOf(name);
    return this.varnums[index];
};

ProcScope.prototype.incr = function() {
    var c = this.count;
    this.count += 1;
    return c;
};

ProcScope.prototype.new_var = function(name) {
    if (this.contains(name)) { throw "Error"; }
    var c = this.incr();
    this.varnames.push(name);
    this.varnums.push(c);
    return c;
};


function PScope(parent) {
    this.parent = parent;
    this.varnames = [];
    this.varnums = [];
}

PScope.prototype._contains = function(name) {
    return (this.varnames.indexOf(name) !== -1);
};

PScope.prototype._get = function(name) {
    var index = this.varnames.indexOf(name);
    return this.varnums[index];
};

PScope.prototype.contains = function(name) {
    if (this._contains(name)) {
        return true;
    } else {
        return this.parent.contains(name);
    }
};

PScope.prototype.get = function(name) {
    if (this._contains(name)) {
        return this._get(name);
    } else {
        return this.parent.get(name);
    }
};

PScope.prototype.incr = function() {
    return this.parent.incr();
};

PScope.prototype.new_var = function(name) {
    if (this._contains(name)) { throw "Error"; }
    var c = this.incr();
    this.varnames.push(name);
    this.varnums.push(c);
    return c;
};


function Label() {
    this.pos = null;
}


function mark_label(asms) {
    var l = 0;

    for (let asm of asms) {
        if (asm[0] === 'label') {
            asm[1].pos = l;
        } else {
            l += 1;
        }
    }

    var new_asms = [];

    for (let a of asms) {
        if (a[0] === 'label') {
            continue;
        } else if (a[0] === 'goto') {
            new_asms.push(['goto', a[1].pos]);
        } else if (a[0] === 'branch') {
            new_asms.push(['branch', a[1].pos]);
        } else {
            new_asms.push(a);
        }
    }

    return new_asms;
}


function compile_p(scope, asms, p) {
    var type = p[0];

    if (type === 'seq') {
        compile_p(scope, asms, p[1]);
        compile_p(scope, asms, p[2]);
    } else if (type === 'branch') {
        var l1 = new Label();
        var l2 = new Label();
        asms.push(['branch', l1]);
        compile_p(new PScope(scope), asms, p[1]);
        asms.push(['goto', l2], ['label', l1]);
        compile_p(new PScope(scope), asms, p[2]);
        asms.push(['label', l2]);
    } else if (type === 'invoke') {
        var [name, args] = p[1];
        asms.push(["invoke", name, [for (arg of args) scope.get(arg)], args]);
    } else if (type === 'new') {
        var new_scope = new PScope(scope);
        for (let arg of p[1]) {
            asms.push(['new', new_scope.new_var(arg), arg]);
        }
        compile_p(new_scope, asms, p[2]);
    } else if (type === 'when') {
        var [name, args] = p[1];
        asms.push(["when", name, [for (arg of args) scope.get(arg)]]);
    } else if (type === 'send') {
        asms.push(['send', scope.get(p[1]), scope.get(p[2]), p[1], p[2]]);
    } else if (type === 'recv') {
        asms.push(['recv', scope.new_var(p[1]), scope.get(p[2]), p[1], p[2]]);
    } else {
        throw "NEVER REACH HERE";
    }
}


function compile_pdef(pdef) {
    var [_, [name, args], body] = pdef;
    var scope = new ProcScope();
    var asms = [];

    for (let arg of args) {
        scope.new_var(arg);
    }

    compile_p(scope, asms, body);
    asms.push(['return']);

    return [name, args.length, scope.count, mark_label(asms)];
}


function compile_code(code) {
    return [for (pdef of code) compile_pdef(pdef)];
}


function parse_code(s) {
    if (s === "") {
        return [true, []];
    }

    var result = PiLexer.tokenize(s);

    if (!result[0]) {
        return result;
    }

    if (result[1].length === 1) {
        return [true, []];
    }

    var ast = PiParser.parse_code(result[1]);
    if (ast === false) {
        return [false, "syntax error in rules"];
    }

    return [true, compile_code(ast)];
}




function Frame(parent, code, pc, vars) {
    this.parent = parent;
    this.code = code;
    this.pc = pc;
    this.vars = vars;
}


Frame.prototype.copy = function() {
    if (this.parent === null) {
        return new Frame(null, this.code, this.pc, this.vars);
    }
    return new Frame(this.parent.copy(), this.code, this.pc, this.vars);
};


function Channel(num) {
    this.num = num;
    this.senders = [];
    this.receivers = [];
}


function Thread(num, stack) {
    this.num = num;
    this.stack = stack;
    this.blocked = false;
}


function*range(begin, end) {
    for (var i=begin; i<end; i++) {
        yield i;
    }
}


function State(procs) {
    this.pnames = [];
    this.pcodes = [];

    for (let [name,args,vars,insts] of procs) {
        this.pnames.push(name);
        this.pcodes.push([args, vars, insts]);
    }

    this.channel_count = 0;
    this.thread_count = 0;
    this.threads = [];
    this.channels = [];

    this.new_thread(this.call(null, "main", []));
}


State.prototype.new_thread = function(frame) {
    var thread = new Thread(this.thread_count, frame);
    this.thread_count += 1;
    this.step_thread(thread);
    this.threads.push(thread);
    return thread;
};

State.prototype.new_channel = function() {
    var channel = new Channel(this.channel_count);
    this.channel_count += 1;
    this.channels.push(channel);
    return channel;
};

State.prototype.call = function(stack, name, args) {
    var i = this.pnames.indexOf(name);
    if (i === -1) {
        throw "ERROR";
    }

    var [argc, varc, insts] = this.pcodes[i];

    if (argc !== args.length) {
        throw "ERROR";
    }

    var vars = [for (_ of range(0, varc)) null];

    for (let i of range(0, argc)) {
        vars[i] = args[i];
    }

    var frame = new Frame(stack, insts, 0, vars);
    return frame;
};


State.prototype.step = function() {
    for (let chan of this.channels) {
        if ((chan.senders.length === 0) || (chan.receivers.length === 0)) {
            continue;
        }

        var sender = chan.senders.shift();
        var receiver = chan.receivers.shift();

        var sender_inst = sender.stack.code[sender.stack.pc];
        var receiver_inst = receiver.stack.code[receiver.stack.pc];
        var message = sender.stack.vars[sender_inst[1]];
        receiver.stack.vars[receiver_inst[1]] = message;

        sender.stack.pc += 1;
        receiver.stack.pc += 1;
        sender.blocked = false;
        receiver.blocked = false;

        this.step_thread(sender);
        this.step_thread(receiver);

        return [["message", sender.num, receiver.num, message.num]];
    }


    for (let thread of this.threads) {
        if (thread.blocked === true) {
            continue;
        }

        var stack = thread.stack;

        if (stack === null) {
            continue;
        }

        var inst = stack.code[stack.pc];

        if (inst[0] !== 'branch') {
            continue;
        }

        var frame = stack.copy();
        stack.pc += 1;
        this.step_thread(thread);

        frame.pc = inst[1];
        var new_thread = this.new_thread(frame);
        return [["branch", thread.num]];
    }

    var results = [];

    for (let i of range(0, this.threads.length)) {
        var thread = this.threads[i];

        if (thread.blocked === true) {
            continue;
        }

        var stack = thread.stack;
        if (stack === null) {
            results.push(['end', i]);
            thread.blocked = true;
            continue;
        }

        var inst = stack.code[stack.pc];

        if (inst[0] === 'new') {
            var channel = this.new_channel();
            stack.vars[inst[1]] = channel;
            stack.pc += 1;
            results.push(['new', i, inst[2], channel.num]);
        } else if (inst[0] === 'send') {
            stack.vars[inst[2]].senders.push(thread);
            thread.blocked = true;
            results.push(['send', i, inst[3], inst[4], stack.vars[inst[2]].num]);
        } else if (inst[0] === 'recv') {
            stack.vars[inst[2]].receivers.push(thread);
            thread.blocked = true;
            results.push(['recv', i, inst[3], inst[4], stack.vars[inst[2]].num]);
        } else if (inst[0] === 'invoke') {
            var frame = this.call(stack, inst[1], [for (a of inst[2]) stack.vars[a]]);
            thread.stack = frame;
            results.push(['invoke', i, inst[1], inst[3]]);
        } else {
            throw "NEVER REACH HERE";
        }

        this.step_thread(thread);
    }

    return results;
};


State.prototype.step_thread = function(thread) {
    do {
        if (thread.blocked === true) {
            return;
        }

        var stack = thread.stack;
        var inst = stack.code[stack.pc];

        if (inst[0] === 'return') {
            thread.stack = stack.parent;
            if (thread.stack === null) {
                return;
            } else {
                thread.stack.pc += 1;
            }
        } else if (inst[0] === 'goto') {
            stack.pc = inst[1];
        } else {
            return;
        }
    } while(true);
};
