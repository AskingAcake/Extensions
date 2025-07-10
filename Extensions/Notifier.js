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

// Made by AskingAcake, Notifier

(function(Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must be run unsandboxed');
    }

    const BlockType = Scratch.BlockType;
    const ArgumentType = Scratch.ArgumentType;

    class SystemNotifier {
        getInfo() {
            return {
                id: 'systemnotifier',
                name: 'System Notifier',
                blocks: [
                    {
                        opcode: 'requestPermission',
                        blockType: BlockType.COMMAND,
                        text: 'ask permission for notifications'
                    },
                    {
                        opcode: 'sendBasic',
                        blockType: BlockType.COMMAND,
                        text: 'send notification title [TITLE] body [BODY]',
                        arguments: {
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hi!' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message' }
                        }
                    },
                    {
                        opcode: 'sendAndWait',
                        blockType: BlockType.COMMAND,
                        text: 'send notification and wait title [TITLE] body [BODY]',
                        arguments: {
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hi!' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message' }
                        }
                    },
                    {
                        opcode: 'sendWithImage',
                        blockType: BlockType.COMMAND,
                        text: 'send notification with image [IMG] title [TITLE] body [BODY]',
                        arguments: {
                            IMG: { type: ArgumentType.STRING, defaultValue: 'https://example.com/icon.png' },
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hi!' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message' }
                        }
                    },
                    {
                        opcode: 'sendWithSound',
                        blockType: BlockType.COMMAND,
                        text: 'send notification with sound [SND] title [TITLE] body [BODY]',
                        arguments: {
                            SND: { type: ArgumentType.STRING, defaultValue: 'https://example.com/notify.mp3' },
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hi!' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message' }
                        }
                    },
                    {
                        opcode: 'sendWithImageSound',
                        blockType: BlockType.COMMAND,
                        text: 'send notification with image [IMG] and sound [SND] title [TITLE] body [BODY]',
                        arguments: {
                            IMG: { type: ArgumentType.STRING, defaultValue: 'https://example.com/icon.png' },
                            SND: { type: ArgumentType.STRING, defaultValue: 'https://example.com/notify.mp3' },
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hi!' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message' }
                        }
                    },
                    {
                        opcode: 'sendWithImageSoundLong',
                        blockType: BlockType.COMMAND,
                        text: 'send long notification with image [IMG] and sound [SND] title [TITLE] body [BODY] for [SECS] secs',
                        arguments: {
                            IMG: { type: ArgumentType.STRING, defaultValue: 'https://example.com/icon.png' },
                            SND: { type: ArgumentType.STRING, defaultValue: 'https://example.com/notify.mp3' },
                            TITLE: { type: ArgumentType.STRING, defaultValue: 'Hi!' },
                            BODY: { type: ArgumentType.STRING, defaultValue: 'Message' },
                            SECS: { type: ArgumentType.NUMBER, defaultValue: 5 }
                        }
                    }
                ]
            };
        }

        requestPermission() {
            if ('Notification' in window) {
                Notification.requestPermission();
            }
        }

        sendBasic({ TITLE, BODY }) {
            if (Notification.permission === 'granted') {
                new Notification(TITLE, { body: BODY });
            }
        }

        async sendAndWait({ TITLE, BODY }) {
            if (Notification.permission === 'granted') {
                new Notification(TITLE, { body: BODY });
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        sendWithImage({ IMG, TITLE, BODY }) {
            if (Notification.permission === 'granted') {
                new Notification(TITLE, {
                    body: BODY,
                    icon: IMG
                });
            }
        }

        sendWithSound({ SND, TITLE, BODY }) {
            if (Notification.permission === 'granted') {
                new Notification(TITLE, { body: BODY });
                const audio = new Audio(SND);
                audio.play();
            }
        }

        sendWithImageSound({ IMG, SND, TITLE, BODY }) {
            if (Notification.permission === 'granted') {
                new Notification(TITLE, {
                    body: BODY,
                    icon: IMG
                });
                const audio = new Audio(SND);
                audio.play();
            }
        }

        async sendWithImageSoundLong({ IMG, SND, TITLE, BODY, SECS }) {
            if (Notification.permission === 'granted') {
                new Notification(TITLE, {
                    body: BODY,
                    icon: IMG
                });
                const audio = new Audio(SND);
                audio.play();
                await new Promise(r => setTimeout(r, SECS * 1000));
            }
        }
    }

    Scratch.extensions.register(new SystemNotifier());
})(Scratch);
