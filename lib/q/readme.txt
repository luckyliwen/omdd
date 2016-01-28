# Bluebird library wrapped with bluebird-q shim
# This library was packaged using following steps:
# Prerequisites: git, node.js, browserify.js

# 1) Clone bluebird and bluebird-q
git clone https://github.com/petkaantonov/bluebird.git
git clone https://github.com/petkaantonov/bluebird-q.git

# 2) Disable all optional features for bluebird build
#    In package.json change line starting with "prepublish": to
#    "prepublish": "node tools/build.js node tools/build.js --no-debug --release --browser --features=\"core call_get map settle timers\"",
cd bluebird
sed -i -e 's/"prepublish":.*$/"prepublish": "node tools\/build.js node tools\/build.js --no-debug --release --browser --features=\\\"core call_get map settle timers\\\"",/g' package.json

# 3) Apply all necessary patches to bluebird (necessary only for pending opensource contributions)
git remote add fork https://github.com/lextiz/bluebird
git fetch fork
# TODO: Remove these cherry picks when PRs are accepted
# Cherry-pick this PR: https://github.com/petkaantonov/bluebird/pull/907
git merge fork/monitor

# 4) Install bluebird dependencies
npm install

# 5) Apply all necessary patches to bluebird-q (necessary only for pending opensource contributions)
cd ../bluebird-q
git remote add fork https://github.com/lextiz/bluebird-q
git fetch fork
# TODO: Remove these cherry picks when PRs are accepted
# Cherry-pick this PR: https://github.com/petkaantonov/bluebird-q/pull/4
git cherry-pick f92ff1690359188e294b623e590189d5440667aa 
# Cherry-pick this PR: https://github.com/petkaantonov/bluebird-q/pull/6
git cherry-pick 9cedbe4bff5c473e4dd05b41f5dd51e6484672a6
# Cherry-pick this PR: https://github.com/petkaantonov/bluebird-q/pull/7
git cherry-pick 26466a5bcdab433281406ba638af6c2ae3b116cc
# Cherry-pick this PR: https://github.com/petkaantonov/bluebird-q/pull/8
git cherry-pick 2f896cf5a72a5b00dbf3f4737f2780bd81bf84fd
git cherry-pick 4e3bb4cf2ad23540beaed09d7be679f3a3649a78

# 6) Point from bluebird-q to cusom bluebird
#    In package.json change dependency to bluebird from version (like "^3.0.5") to "file:../bluebird"
sed -i -e 's/"bluebird":.*$/"bluebird": "file:..\/bluebird"/g' package.json

# 7) Package bluebird-q and bluebird to file q.js 
npm install
browserify index.js -o q.js -s Q --dg=false
cp q.js ../updated.q.js

# 8) Cleanup
cd ..
rm -rf bluebird bluebird-q