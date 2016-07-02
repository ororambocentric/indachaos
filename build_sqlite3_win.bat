@echo off
cd /d %~dp0
cd /d node_modules\sqlite3
call npm install
call npm run prepublish
call node-gyp configure --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.2-win32-x64
call node-gyp rebuild --target=1.2.5 --arch=x64 --target_platform=win32 --dist-url=https://atom.io/download/atom-shell --module_name=node_sqlite3 --module_path=../lib/binding/electron-v1.2-win32-x64
cd /d %~dp0
exit /B 0