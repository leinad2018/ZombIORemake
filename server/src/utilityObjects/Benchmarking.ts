import { ZIREntity } from "../baseObjects/EntityBase";
import { Vector } from "./Math";
import { ZIREnemy } from "../entities/mobs/Enemy";
import { ZIRPhysicsEngine } from "../PhysicsEngine";
import { ZIRTimer } from "../Timer";

function generateStationaryEntityGrid(size: number = 50): ZIREntity[] {
    const entities = []
    let toGenerate = size;
    for(let x = 0; x < Math.sqrt(size); x++) {
        for(let y = 0; y < Math.sqrt(size); y++) {
            if(toGenerate > 0) {
                entities.push(new ZIREnemy(new Vector(x*10, y*10)));
                toGenerate--;
            }
        }
    }
    console.log(entities.length);
    return entities;
}

function generateMovingEntityGrid(): ZIREntity[] {
    const entities = generateStationaryEntityGrid();
    for(const entity of entities) {
        entity.setVelocity(new Vector(10, 0));
    }
    return entities;
}

function testPhysics(entities: ZIREntity[]) {
    const engine = new ZIRPhysicsEngine();
    repeat(()=> {
        for(const entity of entities) {
            engine.applyPhysics(entity, 30/1000);
        }
    }, 10000000);
}

function time(process: Function): number {
    const start = ZIRTimer.getNanoTime();
    process();
    const dt = ZIRTimer.getNanoTime() - start;
    return dt;
}

function repeat(process: Function, repetitions: number) {
    for(let i = 0; i < repetitions; i++) {
        process();
    }
}

let stationaryEntities = generateStationaryEntityGrid();
console.log(time(()=>testPhysics(stationaryEntities)));
stationaryEntities = generateStationaryEntityGrid();
console.log(time(()=>testPhysics(stationaryEntities)));
stationaryEntities = generateStationaryEntityGrid();
console.log(time(()=>testPhysics(stationaryEntities)));
stationaryEntities = generateStationaryEntityGrid();
console.log(time(()=>testPhysics(stationaryEntities)));
stationaryEntities = generateStationaryEntityGrid();
console.log(time(()=>testPhysics(stationaryEntities)));