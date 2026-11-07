import pathlib,sys
S=pathlib.Path(__file__).parent/'src'; new=pathlib.Path(sys.argv[1]).read_text(encoding='utf8')
a,b=(S/'shell.html').read_text(encoding='utf8').split('/*CSS*/'); b1,c=b.split('/*JS*/')
assert new.startswith(a) and new.endswith(c), "shell.html изменился"
i=len(a); j=new.index(b1,i); css=new[i:j]; js=new[j+len(b1):len(new)-len(c)]
files=["i18n.js","taxonomy.js","brandlogos.js","icons.js","vision.js","mock.js","app.js","admin.js"]
pos=[];st=0
for f in files:
    t=(S/f).read_text(encoding='utf8'); hd="\n".join(t.split("\n")[:2]) if f=="app.js" else t.split("\n")[0]
    p=js.index(hd,st); pos.append(p); st=p+1
for n,f in enumerate(files):
    (S/f).write_text(js[pos[n]:(pos[n+1]-1 if n+1<len(files) else len(js))],encoding='utf8')
(S/'style.css').write_text(css,encoding='utf8')
