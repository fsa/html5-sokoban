'use strict'

let level, hash=location.hash.substring(1);
if(hash>0 && hash<=60) {
    level=hash;
} else {
    level=1;
}
document.title='Sokoban, уровень '+level;

const blockSize=32;
const maxWidth=28;
const maxHeight=20

const spriteSize=64;

let game_map=maps[level-1];

const div = document.getElementById('game');
const canvas = document.createElement("canvas");
const ctx = canvas.getContext('2d');
div.appendChild(canvas);

canvas.width = game_map[0].length*blockSize;
canvas.height = game_map.length*blockSize;
//cswwanvas.style.display = 'block';
canvas.style.maxWidth = '100vws';
canvas.style.maxHeight = '100vh';

const sprites = new Image();
sprites.src = 'img/sokoban_tilesheet.png';

let player_x, player_y;
let player_dir='d';
let player_move=0;

addEventListener('load', drawGame);
// Управление с клавиатуры
addEventListener('keydown', movePlayer);
function movePlayer(event) {
    switch(event.keyCode) {
        case 37:
            movePlayerLeft();
            break;
        case 38:
            movePlayerUp();
            break;
        case 39:
            movePlayerRight();
            break;
        case 40:
            movePlayerDown();
            break;
    }
}

// Управление свайпами
const sensitivity = 20;
let touchStartPos, touchPosition;
addEventListener("touchstart", touchStart);
addEventListener("touchmove", touchMove);
addEventListener("touchend", touchEnd);

function touchStart(e){
    touchStartPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    touchPosition = { x: touchStartPos.x, y: touchStartPos.y };
}

function touchMove(e){
    touchPosition = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
}

function touchEnd(e, color){
    CheckAction();
    touchStartPos = null;
    touchPosition = null;
}

function CheckAction() {
    var d = {
        x: touchStartPos.x - touchPosition.x,
        y: touchStartPos.y - touchPosition.y
    };

    if(Math.abs(d.x) > Math.abs(d.y)) {
        if(Math.abs(d.x) > sensitivity) {
            if(d.x > 0) {
                movePlayerLeft();
            } else {
                movePlayerRight();
            }
        }
    } else {
        if(Math.abs(d.y) > sensitivity){
            if(d.y > 0) {
                movePlayerUp();
            } else {
                movePlayerDown();
            }
        }
    }
}

// Основной код игры
function drawGame() {
    let boxes=0;
    for(let y=0;y<game_map.length;y++) {
        for(let x=0;x<game_map[y].length;x++) {
            let sym=game_map[y][x];
            if(sym=='@') {
                player_x=x;
                player_y=y;
            }
            drawBlock(sym, x, y);
            if(sym=='*') {
                boxes++;
            }
        }
    }
    if(boxes>0) {
        document.getElementById('result').innerHTML='Нужно передвинуть ящиков на своё место: ' + boxes + ' шт.';
    } else {
        document.getElementById('result').innerHTML='Вы победили! <a href="#'+(Number.parseInt(level)+1)+'">Следующий уровень</a>';
    }
    return boxes;
}

function drawBlock(block, x, y) {
    let coord;
    ctx.clearRect(x*blockSize, y*blockSize, blockSize, blockSize);
    switch (block) {
        case 'X':
            coord = {x: 512, y: 384};
            break;
        case '*':
            coord = {x: 64, y: 0};
            break;
        case '/':
            coord = {x: 128, y: 0};
            break;
        case '@':
        case '+':
            coord = getPlayer();
            break;
        case '.':
            coord = {x: 768, y: 64};
            break;
        default:
            return;
    }
    ctx.drawImage(sprites, coord.x, coord.y, spriteSize, spriteSize, x*blockSize, y*blockSize, blockSize, blockSize);
}

function getPlayer() {
    switch (player_dir) {
        case 'd':
            return {x: 0+player_move*spriteSize, y: 256};
        case 'u':
            return {x: 192+player_move*spriteSize, y: 256};
        case 'r':
            return {x: 0+player_move*spriteSize, y: 384};
        case 'l':
            return {x: 192+player_move*spriteSize, y: 384};
    }
}

function moveBlockLeft(x, y) {
    if(game_map[y][x-1]!=' ' && game_map[y][x-1]!='.') {
        return false;
    }
    let new_block, old_block;
    switch(game_map[y][x]) {
        case '@':
            new_block=game_map[y][x-1]=='.'?'+':'@';
            old_block=' ';
            break;
        case '+':
            new_block=game_map[y][x-1]=='.'?'+':'@';
            old_block='.';
            break;
        case '*':
            new_block=game_map[y][x-1]=='.'?'/':'*';
            old_block=' ';
            break;
        case '/':
            new_block=game_map[y][x-1]=='.'?'/':'*';
            old_block='.';
            break;
        default:
            return false;
    }
    let row=game_map[y];
    game_map[y]=row.slice(0, x-1)+new_block+old_block+row.slice(x+1);
    return true;
}

function moveBlockRight(x, y) {
    if(game_map[y][x+1]!=' ' && game_map[y][x+1]!='.') {
        return false;
    }
    let new_block, old_block;
    switch(game_map[y][x]) {
        case '@':
            new_block=game_map[y][x+1]=='.'?'+':'@';
            old_block=' ';
            break;
        case '+':
            new_block=game_map[y][x+1]=='.'?'+':'@';
            old_block='.';
            break;
        case '*':
            new_block=game_map[y][x+1]=='.'?'/':'*';
            old_block=' ';
            break;
        case '/':
            new_block=game_map[y][x+1]=='.'?'/':'*';
            old_block='.';
            break;
        default:
            return false;
    }
    let row=game_map[y];
    game_map[y]=row.slice(0, x)+old_block+new_block+row.slice(x+2);
    return true;
}

function moveBlockUp(x, y) {
    if(game_map[y-1][x]!=' ' && game_map[y-1][x]!='.') {
        return false;
    }
    let new_block, old_block;
    switch(game_map[y][x]) {
        case '@':
            new_block=game_map[y-1][x]=='.'?'+':'@';
            old_block=' ';
            break;
        case '+':
            new_block=game_map[y-1][x]=='.'?'+':'@';
            old_block='.';
            break;
        case '*':
            new_block=game_map[y-1][x]=='.'?'/':'*';
            old_block=' ';
            break;
        case '/':
            new_block=game_map[y-1][x]=='.'?'/':'*';
            old_block='.';
            break;
        default:
            return false;
    }
    let row_old=game_map[y];
    let row_new=game_map[y-1];
    game_map[y]=row_old.slice(0, x)+old_block+row_old.slice(x+1);
    game_map[y-1]=row_new.slice(0, x)+new_block+row_new.slice(x+1);
    return true;
}

function moveBlockDown(x, y) {
    if(game_map[y+1][x]!=' ' && game_map[y+1][x]!='.') {
        return false;
    }
    let new_block, old_block;
    switch(game_map[y][x]) {
        case '@':
            new_block=game_map[y+1][x]=='.'?'+':'@';
            old_block=' ';
            break;
        case '+':
            new_block=game_map[y+1][x]=='.'?'+':'@';
            old_block='.';
            break;
        case '*':
            new_block=game_map[y+1][x]=='.'?'/':'*';
            old_block=' ';
            break;
        case '/':
            new_block=game_map[y+1][x]=='.'?'/':'*';
            old_block='.';
            break;
        default:
            return false;
    }
    let row_old=game_map[y];
    let row_new=game_map[y+1];
    game_map[y]=row_old.slice(0, x)+old_block+row_old.slice(x+1);
    game_map[y+1]=row_new.slice(0, x)+new_block+row_new.slice(x+1);
    return true;
}

function isBox(x,y) {
    return game_map[y][x]=='*' || game_map[y][x]=='/';
}

function movePlayerLeft() {
    player_dir='l';
    if(isBox(player_x-1,player_y)) {
        moveBlockLeft(player_x-1,player_y);
    }
    if(moveBlockLeft(player_x, player_y)) {
        player_x--;
    }
    playerStep();
    drawGame();
}

function movePlayerRight() {
    player_dir='r';
    if(isBox(player_x+1,player_y)) {
        moveBlockRight(player_x+1,player_y);
    }
    if(moveBlockRight(player_x, player_y)) {
        player_x++;
    }
    playerStep();
    drawGame();
}

function movePlayerUp() {
    player_dir='u';
    if(isBox(player_x,player_y-1)) {
        moveBlockUp(player_x,player_y-1);
    }
    if(moveBlockUp(player_x, player_y)) {
        player_y--;
    }
    playerStep();
    drawGame();
}

function movePlayerDown() {
    player_dir='d';
    if(isBox(player_x,player_y+1)) {
        moveBlockDown(player_x,player_y+1);
    }
    if(moveBlockDown(player_x, player_y)) {
        player_y++;
    }
    playerStep();
    drawGame();
}

function playerStep() {
    player_move++;
    if(player_move>2) {
        player_move=0;
    }
}