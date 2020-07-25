const { Extension, log, INPUT_METHOD, PLATFORMS } = require('deckboard-kit');
const prompt = require('electron-prompt');
const fs = require('fs');
const path = require('path');
const { getDocumentsFolder } = require('platform-folders');

class WinLoseCounter {

    constructor() {
        this.win = 0;
        this.lose = 0;
    }

    doWin() {
        this.win++;
    }

    doLose() {
        this.lose++;
    }

    resetCounter() {
        this.win = 0;
        this.lose = 0;
    }

    setCounter(win, lose) {
        this.win = win;
        this.lose = lose;
    }

    printResult() {
        return `${this.win} - ${this.lose}`;
    }
}
class PowerControlExtension extends Extension {
    constructor() {
        super();

        this.setupCounter();

        this.name = 'Win Lose Remote';
        this.platforms = [PLATFORMS.WINDOWS, PLATFORMS.MAC];
        this.inputs = [
            {
                label: 'Win',
                value: 'win',
                icon: 'thumbs-up',
                color: '#008013',

            }, {
                label: 'Lose',
                value: 'lose',
                icon: 'thumbs-down',
                color: '#800011',

            }, {
                label: 'Reset',
                value: 'reset',
                icon: 'trash',
                color: '#27275c',

            }, {
                label: 'Set',
                value: 'set',
                icon: 'edit',
                color: '#27275c',

            }
        ];
    }

    setupCounter() {
        const winloseFolder = path.join(getDocumentsFolder(), "WinLoseCounter");

        if (!fs.existsSync(winloseFolder)) {
            fs.mkdirSync(winloseFolder, { recursive: true });
        }

        this.counterFile = path.join(winloseFolder, "counter.txt")
        this.winlosecounter = new WinLoseCounter()

        if (!fs.existsSync(this.counterFile)) {
            this.writeCounterFile()
        }

        this.readCounterFile()
    }

    writeCounterFile() {
        fs.writeFile(this.counterFile, this.winlosecounter.printResult(), (err) => {
            if (err) {
                throw err
            }
        });
    }

    readCounterFile() {
        fs.readFile(this.counterFile, "utf-8", (err, data) => {
            if (err) {
                throw err;
            }

            const win = data.split(" - ")[0];
            const lose = data.split(" - ")[1];
            this.winlosecounter.setCounter(win, lose)
        });
    }

    execute(action, { powerAction, confirmation = true }) {
        log.info(`${action} ${powerAction}`);

        switch (action) {
            case 'win':
                this.winlosecounter.doWin();
                this.writeCounterFile()
                break;
            case 'lose':
                this.winlosecounter.doLose();
                this.writeCounterFile()
                break;
            case 'reset':
                this.winlosecounter.resetCounter();
                this.writeCounterFile()
                break;
            case 'set':
                prompt({
                    title: 'Set',
                    label: 'WIN-LOSE',
                    value: '0-0',
                    type: 'input'
                })
                    .then((r) => {
                        if (r === null) {
                            console.log('user cancelled');
                        } else {
                            const m = r.split("-");
                            this.winlosecounter.setCounter(+m[0], +m[1])
                            this.writeCounterFile()
                        }
                    })
                    .catch(console.error);
                break;
            default:
                break;
        }
    }
}

module.exports = new PowerControlExtension();
