setTimeout(function() {
            let toolSelect = document.querySelector("#toolsDiv > div:nth-child(1) > span > select:nth-child(2)");
            if (toolSelect) {
                toolSelect.appendChild(new Option("Eager Judge", "timer_beep"));

                toolSelect.addEventListener("change", function(event    ) {
                    if (toolSelect.value == "timer_beep") {
                        showTimerBeepTool();
                    }
                });

                function showTimerBeepTool() {
                    //TODO: Ff iets met die breedte fixen want dit is lelijk
                    let toolContent = `
                        <div style="padding: 20px; width: 100%">
                            <label for="beepDelay">Eager Judge Average Delay (seconds): <span id="beepDelayValue">0.0</span></label>
                            <input type="range" id="beepDelay" min="4" max="20" value="0" step="0.1" style="width: 60%;">
                            <br/>
                            <label for="enableAlgCountBased">Enable Alg-Count Based Timing (UF/UFR only)</label>
                            <input type="checkbox" id="enableAlgCountBased" name="algCountBased">
                            
                        </div>
                    `;

                    let toolsDivContent = document.querySelector("#toolsDiv > div:nth-child(1) > div");
                    if (toolsDivContent) {
                        toolsDivContent.innerHTML = toolContent;

                        let beepDelaySlider = document.getElementById('beepDelay');
                        let beepDelayValueDisplay = document.getElementById('beepDelayValue');

                        let displayValue = beepDelaySlider.value
                        if (displayValue.length === 1) {
                            displayValue = displayValue + ".0"
                        }
                        beepDelayValueDisplay.textContent = displayValue;

                        beepDelaySlider.addEventListener('input', function() {
                            let displayValue = beepDelaySlider.value
                            if (displayValue.length === 1) {
                                displayValue = displayValue + ".0"
                            }
                            beepDelayValueDisplay.textContent = displayValue;
                        });

                        // check();

                        // monitorTimer();
                        monitorTimer2();
                    }
                }

                let alreadyBeeped = false;

                function monitorTimer2() {
                    const checkInterval = setInterval(() => {

                        const currentTime = timer.getCurTime(); // Get current timer time
                        let beepDelaySlider = document.getElementById('beepDelay');
                        let algBasedTime = document.getElementById('enableAlgCountBased');

                        if (beepDelaySlider) {
                            let beepValue = parseFloat(beepDelaySlider.value)

                            if (algBasedTime.checked) {
                                let algCount = getAlgCount()

                                beepValue = 0.5 + (algCount/10.26) * (beepValue-0.5)
                            }

                            beepValue = beepValue * 1000

                            if (currentTime >= beepValue && beepValue !== 0.0 && !alreadyBeeped) {
                                playBeep();
                                alreadyBeeped = true;
                                console.log("Target time reached:", beepValue, "milliseconds!");
                                // Trigger your action here
                            } else if (alreadyBeeped && currentTime === 0) {
                                alreadyBeeped = false;
                            }
                        }
                    }, 100)
                }
            }
        }, 2000)

function playBeep() {
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // Frequency in Hz
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1); // Beep duration in seconds
}




let scheme = 'CJM DIF ARE BQN VKP ULG XSH WTO BM CI DE AQ VO UK XG WS JP LF RH TN'
let cbuff = 0
let ebuff = 1
let order = '012345670123456789ab'

function getAlgCount(test) {
    let state = cubeutil.getScrambledState(tools.getCurScramble());

    if (test) {
        state = cubeutil.getScrambledState(['333ni', test, 0])
    }

    //TODO: Add custom buffers
    let bldCode = getBLDcode(state, scheme, cbuff, ebuff, order)
    let corners = bldCode[0]
    let edges = bldCode[1]
    let cCount = corners.filter(entry => entry !== " ").length;
    let eCount = edges.filter(entry => entry !== " ").length;
    let totalAlgCount = Math.ceil((cCount + eCount) / 2)

    //Account for corner twists
    let tcCount = 0;
    let totalTwist = 0;

    for (let i = 0; i < 8; i++) {
        if (i === cbuff) {
            continue
        }

        let z = state.ca[i];
        if (z % 8 !== i || z === i) {
            continue
        }

        tcCount++;

        if (z - 16 < 0) {
            totalTwist += 1
        } else {
            totalTwist += 2
        }
    }

    //For every corner twist 1 alg has been added by CStimer
    totalAlgCount -= tcCount;

    if (totalTwist % 3 !== 0) {
        tcCount += 1
    }
    totalAlgCount += Math.ceil(tcCount / 2)

    //Account for edge flips
    let feCount = 0;

    for (let i = 0; i < 12; i++) {
        if (i === ebuff) {
            continue
        }

        let z = state.ea[i];
        if (!(z % 2 === 1 && z-1 === (i*2))) {
            continue
        }


        feCount++;
    }
    totalAlgCount -= feCount

    if (feCount % 2 === 1) {
        feCount++
    }

    totalAlgCount += Math.ceil(feCount / 4)

    // console.log(totalAlgCount)
    return totalAlgCount
}

/**
 * Copied from cstimer's tools/bldheper.js
 */
function getBLDcode(c, scheme, cbuf, ebuf, order) {
    var cori = ~~(cbuf / 8);
    cbuf %= 8;
    cori ^= (0xa5 >> cbuf & 0x1) * 3;
    var eori = ~~(ebuf / 12);
    ebuf %= 12;
    var corns = [];
    var corders = [];
    for (var i = 0; i < 8; i++) {
        corns[i] = scheme.slice(i * 4, i * 4 + 3);
        corders[i] = parseInt(order[i], 24);
    }

    var ccode = [];
    var ecode = [];
    var cc = new mathlib.CubieCube();
    cc.init(c.ca, c.ea);


    var done = 1 << cbuf;
    for (var i = 0; i < 8; i++) {
        if (cc.ca[i] == i) {
            done |= 1 << i;
        }
    }
    while (done != 0xff) {
        var target = cc.ca[cbuf] & 0x7;
        if (target == cbuf) { // buffer in place, swap with any unsolved
            var perm = -1;
            while (done >> (corders[++perm] % 8) & 1) {}
            perm = corders[perm];
            var ori = ~~(perm / 8);
            perm = perm % 8;
            ori ^= (0xa5 >> perm & 0x1) * 3;
            mathlib.circle(cc.ca, perm, cbuf);
            cc.ca[perm] = (cc.ca[perm] + ((6 + ori - cori) << 3)) % 24;
            cc.ca[cbuf] = (cc.ca[cbuf] + ((6 - ori + cori) << 3)) % 24;
            ccode.push((6 - ori + cori) % 3 * 8 + perm);
            continue;
        }
        ccode.push(cc.ca[cbuf]);
        cc.ca[cbuf] = (cc.ca[target] + (cc.ca[cbuf] & 0xf8)) % 24;
        cc.ca[target] = target;
        done |= 1 << target;
    }


    var ret = [[], []];
    for (var i = 0; i < ccode.length; i++) {
        var val = ccode[i] & 0x7;
        var ori = (6 - (ccode[i] >> 3) + cori) % 3;
        ori ^= (0xa5 >> val & 0x1) * 3;
        ret[0].push(corns[val].charAt(ori % 3));
        if (i % 2 == 1) {
            ret[0].push(' ');
        }
    }

    //Edges
    var edges = [];
    var eorders = [];
    for (var i = 0; i < 12; i++) {
        edges[i] = scheme.slice(32 + i * 3, 32 + i * 3 + 2);
        eorders[i] = parseInt(order[i + 8], 24);
    }

    //Do PseudoSwap
    if (ret[0][ret[0].length - 1] !== ' ') {
        let [firstIndex, secondIndex] = [-1, -1];
        let [isMissFirst, isMissSecond] = [false, false];

        cc.ea.forEach((val, i) => {
            if (val / 2 < 2) {
                if (firstIndex === -1) {
                    if (val % 2 === 1) {
                        cc.ea[i]--;
                        isMissFirst = true;
                    }
                    firstIndex = i;
                } else if (secondIndex === -1) {
                    if (val % 2 === 1) {
                        cc.ea[i]--;
                        isMissSecond = true;
                    }
                    secondIndex = i;
                }
            }
        });

        [cc.ea[firstIndex], cc.ea[secondIndex]] = [cc.ea[secondIndex], cc.ea[firstIndex]];

        if (isMissFirst) cc.ea[firstIndex]++;
        if (isMissSecond) cc.ea[secondIndex]++;
    }

    done = 1 << ebuf;
    for (var i = 0; i < 12; i++) {
        if (cc.ea[i] == i * 2) {
            done |= 1 << i;
        }
    }
    while (done != 0xfff) {
        var target = cc.ea[ebuf] >> 1;
        if (target == ebuf) { // buffer in place, swap with any unsolved
            var perm = -1;
            while (done >> (eorders[++perm] % 12) & 1) {}
            perm = eorders[perm];
            var ori = ~~(perm / 12) ^ eori;
            perm = perm % 12;
            mathlib.circle(cc.ea, perm, ebuf);
            cc.ea[perm] ^= ori;
            cc.ea[ebuf] ^= ori;
            ecode.push(perm * 2 + ori);
            continue;
        }
        ecode.push(cc.ea[ebuf]);
        cc.ea[ebuf] = cc.ea[target] ^ (cc.ea[ebuf] & 1);
        cc.ea[target] = target << 1;
        done |= 1 << target;
    }

    for (var i = 0; i < ecode.length; i++) {
        var val = ecode[i] ^ eori;
        ret[1].push(edges[val >> 1].charAt(val & 1));
        if (i % 2 == 1) {
            ret[1].push(' ');
        }
    }

    return ret;
}

function check() {
    let arr = checkAlgs.split("\n")
    let count = 0;
    let total = 0;

    for (let i = 0; i < arr.length; i++) {
        count++

        let scramble = arr[i].split(". ")[1]
        total += getAlgCount(scramble)

    }
    console.log(count)
    console.log(total / count)
}

let checkAlgs = ``
