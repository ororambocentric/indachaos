Indachaos
---------

Supersonic notes manager

Requirements
============

sudo apt-get install sqlcipher

Setup
=====
(instructions for Linux x64)

1. Install node modules
- npm install

2. Install sqlite3 with sqlcipher
- export LDFLAGS="-L/usr/local/lib"
- export CPPFLAGS="-I/usr/local/include -I/usr/local/include/sqlcipher"
- export CXXFLAGS="$CPPFLAGS"
- npm install sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite=/usr/local --verbose

3. Build sqlite3
- npm run build_linux_64

Run
===

npm start

