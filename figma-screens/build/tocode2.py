import re,sys,json
A=lambda s:dict(re.findall(r'([\w-]+)="([^"]*)"',s))
def num(v):
  v=round(v,1); return str(int(v)) if v==int(v) else str(v)
def flat_chart(svg):
  # returns list of calls with the chart's own coordinates mapped to the page
  h=A(re.match(r'<svg([^>]*)>',svg).group(1)); vb=[float(v) for v in h['viewBox'].split()]
  ox,oy,W,H=float(h['x']),float(h['y']),float(h['width']),float(h['height']); sx,sy=W/vb[2],H/vb[3]
  X=lambda v:ox+float(v)*sx; Y=lambda v:oy+float(v)*sy; out=[]
  for m in re.finditer(r'<line ([^>]*)/?>|<rect ([^>]*)/>|<text ([^>]*)>(.*?)</text>|<circle ([^>]*)/>|<path ([^>]*)/>',svg,re.S):
    if m.group(1):
      a=A(m.group(1)); out.append('r(%s,%s,%s,1,"%s")'%(num(X(a['x1'])),num(Y(a['y1'])),num((float(a['x2'])-float(a['x1']))*sx),a.get('stroke','#e3e9f0')[1:]))
    elif m.group(2):
      a=A(m.group(2)); out.append('r(%s,%s,%s,%s,"%s",%s)'%(num(X(a['x'])),num(Y(a['y'])),num(float(a['width'])*sx),num(float(a['height'])*sy),a['fill'][1:],a.get('rx','0')))
    elif m.group(3):
      a=A(m.group(3)); an={'middle':'m','end':'e'}.get(a.get('text-anchor',''),'')
      w={'500':'s','600':'s','700':'b'}.get(a.get('font-weight',''),'')
      fs=float(a['font-size'])*min(sx,sy)
      out.append('t(%s,%s,%s,"%s","%s","",%s,"%s")'%(num(X(a['x'])),num(Y(a['y'])),num(fs),a['fill'][1:],w,json.dumps(m.group(4),ensure_ascii=False),an))
    elif m.group(5):
      a=A(m.group(5)); out.append('c(%s,%s,%s,"%s")'%(num(X(a['cx'])),num(Y(a['cy'])),num(float(a['r'])*min(sx,sy)),a['fill'][1:]))
    else:
      a=A(m.group(6)); pts=re.findall(r'([ML])([\d.]+) ([\d.]+)',a['d'])
      d=''.join('%s%s %s'%(c,num(X(px)),num(Y(py))) for c,px,py in pts)
      out.append('x(%s)'%json.dumps('<path d="%s" fill="none" stroke="%s" stroke-width="%s"/>'%(d,a['stroke'],num(float(a['stroke-width'].replace('px',''))*min(sx,sy)))))
  return out
def conv(svg):
  body=re.sub(r'^<svg[^>]*>','',svg); body=re.sub(r'</svg>$','',body)
  out=[]
  tok=re.compile(r'(<svg [^>]*role="img"[^>]*>.*?</svg>)|<g id="([^"]*)">|</g>|<text ([^>]*)>(.*?)</text>|<rect ([^>]*)/>|(<svg .*?</svg>)',re.S)
  for m in tok.finditer(body):
    if m.group(1): out+=flat_chart(m.group(1))
    elif m.group(2) is not None: out.append('g(%s)'%json.dumps(m.group(2)))
    elif m.group(0)=='</g>': out.append('e()')
    elif m.group(3) is not None:
      a=A(m.group(3)); w={'500':'s','600':'s','700':'b'}.get(a.get('font-weight',''),'')
      ls=a.get('letter-spacing',''); ls='' if ls in ('0','0.00') else ls
      an={'middle':'m','end':'e'}.get(a.get('text-anchor',''),'')
      out.append('t(%s,%s,%s,"%s","%s",%s,%s%s)'%(num(float(a['x'])),num(float(a['y'])),a['font-size'],a['fill'][1:],w,json.dumps(ls),json.dumps(m.group(4).replace('&amp;','&'),ensure_ascii=False),(',"%s"'%an) if an else ''))
    elif m.group(5) is not None:
      a=A(m.group(5))
      if a.get('fill')=='none': out.append('x(%s)'%json.dumps('<rect %s/>'%m.group(5))); continue
      op=a.get('fill-opacity','')
      out.append('r(%s,%s,%s,%s,"%s",%s,"%s"%s)'%(num(float(a['x'])),num(float(a['y'])),num(float(a['width'])),num(float(a['height'])),a['fill'][1:],a.get('rx','0'),a.get('stroke','')[1:],(','+op) if op and op!='1' else ''))
    else:
      v=re.sub(r' stroke-linecap="butt"| stroke-linejoin="miter"| aria-hidden="true"','',m.group(6)); out.append('x(%s)'%json.dumps(v,ensure_ascii=False))
  return ';'.join(out)
print(';'.join(conv(open(f).read()) for f in sys.argv[1:]))
