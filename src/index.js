"use strict";
import './style.css';
import "./img/sokoban_tilesheet@2.png";
import { maps } from "./maps.js";

console.log(maps);
// Настройки спрайтов и canvas
const div = document.getElementById("game");

const blockSize = Number(
    getComputedStyle(div).getPropertyValue("--canvas-block-size")
);
const sprite = {
    filename: getComputedStyle(div).getPropertyValue("--sprites-filename"),
    size: Number(getComputedStyle(div).getPropertyValue("--sprite-size")),
};
// Получение номера уровня из якоря
let level = Number.parseInt(location.hash.substring(1));
if (level > maps.length) {
    alert(
        "Неверный номер уровня, максимальный доступный уровень " + maps.length
    );
    location.hash = "1";
    location.reload();
}
if (!level || level < 1) {
    location.hash = "1";
    location.reload();
}
let map = maps[level - 1];
document.title = "Sokoban, уровень " + level;

sprite.xy = [
    0,
    sprite.size * 1,
    sprite.size * 2,
    sprite.size * 3,
    sprite.size * 4,
    sprite.size * 5,
    sprite.size * 6,
    sprite.size * 7,
    sprite.size * 8,
    sprite.size * 9,
    sprite.size * 10,
    sprite.size * 11,
    sprite.size * 12,
];

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
div.appendChild(canvas);
canvas.width = map[0].length * blockSize;
canvas.height = map.length * blockSize;
canvas.style.display = "block";
canvas.style.maxWidth = "100%";
canvas.style.maxHeight = "80vh";

const sprites = new Image();
sprites.src = sprite.filename;

const player = {
    x: null,
    y: null,
    dir: "d",
    move: 0,
    step: function () {
        this.move++;
        if (this.move > 2) {
            this.move = 0;
        }
    },
};

addEventListener("load", drawGame);
addEventListener("hashchange", () => {
    location.reload();
});
// Управление с клавиатуры
addEventListener("keydown", movePlayer);
function movePlayer(event) {
    switch (event.keyCode) {
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
        case 81:
            cheat();
            break;
    }
}

// Управление свайпами
const sensitivity = 20;
let touchStartPos, touchPosition;
addEventListener("touchstart", touchStart);
addEventListener("touchmove", touchMove);
addEventListener("touchend", touchEnd);

function touchStart(e) {
    touchStartPos = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
    };
    touchPosition = { x: touchStartPos.x, y: touchStartPos.y };
}

function touchMove(e) {
    touchPosition = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
    };
}

function touchEnd(e, color) {
    CheckAction();
    touchStartPos = null;
    touchPosition = null;
}

function CheckAction() {
    var d = {
        x: touchStartPos.x - touchPosition.x,
        y: touchStartPos.y - touchPosition.y,
    };

    if (Math.abs(d.x) > Math.abs(d.y)) {
        if (Math.abs(d.x) > sensitivity) {
            if (d.x > 0) {
                movePlayerLeft();
            } else {
                movePlayerRight();
            }
        }
    } else {
        if (Math.abs(d.y) > sensitivity) {
            if (d.y > 0) {
                movePlayerUp();
            } else {
                movePlayerDown();
            }
        }
    }
}

// Основной код игры
const russian_digits = (number, txt, cases = [2, 0, 1, 1, 1, 2]) =>
    txt[
        number % 100 > 4 && number % 100 < 20
            ? 2
            : cases[number % 10 < 5 ? number % 10 : 5]
    ];

function drawGame() {
    let boxes = 0;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let sym = map[y][x];
            if (sym == "@") {
                player.x = x;
                player.y = y;
            }
            drawBlock(sym, x, y);
            if (sym == "*") {
                boxes++;
            }
        }
    }
    let message =
        "Нужно передвинуть ещё " +
        boxes +
        " " +
        russian_digits(boxes, ["ящик", "ящика", "ящиков"]) +
        " на их места.";
    if (boxes == 0) {
        message = "Вы победили!";
        if (level < maps.length) {
            message += ' <a href="#' + ++level + '">Следующий уровень</a>';
        } else {
            message += " Вы прошли все уровни!";
        }
    }
    document.getElementById("result").innerHTML = message;
    return boxes;
}

function cheat() {
    for (let y = 0; y < map.length; y++) {
        map[y] = map[y].replaceAll("*", " ");
        map[y] = map[y].replaceAll(".", "&");
    }
    drawGame();
}

function drawBlock(block, x, y) {
    let coord;
    ctx.clearRect(x * blockSize, y * blockSize, blockSize, blockSize);
    switch (block) {
        case "X":
            coord = { x: sprite.xy[8], y: sprite.xy[6] };
            break;
        case "*":
            coord = { x: sprite.xy[1], y: sprite.xy[0] };
            break;
        case "&":
            coord = { x: sprite.xy[4], y: sprite.xy[0] };
            break;
        case "@":
        case "+":
            coord = getPlayer();
            break;
        case ".":
            coord = { x: sprite.xy[12], y: sprite.xy[2] };
            break;
        default:
            return;
    }
    ctx.drawImage(
        sprites,
        coord.x,
        coord.y,
        sprite.size,
        sprite.size,
        x * blockSize,
        y * blockSize,
        blockSize,
        blockSize
    );
}

function getPlayer() {
    switch (player.dir) {
        case "d":
            return {
                x: sprite.xy[0] + player.move * sprite.size,
                y: sprite.xy[4],
            };
        case "u":
            return {
                x: sprite.xy[3] + player.move * sprite.size,
                y: sprite.xy[4],
            };
        case "r":
            return {
                x: sprite.xy[0] + player.move * sprite.size,
                y: sprite.xy[6],
            };
        case "l":
            return {
                x: sprite.xy[3] + player.move * sprite.size,
                y: sprite.xy[6],
            };
    }
}

function moveBlockLeft(x, y) {
    if (map[y][x - 1] != " " && map[y][x - 1] != ".") {
        return false;
    }
    let new_block, old_block;
    switch (map[y][x]) {
        case "@":
            new_block = map[y][x - 1] == "." ? "+" : "@";
            old_block = " ";
            break;
        case "+":
            new_block = map[y][x - 1] == "." ? "+" : "@";
            old_block = ".";
            break;
        case "*":
            new_block = map[y][x - 1] == "." ? "&" : "*";
            old_block = " ";
            break;
        case "&":
            new_block = map[y][x - 1] == "." ? "&" : "*";
            old_block = ".";
            break;
        default:
            return false;
    }
    let row = map[y];
    map[y] = row.slice(0, x - 1) + new_block + old_block + row.slice(x + 1);
    return true;
}

function moveBlockRight(x, y) {
    if (map[y][x + 1] != " " && map[y][x + 1] != ".") {
        return false;
    }
    let new_block, old_block;
    switch (map[y][x]) {
        case "@":
            new_block = map[y][x + 1] == "." ? "+" : "@";
            old_block = " ";
            break;
        case "+":
            new_block = map[y][x + 1] == "." ? "+" : "@";
            old_block = ".";
            break;
        case "*":
            new_block = map[y][x + 1] == "." ? "&" : "*";
            old_block = " ";
            break;
        case "&":
            new_block = map[y][x + 1] == "." ? "&" : "*";
            old_block = ".";
            break;
        default:
            return false;
    }
    let row = map[y];
    map[y] = row.slice(0, x) + old_block + new_block + row.slice(x + 2);
    return true;
}

function moveBlockUp(x, y) {
    if (map[y - 1][x] != " " && map[y - 1][x] != ".") {
        return false;
    }
    let new_block, old_block;
    switch (map[y][x]) {
        case "@":
            new_block = map[y - 1][x] == "." ? "+" : "@";
            old_block = " ";
            break;
        case "+":
            new_block = map[y - 1][x] == "." ? "+" : "@";
            old_block = ".";
            break;
        case "*":
            new_block = map[y - 1][x] == "." ? "&" : "*";
            old_block = " ";
            break;
        case "&":
            new_block = map[y - 1][x] == "." ? "&" : "*";
            old_block = ".";
            break;
        default:
            return false;
    }
    let row_old = map[y];
    let row_new = map[y - 1];
    map[y] = row_old.slice(0, x) + old_block + row_old.slice(x + 1);
    map[y - 1] = row_new.slice(0, x) + new_block + row_new.slice(x + 1);
    return true;
}

function moveBlockDown(x, y) {
    if (map[y + 1][x] != " " && map[y + 1][x] != ".") {
        return false;
    }
    let new_block, old_block;
    switch (map[y][x]) {
        case "@":
            new_block = map[y + 1][x] == "." ? "+" : "@";
            old_block = " ";
            break;
        case "+":
            new_block = map[y + 1][x] == "." ? "+" : "@";
            old_block = ".";
            break;
        case "*":
            new_block = map[y + 1][x] == "." ? "&" : "*";
            old_block = " ";
            break;
        case "&":
            new_block = map[y + 1][x] == "." ? "&" : "*";
            old_block = ".";
            break;
        default:
            return false;
    }
    let row_old = map[y];
    let row_new = map[y + 1];
    map[y] = row_old.slice(0, x) + old_block + row_old.slice(x + 1);
    map[y + 1] = row_new.slice(0, x) + new_block + row_new.slice(x + 1);
    return true;
}

function isBox(x, y) {
    return map[y][x] == "*" || map[y][x] == "&";
}

function movePlayerLeft() {
    player.dir = "l";
    if (isBox(player.x - 1, player.y)) {
        moveBlockLeft(player.x - 1, player.y);
    }
    if (moveBlockLeft(player.x, player.y)) {
        player.x--;
    }
    player.step();
    drawGame();
}

function movePlayerRight() {
    player.dir = "r";
    if (isBox(player.x + 1, player.y)) {
        moveBlockRight(player.x + 1, player.y);
    }
    if (moveBlockRight(player.x, player.y)) {
        player.x++;
    }
    player.step();
    drawGame();
}

function movePlayerUp() {
    player.dir = "u";
    if (isBox(player.x, player.y - 1)) {
        moveBlockUp(player.x, player.y - 1);
    }
    if (moveBlockUp(player.x, player.y)) {
        player.y--;
    }
    player.step();
    drawGame();
}

function movePlayerDown() {
    player.dir = "d";
    if (isBox(player.x, player.y + 1)) {
        moveBlockDown(player.x, player.y + 1);
    }
    if (moveBlockDown(player.x, player.y)) {
        player.y++;
    }
    player.step();
    drawGame();
}
