#!/bin/bash
# Забрать последнюю версию с GitHub (если обновляли из другого чата/телефона) и восстановить src/ из index.html
set -e
cd /home/claude/bazar; R=/home/claude/tm-bazar.github.io
git -C $R fetch -q origin main && git -C $R reset -q --hard origin/main
if cmp -s site/index.html $R/index.html; then echo "Уже последняя версия: $(cat $R/version.json)"; exit 0; fi
python3 split.py $R/index.html
find site -mindepth 1 -maxdepth 1 -exec rm -rf {} +; cp -r $R/. site/; rm -rf site/.git
python3 build.py >/dev/null; cmp site/index.html $R/index.html && echo "Синхронизировано: $(cat site/version.json)"
