# Regenerates public/assets/logo-script-{a,b,c}.svg (Dejeu on top, Crew hanging off the j's descender).
# Needs: python venv with uharfbuzz + fonttools; Great Vibes / Pinyon Script / Parisienne TTFs (SIL OFL, Google Fonts).
# Font paths are set in lib.py FONTS. Usage: python scripts/logo-script/build.py
import sys, os; here=os.path.dirname(__file__); sys.path.insert(0, here)
from compose import compose; from flourish import JSwash
V=[('a','greatvibes',dict(cs=0.85,dx=0,overlap=6)),
   ('b','pinyon',dict(cs=0.85,dx=0,overlap=6,flourish=JSwash(depth=7,reach=14,loop=20,w=1.3))),
   ('c','parisienne',dict(cs=0.85,dx=-2,overlap=6,flourish=JSwash(depth=8,reach=16,loop=22,w=1.5)))]
for n,k,kw in V:
    svg,_=compose(n,k,k,**kw)
    open(os.path.join(here,'..','..','public','assets',f'logo-script-{n}.svg'),'w').write(svg)
