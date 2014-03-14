#!/usr/bin/env python2


from ply import lex, yacc


t_ignore  = ' \t'



def t_newline(t):
    r'\n+'
    t.lexer.lineno += len(t.value)



literals = ",;|(){}"
reserved = ['PROC', 'WHEN', 'NEW', 'IN', 'SEND', 'TO', 'RECV', 'FROM']
tokens = ['VAR', 'ATOM'] + reserved
t_VAR = r'[A-Z][A-Za-z_0-9]*'



def t_ATOM(t):
    r'[a-z][A-Za-z_0-9]*'
    upper = t.value.upper()
    t.type = upper if t.value.islower() and upper in reserved else 'ATOM'
    return t



precedence = [
    ('left', '|'),
    ('left', ';')
]



def p_program(p):
    "program : program pdef"
    p[0] = p[1] + [p[2]]


def p_empty_program(p):
    "program : "
    p[0] = []


def p_pdef(p):
    "pdef : PROC invoke '{' p '}'"
    p[0] = ('pdef', p[2], p[4])


def p_p_invoke(p):
    "p : invoke"
    p[0] = ("invoke", p[1])


def p_when(p):
    "p : WHEN invoke"
    p[0] = ("when", p[2])


def p_new(p):
    "p : NEW varlist IN '{' p '}'"
    p[0] = ("new", p[2], p[5])


def p_brace(p):
    "p : '{' p '}'"
    p[0] = p[2]


def p_branch(p):
    "p : p '|' p"
    p[0] = ('branch', p[1], p[3])


def p_seq(p):
    "p : p ';' p"
    p[0] = ('seq', p[1], p[3])


def p_send(p):
    "p : SEND VAR TO VAR"
    p[0] = ('send', p[2], p[4])


def p_recv(p):
    "p : RECV VAR FROM VAR"
    p[0] = ('recv', p[2], p[4])


def p_invoke(p):
    "invoke : ATOM '(' vlist ')'"
    p[0] = (p[1], p[3])


def p_vlist(p):
    "vlist : varlist"
    p[0] = p[1]


def p_vlist_empty(p):
    "vlist : "
    p[0] = []


def p_varlist(p):
    "varlist : varlist ',' VAR"
    p[0] = p[1] + [p[3]]


def p_var(p):
    "varlist : VAR"
    p[0] = [p[1]]



lexer = lex.lex()
parser = yacc.yacc()




class ProcScope(object):


    def __init__(self):
        self.count = 0
        self.vars = {}


    def __contains__(self, item):
        return item in self.vars


    def __getitem__(self, key):
        return self.vars[key]


    def incr(self):
        c = self.count
        self.count += 1
        return c


    def new_var(self, name):
        assert name not in self.vars
        c = self.incr()
        self.vars[name] = c
        return c



class PScope(object):


    def __init__(self, parent):
        self.parent = parent
        self.vars = {}


    def __contains__(self, item):
        if item in self.vars:
            return True
        else:
            return item in self.parent


    def __getitem__(self, key):
        if key in self.vars:
            return self.vars[key]
        else:
            return self.parent[key]


    def incr(self):
        return self.parent.incr()


    def new_var(self, name):
        assert name not in self.vars
        c = self.incr()
        self.vars[name] = c
        return c



class Label(object):

    def __init__(self):
        self.pos = None



def compile_p(scope, asms, p):
    typ = p[0]

    if typ == 'seq':
        compile_p(scope, asms, p[1])
        compile_p(scope, asms, p[2])
        return
    elif typ == 'branch':
        l1, l2 = Label(), Label()

        asms += [('branch', l1)]
        compile_p(PScope(scope), asms, p[1])

        asms += [
            ('goto', l2),
            ('label', l1)
        ]
        compile_p(PScope(scope), asms, p[2])
        asms += [('label', l2)]

    elif typ == 'invoke':
        name, args = p[1]
        asms += [('invoke', name, [scope[arg] for arg in args])]
    elif typ == 'new':
        new_scope = PScope(scope)
        for arg in p[1]:
            asms += [('new', new_scope.new_var(arg))]
        compile_p(new_scope, asms, p[2])
    elif typ == 'when':
        name, args = p[1]
        asms += [('when', name, [scope[arg] for arg in args])]
    elif typ == 'send':
        asms += [('send', scope[p[1]], scope[p[2]])]
    elif typ == 'recv':
        asms += [('recv', scope.new_var(p[1]), scope[p[2]])]

    else:
        assert False



def mark_label(asms):
    l = 0

    for asm in asms:
        if asm[0] == 'label':
            asm[1].pos = l
        else:
            l += 1

    new_asms = []

    for asm in asms:
        if asm[0] == 'label':
            continue
        elif asm[0] == 'goto':
            new_asms += [('goto', asm[1].pos)]
        elif asm[0] == 'branch':
            new_asms += [('branch', asm[1].pos)]
        else:
            new_asms += [asm]

    return new_asms



def compile_pdef(pdef):
    _, (name, args), body = pdef

    scope = ProcScope()
    asms = []

    for arg in args:
        asms += [('new', scope.new_var(arg))]

    compile_p(scope, asms, body)

    asms += [('return',)]
    print name, len(args)
    print mark_label(asms)
    print



def compile_program(prog):
    for pdef in prog:
        compile_pdef(pdef)



CODE = """
proc resource(Rsr) {
  recv Req from Rsr
}

proc manager(Rsr, Mgr) {
  recv C from Mgr;
  send Rsr to C
}

proc client(Mgr, Clt) {
  { send Clt to Mgr } | {
    recv R from Clt;
    new Request in {
      send Request to R
    }
  }
}

proc main() {
    new Rsr, Mgr, Clt in {
      resource(Rsr) |
      manager(Rsr, Mgr) |
      client(Mgr, Clt)
    }
}
"""

prog = parser.parse(CODE)
compile_program(prog)
