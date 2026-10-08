import math
def bez(p0,p1,p2,p3,t):
    u=1-t; return tuple(u**3*a+3*u*u*t*b+3*u*t*t*c+t**3*d for a,b,c,d in zip(p0,p1,p2,p3))
def tapered(segs,widths,n=60):
    """segs: list of cubic (p0,p1,p2,p3); widths: fn(s in 0..1)->half width"""
    pts=[]
    for i,sg in enumerate(segs):
        for k in range(n+(1 if i==len(segs)-1 else 0)):
            pts.append(bez(*sg,k/n))
    L=len(pts); left=[];right=[]
    for i,p in enumerate(pts):
        a=pts[max(i-1,0)]; b=pts[min(i+1,L-1)]
        dx,dy=b[0]-a[0],b[1]-a[1]; d=math.hypot(dx,dy) or 1
        nx,ny=-dy/d,dx/d; w=widths(i/(L-1))
        left.append((p[0]+nx*w,p[1]+ny*w)); right.append((p[0]-nx*w,p[1]-ny*w))
    poly=left+right[::-1]
    d='M'+' L'.join(f'{x:.2f} {y:.2f}' for x,y in poly)+'Z'
    xs=[p[0] for p in poly]; ys=[p[1] for p in poly]
    return d,(min(xs),min(ys),max(xs),max(ys))
class JSwash:
    """j tail -> calligraphic oval sweep down-left (thick downstroke) -> hairline sweep right under Crew."""
    def __init__(s,depth=8,reach=16,loop=20,w=1.8,lift=7,hair=0.45): s.depth,s.reach,s.loop,s.w,s.lift,s.hair=depth,reach,loop,w,lift,hair
    def __call__(s,tx,ty,cx,cy,cb,db):
        y=cb[3]+s.depth; H=y-ty; L=s.loop
        P0=(tx,ty); P3=(tx+H*0.35,y)
        seg1=(P0,(tx-L,ty+H*0.15),(tx-L*0.75,y),P3)
        E=(cb[2]+s.reach,y-s.lift)
        seg2=(P3,(tx+(E[0]-tx)*0.4,y),(tx+(E[0]-tx)*0.8,y-s.lift*0.2),E)
        W=s.w; h=s.hair
        def wf(t):
            if t<0.5:
                u=t/0.5; return h*0.6+(W-h*0.6)*math.sin(math.pi*u)**1.3
            u=(t-0.5)/0.5; return max(0.04,h*0.6*(1-u**1.3))
        d,b=tapered([seg1,seg2],wf)
        s.bounds=b
        return f'<path d="{d}"/>'
