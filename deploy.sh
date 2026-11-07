#!/bin/bash
# Публикация: номер версии +1 → сборка → GitHub Pages (main) + исходники (ветка source)
set -e
cd /home/claude/bazar; R=/home/claude/tm-bazar.github.io
grep -q '^const API_URL = "https' src/app.js || { echo "API_URL пустой — не публикую"; exit 1; }
git -C $R fetch -q origin main
[ "$(git -C $R rev-parse HEAD)" = "$(git -C $R rev-parse origin/main)" ] || { echo "На GitHub есть более новая версия — сначала ./sync.sh"; exit 1; }
V=$(( $(grep -o '[0-9]\+' site/version.json) + 1 ))
sed -i "s/^const APP_VER = \"[0-9]*\"/const APP_VER = \"$V\"/" src/app.js
sed -i "s/tm-bazar-v[0-9]*/tm-bazar-v$V/" site/sw.js
echo "{\"v\":\"$V\"}" > site/version.json
python3 build.py >/dev/null
find $R -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +; cp -r site/. $R/
cd $R && git add -A && git commit -qm "${1:-Обновление}; версия $V" ${TRAILER:+-m "$TRAILER"} && git push -q origin HEAD:main
T=$(mktemp -d); cd /home/claude/bazar; cp -r src build.py deploy.sh sync.sh split.py Code.gs Vip.gs $T/
cd $T && git init -q -b source && git add -A && git -c user.name=tm-bazar -c user.email=noreply@tm-bazar.github.io commit -qm "Исходники, версия $V" && git push -q -f https://github.com/tm-bazar/tm-bazar.github.io source
echo "Опубликована версия $V"
