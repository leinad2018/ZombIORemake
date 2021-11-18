import { ZIREntity } from "../baseObjects/EntityBase";
import { Vector } from "./Math";
import { ZIREnemy } from "../entities/mobs/Enemy";
import { ZIRPhysicsEngine } from "../processManagers/PhysicsEngine";
import { ZIRTimer } from "./Timer";
import { isNumber } from "util";
import { writeFile, readFile } from "fs";
import { createInterface } from "readline";
import { ZIRPlayerWorld } from "../worlds/PlayerWorld";
import { EntityQuadtree } from "./DataStructures";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";
let calibrationMean = 1; // Expected mean ratio of snapshot
const calibrationDeviation = 0.15; // Tolerated deviation from mean due to sampling noise

let snapshots: {[description: string]: number} = {};
const newSnapshots: {[description: string]: number} = {};

function generateStationaryEntityGrid(size: number = 50): ZIREntity[] {
    const entities = [];
    let toGenerate = size;
    for (let x = 0; x < Math.sqrt(size); x++) {
        for (let y = 0; y < Math.sqrt(size); y++) {
            if (toGenerate > 0) {
                entities.push(new ZIREnemy(new Vector(x * 10, y * 10)));
                toGenerate--;
            }
        }
    }
    return entities;
}

function generateMovingEntityGrid(size: number = 50): ZIREntity[] {
    const entities = generateStationaryEntityGrid(size);
    for (const entity of entities) {
        entity.setVelocity(new Vector(10, 0));
    }
    return entities;
}

function generateStationaryEntityPile(size: number = 50): ZIREntity[] {
    const entities = [];
    let toGenerate = size;
    while (toGenerate > 0) {
        entities.push(new ZIREnemy(new Vector(0, 0)));
        toGenerate--;
    }
    return entities;
}

function generateMovingEntityPile(size: number = 50): ZIREntity[] {
    const entities = generateStationaryEntityPile(size);
    for (const entity of entities) {
        entity.setVelocity(new Vector(10, 0));
    }
    return entities;
}

function testPhysics() {
    const engine = new ZIRPhysicsEngine();
    let entities = generateStationaryEntityGrid();
    timeRepeated(
        () => {
            for (const entity of entities) {
                engine.applyPhysics(entity, 30 / 1000);
            }
        }, "stationary physics",
    );
    entities = generateMovingEntityGrid();
    timeRepeated(
        () => {
            for (const entity of entities) {
                entity.applyForce(new Vector(10, 0));
                engine.applyPhysics(entity, 30 / 1000);
            }
        }, "moving physics",
    );
}

function testCollision() {
    let sandbox = new ZIRPlayerWorld("test");
    let entities = generateMovingEntityGrid();
    for (const entity of entities) {
        sandbox.registerEntity(entity);
    }
    timeRepeated(
        () => {
            for (const entity of sandbox.getEntities()) {
                entity.applyForce(new Vector(10, 10));
            }
            sandbox.runCollisionLogic();
        }, "collision without hits", 10000,
    );
    sandbox = new ZIRPlayerWorld("test2");
    entities = generateMovingEntityPile();
    for (const entity of entities) {
        sandbox.registerEntity(entity);
    }
    timeRepeated(
        () => {
            for (const entity of sandbox.getEntities()) {
                entity.applyForce(new Vector(10, 10));
            }
            sandbox.runCollisionLogic();
        }, "collision with only hits", 10000,
    );
}

function thousandPrimes() {
    const primes = [];
    let i = 2;
    while (primes.length < 1000) {
        let prime = true;
        for (let j = Math.trunc(Math.sqrt(i)); j > 1; j--) {
            if (i % j === 0) {
                prime = false;
                break;
            }
        }
        if (prime) {
            primes.push(i);
        }
        i++;
    }
}

function calibrate() {
    console.log("\n");
    console.log("Calibrating by calculating 1000 primes over 1000 samples...");
    const snapshotCalibration = snapshots["calibration"];
    const callibrationTime = time(
        () => {
            repeat(thousandPrimes, 1000);
        },
    ) / 10000;
    newSnapshots["calibration"] = callibrationTime;
    const performance = callibrationTime / snapshotCalibration;
    console.log("Performing at " + Math.trunc(100 * performance) + "% of snapshot.");
    const deviation = Math.abs(1 - performance);
    if (deviation > calibrationDeviation) {
        console.log(RED + "WARNING: Results are potentially unreliable. " + Math.trunc(100 * (deviation / 2)) + "% deviation from snapshot." + RESET);
    }

    calibrationMean = 1;
    console.log("Set calibration at " + Math.trunc(100 * calibrationMean) + "% snapshot performance");
    console.log("Allowing for " + Math.trunc(100 * calibrationDeviation) + "% deviation due to noise");
    console.log("\n");
}

function timeRepeated(process: (any?) => any, identifier: string, n: number = 1000000) {
    console.log("Benchmarking " + identifier + " average over " + n + " samples:");
    let dt = time(() => {
        repeat(process, n);
    }) / n;
    let snapshotID = identifier + "_initial";
    newSnapshots[snapshotID] = dt;
    let snapshot = snapshots[snapshotID];
    outputResults(dt, snapshot, "initial");

    dt = time(() => {
        repeat(process, n);
    }) / n;
    snapshotID = identifier + "_second";
    newSnapshots[snapshotID] = dt;
    snapshot = snapshots[snapshotID];
    outputResults(dt, snapshot, "second");
    console.log("\n");
}

function outputResults(observation: number, snapshot: number, identifier: string) {
    const ratio = observation / (snapshot * calibrationMean);
    const change = 1 - ratio;
    if (ratio > (1 + calibrationDeviation)) {
        console.log(RED + identifier + ": " + observation + " ns (" + Math.trunc(100 * ratio) + "% of snapshot) [" + Math.trunc(100 * change) + "%]" + RESET);
    } else if (ratio < (1 - calibrationDeviation)) {
        console.log(GREEN + identifier + ": " + observation + " ns (" + Math.trunc(100 * ratio) + "% of snapshot) [+" + Math.trunc(100 * change) + "%]" + RESET);
    } else {
        console.log(identifier + ": " + observation + " ns (" + Math.trunc(100 * ratio) + "% of snapshot) [NO EFFECTIVE CHANGE]");
    }
}

function writeSnapshot() {
    const json = JSON.stringify(newSnapshots);
    writeFile("benchmark_snapshots.json", json, "utf8",
        (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Snapshot saved.");
            }
        });
}

function loadSnapshot() {
    console.log("Loading benchmark snapshots...");
    readFile("benchmark_snapshots.json", function readFileCallback(err, data) {
        if (err) {
            console.log("Load failed:");
            console.log(err);
        } else {
            console.log("Load succeeded.");
            snapshots = JSON.parse(data.toString());
            runTests();
        }
    });
}

function promptForSnapshotWrite() {

    const stdin = process.openStdin();

    console.log("Update snapshots? (y/n):")
    stdin.addListener("data", (d) => {
       let response = d.toString().trim();
       response = response.toLowerCase();
       if (response === "y") {
           writeSnapshot();
           console.log("Terminating program.");
       } else if (response === "n") {
           console.log("Terminating program.");
           process.exit();
       } else {
           promptForSnapshotWrite();
       }
    });
}

function time(process: Function): number {
    const start = ZIRTimer.getNanoTime();
    process();
    const dt = ZIRTimer.getNanoTime() - start;
    return dt;
}

function repeat(process: Function, repetitions: number) {
    for (let i = 0; i < repetitions; i++) {
        process();
    }
}

function testDataStructures() {
    const entities = generateStationaryEntityGrid();
    const quadTree = new EntityQuadtree(entities);
}

loadSnapshot();

function runTests() {
    // calibrate();
    // testPhysics();
    // testCollision();
    testDataStructures();
    // promptForSnapshotWrite();
}
