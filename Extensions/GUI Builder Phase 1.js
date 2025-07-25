/*
MIT License

Copyright (c) 2025 AskingAcake

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "GUI Builder Phase 1" Extension),
to deal in the Extension without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Extension, and to permit persons to whom the Extension is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Extension.

THE EXTENSION IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE EXTENSION OR THE USE OR OTHER DEALINGS
IN THE EXTENSION.
*/

// NOTICE
// This is phase 1, the most simplest GUI builder, aside with less capabilities
// This can be used for simple guis
// Aka panels for fun
// If you want smh even better and complex check out
// Marketplace.js
// Please leave a comment for suggestions
// It took me days

(() => {
class GUIBuilderPhase1 {
    constructor() {
        this.builderOpen = false;
        this.builder = null;
        this.canvas = null;
        this.guiContainer = null;
        this.currentDesign = { width: 600, height: 400, widgets: [] };
        this.currentDesignJSON = JSON.stringify(this.currentDesign);
        this.currentDesignDataURL = "data:text/json;base64," + btoa(this.currentDesignJSON);
        this.snapToGrid = true;
        this.gridSize = 10;
        this.dragging = null;
        this.dragOffset = { x: 0, y: 0 };
        this.resizing = false;
        this.instances = {};
    }

    getInfo() {
        return {
            id: "guibuilderphase1",
            name: "GUI Builder Phase 1",
            blocks: [
                { opcode: "openBuilder", blockType: "command", text: "open GUI builder" },
                { opcode: "closeBuilder", blockType: "command", text: "close GUI builder" },
                { opcode: "exportDataURL", blockType: "command", text: "export design as dataurl" },
                { opcode: "exportJSON", blockType: "command", text: "export design as json" },
                { opcode: "currentDataURL", blockType: "reporter", text: "current gui dataurl" },
                { opcode: "currentJSON", blockType: "reporter", text: "current gui json" },
                { opcode: "importGUI", blockType: "command", text: "import GUI with [DATA] id [ID]", arguments: { DATA: { type: "string" }, ID: { type: "string" } } },
                { opcode: "showGUI", blockType: "command", text: "show gui [ID] visible [V]", arguments: { ID: { type: "string" }, V: { type: "boolean", defaultValue: true } } },
                { opcode: "destroyGUI", blockType: "command", text: "destroy gui [ID]", arguments: { ID: { type: "string" } } },
                { opcode: "lastClickedButton", blockType: "reporter", text: "last clicked button in gui [ID]", arguments: { ID: { type: "string" } } },
                { opcode: "buttonClicked", blockType: "Boolean", text: "button [NAME] clicked in gui [ID]?", arguments: { NAME: { type: "string" }, ID: { type: "string" } } }
            ]
        };
    }

    openBuilder() {
        if (this.builderOpen) return;
        this.builderOpen = true;

        this.builder = document.createElement("div");
        Object.assign(this.builder.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "#222",
            color: "#fff",
            zIndex: "99999",
            display: "flex",
            flexDirection: "row",
            fontFamily: "Arial, sans-serif"
        });

        const sidebar = document.createElement("div");
        Object.assign(sidebar.style, {
            width: "220px",
            background: "#333",
            padding: "10px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
        });

        const title = document.createElement("div");
        title.innerText = "Widgets";
        title.style.fontWeight = "bold";
        sidebar.appendChild(title);

        ["Button", "Label", "Input", "Image"].forEach(type => {
            const b = document.createElement("button");
            b.innerText = "Add " + type;
            b.style.width = "100%";
            b.onclick = () => this.addWidget(type.toLowerCase());
            sidebar.appendChild(b);
        });

        const exportClose = document.createElement("button");
        exportClose.innerText = "Export & Close";
        exportClose.style.marginTop = "auto";
        exportClose.onclick = () => { this.exportJSON(); this.exportDataURL(); this.closeBuilder(); };
        sidebar.appendChild(exportClose);

        this.canvas = document.createElement("div");
        Object.assign(this.canvas.style, { flex: "1", background: "#555", position: "relative", overflow: "auto" });

        // GUI container preview
        this.guiContainer = document.createElement("div");
        Object.assign(this.guiContainer.style, {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            border: "2px solid #000",
            width: this.currentDesign.width + "px",
            height: this.currentDesign.height + "px",
            boxSizing: "border-box",
            overflow: "hidden"
        });
        this.guiContainer.addEventListener("mousedown", e => this.onCanvasMouseDown(e));
        this.guiContainer.addEventListener("mouseup", e => this.onCanvasMouseUp(e));
        this.guiContainer.addEventListener("mousemove", e => this.onCanvasMouseMove(e));

        // Resizer handle
        const resizer = document.createElement("div");
        Object.assign(resizer.style, {
            position: "absolute",
            right: "0",
            bottom: "0",
            width: "16px",
            height: "16px",
            background: "#888",
            cursor: "nwse-resize"
        });
        resizer.addEventListener("mousedown", e => {
            this.resizing = true;
            e.stopPropagation();
            e.preventDefault();
        });
        this.guiContainer.appendChild(resizer);

        document.addEventListener("mouseup", () => this.resizing = false);
        document.addEventListener("mousemove", e => {
            if (this.resizing) {
                const rect = this.guiContainer.getBoundingClientRect();
                const newW = e.clientX - rect.left;
                const newH = e.clientY - rect.top;
                this.currentDesign.width = Math.max(100, newW);
                this.currentDesign.height = Math.max(100, newH);
                this.guiContainer.style.width = this.currentDesign.width + "px";
                this.guiContainer.style.height = this.currentDesign.height + "px";
            }
        });

        this.canvas.appendChild(this.guiContainer);
        this.builder.appendChild(sidebar);
        this.builder.appendChild(this.canvas);
        document.body.appendChild(this.builder);

        this.loadDesignToCanvas();
    }

    closeBuilder() {
        if (!this.builderOpen) return;
        document.body.removeChild(this.builder);
        this.builderOpen = false;
        this.builder = null;
        this.canvas = null;
        this.guiContainer = null;
    }

    addWidget(type) {
        const def = { type, name: this.uniqueName(type), text: type, x: 10, y: 10, url: "" };
        const w = this.createWidgetElement(def);
        this.guiContainer.appendChild(w.el);
        this.currentDesign.widgets.push(def);
    }

    createWidgetElement(def) {
        const el = document.createElement("div");
        el.className = "gui-widget";
        el.dataset.type = def.type;
        el.dataset.name = def.name;
        el.style.position = "absolute";
        el.style.left = def.x + "px";
        el.style.top = def.y + "px";
        el.style.cursor = "move";
        el.style.background = "#ccc";
        el.style.padding = "4px 8px";
        el.style.boxSizing = "border-box";
        if (def.type === "image") {
            const img = document.createElement("img");
            img.src = def.url || "";
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            img.style.pointerEvents = "none";
            el.appendChild(img);
        } else {
            el.innerText = def.text || def.type;
        }
        el.onmousedown = e => {
            this.dragging = el;
            const rect = el.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            e.stopPropagation();
        };
        el.ondblclick = () => {
            const newName = prompt("Widget name/id:", def.name || "");
            if (newName && newName.trim()) {
                def.name = newName.trim();
                el.dataset.name = def.name;
            }
            if (def.type === "image") {
                const newURL = prompt("Image URL:", def.url || "");
                if (newURL !== null) {
                    def.url = newURL;
                    const img = el.querySelector("img");
                    if (img) img.src = def.url;
                }
            } else {
                const newText = prompt("Text:", def.text || "");
                if (newText !== null) {
                    def.text = newText;
                    el.innerText = def.text;
                }
            }
        };
        return { el, def };
    }

    onCanvasMouseDown(e) { this.dragging = null; }

    onCanvasMouseUp(e) {
        if (this.dragging) {
            const rect = this.guiContainer.getBoundingClientRect();
            let x = e.clientX - rect.left - this.dragOffset.x;
            let y = e.clientY - rect.top - this.dragOffset.y;
            if (this.snapToGrid) {
                x = Math.round(x / this.gridSize) * this.gridSize;
                y = Math.round(y / this.gridSize) * this.gridSize;
            }
            this.dragging.style.left = x + "px";
            this.dragging.style.top = y + "px";
            const name = this.dragging.dataset.name;
            const w = this.currentDesign.widgets.find(w => w.name === name);
            if (w) { w.x = x; w.y = y; }
            this.dragging = null;
        }
    }

    onCanvasMouseMove(e) {
        if (this.dragging) {
            const rect = this.guiContainer.getBoundingClientRect();
            let x = e.clientX - rect.left - this.dragOffset.x;
            let y = e.clientY - rect.top - this.dragOffset.y;
            this.dragging.style.left = x + "px";
            this.dragging.style.top = y + "px";
        }
    }

    exportDataURL() {
        this.exportJSON();
        this.currentDesignDataURL = "data:text/json;base64," + btoa(this.currentDesignJSON);
    }

    exportJSON() {
        const widgets = [...this.guiContainer.querySelectorAll(".gui-widget")].map(el => {
            const type = el.dataset.type;
            const name = el.dataset.name;
            const x = parseInt(el.style.left) || 0;
            const y = parseInt(el.style.top) || 0;
            if (type === "image") {
                const img = el.querySelector("img");
                return { type, name, x, y, url: img ? img.src : "" };
            } else {
                return { type, name, x, y, text: el.innerText };
            }
        });
        this.currentDesign.widgets = widgets;
        this.currentDesignJSON = JSON.stringify(this.currentDesign);
    }

    currentDataURL() { return this.currentDesignDataURL; }
    currentJSON() { return this.currentDesignJSON; }

    importGUI(args) {
        let obj;
        try {
            if (args.DATA.startsWith("data:")) {
                const base64 = args.DATA.split(",")[1] || "";
                obj = JSON.parse(decodeURIComponent(escape(atob(base64))));
            } else {
                obj = JSON.parse(args.DATA);
            }
        } catch (e) { return; }

        const root = document.createElement("div");
        Object.assign(root.style, {
            position: "absolute",
            left: "50px",
            top: "50px",
            width: obj.width + "px",
            height: obj.height + "px",
            background: "#ffffff",
            border: "1px solid #aaa",
            borderRadius: "6px",
            overflow: "hidden",
            zIndex: "9999"
        });

        const header = document.createElement("div");
        header.style.background = "#4c8bf5";
        header.style.color = "#fff";
        header.style.padding = "6px 10px";
        header.style.cursor = "move";
        header.innerText = args.ID;
        root.appendChild(header);

        const canvas = document.createElement("div");
        canvas.style.position = "relative";
        canvas.style.width = "100%";
        canvas.style.height = "calc(100% - 32px)";
        root.appendChild(canvas);
        document.body.appendChild(root);

        let dragging = false, ox = 0, oy = 0, sx = 0, sy = 0;
        header.addEventListener("mousedown", e => { dragging = true; sx = e.clientX; sy = e.clientY; ox = root.offsetLeft; oy = root.offsetTop; });
        window.addEventListener("mousemove", e => { if (!dragging) return; root.style.left = (ox + (e.clientX - sx)) + "px"; root.style.top = (oy + (e.clientY - sy)) + "px"; });
        window.addEventListener("mouseup", () => dragging = false);

        const lastClicks = { button: "" };
        const widgets = {};
        const ws = obj.widgets || [];
        ws.forEach(w => {
            const el = document.createElement("div");
            el.style.position = "absolute";
            el.style.left = (w.x || 0) + "px";
            el.style.top = (w.y || 0) + "px";
            el.dataset.name = w.name;
            el.dataset.type = w.type;
            if (w.type === "button") {
                const btn = document.createElement("button");
                btn.innerText = w.text || "Button";
                btn.onclick = () => { lastClicks.button = w.name; };
                el.appendChild(btn);
            } else if (w.type === "label") {
                const lbl = document.createElement("div");
                lbl.innerText = w.text || "Label";
                el.appendChild(lbl);
            } else if (w.type === "input") {
                const inp = document.createElement("input");
                inp.type = "text";
                inp.value = w.text || "";
                el.appendChild(inp);
            } else if (w.type === "image") {
                const img = document.createElement("img");
                img.src = w.url || "";
                img.style.maxWidth = "100%";
                img.style.maxHeight = "100%";
                el.appendChild(img);
            }
            canvas.appendChild(el);
            widgets[w.name] = el;
        });
        this.instances[args.ID] = { root, canvas, data: obj, widgets, lastClicks };
    }

    showGUI(args) {
        const inst = this.instances[args.ID];
        if (!inst) return;
        inst.root.style.display = args.V ? "block" : "none";
    }

    destroyGUI(args) {
        const inst = this.instances[args.ID];
        if (!inst) return;
        inst.root.remove();
        delete this.instances[args.ID];
    }

    lastClickedButton(args) {
        const inst = this.instances[args.ID];
        return inst ? inst.lastClicks.button : "";
    }

    buttonClicked(args) {
        const inst = this.instances[args.ID];
        return inst ? inst.lastClicks.button === args.NAME : false;
    }

    loadDesignToCanvas() {
        (this.currentDesign.widgets || []).forEach(w => {
            const el = this.createWidgetElement(w);
            this.guiContainer.appendChild(el.el);
        });
    }

    uniqueName(type) {
        const base = type.toLowerCase();
        let n = 1;
        while (this.currentDesign.widgets.find(x => x.name === base + n)) n++;
        return base + n;
    }
}

Scratch.extensions.register(new GUIBuilderPhase1());
})();
