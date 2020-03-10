// パーティー
var party = [
    {
        id: 'yusha',
        name: 'ゆうしゃ',
        max_hp: 2000,
        hp: 2000,
        max_mp: 300,
        mp: 300,
        attack: 100,
        wisdom: 100,
        defence: 100,
        spirit: 100,
        speed: 100,
        spells: [
            { id: 'cure', mp: 13 },
            { id: 'lightning', mp: 33 }
        ]
    },
    {
        id: 'senshi',
        name: 'せんし',
        max_hp: 2400,
        hp: 2400,
        max_mp: 100,
        mp: 100,
        attack: 120,
        wisdom: 50,
        defence: 120,
        spirit: 50,
        speed: 50,
        spells: [
            { id: 'max', mp: 25 }
        ]
    },
    {
        id: 'kenja',
        name: 'けんじゃ',
        max_hp: 1500,
        hp: 1500,
        max_mp: 500,
        mp: 500,
        attack: 80,
        wisdom: 120,
        defence: 90,
        spirit: 130,
        speed: 80,
        spells: [
            { id: 'cure', mp: 13 },
            { id: 'diamond', mp: 20 },
            { id: 'lightning', mp: 33 }
        ]
    },
    {
        id: 'mahou',
        name: 'まほうつかい',
        max_hp: 1000,
        hp: 1000,
        max_mp: 800,
        mp: 800,
        attack: 40,
        wisdom: 150,
        defence: 50,
        spirit: 110,
        speed: 130,
        spells: [
            { id: 'fire', mp: 12 },
            { id: 'diamond', mp: 20 },
            { id: 'lightning', mp: 33 },
            { id: 'meteo', mp: 80 }
        ]
    }
];

// モンスター情報
var monster = {
    id: 'monster',
    name: 'モンスター',
    max_hp: 10000,
    hp: 10000,
    max_mp: 5000,
    mp: 5000,
    attack: 200,
    wisdom: 100,
    defence: 100,
    spirit: 100,
    speed: 100
};

// 行動可能メンバー
var availableMembers = [];

// 防御メンバー
var defenceMembers = [];

// 行動情報格納配列
var actions = [];

// タイマー ID
var tid = 0;

// 敵の攻撃回数
var numberOfEnemyAttacks = 2;

// インターバル時間
intervalTime = 2000;


// 画面初期化
function initialize() {
    for(var i = 0; i < party.length; i++) {
        availableMembers.push(party[i]);
    }
    updateStatus();
    prepareCommand();
}

// 状態更新
function updateStatus() {
    for(var i = 0; i < party.length; i++){
        var member = party[i];
        updateName(member);
        updateHp(member);
        updateMp(member);
    }
    updateHp(monster);
}

// 名前更新
function updateName(member) {
    var element = document.getElementById(member.id + '_name');
    element.innerHTML = member.name;
}

// HP 更新
function updateHp(member) {
    var valueElement = document.getElementById(member.id + '_hp');
    if(valueElement !== null) {
        valueElement.innerHTML = 'HP: ' + member.hp + '/' + member.max_hp;
    }

    var barElement = document.getElementById(member.id + '_hp_inner');
    if(member.hp === 0) {
        barElement.setAttribute('style', 'display:none;');
    }
    else {
        var percentage = Math.round(member.hp * 100 / member.max_hp);
        barElement.setAttribute('style', 'display: block; width: ' + percentage + '%;');
    }
}

// MP 更新
function updateMp(member) {
    var valueElement = document.getElementById(member.id + '_mp');
    if(valueElement !== null) {
        valueElement.innerHTML = 'MP: ' + member.mp + '/' + member.max_mp;
    }

    var barElement = document.getElementById(member.id + '_mp_inner');
    if(member.mp === 0) {
        barElement.setAttribute('style', 'display:none;');
    }
    else {
        var percentage = Math.round(member.mp * 100 / member.max_mp);
        barElement.setAttribute('style', 'display: block; width: ' + percentage + '%;');
    }
}

// メンバー取得
function getCurrentMember() {
    var index = actions.length;
    var member = null;
    if(index >= 0 && index < availableMembers.length) {
        member = availableMembers[index];
    }
    return member;
}

// コマンド準備
function prepareCommand() {
    var member = getCurrentMember();
    var commandElement = document.getElementById('command_title');
    commandElement.innerHTML = member.name;

    var elements = document.getElementsByClassName('command_li');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.setAttribute('style', 'display: block;');
    }

    elements = document.getElementsByClassName('spell_li');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.setAttribute('style', 'display: none;');
    }
}

// 呪文表示
function showSpells() {
    var member = getCurrentMember();

    var elements = document.getElementsByClassName('command_li');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.setAttribute('style', 'display: none;');
    }

    for(var i = 0; i < member.spells.length; i++) {
        var spell = member.spells[i];
        if(member.mp >= spell.mp) {    // MP が足りるものだけを表示する
            var element = document.getElementById(spell.id + '_spell');
            element.setAttribute('style', 'display: block');
        }
    }

    var element = document.getElementById('return_to_command');
    element.setAttribute('style', 'display: block');
}

// 前に戻る
function showPreviousCommand() {
    if(actions.length > 0) {
        actions.pop();
    }
    prepareCommand();
}

// アクション追加
function addAction(action) {
    var member = getCurrentMember();
    var object = {
        actor: member,
        action: action
    };
    var mp = 0;
    for(var i = 0; i < member.spells.length; i++) {
        var spell = member.spells[i];
        if(action === spell.id) {
            mp = spell.mp
        }
    }
    object.mp = mp;

    actions.push(object);
    if(actions.length === availableMembers.length) {
        startBattle();
    }
    else {
        prepareCommand();
    }

    if(action === 'defence') {
        defenceMembers.push(member);
    }
}

// バトル開始
function startBattle() {
    hideCommand();
    addEnemyAction();
    addPriority();
    
    setTimer();
}

// コマンドを消す
function hideCommand() {
    var commandElement = document.getElementById('command_title');
    commandElement.innerHTML = '';

    var elements = document.getElementsByClassName('command_li');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.setAttribute('style', 'display: none;');
    }

    elements = document.getElementsByClassName('spell_li');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        element.setAttribute('style', 'display: none;');
    }    
}

// 優先度情報追加
function addPriority() {
    for(var i = 0; i < actions.length; i++) {
        var object = actions[i];
        var member = object.actor;
        object.priority = Math.floor(member.speed * Math.random());
    }
}

// 敵のアクション追加
function addEnemyAction() {
    for(var i = 0; i < numberOfEnemyAttacks; i++) {
        var object = {
            actor: monster,
            action: 'attack',
            mp: 0
        };
        actions.push(object);
    }
}

// タイマーセット
function setTimer() {
    tid = setInterval(processAction, intervalTime);
}

// 一番高い priority のアクション index を取得
function getHighestPriorityActionIndex() {
    var index = -1;
    var priority = -1;
    for(var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if(action.priority > priority) {
            index = i;
            priority = action.priority;
        }
    }
    return index;
}

// アクション実行
function processAction() {
    var index = getHighestPriorityActionIndex();

    act(actions[index]);

    if(availableMembers.length === 0) {
        clearInterval(tid);
        setTimeout(
            function() {
                showMessage('全滅しました。');
                var element = document.getElementById('main');
                element.setAttribute('style', 'background-image: none; background-color: red;');
            },
            intervalTime
        );
        
    }
    else if(monster.hp <= 0){
        clearInterval(tid);
        setTimeout(
            function() {
                showMessage('モンスターをたおしました。');
                var element = document.getElementById('main');
                element.setAttribute('style', 'background-image: none; background-color: black;');
            },
            intervalTime
        );
    }
    else {
        newActions = [];
        for(var i = 0; i < actions.length; i++) {
            if(i !== index) {
                newActions.push(actions[i]);
            }
        }
        actions = newActions;
        if(actions.length === 0) {
            clearInterval(tid);
            defenceMembers = [];
            prepareCommand();
        }
    }
}

// 行動
function act(action) {
    var actor = action.actor;
    var index = availableMembers.indexOf(actor);
    if(actor === monster || index >= 0) {
        if(action.action === 'cure') {
            cure(action);
        }
        else if(action.action === 'defence') {
            showMessage(actor.name + 'は身を守っている。');
        }
        else {
            attack(action);
        }
        updateStatus();
    }
}

// 回復
function cure(action) {
    var actor = action.actor;
    var hpRatio = 1.1;
    var index = -1;
    for(var i = 0; i < availableMembers.length; i++) {
        var member = availableMembers[i];
        var ratio = member.hp / member.max_hp;
        if(ratio < hpRatio) {
            hpRatio = ratio;
            index = i;
        }
    }

    actor.mp = actor.mp - action.mp;

    var target = availableMembers[index];
    target.hp = target.hp + 350;
    if(target.hp > target.max_hp) {
        target.hp = target.max_hp;
    }

    var message = actor.name + 'は「かいふく」をとなえた。' + target.name + 'はかいふくした。';
    showMessage(message);
}

// 攻撃
function attack(action) {
    var target = null;
    var actor = action.actor;
    if(actor === monster) {
        var index = Math.floor(availableMembers.length * Math.random());
        target = availableMembers[index];
    }
    else {
        target = monster;
    }

    var damage = getActionDamage(actor, target, action.action);
    actor.mp = actor.mp - action.mp;
    target.hp = target.hp - damage;
    if(target.hp < 0) {
        target.hp = 0;
    }

    if(target.hp === 0 && target !== monster) {
        newAvailableMembers = [];
        for(var i = 0; i < availableMembers.length; i++) {
            if(availableMembers[i] != target) {
                newAvailableMembers.push(availableMembers[i]);
            }
        }
        availableMembers = newAvailableMembers;
    }
}

// ダメージ計算
function getActionDamage(actor, target, action) {
    var message = '';
    var damage = 0;

    if(action === 'attack') {
        message = actor.name + 'のこうげき。';
        damage = calculateDamage(actor.attack, target.defence, 2.0, 3.0);
    }
    else if(action === 'lightning') {
        message = actor.name +'は「いなづま」をとなえた。';
        damage = calculateDamage(actor.wisdom, target.spirit, 4.0, 5.0);
    }
    else if(action === 'max') {
        message = actor.name + 'のこんしんのいちげき！';
        damage = calculateDamage(actor.attack, target.defence, 5.0, 6.0);
    }
    else if(action === 'diamond') {
        message = actor.name + 'は「ダイヤモンドダスト」をとなえた。';
        damage = calculateDamage(actor.wisdom, target.spirit, 3.0, 4.0);
    }
    else if(action === 'fire') {
        message = actor.name + 'は「ほのお」をとなえた。';
        damage = calculateDamage(actor.wisdom, target.spirit, 2.0, 3.0);
    }
    else if(action === 'meteo') {
        message = actor.name + 'は「いんせき」をとなえた。';
        damage = calculateDamage(actor.wisdom, target.spirit, 5.0, 6.0);
    }
    var index = defenceMembers.indexOf(target);
    if(index >= 0) {
        damage = Math.ceil(damage / 2.0);
    }
    message = message + target.name + 'は ' + damage + ' のダメージをうけた。';
    showMessage(message);

    return damage;
}

// ダメージ計算
function calculateDamage(plusElement, minusElement, minRatio, maxRatio) {
    var ratio = minRatio + (maxRatio - minRatio) * Math.random();
    var damage = Math.floor(ratio * plusElement - minusElement);
    if(damage < 1) {
        damage = 1;
    }
    return damage;
}

// メッセージ表示
function showMessage(message) {
    var element = document.getElementById('top');
    element.innerHTML = message;
}
