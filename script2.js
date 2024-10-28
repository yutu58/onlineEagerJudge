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
                            <label for="beepDelay">Eager Judge Delay (seconds): <span id="beepDelayValue">0.0</span></label>
                            <input type="range" id="beepDelay" min="0" max="20" value="0" step="0.1" style="width: 60%;">
                        </div>
                    `;

                    let toolsDivContent = document.querySelector("#toolsDiv > div:nth-child(1) > div");
                    if (toolsDivContent) {
                        toolsDivContent.innerHTML = toolContent;

                        let beepDelaySlider = document.getElementById('beepDelay');
                        let beepDelayValueDisplay = document.getElementById('beepDelayValue');
                        beepDelayValueDisplay.textContent = beepDelaySlider.value;
                        beepDelaySlider.addEventListener('input', function() {
                            beepDelayValueDisplay.textContent = beepDelaySlider.value;
                        });

                        // monitorTimer();
                        monitorTimer2();
                    }
                }

                let alreadyBeeped = false;

                function monitorTimer2() {
                    const checkInterval = setInterval(() => {

                        const currentTime = timer.getCurTime(); // Get current timer time
                        let beepDelaySlider = document.getElementById('beepDelay');

                        if (beepDelaySlider) {

                            let beepValue = parseFloat(beepDelaySlider.value) * 1000

                            if (currentTime >= beepValue && beepValue !== 0.0 && !alreadyBeeped) {
                                playBeep();
                                alreadyBeeped = true;
                                console.log("Target time reached:", beepValue, "seconds!");
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
