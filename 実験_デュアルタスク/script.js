document.addEventListener('DOMContentLoaded', () => {
    const PLAYER_WIDTH = 35;
    const PLAYER_HEIGHT = 85;
    const FW_ANIMATION_DURATION = 2;
    const TOTAL_TRIALS_PER_CONDITION = 5;
    const field = document.getElementById('field');
    const fw = document.getElementById('fw');
    const df = document.getElementById('df');
    const ball = document.getElementById('ball');
    const instruction = document.getElementById('instruction');
    const redLeftBtn = document.getElementById('red-left-btn');
    const redRightBtn = document.getElementById('red-right-btn');
    const retryBtn = document.getElementById('retry-btn');
    const downloadBtn = document.getElementById('download-btn');
    const judgementButtons = document.getElementById('judgement-buttons');
    const tableBody = document.getElementById('results-table').getElementsByTagName('tbody')[0];

    const passTimings = [
        { t_value: -0.5, correctAnswer: 'red-left-btn' }, { t_value: -0.3, correctAnswer: 'red-left-btn' },
        { t_value: -0.1, correctAnswer: 'red-left-btn' }, { t_value:  0.1, correctAnswer: 'red-right-btn' },
        { t_value:  0.3, correctAnswer: 'red-right-btn' }, { t_value:  0.5, correctAnswer: 'red-right-btn' },
    ];
    const lanes = ['FW', 'DF'];
    const TOTAL_TRIALS = passTimings.length * lanes.length * TOTAL_TRIALS_PER_CONDITION;

    const AUDIO_OFFSET_MS = 250;
    const AUDIO_TIMING_PATTERNS = ['before', 'before', 'after', 'after', 'after'];

    const audio = document.getElementById('audio-cue');

    let allTrials = [];
    let detailedResults = [];
    let currentScenario;
    let answered = false;
    let trialCount = 0;
    let audioPlayed = false;
    let enterPressedTime = null;

    function createTrialList() {
        allTrials = [];
        for (const timing of passTimings) {
            for (const lane of lanes) {
                const audioPatterns = [...AUDIO_TIMING_PATTERNS];
                for (let i = audioPatterns.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [audioPatterns[i], audioPatterns[j]] = [audioPatterns[j], audioPatterns[i]];
                }
                for (let i = 0; i < TOTAL_TRIALS_PER_CONDITION; i++) {
                    allTrials.push({
                        ...timing,
                        lane,
                        audioTiming: audioPatterns[i]
                    });
                }
            }
        }
        for (let i = allTrials.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allTrials[i], allTrials[j]] = [allTrials[j], allTrials[i]];
        }
    }

    function resetUI() {
        judgementButtons.style.visibility = 'hidden';
        retryBtn.style.visibility = 'visible';
        downloadBtn.style.visibility = 'hidden';
        retryBtn.textContent = '挑戦する';
        instruction.textContent = 'ボタンを押して開始してください';
        field.classList.remove('playing');
        ball.style.opacity = 0;
    }

    function prepareScenario() {
        if (trialCount >= TOTAL_TRIALS) return;
        currentScenario = allTrials[trialCount];
        answered = false;
        audioPlayed = false;
        enterPressedTime = null;
        field.classList.remove('playing');
        fw.style.animation = 'none';
        ball.style.opacity = 0;
        document.querySelectorAll('.player').forEach(p => {
            p.style.width = `0px`; p.style.height = `0px`;
        });
        const ballSize = PLAYER_WIDTH;
        ball.style.width = `${ballSize}px`; ball.style.height = `${ballSize}px`;
        const DF_CENTER_X = 450;
        df.style.left = `${DF_CENTER_X - (PLAYER_WIDTH / 2)}px`;
        const common_y_pos = 210;
        fw.style.top = `${common_y_pos}px`;
        df.style.top = `${common_y_pos}px`;
        if (currentScenario.lane === 'FW') {
            fw.style.zIndex = 2; df.style.zIndex = 1;
        } else {
            fw.style.zIndex = 1; df.style.zIndex = 2;
        }
        const fw_start_center_x = 50;
        fw.style.left = `${fw_start_center_x - (PLAYER_WIDTH / 2)}px`;
        const BALL_START_X = 200;
        ball.style.left = `${BALL_START_X}px`;
        ball.style.top = `${common_y_pos + (PLAYER_HEIGHT / 2) - (ballSize / 2)}px`;
        retryBtn.style.visibility = 'hidden';
        judgementButtons.style.visibility = 'hidden';
    }

    function startAnimation() {
        const DF_CENTER_X = 450;
        const fw_start_center_x = 50;
        const fw_end_center_x = 700;
        const fwSpeed = (fw_end_center_x - fw_start_center_x) / FW_ANIMATION_DURATION;
        const timeToCenter = (DF_CENTER_X - fw_start_center_x) / fwSpeed;
        const timeOffset = currentScenario.t_value * 0.2;
        const ballFlashTime = timeToCenter + timeOffset;

        let audioDelay;
        if (currentScenario.audioTiming === 'before') {
            audioDelay = (ballFlashTime * 1000) - AUDIO_OFFSET_MS;
        } else {
            audioDelay = (ballFlashTime * 1000) + AUDIO_OFFSET_MS;
        }

        setTimeout(() => {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.error("Audio playback failed:", error);
                alert("音声の再生に失敗しました。ブラウザの設定をご確認ください。");
            });
            audioPlayed = true;
        }, audioDelay);

        setTimeout(() => {
            ball.style.opacity = 1;
            setTimeout(() => {
                ball.style.opacity = 0;
            }, 100);
        }, ballFlashTime * 1000);

        void fw.offsetWidth;
        fw.style.animation = `move-fw ${FW_ANIMATION_DURATION}s linear forwards`;
        instruction.textContent = `試行回数 ${trialCount + 1} / ${TOTAL_TRIALS}`;
        fw.addEventListener('animationend', onAnimationEnd, { once: true });
        field.classList.add('playing');

        document.addEventListener('keydown', handleEnterPress);
    }

    function handleEnterPress(event) {
        if (event.key === 'Enter' && audioPlayed && !enterPressedTime) {
            enterPressedTime = performance.now();
            document.removeEventListener('keydown', handleEnterPress);
        }
    }

    function onAnimationEnd() {
        document.removeEventListener('keydown', handleEnterPress);

        if (!answered) {
            judgementButtons.style.visibility = 'visible';
        }
    }

    function checkAnswer(userChoice) {
        if (answered) return;
        answered = true;
        trialCount++;
        addResultToTable();

        detailedResults.push({
            trial: trialCount,
            t_value: currentScenario.t_value,
            lane: currentScenario.lane,
            audioTiming: currentScenario.audioTiming,
            enterResponseTime: enterPressedTime,
            userChoice: userChoice,
            correctAnswer: currentScenario.correctAnswer,
            isCorrect: (userChoice === currentScenario.correctAnswer)
        });

        judgementButtons.style.visibility = 'hidden';
        if (trialCount < TOTAL_TRIALS) {
            retryBtn.style.visibility = 'visible';
            retryBtn.textContent = '次の試行へ';
        } else {
            endExperiment();
        }
    }

    function addResultToTable() {
        const newRow = tableBody.insertRow(0);
        const cell1 = newRow.insertCell(0); const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        cell1.innerHTML = trialCount;
        cell2.innerHTML = currentScenario.t_value;
        cell3.innerHTML = currentScenario.lane;
    }

    function endExperiment() {
        instruction.textContent = '全ての試行が完了しました。結果をダウンロードしてください。';
        retryBtn.style.visibility = 'hidden';
        downloadBtn.style.visibility = 'visible';
        judgementButtons.style.visibility = 'hidden';
    }

    function downloadCSV() {
        const detailedHeaders = '"試行","tの値","前面","音のタイミング","Enter反応時間","ユーザーの回答","正解の配置","正誤"';
        const detailedRows = detailedResults.map(res =>
            [
                res.trial, res.t_value, res.lane,
                res.audioTiming,
                res.enterResponseTime || 'N/A',
                res.userChoice.replace('-btn', ''),
                res.correctAnswer.replace('-btn', ''),
                res.isCorrect ? '正解' : '不正解'
            ].join(',')
        );

        const summary = calculateSummary();
        const summaryHeaders = '"tの値","前面","正解数","試行回数","正答率(%)"';
        const summaryRows = Object.entries(summary).map(([key, value]) => {
            const [t, lane] = key.split(',');
            const accuracy = (value.correct / value.total * 100).toFixed(1);
            return [t, lane, value.correct, value.total, accuracy].join(',');
        });

        const csvString = [
            '--- 詳細結果 ---', detailedHeaders, ...detailedRows,
            '', '--- 集計結果 ---', summaryHeaders, ...summaryRows
        ].join('\n');

        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'cognitive_task_A_results.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function calculateSummary() {
        const summary = {};
        detailedResults.forEach(res => {
            const key = `${res.t_value},${res.lane}`;
            if (!summary[key]) {
                summary[key] = { correct: 0, total: 0 };
            }
            summary[key].total++;
            if (res.isCorrect) {
                summary[key].correct++;
            }
        });
        return summary;
    }

    redLeftBtn.addEventListener('click', () => checkAnswer('red-left-btn'));
    redRightBtn.addEventListener('click', () => checkAnswer('red-right-btn'));
    retryBtn.addEventListener('click', () => {
        // ボタンが押されたときに音源をロードする
        audio.load();

        retryBtn.style.visibility = 'hidden';
        instruction.textContent = `試行回数 ${trialCount + 1} / ${TOTAL_TRIALS}`;
        prepareScenario();
        const randomDelay = Math.random() * 1000 + 500;
        setTimeout(() => {
            startAnimation();
        }, randomDelay);
    });
    downloadBtn.addEventListener('click', downloadCSV);

    createTrialList();
    resetUI();
    prepareScenario();
    retryBtn.style.visibility = 'visible';
    judgementButtons.style.visibility = 'hidden';
    instruction.textContent = 'ボタンを押して開始してください';
});
