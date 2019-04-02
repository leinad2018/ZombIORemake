import * as $ from "../lib/jquery";

export class ZIRConsole {
    constructor() {
        console.log((JSON.stringify($("#area")) as any));
        // console.log((JSON.stringify($("#area")) as any).epoch);
        const data = [
            { label: "Layer 1", values: [ {x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2} ] },
            { label: "Layer 2", values: [ {x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 4} ] },
        ];
        const areaChartInstance = ($("#area") as any).epoch({
            axes: ["left", "right", "bottom"],
            data: {data},
            type: "area",
        });
    }
}
