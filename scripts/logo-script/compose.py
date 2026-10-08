import os, sys; sys.path.insert(0, os.path.dirname(__file__))
import sys, json; from lib import *
GOLD='''<linearGradient id="g{id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCC293"/><stop offset=".5" stop-color="#C4A574"/><stop offset="1" stop-color="#A8864F"/></linearGradient>'''
def jtail(k,gl):
    j=[g for g in gl if g['cluster']==2][0]
    pts=points(k,j['name'],SIZE,*j['_o'])
    return max(pts,key=lambda p:p[1])
SIZE=100
def compose(id,kD,kC,cs=0.85,dx=0,overlap=6,flourish=None,title='Dejeu Crew',pad=6):
    gl,w=shape(kD,'Dejeu',SIZE,0,0)
    # record origins for j
    tt,f=load(kD); 
    # recompute j origin from bbox of path: re-shape to get offsets
    buf=hb.Buffer(); buf.add_str('Dejeu'); buf.guess_segment_properties(); hb.shape(f,buf,{"kern":True,"liga":True,"calt":True})
    s=SIZE/tt['head'].unitsPerEm; x=0
    for g,(i,p) in zip(gl,zip(buf.glyph_infos,buf.glyph_positions)):
        g['_o']=((x+p.x_offset)*s,-p.y_offset*s); x+=p.x_advance
    tx,ty=jtail(kD,gl)
    cg0,_=shape(kC,'Crew',SIZE*cs,0,0); cb=bbox(cg0)
    cx=tx-cb[0]+dx; cy=ty-overlap-cb[1]
    cg,_=shape(kC,'Crew',SIZE*cs,cx,cy)
    paths=[g['path'] for g in gl+cg]
    extra=''
    if flourish:
        extra=flourish(tx,ty,cx,cy,bbox(cg),bbox(gl))
    allb=[bbox(gl),bbox(cg)]
    x0=min(b[0] for b in allb)-pad; y0=min(b[1] for b in allb)-pad; x1=max(b[2] for b in allb)+pad; y1=max(b[3] for b in allb)+pad
    if flourish:
        fb=flourish.bounds; x0=min(x0,fb[0]-pad); x1=max(x1,fb[2]+pad); y1=max(y1,fb[3]+pad); y0=min(y0,fb[1]-pad)
    W=x1-x0;H=y1-y0
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.1f} {y0:.1f} {W:.1f} {H:.1f}" width="{W*4:.0f}" height="{H*4:.0f}" role="img" aria-label="{title}"><title>{title}</title><defs>{GOLD.format(id=id)}</defs><g fill="url(#g{id})">{"".join(f'<path d="{p}"/>' for p in paths)}{extra}</g></svg>'''
    return svg,(W,H)
