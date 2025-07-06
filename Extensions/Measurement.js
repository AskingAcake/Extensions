// MIT License
// Copyright (c) 2025 AskingAcake
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the “Software”), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Made by AskingAcake, Measurement

(function () {
    const BlockType = Scratch.BlockType;
    const ArgumentType = Scratch.ArgumentType;

    const units = {
        length: {
            base: "m",
            units: {
                m: 1,
                cm: 0.01,
                mm: 0.001,
                km: 1000,
                in: 0.0254,
                ft: 0.3048,
                yd: 0.9144,
                mi: 1609.34
            }
        },
        mass: {
            base: "g",
            units: {
                g: 1,
                kg: 1000,
                mg: 0.001,
                lb: 453.592,
                oz: 28.3495,
                ton: 1e6
            }
        },
        time: {
            base: "s",
            units: {
                s: 1,
                ms: 0.001,
                min: 60,
                h: 3600,
                day: 86400
            }
        },
        volume: {
            base: "L",
            units: {
                L: 1,
                mL: 0.001,
                gal: 3.78541,
                qt: 0.946353,
                pt: 0.473176,
                cup: 0.24,
                floz: 0.0295735,
                tbsp: 0.0147868,
                tsp: 0.00492892
            }
        },
        temperature: {
            special: true
        }
    };

    function convertTemperature(value, from, to) {
        from = from.toLowerCase();
        to = to.toLowerCase();
        if (from === to) return value;

        // Convert to Celsius
        let c;
        if (from === "c") c = value;
        else if (from === "f") c = (value - 32) * 5 / 9;
        else if (from === "k") c = value - 273.15;
        else return NaN;

        // Convert from Celsius to target
        if (to === "c") return c;
        if (to === "f") return (c * 9 / 5) + 32;
        if (to === "k") return c + 273.15;

        return NaN;
    }

    class UnitConverter {
        getInfo() {
            return {
                id: "unitconverter",
                name: "Unit Converter",
                color1: "#4b7bec",
                blocks: [
                    {
                        opcode: "convert",
                        blockType: BlockType.REPORTER,
                        text: "convert [VALUE] [FROM] to [TO]",
                        arguments: {
                            VALUE: { type: ArgumentType.NUMBER, defaultValue: 1 },
                            FROM: { type: ArgumentType.STRING, defaultValue: "m" },
                            TO: { type: ArgumentType.STRING, defaultValue: "ft" }
                        }
                    },
                    {
                        opcode: "getUnits",
                        blockType: BlockType.REPORTER,
                        text: "get all units in category [CATEGORY]",
                        arguments: {
                            CATEGORY: {
                                type: ArgumentType.STRING,
                                menu: "categories",
                                defaultValue: "length"
                            }
                        }
                    },
                    {
                        opcode: "isValidUnit",
                        blockType: BlockType.BOOLEAN,
                        text: "is unit [UNIT] valid in category [CATEGORY]",
                        arguments: {
                            UNIT: { type: ArgumentType.STRING, defaultValue: "m" },
                            CATEGORY: {
                                type: ArgumentType.STRING,
                                menu: "categories",
                                defaultValue: "length"
                            }
                        }
                    }
                ],
                menus: {
                    categories: {
                        acceptReporters: true,
                        items: ["length", "mass", "time", "volume", "temperature"]
                    }
                }
            };
        }

        convert(args) {
            const val = parseFloat(args.VALUE);
            const from = args.FROM.toLowerCase();
            const to = args.TO.toLowerCase();

            if (from === to) return val;

            if (["c", "f", "k"].includes(from) || ["c", "f", "k"].includes(to)) {
                return convertTemperature(val, from, to);
            }

            for (const category in units) {
                const cat = units[category];
                if (!cat.special && from in cat.units && to in cat.units) {
                    const base = val * cat.units[from];
                    return base / cat.units[to];
                }
            }
            return NaN;
        }

        getUnits(args) {
            const cat = units[args.CATEGORY];
            if (!cat) return "";
            if (cat.special) return "C, F, K";
            return Object.keys(cat.units).join(", ");
        }

        isValidUnit(args) {
            const cat = units[args.CATEGORY];
            if (!cat) return false;
            if (cat.special) return ["c", "f", "k"].includes(args.UNIT.toLowerCase());
            return args.UNIT.toLowerCase() in cat.units;
        }
    }

    Scratch.extensions.register(new UnitConverter());
})();
