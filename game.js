
'use strict';
class Vector {
    constructor(X = 0, Y = 0) {
        this.x = X;
        this.y = Y
    }
    plus(vector) {
        if (vector instanceof Vector === false) {
            throw new Error('����� ���������� � ������ ������ ������ ���� Vector')
        } else {
            let newX = vector.x + this.x;
            let newY = vector.y + this.y;
            return new Vector(newX, newY);
        }
    }
    times(t) {
        return new Vector(this.x * t, this.y * t)
    }
}
//�������� ����������������� ������ ������
/*const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));
console.log(finish); */


class Actor {
    constructor(position = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {

        if (position instanceof Vector && size instanceof Vector && speed instanceof Vector) {
            this.pos = position;
            this.size = size;
            this.speed = speed;
            this.act = new Function();
        } else {
            throw new Error('���������� ������ �� �������� ����� Vector');
        }
    }
    get left() { return this.pos.x;}
    get top() { return this.pos.y; }
    get right() { return this.pos.x + this.size.x; }
    get bottom() { return this.pos.y + this.size.y; }
    
}
Object.defineProperty(Actor.prototype, 'type', {
    value: 'actor',
    enumerable: true,
    configurable: true,
});

Actor.prototype.isIntersect = function (actor) {
    if (actor instanceof Actor === false) {
        throw new Error('������������ ��� Actor')
    } else if (this === actor) {
        return false;
    } else if ((this.top === actor.bottom && this.left === actor.right) || (this.top === actor.bottom && this.right === actor.left) || (this.bottom === actor.top && this.right === actor.left) || (this.bottom === actor.top && this.left === actor.right)) {return true;}
    else if ((this.left > actor.right && this.right >= actor.right) || (this.right < actor.left && this.left <= actor.left) || (this.bottom > actor.top && this.top >= actor.top) || (this.top < actor.bottom && this.bottom <= actor.bottom)) {return false;}
       /* попытка пройти последний тест "Объект пересекается с объектом, который частично содержится в нём". не проходит
    else if (((actor.left >= this.left && actor.left <= this.right) || (actor.right >= this.left && actor.right <= this.right)) &&  ((actor.top >= this.bottom && actor.top <= this.top) || (actor.bottom >= this.bottom && actor.bottom <= this.top))) {return true;}
    */
   //еще попытка
  
    else {
        return true;
    }
}

/*
const items = new Map();

const player = new Actor();
items.set('�����', player);
items.set('������ ������', new Actor(new Vector(10, 10)));
items.set('������ ������', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`����� �������� ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status); */


class Level {
    constructor(grid, actors) {
        this.grid = grid;
        this.actors = actors;
    }
    get height() {
        if (this.grid === undefined  || this.grid === []) {
            return 0;
        } else {
            return this.grid.length;
        }
    }
    get width() {
        if (this.grid === undefined || this.grid === [] ) {
            return 0;
        } 
            let max = 0;
            for (let line of this.grid) {
                if (line.length > max) {
                    max = line.length;
                }
            }
            return max;
        
    }
    get player() {
        for (let one of this.actors) {
            if (one.type === 'player') {
                return one;
            }
        }
    }
    isFinished() {
        return this.status !== null && this.finishDelay < 0 ? true : false;
    }
    actorAt(movingObject) {
    
        if (this.actors === undefined || this.actors === []) {
            return undefined;
        } else { 
            const filtered = this.actors.filter(el => el instanceof Actor);
            const result = filtered.filter(el => el.isIntersect(movingObject) === true);
            if (result !== []) { return undefined;
            } else { 
                return result[0];
            }
        }
    }
    obstacleAt(moveActorTo, size) {
        if (moveActorTo instanceof Vector && size instanceof Vector) {
            //size.x = Math.floor(size.x);
            //size.y = Math.floor(size.y);
            let movedto = moveActorTo.plus(size);
            if (movedto.y > this.height || moveActorTo.y > this.height) { return 'lava'; }
            else if (movedto.x > this.width || movedto.x < 0 || moveActorTo.x < 0 || moveActorTo.y < 0 || movedto.y < 0 || moveActorTo.x > this.width) {
                return 'wall';
            } else {
                for (let i = Math.floor(moveActorTo.y); i <= Math.floor(moveActorTo.y + size.y); i++) {
                    for (let j = Math.floor(moveActorTo.x); j <= Math.floor(moveActorTo.x + size.x); j++) {
                        if (this.grid[i][j] === 'lava' || this.grid[i][j] === 'wall') {
                            return this.grid[i][j];
                        } else {return undefined;}
                    }
                }    
            }
        } else {
            throw new Error('������������ ��� ���������');
        }
    }
    removeActor(toBeRemoved) {
        let i = this.actors.indexOf(toBeRemoved);
        this.actors.splice(i, 1);

    }
    noMoreActors(actorType) {
        if (this.actors === [] || this.actors === undefined) { return true;}
        let types = this.actors.map(function (one) {
            return one.type;
        })
        return types.indexOf(actorType) === -1 ? true : false;
    }

    playerTouched(obstacleType, actor) {
        if (obstacleType === 'lava' || obstacleType === 'fireball') {
            this.status = 'lost';
        } else if (obstacleType === 'coin') {
            this.removeActor(actor);
            if (this.noMoreActors(obstacleType)) { this.status = 'won' }
        }
    }

}

Level.prototype.status = null;
Level.prototype.finishDelay = 1;





class LevelParser {
    constructor(dict) {
        this.dict = dict;
    }
    actorFromSymbol(sym = 0) {
        if (sym == 0 ) { return undefined;}
        else if (sym in this.dict) {return this.dict[sym];}
        else {return undefined;}
     }
    obstacleFromSymbol(sym) {
       if (sym === 'x') { return 'wall';}
       else if (sym === '!') { return 'lava';}
       else { return undefined; }
    }
    createGrid(plan) {
        if (plan.length === 0) {return [];}
        let result = [];
        for (let line of plan) {
            result.push(line.split('').map(symbol => this.obstacleFromSymbol(symbol)));
        }
        return result;
    }
    createActors(plan) {
		let result = [];
		if (plan.length === 0) {
			return [];
		} 
        if (this.dict === undefined) {return result;}
        else { 
		plan.forEach(function (line, indexY) {
			let lineArr = line.split('');
            lineArr.forEach(function(symbol, index){
                let obj = this.actorFromSymbol(symbol)
                if ( obj instanceof Actor.constructor) {
                    let newActor = new obj(new Vector(index, indexY))
                    if (newActor instanceof Actor) {
                        result.push(newActor);
                    }
                } 
            }, this)
		}, this)
		return result;}
    }
    parse(plan) {
        let grid = Array.from(this.createGrid(plan));
        let actors = Array.from(this.createActors(plan));
        let level = new Level(grid, actors);
        return level;
    }     
}

  
class Fireball extends Actor {
    constructor (position = new Vector(0,0), speed = new Vector(0,0)) {
        super(position);
        this.speed = speed;        
    }

getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.times(time).x, this.pos.y + this.speed.times(time).y);
}
handleObstacle() {
    let s = new Vector(this.speed.x * (-1), this.speed.y * (-1));
    this.speed = s;
}
act(time, level = new Level) {
    let currentPosition = new Vector(this.pos.x, this.pos.y);
    let newPosition = new Vector(this.getNextPosition(time).x, this.getNextPosition(time).y);
    const size = new Vector(this.size.x, this.size.y);
    let obstacle = level.obstacleAt(newPosition, size);
    if (obstacle === 'wall' || obstacle === 'lava') {
        this.handleObstacle();
        this.pos = new Vector(currentPosition.x, currentPosition.y);
    } else if (obstacle === undefined) {
        this.pos = new Vector (newPosition.x, newPosition.y);
    }
}
}

Object.defineProperty(Fireball.prototype, 'type', {
    value: 'fireball',
    enumerable: true,
    configurable: true,
}) 

class HorizontalFireball extends Fireball {
    constructor (position) {
        super(position);
        this.speed = new Vector(2, 0);
    }
}
class VerticalFireball extends Fireball {
    constructor (position) {
        super(position);
        this.speed = new Vector(0, 2);
    }
}

class FireRain extends VerticalFireball {
    constructor (position) {
        super(position);
        this.speed = new Vector(0, 3);
        this.originalPos = position;
    }
    handleObstacle() {
        let s = new Vector(0, 3);
        this.speed = s;
        this.pos = new Vector(this.originalPos.x, this.originalPos.y);
    }
    
}

class Player extends Actor {
    constructor (position = new Vector) {
        super(position.plus(new Vector(0, -0.5)));        
        this.size = new Vector(0.8, 1.5);
        this.speed = new Vector(0, 0);
    }
}

Object.defineProperty(Player.prototype, 'type', {
    value: 'player',
    enumerable: true,
    configurable: true,
}) 

class Coin extends Actor {
    constructor (position = new Vector) {
        super(position.plus(new Vector(0.2, 0.1)));
        this.originalPos = new Vector(position.x + 0.2, position.y + 0.1);
        this.size = new Vector(0.6, 0.6);
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random() * 2 * Math.PI;
    }
    updateSpring(time) {
        const speed = this.springSpeed;
        if (time !== undefined) { 
        this.spring += time * speed;
        } else {
            this.spring += speed;
        }
        
    }
    getSpringVector() {
        let springVector = new Vector(0, this.springDist * Math.sin(this.spring));
        return springVector;
    }

}

Object.defineProperty(Coin.prototype, 'type', {
    value: 'coin',
    enumerable: true,
    configurable: true,
})

Coin.prototype.getNextPosition = function(time = 1) {
    let springVector = this.getSpringVector();
        const originalPosition = new Vector(this.originalPos.x, this.originalPos.y); 
            let newPosition
        this.updateSpring();
     
        return originalPosition.plus(springVector);
}

Coin.prototype.act = function(time) {
    let newPosition = this.getNextPosition(time);
        this.positon = new Vector (newPosition.x, newPosition.y);
}