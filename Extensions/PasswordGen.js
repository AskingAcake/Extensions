(function() {
    const BlockType = Scratch.BlockType;
    const ArgumentType = Scratch.ArgumentType;

    let passwordRules = {
        length: 6,
        numbers: false,
        symbols: false,
        uppercase: false
    };

    const difficultySettings = {
        'super easy':     { length: 4, numbers: false, symbols: false, uppercase: false },
        'easy':           { length: 6, numbers: false, symbols: false, uppercase: false },
        'not easy':       { length: 8, numbers: true,  symbols: false, uppercase: true  },
        'a bit medium':   { length: 10, numbers: true, symbols: true,  uppercase: true  },
        'medium':         { length: 12, numbers: true, symbols: true,  uppercase: true  },
        'a bit hard':     { length: 14, numbers: true, symbols: true,  uppercase: true  },
        'hard':           { length: 16, numbers: true, symbols: true,  uppercase: true  },
        'very hard':      { length: 18, numbers: true, symbols: true,  uppercase: true  },
        'hardest':        { length: 20, numbers: true, symbols: true,  uppercase: true  }
    };

    const SYMBOLS = '!@#$%^&*()_+-={}[]<>?';
    const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
    const NUMBERS = '0123456789';

    function generatePassword(rules) {
        let chars = LETTERS;
        if (rules.uppercase) chars += LETTERS.toUpperCase();
        if (rules.numbers) chars += NUMBERS;
        if (rules.symbols) chars += SYMBOLS;

        let result = '';
        for (let i = 0; i < rules.length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    function getStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        if (password.length >= 16) score++;

        if (score <= 1) return 'weak';
        if (score <= 3) return 'medium';
        return 'strong';
    }

    class PasswordGenerator {
        getInfo() {
            return {
                id: 'passwordgen',
                name: 'Password Generator',
                color1: '#2563eb',
                color2: '#1e40af',
                blocks: [
                    {
                        opcode: 'generateDifficulty',
                        blockType: BlockType.REPORTER,
                        text: 'generate password [LEVEL]',
                        arguments: {
                            LEVEL: {
                                type: ArgumentType.STRING,
                                menu: 'difficultyLevels',
                                defaultValue: 'super easy'
                            }
                        }
                    },
                    {
                        opcode: 'setCustomRules',
                        blockType: BlockType.COMMAND,
                        text: 'set password rules length [LEN] include numbers [NUM] symbols [SYM] uppercase [UP]',
                        arguments: {
                            LEN: { type: ArgumentType.NUMBER, defaultValue: 12 },
                            NUM: { type: ArgumentType.BOOLEAN, defaultValue: true },
                            SYM: { type: ArgumentType.BOOLEAN, defaultValue: true },
                            UP:  { type: ArgumentType.BOOLEAN, defaultValue: true }
                        }
                    },
                    {
                        opcode: 'generateCustomPassword',
                        blockType: BlockType.REPORTER,
                        text: 'generate custom password'
                    },
                    {
                        opcode: 'getCurrentRules',
                        blockType: BlockType.REPORTER,
                        text: 'current password rules'
                    },
                    {
                        opcode: 'resetRules',
                        blockType: BlockType.COMMAND,
                        text: 'reset password rules to default'
                    },
                    {
                        opcode: 'generatePin',
                        blockType: BlockType.REPORTER,
                        text: 'generate pin code [DIGITS] digits',
                        arguments: {
                            DIGITS: { type: ArgumentType.NUMBER, defaultValue: 4 }
                        }
                    },
                    {
                        opcode: 'randomChar',
                        blockType: BlockType.REPORTER,
                        text: 'generate random character from [CHARS]',
                        arguments: {
                            CHARS: { type: ArgumentType.STRING, defaultValue: 'A-Za-z0-9@#$' }
                        }
                    },
                    {
                        opcode: 'testStrength',
                        blockType: BlockType.REPORTER,
                        text: 'test password strength of [PASSWORD]',
                        arguments: {
                            PASSWORD: { type: ArgumentType.STRING, defaultValue: 'abc123' }
                        }
                    }
                ],
                menus: {
                    difficultyLevels: {
                        acceptReporters: true,
                        items: Object.keys(difficultySettings)
                    }
                }
            };
        }

        generateDifficulty(args) {
            const level = args.LEVEL.toLowerCase();
            const rules = difficultySettings[level] || difficultySettings['super easy'];
            return generatePassword(rules);
        }

        setCustomRules(args) {
            passwordRules.length = Math.max(4, args.LEN);
            passwordRules.numbers = args.NUM;
            passwordRules.symbols = args.SYM;
            passwordRules.uppercase = args.UP;
        }

        generateCustomPassword() {
            return generatePassword(passwordRules);
        }

        getCurrentRules() {
            return `length:${passwordRules.length}, numbers:${passwordRules.numbers}, symbols:${passwordRules.symbols}, uppercase:${passwordRules.uppercase}`;
        }

        resetRules() {
            passwordRules = {
                length: 6,
                numbers: false,
                symbols: false,
                uppercase: false
            };
        }

        generatePin(args) {
            let pin = '';
            for (let i = 0; i < args.DIGITS; i++) {
                pin += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
            }
            return pin;
        }

        randomChar(args) {
            const pool = args.CHARS;
            return pool[Math.floor(Math.random() * pool.length)] || '';
        }

        testStrength(args) {
            return getStrength(args.PASSWORD);
        }
    }

    Scratch.extensions.register(new PasswordGenerator());
})();
