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
// Made by AskingAcake, QR Code

(function () {
    const BlockType = Scratch.BlockType;
    const ArgumentType = Scratch.ArgumentType;

    const QRCodeLibURL = 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js';
    const QRReaderLibURL = 'https://cdn.jsdelivr.net/npm/jsqr/dist/jsQR.js';

    class QRCodeExtension {
        constructor() {
            this.qrSize = 128;
            this.qrCanvas = null;
            this.lastQRText = "";
            this._loadLibraries();
        }

        getInfo() {
            return {
                id: "qrcode",
                name: "QR Code",
                color1: "#00cec9",
                blocks: [
                    {
                        opcode: "generateQR",
                        blockType: BlockType.COMMAND,
                        text: "generate QR from [TEXT]",
                        arguments: {
                            TEXT: { type: ArgumentType.STRING, defaultValue: "https://penguinmod.com" }
                        }
                    },
                    {
                        opcode: "clearQR",
                        blockType: BlockType.COMMAND,
                        text: "clear QR code"
                    },
                    {
                        opcode: "setQRSize",
                        blockType: BlockType.COMMAND,
                        text: "set QR size to [SIZE]",
                        arguments: {
                            SIZE: { type: ArgumentType.NUMBER, defaultValue: 128 }
                        }
                    },
                    {
                        opcode: "generateQRAsDataURL",
                        blockType: BlockType.REPORTER,
                        text: "generate QR from [TEXT] as dataurl",
                        arguments: {
                            TEXT: { type: ArgumentType.STRING, defaultValue: "Hello world" }
                        }
                    },
                    {
                        opcode: "scanQRFromImage",
                        blockType: BlockType.HAT,
                        text: "when QR is scanned from image"
                    },
                    {
                        opcode: "scannedQRText",
                        blockType: BlockType.REPORTER,
                        text: "last scanned QR text"
                    }
                ]
            };
        }

        async _loadLibraries() {
            if (!window.QRCode) {
                const script = document.createElement('script');
                script.src = QRCodeLibURL;
                document.head.appendChild(script);
            }
            if (!window.jsQR) {
                const script = document.createElement('script');
                script.src = QRReaderLibURL;
                document.head.appendChild(script);
            }
        }

        async generateQR(args) {
            await this._loadLibraries();

            if (!this.qrCanvas) {
                this.qrCanvas = document.createElement('canvas');
                this.qrCanvas.style.position = "absolute";
                this.qrCanvas.style.left = "10px";
                this.qrCanvas.style.top = "10px";
                this.qrCanvas.style.zIndex = 1000;
                document.body.appendChild(this.qrCanvas);
            }

            this.qrCanvas.width = this.qrSize;
            this.qrCanvas.height = this.qrSize;

            window.QRCode.toCanvas(this.qrCanvas, args.TEXT, {
                width: this.qrSize
            }, err => {
                if (err) console.error("QR error:", err);
            });
        }

        clearQR() {
            if (this.qrCanvas) {
                document.body.removeChild(this.qrCanvas);
                this.qrCanvas = null;
            }
        }

        setQRSize(args) {
            this.qrSize = Number(args.SIZE);
        }

        async generateQRAsDataURL(args) {
            await this._loadLibraries();

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.qrSize;
            tempCanvas.height = this.qrSize;

            await new Promise((resolve, reject) => {
                window.QRCode.toCanvas(tempCanvas, args.TEXT, {
                    width: this.qrSize
                }, err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return tempCanvas.toDataURL("image/png");
        }

        scanQRFromImage() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";

            input.onchange = () => {
                const file = input.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = e => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);

                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = window.jsQR(imageData.data, canvas.width, canvas.height);

                        if (code) {
                            this.lastQRText = code.data;
                            Scratch.vm.runtime.startHats("qrcode_scanQRFromImage");
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            };

            input.click();
        }

        scannedQRText() {
            return this.lastQRText || "";
        }
    }

    Scratch.extensions.register(new QRCodeExtension());
})();
