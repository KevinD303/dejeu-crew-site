import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
G='/usr/share/fonts/truetype/sand-box/google/'
FONTS={
 'pinyon':G+'Pinyon Script/PinyonScript-Regular.ttf',
 'greatvibes':G+'Great Vibes/GreatVibes-Regular.ttf',
 'allura':G+'Allura/Allura-Regular.ttf',
 'parisienne':G+'Parisienne/Parisienne-Regular.ttf',
 'alexbrush':G+'Alex Brush/AlexBrush-Regular.ttf',
 'italianno':G+'Italianno/Italianno-Regular.ttf',
 'petitformal':G+'Petit Formal Script/PetitFormalScript-Regular.ttf',
 'rouge':G+'Rouge Script/RougeScript-Regular.ttf',
 'mrssaint':'/tmp/logo/fonts/MrsSaintDelafield-Regular.ttf',
 'monsieur':'/tmp/logo/fonts/MonsieurLaDoulaise-Regular.ttf',
}
_c={}
def load(k):
    if k not in _c:
        p=FONTS[k]; data=open(p,'rb').read()
        _c[k]=(TTFont(p), hb.Font(hb.Face(data)))
    return _c[k]
def shape(k,text,size,x0=0,y0=0,features=None):
    """returns list of dict(name,path,bbox) in SVG coords (y down), baseline at y0, font size px"""
    tt,f=load(k); upm=tt['head'].unitsPerEm; s=size/upm
    buf=hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(f,buf,features or {"kern":True,"liga":True,"calt":True})
    gs=tt.getGlyphSet(); order=tt.getGlyphOrder(); out=[]; x=0
    for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
        name=order[info.codepoint]
        ox=x0+(x+pos.x_offset)*s; oy=y0-pos.y_offset*s
        t=(s,0,0,-s,ox,oy)
        sp=SVGPathPen(gs); gs[name].draw(TransformPen(sp,t))
        bp=BoundsPen(gs); gs[name].draw(TransformPen(bp,t))
        out.append(dict(name=name,path=sp.getCommands(),bbox=bp.bounds,cluster=info.cluster))
        x+=pos.x_advance
    return out,x0+x*s
def bbox(gl):
    bs=[g['bbox'] for g in gl if g['bbox']]
    return min(b[0] for b in bs),min(b[1] for b in bs),max(b[2] for b in bs),max(b[3] for b in bs)
from fontTools.pens.recordingPen import DecomposingRecordingPen
def points(k,name,size,ox,oy):
    tt,f=load(k); s=size/tt['head'].unitsPerEm; gs=tt.getGlyphSet()
    rp=DecomposingRecordingPen(gs); gs[name].draw(TransformPen(rp,(s,0,0,-s,ox,oy)))
    pts=[]
    for op,args in rp.value:
        pts+=[a for a in args if isinstance(a,tuple)]
    return pts
