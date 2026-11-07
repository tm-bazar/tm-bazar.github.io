import pathlib
S=pathlib.Path(__file__).parent/"src"
html=(S/"shell.html").read_text(encoding="utf-8")
js="\n".join((S/f).read_text(encoding="utf-8") for f in ["i18n.js","taxonomy.js","brandlogos.js","icons.js","vision.js","mock.js","app.js","admin.js"])
html=html.replace("/*CSS*/",(S/"style.css").read_text(encoding="utf-8")).replace("/*JS*/",js)
(S.parent/"site"/"index.html").write_text(html,encoding="utf-8")
print("built",len(html))
