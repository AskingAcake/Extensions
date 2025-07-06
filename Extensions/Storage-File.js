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

// Made by AskingAcake, Storage File

(function () {
    const BlockType = Scratch.BlockType;
    const ArgumentType = Scratch.ArgumentType;

    class StorageFile {
        constructor() {
            this.files = {};
            this.lastLoaded = null;
        }

        getInfo() {
            return {
                id: "storagefile",
                name: "Storage File",
                color1: "#2d3436",
                blocks: [
                    {
                        opcode: "saveFile",
                        blockType: BlockType.COMMAND,
                        text: "save data [DATA] as filename [NAME] as file [EXT]",
                        arguments: {
                            DATA: { type: ArgumentType.STRING, defaultValue: "Hello World" },
                            NAME: { type: ArgumentType.STRING, defaultValue: "example" },
                            EXT: { type: ArgumentType.STRING, defaultValue: "txt" }
                        }
                    },
                    {
                        opcode: "loadFile",
                        blockType: BlockType.HAT,
                        text: "load file as [VAR]",
                        isEdgeActivated: false,
                        arguments: {
                            VAR: { type: ArgumentType.STRING, defaultValue: "loadedText" }
                        }
                    },
                    {
                        opcode: "viewData",
                        blockType: BlockType.REPORTER,
                        text: "view data of file [FILENAME]",
                        arguments: {
                            FILENAME: { type: ArgumentType.STRING, defaultValue: "example.txt" }
                        }
                    },
                    {
                        opcode: "renameFile",
                        blockType: BlockType.COMMAND,
                        text: "rename filename [OLD] as [NEW]",
                        arguments: {
                            OLD: { type: ArgumentType.STRING, defaultValue: "example.txt" },
                            NEW: { type: ArgumentType.STRING, defaultValue: "renamed.txt" }
                        }
                    },
                    {
                        opcode: "renameData",
                        blockType: BlockType.COMMAND,
                        text: "rename data of file [FILENAME] as [NEWDATA]",
                        arguments: {
                            FILENAME: { type: ArgumentType.STRING, defaultValue: "example.txt" },
                            NEWDATA: { type: ArgumentType.STRING, defaultValue: "Updated content" }
                        }
                    },
                    {
                        opcode: "deleteFile",
                        blockType: BlockType.COMMAND,
                        text: "delete file named [FILENAME]",
                        arguments: {
                            FILENAME: { type: ArgumentType.STRING, defaultValue: "example.txt" }
                        }
                    }
                ]
            };
        }

        saveFile(args) {
            const fullName = args.NAME + "." + args.EXT;
            localStorage.setItem("file:" + fullName, args.DATA);
        }

        loadFile(args) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "*/*";
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => {
                    this.files[args.VAR] = reader.result;
                    this.lastLoaded = args.VAR;
                    Scratch.vm.runtime.startHats("storagefile_loadFile", {
                        VAR: args.VAR
                    });
                };
                reader.readAsText(file);
            };
            input.click();
        }

        viewData(args) {
            return localStorage.getItem("file:" + args.FILENAME) || "";
        }

        renameFile(args) {
            const oldKey = "file:" + args.OLD;
            const newKey = "file:" + args.NEW;
            const content = localStorage.getItem(oldKey);
            if (content !== null) {
                localStorage.setItem(newKey, content);
                localStorage.removeItem(oldKey);
            }
        }

        renameData(args) {
            const key = "file:" + args.FILENAME;
            if (localStorage.getItem(key) !== null) {
                localStorage.setItem(key, args.NEWDATA);
            }
        }

        deleteFile(args) {
            localStorage.removeItem("file:" + args.FILENAME);
        }
    }

    Scratch.extensions.register(new StorageFile());
})();
