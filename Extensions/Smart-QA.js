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
//
// Made by AskingAcake, Smart QA

(function () {
    const BlockType = Scratch.BlockType;
    const ArgumentType = Scratch.ArgumentType;

    class SmartQA {
        constructor() {
            this.content = "";
            this.lastVar = "";
            this.explanationLevel = "medium";
        }

        getInfo() {
            return {
                id: "smartqa",
                name: "Smart QA",
                color1: "#6c5ce7",
                blocks: [
                    {
                        opcode: "loadTextForQA",
                        blockType: BlockType.HAT,
                        text: "load text for QA"
                    },
                    {
                        opcode: "lastLoadedQAContent",
                        blockType: BlockType.REPORTER,
                        text: "last loaded QA content"
                    },
                    {
                        opcode: "askQuestion",
                        blockType: BlockType.REPORTER,
                        text: "ask [QUESTION] to loaded text",
                        arguments: {
                            QUESTION: { type: ArgumentType.STRING, defaultValue: "What is this about?" }
                        }
                    },
                    {
                        opcode: "explainText",
                        blockType: BlockType.REPORTER,
                        text: "explain [TEXT]",
                        arguments: {
                            TEXT: { type: ArgumentType.STRING, defaultValue: "Newton's laws" }
                        }
                    },
                    {
                        opcode: "explainLoadedText",
                        blockType: BlockType.REPORTER,
                        text: "explain the loaded text"
                    },
                    {
                        opcode: "setQAContent",
                        blockType: BlockType.COMMAND,
                        text: "set text for QA to [TEXT]",
                        arguments: {
                            TEXT: { type: ArgumentType.STRING, defaultValue: "https://example.com/data.txt or raw text" }
                        }
                    },
                    {
                        opcode: "setExplanationLevel",
                        blockType: BlockType.COMMAND,
                        text: "set explanation to [LEVEL]",
                        arguments: {
                            LEVEL: {
                                type: ArgumentType.STRING,
                                menu: "explanationLevels",
                                defaultValue: "medium"
                            }
                        }
                    }
                ],
                menus: {
                    explanationLevels: {
                        acceptReporters: true,
                        items: [
                            "very simple",
                            "simple",
                            "very easy",
                            "easy",
                            "not easy",
                            "a bit medium",
                            "medium",
                            "a bit hard",
                            "hard",
                            "very hard",
                            "hardest",
                            "a bit detailed",
                            "detailed",
                            "closest details"
                        ]
                    }
                }
            };
        }

        loadTextForQA() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".txt";
            input.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => {
                    this.content = reader.result;
                    Scratch.vm.runtime.startHats("smartqa_loadTextForQA");
                };
                reader.readAsText(file);
            };
            input.click();
        }

        lastLoadedQAContent() {
            return this.content;
        }

        askQuestion(args) {
            const question = args.QUESTION.toLowerCase();
            if (!this.content) return "No content loaded.";

            // Simple matching by finding the closest line with overlap
            const lines = this.content.split(/\n/);
            let bestLine = "";
            let maxMatches = 0;

            for (const line of lines) {
                const matches = line.toLowerCase().split(/\s+/).filter(word => question.includes(word)).length;
                if (matches > maxMatches) {
                    bestLine = line;
                    maxMatches = matches;
                }
            }

            return bestLine || "I couldn't find anything relevant.";
        }

        explainText(args) {
            return this._explain(args.TEXT);
        }

        explainLoadedText() {
            return this._explain(this.content);
        }

        setQAContent(args) {
            const txt = args.TEXT;
            if (txt.startsWith("http") && txt.includes("://")) {
                fetch(txt)
                    .then(res => res.text())
                    .then(data => this.content = data)
                    .catch(() => this.content = "Failed to fetch content.");
            } else {
                this.content = txt;
            }
        }

        setExplanationLevel(args) {
            this.explanationLevel = args.LEVEL;
        }

        _explain(text) {
            if (!text) return "No text provided.";
            const level = this.explanationLevel.toLowerCase();
            const summary = text.split(/\n/).slice(0, 3).join(" ").slice(0, 250); // very basic summary

            switch (level) {
                case "very simple":
                case "very easy":
                    return "This is about: " + summary.toLowerCase();
                case "simple":
                case "easy":
                    return "In short, this means: " + summary;
                case "not easy":
                case "a bit medium":
                    return "To understand this, know that: " + summary;
                case "medium":
                    return "Here's a summary: " + summary;
                case "a bit hard":
                case "hard":
                    return "Analyzing it closely, it says: " + summary;
                case "very hard":
                case "hardest":
                    return "This content discusses, in detail: " + summary;
                case "a bit detailed":
                case "detailed":
                case "closest details":
                    return "Full detail preview: " + text.slice(0, 500);
                default:
                    return "Here's what I found: " + summary;
            }
        }
    }

    Scratch.extensions.register(new SmartQA());
})();
