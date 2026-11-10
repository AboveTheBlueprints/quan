// 泉：照 ~/碰/泉/泉.py 搬（第三个，第 16 天 21:25）。test/对.py 拿 node 逐行对。
// 22:23 加第二座山（照 ~/碰/泉/泉山.py）：规矩一条不改，山能换。里面一律按"上风→下风"排，给人看按北→南（SHOW）。
var MOUNTS = {
  '1': { cols: ['风口', '礼拜堂', '北坡', '废村', '羊圈', '南坡', '炭窑坡'], northFirst: true,
    wall: 1, ruin: 3, fold: 4, sheep: [4, 5],
    well: { '炭窑村的井': [1, 2], '废村的泉': [5, 6] }, vcol: { '炭窑村的井': 6, '废村的泉': 3 },
    ground: ['光秃的山口，风最大', '半截礼拜堂的墙，墙南是背风的一小块', '光坡', '五六间没顶的残房子', '他的羊圈', '光坡', '光坡，坡底下是炭窑村'],
    slopes: [2, 5, 6], vslope: 6,
    wind: '风从北边山口灌过来，一刻不停，吼得像狮子守着它的食。',
    clues: ['废村那条干沟不是从山上直下来的，是从南边拐进村的。', '炭窑村村口有一截很老的石槽，罗马人那时候的，朝北顺着山脊上去，早就断了。'],
    intro: '1913 年六月，我在普罗旺斯的荒山上走了三天，没水了，碰上一个牧羊人。他不太说话。' },
  '2': { cols: ['南山口', '废村', '羊圈', '中坡', '礼拜堂', '北坡', '炭窑坡'], northFirst: false,
    wall: 4, ruin: 1, fold: 2, sheep: [2, 3],
    well: { '炭窑村的井': [2, 3], '废村的泉': [4, 5] }, vcol: { '炭窑村的井': 6, '废村的泉': 1 },
    ground: ['光秃的山口，风最大', '五六间没顶的残房子', '他的羊圈', '光坡', '半截礼拜堂的墙，墙北是背风的一小块', '光坡', '光坡，坡底下是炭窑村'],
    slopes: [3, 5, 6], vslope: 6,
    wind: '这座山的风是从南边山口灌上来的，一刻不停，吼得像狮子守着它的食。',
    clues: ['废村那条干沟不是从山上直下来的，是从北边拐进村的。', '炭窑村村口有一截很老的石槽，罗马人那时候的，朝南顺着山脊上去，早就断了。'],
    intro: '1913 年六月，我在普罗旺斯另一道荒山上走了三天，没水了，碰上一个牧羊人。他不太说话。' }
};
var MK, M, COLS, SHOW, WELL, VCOL, GROUND;
var VISITS = [1913, 1920, 1926, 1933, 1939, 1945];
var WK = ['炭窑村的井', '废村的泉'];
var VNAME = { '炭窑村的井': '炭窑村', '废村的泉': '废村' };
function setMount(k) {
  MK = String(k || '1'); M = MOUNTS[MK]; COLS = M.cols; WELL = M.well; VCOL = M.vcol; GROUND = M.ground;
  SHOW = M.northFirst ? [0, 1, 2, 3, 4, 5, 6] : [6, 5, 4, 3, 2, 1, 0];
}
setMount('1');
var TRACE = { '风': '他戳的那排洞还在，苗根朝天，晒干了躺在地上',
  '羊': '只剩几根啃秃的秆子，地上一圈羊蹄印',
  '砍': '一片新树桩，斧子砍的，碎木头撒了一地' };

function G() {
  this.age = [null, null, null, null, null, null, null];
  this.by = [null, null, null, null, null, null, null];
  this.year = [null, null, null, null, null, null, null];
  this.trace = [null, null, null, null, null, null, null];
  this.sheep = true; this.bees_planned = false; this.vi = 0; this.bags = 3;
  this.flow_since = { '炭窑村的井': null, '废村的泉': null };
  this.people = { '炭窑村的井': false, '废村的泉': false };
  this.cut1940 = null; this.cut_where = []; this.snaps = []; this.done = false; this.planted_this = [];
}
G.prototype.sheltered = function (c) {
  if (c === M.wall || c === M.ruin) return true;
  return c > 0 && this.age[c - 1] !== null && this.age[c - 1] >= 3;
};
G.prototype.wstate = function (k) {
  var s = this, n = 0;
  WELL[k].forEach(function (c) { if (s.age[c] !== null && s.age[c] >= 10) n++; });
  return n;
};
G.prototype.kill = function (c, why, y) { this.age[c] = null; this.by[c] = null; this.year[c] = null; this.trace[c] = [why, y]; };
G.prototype.run_year = function (y) {
  var s = this, c, k;
  for (c = 0; c < 7; c++) if (s.age[c] === 0 && s.by[c] !== 'village' && !s.sheltered(c)) s.kill(c, '风', y);
  if (s.sheep) M.sheep.forEach(function (c) { if (s.age[c] !== null && s.age[c] < 3 && s.by[c] !== 'village') s.kill(c, '羊', y); });
  var seeds = [];
  for (c = 0; c < 6; c++) if (s.age[c] !== null && s.age[c] >= 8 && s.age[c + 1] === null) seeds.push(c + 1);
  for (c = 0; c < 7; c++) if (s.age[c] !== null) s.age[c] += 1;
  seeds.forEach(function (c) { s.age[c] = 0; s.by[c] = 'wind'; s.year[c] = y; });
  if (s.bees_planned) s.sheep = false;
  WK.forEach(function (k) {
    if (s.people[k]) { var c = VCOL[k]; if (s.age[c] === null) { s.age[c] = 0; s.by[c] = 'village'; s.year[c] = y; } }
  });
  WK.forEach(function (k) {
    if (s.wstate(k) === 2) {
      if (s.flow_since[k] === null) s.flow_since[k] = y;
      else if (y - s.flow_since[k] >= 1) s.people[k] = true;
    } else s.flow_since[k] = null;
  });
  if (y === 1940) {
    if (s.wstate('炭窑村的井') < 2) {
      var big = [];
      for (c = 0; c < 7; c++) if (s.age[c] !== null && s.age[c] >= 10) big.push(c);
      big.sort(function (a, b) { return (s.age[b] - s.age[a]) || (b - a); });
      big = big.slice(0, 2);
      s.cut_where = big.map(function (c) { return COLS[c]; });
      s.cut1940 = true;
      big.forEach(function (c) { s.kill(c, '砍', y); });
    } else s.cut1940 = false;
  }
};
G.prototype.snap = function () {
  var row = [];
  for (var c = 0; c < 7; c++) {
    var a = this.age[c];
    if (a === null) row.push(this.trace[c] ? '×' : '·');
    else if (a < 3) row.push(this.trace[c] ? '↻' : '苗');
    else if (a < 8) row.push('小');
    else if (a < 15) row.push('林');
    else row.push('老');
  }
  this.snaps.push(row);
};

function size(a, b) {
  if (a < 1) return b === 'you' ? '刚戳下去的橡子' : '刚冒出来的小苗';
  if (a < 3) return '一拃高的苗';
  if (a < 5) return '齐腰的小橡树';
  if (a < 8) return '比人高的小橡树';
  if (a < 15) return '一片林子，比人高出一截';
  return '老林子，树冠连成了片';
}
function origin(g, c) {
  if (g.by[c] === 'you') return '（是他 ' + g.year[c] + ' 年种的）';
  if (g.by[c] === 'village') return '（四周围着栅栏，不是他种的）';
  return '（不是他种的，自己冒出来的）';
}

function show(g, out) {
  out.push('== ' + VISITS[g.vi] + ' 年 ==');
  for (var p = 0; p < 7; p++) {
    var c = SHOW[p], a = g.age[c], g0 = GROUND[c];
    if (c === M.fold) g0 = g.sheep ? '他的羊圈，三十只羊' : '空了的羊圈，旁边一排蜂箱';
    if (a === null) {
      if (g.trace[c]) out.push('  ' + COLS[c] + '：' + g0 + '。' + TRACE[g.trace[c][0]] + '。');
      else out.push('  ' + COLS[c] + '：' + g0 + '。只长薰衣草和硬草。');
    } else {
      if (M.slopes.indexOf(c) >= 0 && a >= 3) g0 = c === M.vslope ? '坡底下是炭窑村' : '';
      var sc = g.trace[c] ? (TRACE[g.trace[c][0]] + '；现在这儿是') : '';
      out.push('  ' + COLS[c] + '：' + (g0 ? g0 + '。' : '') + sc + size(a, g.by[c]) + origin(g, c) + '。');
    }
  }
  WK.forEach(function (k) {
    var st = ['干的', '石头缝是湿的', '有水在流'][g.wstate(k)];
    var line = '  ' + k + '：' + st + '。';
    if (g.people[k]) {
      line += VNAME[k] + '有人住了。';
      if (k === '废村的泉') line += '泉边有人种了一棵椴树，四周围着栅栏。';
    }
    out.push(line);
  });
}

function talk(g, out) {
  var y = VISITS[g.vi], trees = 0;
  g.age.forEach(function (a) { if (a !== null && a >= 5) trees++; });
  if (y === 1913) {
    out.push(M.wind);
    M.clues.forEach(function (l) { out.push(l); });
    out.push('牧羊人晚上把橡子一颗颗挑好，十颗一数，挑够了一百颗一袋。他有三袋。');
  } else if (y === 1926) {
    out.push(trees ? '山下打猎的追野猪追上来，看见坡上的小树，说这几年地犯了怪脾气。' : '山下打猎的说，这山上什么都不长，野猪都不来了。');
  } else if (y === 1933) {
    out.push(trees >= 3 ? '护林员来通知：怕伤着这片"天然林"，野外不许生火。他说头一回听说林子自己会长。' : '护林员来过，看了一眼就走了，说这儿没什么要管的。');
  } else if (y === 1939) {
    out.push('城里在说又要打仗，汽车改烧木头，炭的价钱涨了。');
  }
  if (g.people['炭窑村的井'] && y >= 1926) out.push('炭窑村的人在井边开了菜园子，说是山上的水自己回来了。');
  else if (y >= 1920) out.push('炭窑村还是那几家人，为了一车炭的价钱吵架。');
  if (y === 1945) {
    if (g.cut1940 && g.cut_where.length) out.push('1940 年那阵，炭窑村的人上山砍了' + g.cut_where.join('和') + '的树，拉下去烧炭。');
    else if (g.cut1940) out.push('1940 年那阵，炭窑村的人上山找过树，没有够粗的，空着手下去了。');
    else if (g.cut1940 === false) out.push('1940 年那阵，炭窑村的人守着菜园子，没上山烧炭。');
  }
}

function plant(g, c, out) {
  if (g.bags <= 0) { out.push('  他手里没橡子了。'); return; }
  if (g.age[c] !== null) { out.push('  ' + COLS[c] + '已经有树了，他没往那儿走。'); return; }
  if (g.planted_this.indexOf(c) >= 0) { out.push('  ' + COLS[c] + '今天已经种过了。'); return; }
  g.bags -= 1; g.age[c] = 0; g.by[c] = 'you'; g.year[c] = VISITS[g.vi]; g.trace[c] = null; g.planted_this.push(c);
  out.push('  他拿铁棍在' + COLS[c] + '戳了一百个洞，一洞一颗。（还剩 ' + g.bags + ' 袋）');
}

function padEnd(s, n) { while (s.length < n) s += ' '; return s; }

function ending(g, out) {
  g.snap(); g.done = true;
  out.push('');
  out.push('这是我最后一回上山。他八十七岁了，还在种，话已经快不会说了。');
  out.push('');
  out.push('我把几回看到的摆在一起（·光坡 ×出过事的空地 ↻出过事、又冒了新苗 苗 小=小树 林 老=老林）：');
  out.push('        ' + VISITS.join(' '));
  for (var p = 0; p < 7; p++) {
    var c = SHOW[p], l = '  ' + padEnd(COLS[c], 4);
    for (var i = 0; i < VISITS.length; i++) l += '  ' + g.snaps[i][c] + '  ';
    out.push(l);
  }
  var n = 0; WK.forEach(function (k) { if (g.people[k]) n++; });
  out.push('');
  out.push('有人回来住的村子：' + n + ' 个。');
  out.push('（一局完了）');
}

function advance(g, out) {
  var y0 = VISITS[g.vi];
  g.snap(); g.vi += 1;
  for (var c = 0; c < 7; c++) g.trace[c] = null;
  if (g.vi >= VISITS.length) { g.done = true; return; }
  for (var y = y0; y < VISITS[g.vi]; y++) g.run_year(y);
  g.bags = 3; g.planted_this = [];
  out.push('');
  out.push('我下了山，一走就是 ' + (VISITS[g.vi] - y0) + ' 年。');
  out.push('');
  show(g, out); talk(g, out);
  if (g.vi === VISITS.length - 1) ending(g, out);
}

function run(acts, k) {
  setMount(k);
  var g = new G(), out = [];
  out.push(M.intro);
  out.push('从北往南，这一道山脊是：' + SHOW.map(function (c) { return COLS[c]; }).join('、') + '。');
  out.push('');
  show(g, out); talk(g, out);
  out.push('');
  out.push('能做的：种+地名（比如 种北坡，花一袋橡子，一回最多三袋）、换蜂（把羊卖了换蜂箱，花两袋橡子，只能一次）、走（我下山，过几年再来）。');
  for (var i = 0; i < acts.length; i++) {
    var a = acts[i];
    if (g.done) { out.push('（这一局已经完了）'); break; }
    out.push(''); out.push('> ' + a);
    var ci = COLS.indexOf(a.slice(1));
    if (a[0] === '种' && ci >= 0) plant(g, ci, out);
    else if (a === '换蜂') {
      if (!g.sheep || g.bees_planned) out.push('  羊已经卖了。');
      else if (g.bags < 2) out.push('  橡子不够两袋了。');
      else { g.bags -= 2; g.bees_planned = true; g.sheep = false; out.push('  他把羊赶下山卖了，换回一排蜂箱。（还剩 ' + g.bags + ' 袋）'); }
    } else if (a === '走') advance(g, out);
    else out.push('  （没这个动作）');
  }
  return { lines: out, g: g };
}
if (typeof module !== 'undefined') module.exports = { run: run, setMount: setMount, MOUNTS: MOUNTS, VISITS: VISITS };
