// Word list (common 5-letter English words)
var WORDS = "about,above,abuse,actor,acute,admit,adopt,adult,after,again,agent,agree,ahead,alarm,album,alert,alien,align,alive,alley,allow,alone,along,alter,among,angel,anger,angle,angry,anime,ankle,annex,antic,apart,apple,apply,arena,argue,arise,armor,array,arrow,aside,asset,atlas,avoid,awake,award,aware,badge,badly,basic,basin,basis,batch,beach,began,begin,being,below,bench,berry,birth,black,blade,blame,bland,blank,blast,blaze,bleed,blend,bless,blind,block,bloom,blown,blues,blunt,board,boast,bones,boost,booth,bound,brain,brand,brave,bread,break,breed,brick,bride,brief,bring,broad,broke,brown,brush,build,bunch,burst,buyer,cabin,cable,candy,cargo,carry,catch,cause,cease,chain,chair,champ,chaos,charm,chart,chase,cheap,check,cheek,cheer,chess,chest,chief,child,chill,china,chunk,civic,civil,claim,class,clean,clear,climb,cling,clock,clone,close,cloud,coach,coast,color,comet,coral,could,count,court,cover,crack,craft,crane,crash,crazy,cream,creek,crime,cross,crowd,crown,crude,crush,curve,cycle,daily,dance,dealt,death,debut,delay,depot,depth,derby,devil,diary,digit,donor,doubt,dough,draft,drain,drama,drank,drape,drawn,dread,dream,dress,dried,drift,drill,drink,drive,droit,drove,drunk,dryer,duchy,dying,eager,eagle,early,earth,eaten,eight,elder,elect,elite,embed,empty,enemy,enjoy,enter,equal,error,essay,event,every,exact,exert,exist,extra,fable,faint,fairy,faith,false,fault,feast,fence,ferry,fetch,fever,fiber,field,fifth,fifty,fight,final,first,fixed,flame,flash,flask,flesh,flick,fling,flint,float,flock,flood,floor,flora,flour,fluid,flush,flute,focal,focus,force,forge,forth,forum,found,frame,frank,fraud,fresh,front,frost,froze,fruit,fully,funds,fused,gauge,genre,giant,given,gland,glare,glass,gleam,glide,globe,gloom,glory,gloss,glove,going,grace,grade,grain,grand,grant,grape,graph,grasp,grass,grave,gravel,great,greed,green,greet,grief,grill,grind,groan,groom,gross,group,grove,grown,guard,guess,guest,guide,guild,guilt,guise,habit,happy,harsh,haste,haven,heart,heavy,hedge,hence,hobby,homer,horse,hotel,house,human,humor,hurry,image,imply,incur,index,indie,input,issue,ivory,jewel,joint,joker,judge,juice,known,label,labor,large,laser,later,laugh,layer,learn,lease,least,leave,legal,lemon,level,lever,light,limit,linen,liver,lobby,local,lodge,logic,login,loose,lover,lower,lucky,lunch,lungly,luxury,lying,magic,major,maker,manor,maple,march,marry,mason,match,mayor,media,mercy,merit,metal,meter,midst,might,minor,minus,mirth,model,money,month,moral,motor,mount,mouse,mouth,movie,music,naive,nerve,never,newly,niche,night,noble,noise,north,noted,novel,nurse,nylon,occur,ocean,offer,often,olive,onset,optic,orbit,order,organ,other,outer,oxide,ozone,paint,panel,panic,paper,party,paste,patch,pause,peace,pearl,penny,phase,phone,photo,piano,piece,pilot,pinch,pitch,pixel,place,plain,plane,plant,plate,plaza,plead,pluck,plumb,plume,plump,plunge,point,polar,pound,power,press,price,pride,prime,prince,print,prior,prize,probe,promo,prone,proof,proud,prove,psalm,pulse,pupil,purge,queen,query,quest,queue,quick,quiet,quota,quote,radar,radio,raise,rally,ranch,range,rapid,ratio,reach,react,ready,realm,rebel,refer,reign,relax,relay,renew,repay,reply,rider,rifle,right,rigid,risky,rival,river,roast,robot,rocky,rouge,rough,round,route,royal,rugby,ruler,rural,sadly,saint,salad,sauce,scale,scare,scene,scent,scope,score,scout,scrap,sense,serve,setup,seven,shade,shaft,shake,shall,shame,shape,share,shark,sharp,shave,shear,sheep,sheer,sheet,shelf,shell,shift,shine,shirt,shock,shoot,shore,short,shout,shove,shown,shrub,siege,sight,since,sixth,sixty,sized,skill,skull,slate,slave,sleek,sleep,slice,slide,slope,small,smart,smell,smile,smoke,snake,solar,solid,solve,sorry,sound,south,space,spare,spark,speak,speed,spend,spent,spice,spine,split,spoke,spoon,sport,spray,squad,stack,staff,stage,stain,stair,stake,stale,stall,stamp,stand,stare,stark,start,state,stays,steak,steal,steam,steel,steep,steer,stern,stick,stiff,still,stock,stoic,stoke,stole,stomp,stone,stood,stool,store,storm,story,stout,stove,strap,straw,stray,strip,stuck,study,stuff,stump,stung,stunt,style,sugar,suite,sunny,super,surge,swamp,swear,sweat,sweep,sweet,swept,swift,swing,sword,swore,sworn,swung,table,taken,taste,teach,teens,tempo,tense,tenth,terms,theft,theme,there,thick,thief,thing,think,third,thorn,those,three,threw,throw,thumb,tiger,tight,tired,title,toast,today,token,total,touch,tough,towel,tower,toxic,trace,track,trail,train,trait,trash,treat,trend,trial,tribe,trick,tried,troop,trout,truck,truly,trunk,trust,truth,tumor,twice,twist,tying,ultra,uncle,under,union,unite,unity,until,upper,upset,urban,usage,usual,utter,vague,valid,value,valve,vault,venue,verse,video,vigor,viola,vinyl,viral,virus,visit,visor,vista,vital,vivid,vocal,vodka,voice,voter,vowel,vulgar,wagon,waist,waste,watch,water,weary,weave,wedge,weigh,weird,wheat,wheel,where,which,while,white,whole,whose,widen,width,witch,woman,world,worry,worse,worst,worth,would,wound,wreak,wrist,write,wrong,wrote,yacht,yearn,yield,young,yours,youth,zebra".split(",");

var target, guesses, currentRow, currentCol, gameOver, won;
var keyStates = {};
var stats;

function init() {
  stats = JSON.parse(localStorage.getItem('wordle_stats') || '{"played":0,"won":0,"streak":0,"maxStreak":0,"dist":[0,0,0,0,0,0]}');
  newGame();
}

function getDailyWord() {
  var today = new Date();
  var dayNum = Math.floor(today.getTime() / 86400000);
  return WORDS[dayNum % WORDS.length].toUpperCase();
}

function newGame() {
  target = getDailyWord();
  guesses = [];
  currentRow = 0;
  currentCol = 0;
  gameOver = false;
  won = false;
  keyStates = {};
  renderBoard();
  renderKeyboard();
  document.getElementById('message').textContent = '';
}

function renderBoard() {
  var board = document.getElementById('board');
  board.innerHTML = Array.from({length: 6}, (_, r) => {
    var tiles = Array.from({length: 5}, (_, c) => {
      var letter = guesses[r] ? guesses[r][c] || '' : '';
      var state = guesses[r] ? getTileState(r, c) : '';
      return `<div class="tile ${state} ${letter ? 'filled' : ''}">${letter}</div>`;
    }).join('');
    return `<div class="row">${tiles}</div>`;
  }).join('');
}

function getTileState(row, col) {
  var guess = guesses[row];
  if (!guess) return '';
  var letter = guess[col];
  if (letter === target[col]) return 'correct';
  if (target.includes(letter)) return 'present';
  return 'absent';
}

function renderKeyboard() {
  var rows = ['qwertyuiop','asdfghjkl','zxcvbnm'];
  rows.forEach(row => {
    row.split('').forEach(letter => {
      var key = document.querySelector(`.key[onclick="pressKey('${letter}')"]`);
      if (key) {
        key.className = 'key';
        if (keyStates[letter]) key.classList.add(keyStates[letter]);
      }
    });
  });
}

function pressKey(letter) {
  if (gameOver || currentCol >= 5) return;
  var tiles = document.querySelectorAll('.row')[currentRow].querySelectorAll('.tile');
  tiles[currentCol].textContent = letter.toUpperCase();
  tiles[currentCol].classList.add('filled');
  currentCol++;
  // Pop animation
  tiles[currentCol - 1].classList.add('pop');
  setTimeout(() => tiles[currentCol - 1].classList.remove('pop'), 100);
}

function deleteKey() {
  if (gameOver || currentCol <= 0) return;
  currentCol--;
  var tiles = document.querySelectorAll('.row')[currentRow].querySelectorAll('.tile');
  tiles[currentCol].textContent = '';
  tiles[currentCol].classList.remove('filled');
}

function submitGuess() {
  if (gameOver) return;
  if (currentCol < 5) {
    shakeRow();
    showMessage('字母不够');
    return;
  }
  var tiles = document.querySelectorAll('.row')[currentRow].querySelectorAll('.tile');
  var guess = Array.from(tiles).map(t => t.textContent).join('');

  // Check if it's a valid word (simple check: 5 letters)
  if (!WORDS.includes(guess.toLowerCase())) {
    shakeRow();
    showMessage('不在词库中');
    return;
  }

  guesses.push(guess);

  // Reveal tiles with animation
  var targetArr = target.split('');
  var guessArr = guess.split('');
  var result = Array(5).fill('absent');

  // First pass: correct
  for (var i = 0; i < 5; i++) {
    if (guessArr[i] === targetArr[i]) { result[i] = 'correct'; targetArr[i] = null; }
  }
  // Second pass: present
  for (var i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue;
    var idx = targetArr.indexOf(guessArr[i]);
    if (idx !== -1) { result[i] = 'present'; targetArr[idx] = null; }
  }

  // Update key states
  guessArr.forEach((letter, i) => {
    var current = keyStates[letter.toLowerCase()];
    if (result[i] === 'correct') keyStates[letter.toLowerCase()] = 'correct';
    else if (result[i] === 'present' && current !== 'correct') keyStates[letter.toLowerCase()] = 'present';
    else if (!current) keyStates[letter.toLowerCase()] = 'absent';
  });

  // Animate reveal
  tiles.forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('reveal', result[i]);
    }, i * 100);
  });

  setTimeout(() => {
    renderKeyboard();

    if (guess === target) {
      won = true;
      gameOver = true;
      var messages = ['Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'];
      showMessage(messages[currentRow] || 'Nice!');
      saveStats(true);
      setTimeout(() => showOverlay(true), 1200);
    } else if (currentRow >= 5) {
      gameOver = true;
      showMessage(target);
      saveStats(false);
      setTimeout(() => showOverlay(false), 1200);
    }
    currentRow++;
    currentCol = 0;
  }, 550);
}

function shakeRow() {
  var row = document.querySelectorAll('.row')[currentRow];
  row.classList.add('shake');
  setTimeout(() => row.classList.remove('shake'), 400);
}

function showMessage(msg) {
  var el = document.getElementById('message');
  el.textContent = msg;
  setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 2000);
}

function saveStats(win) {
  stats.played++;
  if (win) {
    stats.won++;
    stats.streak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    stats.dist[currentRow - 1]++;
  } else {
    stats.streak = 0;
  }
  localStorage.setItem('wordle_stats', JSON.stringify(stats));
}

function showOverlay(win) {
  var el = document.getElementById('overlay');
  document.getElementById('overlayTitle').textContent = win ? '恭喜!' : '游戏结束';
  document.getElementById('overlayMsg').textContent = win ? `你用了 ${currentRow} 次猜对` : `答案是: ${target}`;
  document.getElementById('overlayStats').innerHTML =
    `<div class="stat"><div class="num">${stats.played}</div><div class="lbl">场次</div></div>` +
    `<div class="stat"><div class="num">${stats.played ? Math.round(stats.won/stats.played*100) : 0}%</div><div class="lbl">胜率</div></div>` +
    `<div class="stat"><div class="num">${stats.streak}</div><div class="lbl">连胜</div></div>` +
    `<div class="stat"><div class="num">${stats.maxStreak}</div><div class="lbl">最大连胜</div></div>`;
  var maxDist = Math.max(...stats.dist, 1);
  document.getElementById('overlayDist').innerHTML = stats.dist.map((n, i) =>
    `<div class="dist-bar"><span class="label">${i+1}</span><div class="bar" style="width:${Math.max(n/maxDist*100, 8)}%">${n}</div></div>`
  ).join('');
  el.style.display = 'flex';
}

function showStats() { showOverlay(won); }
function closeOverlay() { document.getElementById('overlay').style.display = 'none'; }

function shareResult() {
  var squares = guesses.map((guess, row) => {
    if (row >= (gameOver && won ? currentRow : currentRow)) return '';
    return guess.split('').map((letter, col) => {
      var state = getTileState(row, col);
      return state === 'correct' ? '🟩' : state === 'present' ? '🟨' : '⬛';
    }).join('');
  }).filter(Boolean).join('\n');
  var text = `Wordle ${won ? currentRow : 'X'}/6\n\n${squares}`;
  navigator.clipboard.writeText(text).then(() => showMessage('已复制到剪贴板'));
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Enter') { e.preventDefault(); submitGuess(); }
  else if (e.key === 'Backspace') { e.preventDefault(); deleteKey(); }
  else if (/^[a-zA-Z]$/.test(e.key)) { pressKey(e.key.toLowerCase()); }
});

init();