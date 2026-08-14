import random
from tkinter import *

#paramaeters
dfspd = 200

clrs = ['lawn green','deep pink','black']
clrs2 = ['sea green','dark violet']
tempfacing0 = 1
facing0 = 1
tempfacing1 = -1
facing1 = -1
tmpfcs = [tempfacing0,tempfacing1]
fcs = [facing0,facing1]
grow = -1
mvcnt = 0
mrdr = -1
apl = 112
mrd = -1
spd = dfspd
spap = -1
mvcnt2 = 0
forbid = [96,97,98,126,127,128]
dct0 = -1
dct1 = -1
dcts = [dct0,dct1]

def up(event):
    face(-15,0)
def left(event):
    face(-1,0)
def down(event):
    face(15,0)
def right(event):
    face(1,0)

def w(event):
    face(-15,1)
def a(event):
    face(-1,1)
def s(event):
    face(15,1)
def d(event):
    face(1,1)

def face(a,b):
    global tmpfcs
    tmpfcs[b] = a

def end(a,b):
    global sqrs
    global snks
    global forbid
    if a == snks[1-b][-1]:
        eye(a,1-b)
    elif a == snks[b][-1]:
        eye(a,b)
    else:
        sqrs[a].config(bg='black')
        if a in forbid:
            sqrs[a].config(bg='gray25')

def body(a,b):
    global sqrs
    sqrs[a].delete('all')
    sqrs[a].config(bg=clrs[b])

def eye(a,b):
    global sqrs
    global fcs
    sqrs[a].config(bg=clrs[b])
    if fcs[b] > 0:
        sqrs[a].create_oval((28,28),(37,37),fill='black')
    else:
        sqrs[a].create_oval((14,14),(22,22),fill='black')
    if fcs[b] < -1 or fcs[b] == 1:
        sqrs[a].create_oval((28,14),(37,22),fill='black')
    else:
        sqrs[a].create_oval((14,28),(22,37),fill='black')

def reset(a):
    global snks
    global sqrs
    global fcs
    global tmpfcs
    global clrs
    global mrdr
    global mvcnt
    global mrd
    global apl
    global forbid
    global dcts
    dcts[a] += 1
    for i in snks[a]:
        sqrs[snks[a][-1]].delete('all')
        if i == snks[1-a][-1]:
            eye(i,1-a)
        elif i in snks[1-a]:
            body(i,1-a)
        else:
            sqrs[i].config(bg='black')
            if i in forbid:
                sqrs[i].config(bg='gray25')
    tmpfcs[a] = (1-2*a)
    fcs[a] = (1-2*a)
    snks[a] = [112+16*(a*2-1),112+15*(a*2-1),112+14*(a*2-1)]
    eye(snks[a][-1],a)
    body(snks[a][1],a)
    body(snks[a][0],a)
    if a == mrdr:
        if a == 0:
            clrs[a] = 'lawn green'
        elif a == 1:
            clrs[a] = 'deep pink'
        for i in snks[a]:
            sqrs[i].config(bg=clrs[a])
        mrdr = -1
        mrd = -1
        mvcnt = 0
    for i in snks[a]:
        if i in snks[1-a]:
            reset(1-a)
    sqrs[apl].delete('all')
    sqrs[apl].create_oval((5,8),(47,50),fill='red')
    sqrs[apl].create_rectangle((23,3),(29,23),fill='brown')
    sqrs[apl].create_oval((26,6),(37,17),fill='lawn green')
    if mrd > -1:
        sqrs[mrd].delete('all')
        sqrs[mrd].create_oval((5,5),(47,47),fill='white')
        sqrs[mrd].create_text((25,25),text='slice')
    if spap > -1:
        sqrs[spap].delete('all')
        sqrs[spap].create_oval((5,5),(47,47),fill='yellow')
        sqrs[spap].create_text((25,25),text='speed')
    if a == 0:
        sqrs[snks[a][len(snks[a])-2]].create_text((25,25),text='↑←↓→')
    else:
        sqrs[snks[a][len(snks[a])-2]].create_text((25,25),text='wasd')
    sqrs[snks[a][len(snks[a])-3]].create_text((25,25),text=f"deaths: {dcts[a]}")

def move():
    global fcs
    global snks
    global tmpfcs
    global apl
    global grow
    global mrd
    global sqrs
    global mvcnt
    global mrdr
    global clrs
    global spd
    global spap
    global mvcnt2
    global dcts
    temp = []
    for m in range(2):
        if fcs[m] + tmpfcs[m] != 0:
            fcs[m] = tmpfcs[m]
        head = snks[m][-1] + fcs[m]
        if  head % 15 == 0 and fcs[m] == 1:
            head -= 15
        elif head % 15 == 14 and fcs[m] == -1:
            head += 15
        elif head > 224:
            head -= 225
        elif head < 0:
            head += 225
        tail = snks[m][0]
        body(snks[m][-1],m)
        body(snks[m][len(snks[m])-2],m)
        body(snks[m][len(snks[m])-3],m)
        eye(head,m)
        snks[m].append(head)
        if grow != m:
            snks[m].remove(snks[m][0])
            end(tail,m)
    for m in range(2):
        if (snks[m][-1] in snks[1-m]) or (snks[m][-1] in temp):
            temp = snks[0]
            if m == mrdr:
                for k in range(3):
                    if len(snks[1-m]) > 3:
                        sqrs[snks[1-m][0]].config(bg='black')
                        if snks[1-m][0] == snks[m][-1]:
                            eye(snks[m][-1],m)
                        snks[1-m].remove(snks[1-m][0])
                mvcnt = 30
                if snks[m][-1] in snks[1-m]:
                    reset(m)
            else:
                reset(m)
    for m in range(2):
        if snks[m].count(snks[m][-1]) > 1:
            reset(m)
    grow = -1
    for m in range(2):
        if snks[m][-1] == apl:
            sqrs[apl].delete('all')
            eye(apl,m)
            grow = m
            apple()
    for m in range(2):
        if mvcnt == 30:
            if mrdr == 0:
                clrs[mrdr] = 'lawn green'
            elif mrdr == 1:
                clrs[mrdr] = 'deep pink'
            for i in snks[mrdr]:
                sqrs[i].config(bg=clrs[mrdr])
            mrdr = -1
            mvcnt = 0
        if mrdr != -1:
            mvcnt += 1
        elif random.randint(1,60) == 1 and mrd == -1:
            wapple()
        else:
            if snks[m][-1] == mrd:
                sqrs[mrd].delete('all')
                eye(mrd,m)
                mrdr = m
                for i in snks[m]:
                    sqrs[i].config(bg='white')
                clrs[m] = 'white'
                mrd = -1
    if mrdr > -1 and 0 < mvcnt < 30:
        for k in range(3):
            if len(snks[1-mrdr]) - k > 3:
                sqrs[snks[1-mrdr][k]].config(bg=clrs2[1-mrdr])
    if mvcnt2 == 20:
        spd = dfspd
        mvcnt2 = 0
    if spd != dfspd:
        mvcnt2 += 1
    elif random.randint(1,30) == 1 and spap == -1:
        spapple()
    else:
        for m in range(2):
            if snks[m][-1] == spap:
                sqrs[spap].delete('all')
                eye(spap,m)
                spd = dfspd*0.5
                spap = -1
    for m in range(2):
        if snks[m][-1] + fcs[m] == apl:
            if -2 < fcs[m] < 2:
                sqrs[snks[m][-1]].create_rectangle((25+25*fcs[m],22),(25+15*fcs[m],28),fill='red')
            else:
                sqrs[snks[m][-1]].create_rectangle((22,25+25*(fcs[m]/15)),(28,25+15*(fcs[m]/15)),fill='red')
    sqrs[snks[0][len(snks[0])-2]].create_text((25,25),text='↑←↓→')
    sqrs[snks[1][len(snks[1])-2]].create_text((25,25),text='wasd')
    for m in range(2):
        sqrs[snks[m][len(snks[m])-3]].create_text((25,25),text=f"deaths: {dcts[m]}")
    app.after(round(spd), move)

def apple():
    global apl
    global snks
    global sqrs
    global mrd
    global spap
    global forbid
    psbl = []
    for i in range(225):
        if (i in snks[0]) or (i in snks[1]) or i==mrd or i==spap or i in forbid:
            pass
        else:
            psbl.append(i)
    apl = random.choice(psbl)
    sqrs[apl].create_oval((5,8),(47,50),fill='red')
    sqrs[apl].create_rectangle((23,3),(29,23),fill='brown')
    sqrs[apl].create_oval((26,6),(37,17),fill='lawn green')

def wapple():
    global mrd
    global snks
    global sqrs
    global apl
    global spap
    global forbid
    psbl = []
    for i in range(225):
        if (i in snks[0]) or (i in snks[1]) or i==apl or i==spap or i in forbid:
            pass
        else:
            psbl.append(i)
    mrd = random.choice(psbl)
    sqrs[mrd].create_oval((5,5),(47,47),fill='white')
    sqrs[mrd].create_text((25,25),text='slice')

def spapple():
    global spap
    global snks
    global sqrs
    global apl
    global mrd
    global forbid
    psbl = []
    for i in range(225):
        if (i in snks[0]) or (i in snks[1]) or i==apl or i==mrd or i in forbid:
            pass
        else:
            psbl.append(i)
    spap = random.choice(psbl)
    sqrs[spap].create_oval((5,5),(47,47),fill='yellow')
    sqrs[spap].create_text((25,25),text='speed')

app = Tk()
app.title = ("multisnake")

sqrs = {}
for i in range(225):
    sqrs[i] = Canvas(app,bg='black',height=50,width=50)
    rw, clm = divmod(i,15)
    sqrs[i].grid(row=rw,column=clm)
    if i==96 or i==97 or i==98 or i==126 or i==127 or i==128:
        sqrs[i].config(bg='gray25')

snake0 = [0]
snake1 = [0]
snks = [snake0,snake1]
reset(0)
reset(1)
app.bind('<Up>',up)
app.bind('<Left>',left)
app.bind('<Down>',down)
app.bind('<Right>',right)

app.bind('<w>',w)
app.bind('<a>',a)
app.bind('<s>',s)
app.bind('<d>',d)

sqrs[112].create_oval((5,8),(47,50),fill='red')
sqrs[112].create_rectangle((23,3),(29,23),fill='brown')
sqrs[112].create_oval((26,6),(37,17),fill='lawn green')

app.geometry('810x810')
app.after(800, move)
app.mainloop()