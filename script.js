// ==================== TẠO ÂM THANH KHÁN GIẢ (WEB AUDIO API) ====================
const AudioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playAudienceSound(isGoal) {
    if (AudioCtx.state === 'suspended') AudioCtx.resume();
    
    let bufferSize = AudioCtx.sampleRate * 1.5;
    let buffer = AudioCtx.createBuffer(1, bufferSize, AudioCtx.sampleRate);
    let output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    let whiteNoise = AudioCtx.createBufferSource();
    whiteNoise.buffer = buffer;

    let filter = AudioCtx.createBiquadFilter();
    filter.type = isGoal ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(isGoal ? 800 : 400, AudioCtx.currentTime);

    let gain = AudioCtx.createGain();
    if (isGoal) {
        gain.gain.setValueAtTime(0.01, AudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.8, AudioCtx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, AudioCtx.currentTime + 1.4);
    } else {
        gain.gain.setValueAtTime(0.5, AudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, AudioCtx.currentTime + 1.2);
    }

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(AudioCtx.destination);
    whiteNoise.start();
}

window.addEventListener('click', () => {
    let music = document.getElementById("bg-music");
    if (music && music.paused) music.play().catch(() => {});
}, { once: true });

function selectGameMode(mode) {
    document.getElementById("mode-selection-screen").classList.add("hidden");
    if (mode === 1) {
        document.getElementById("mode1-container").classList.remove("hidden");
    } else {
        document.getElementById("mode2-container").classList.remove("hidden");
        startMode2();
    }
}

function backToLobby() {
    document.getElementById("mode1-container").classList.add("hidden");
    document.getElementById("mode2-container").classList.add("hidden");
    document.getElementById("mode-selection-screen").classList.remove("hidden");
}

// ==================== MODE 1: LOGIC 1 NGƯỜI CHƠI ====================
const m1Questions = [
    { answer: "TRIETHOC", hint: "Hệ thống tri thức lý luận chung nhất về thế giới và con người." },
    { answer: "VATCHAT", hint: "Thực tại khách quan được đem lại cho con người trong cảm giác." },
    { answer: "YTHUC", hint: "Hình ảnh phản ánh thế giới khách quan vào bộ óc con người sáng tạo." },
    { answer: "BIENCHUNG", hint: "Xem xét sự vật trong mối liên hệ phổ biến và sự vận động phát triển." },
    { answer: "SIEUHINH", hint: "Xem xét sự vật trong trạng thái cô lập, tĩnh tại, không biến đổi." },
    { answer: "THUCTIEN", hint: "Toàn bộ hoạt động vật chất có mục đích, mang tính lịch sử - xã hội." },
    { answer: "CHANLY", hint: "Tri thức phù hợp thực tại khách quan và được thực tiễn kiểm nghiệm." },
    { answer: "MAUTHUAN", hint: "Sự liên hệ, tác động qua lại lẫn nhau giữa các mặt đối lập." },
    { answer: "LUONG", hint: "Tính quy định vốn có của sự vật về số lượng, quy mô, trình độ." },
    { answer: "CHAT", hint: "Tính quy định vốn có của sự vật, là sự thống nhất hữu cơ các thuộc tính." }
];

// CẬP NHẬT LINK LOGO 10 CLB ỔN ĐỊNH
const teamsData = {
    "MANCHESTER UNITED": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    "Arsenal": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    "Man City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    "Liverpool": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    "Aston Villa": "https://upload.wikimedia.org/wikipedia/hif/5/57/Aston_Villa.png?utm_source=hif.wikipedia.org&utm_campaign=index&utm_content=original",
    "Tottenham": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
    "Chelsea": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    "Newcastle": "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
    "West Ham": "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg",
    "Brighton": "https://thumb.wikimedia.org/wikipedia/vi/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/3840px-Brighton_%26_Hove_Albion_logo.svg.png?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=thumbnail"
};
const otherTeams = ["Arsenal", "Man City", "Liverpool", "Aston Villa", "Tottenham", "Chelsea", "Newcastle", "West Ham", "Brighton"];

let m1Index = 0, m1Rank = 10, m1Animating = false;

function startMode1() {
    document.getElementById("m1-intro").classList.add("hidden");
    document.getElementById("m1-end").classList.add("hidden");
    document.getElementById("m1-game").classList.remove("hidden");
    m1Index = 0; m1Rank = 10;
    updateM1Leaderboard();
    loadM1Question();
}

function loadM1Question() {
    m1Animating = false;
    document.getElementById("m1-submit-btn").disabled = false;
    
    let player = document.getElementById("m1-player");
    let keeper = document.getElementById("m1-keeper");
    let ball = document.getElementById("m1-ball");
    let net = document.getElementById("m1-net");

    player.className = "player-mu-img";
    keeper.className = "goalkeeper-img";
    ball.className = "ball";
    net.className = "goal-net";

    let q = m1Questions[m1Index];
    document.getElementById("m1-q-count").innerText = `Câu ${m1Index + 1}/10`;
    document.getElementById("m1-rank").innerText = `Hạng: ${m1Rank}/10`;
    document.getElementById("m1-hint").innerText = q.hint;
    document.getElementById("m1-letters").innerText = q.answer.split('').sort(() => Math.random() - 0.5).join(' ');
    document.getElementById("m1-input").value = "";
    document.getElementById("m1-feedback").innerText = "";
    document.getElementById("m1-input").focus();
}

function m1CheckAnswer() {
    if (m1Animating) return;
    let val = document.getElementById("m1-input").value.trim().toUpperCase();
    if (!val) return;

    m1Animating = true;
    document.getElementById("m1-submit-btn").disabled = true;

    let player = document.getElementById("m1-player");
    let keeper = document.getElementById("m1-keeper");
    let ball = document.getElementById("m1-ball");
    let net = document.getElementById("m1-net");

    player.classList.add("player-run");

    let isCorrect = (val === m1Questions[m1Index].answer);

    setTimeout(() => {
        playAudienceSound(isCorrect);
        if (isCorrect) {
            ball.classList.add("ball-goal");
            net.classList.add("goal-shake");
            document.getElementById("m1-feedback").className = "feedback correct";
            document.getElementById("m1-feedback").innerText = "⚽ VÀOOO! BRUNO SÚT PENALTY THÀNH CÔNG!";
            if (m1Rank > 1) m1Rank--;
        } else {
            ball.classList.add("ball-saved");
            keeper.classList.add("keeper-catch");
            document.getElementById("m1-feedback").className = "feedback wrong";
            document.getElementById("m1-feedback").innerText = `❌ BỊ CẢN PHÁ! DONNARUMMA ĐÃ BẮT DÍNH BÓNG!Đáp án: ${m1Questions[m1Index].answer}`;
            if (m1Rank < 10) m1Rank++;
        }
        updateM1Leaderboard();
    }, 400);

    setTimeout(() => {
        m1Index++;
        if (m1Index < m1Questions.length) loadM1Question();
        else endM1();
    }, 2200);
}

document.getElementById("m1-input")?.addEventListener("keypress", (e) => { if (e.key === "Enter") m1CheckAnswer(); });

function updateM1Leaderboard() {
    let list = document.getElementById("m1-leaderboard");
    list.innerHTML = "";
    let arr = [...otherTeams];
    arr.splice(m1Rank - 1, 0, "MANCHESTER UNITED");
    arr.forEach((t, i) => {
        let li = document.createElement("li");
        li.innerHTML = `<div class="team-info"><span>${i + 1}.</span><img src="${teamsData[t]}" class="team-logo"><span>${t}</span></div>`;
        if (t === "MANCHESTER UNITED") li.classList.add("mu-team");
        list.appendChild(li);
    });
}

function endM1() {
    // 1. Ẩn màn chơi và hiện màn kết thúc
    document.getElementById("m1-game").classList.add("hidden");
    document.getElementById("m1-end").classList.remove("hidden");
    document.getElementById("m1-final-rank").innerText = `Vị trí chung cuộc MU: Hạng ${m1Rank}/10`;

    // 2. Lấy các element mới để cập nhật ảnh và văn bản
    const endScreen = document.getElementById("m1-end");
    const resultImg = document.getElementById("m1-result-img");
    const congratsText = document.getElementById("m1-congrats-text");
    const failText = document.getElementById("m1-fail-text");

    // 3. Reset các lớp hiệu ứng cũ
    endScreen.classList.remove("win");

    // 4. Kiểm tra thứ hạng để đổi ảnh & văn bản
    if (m1Rank === 1) {
        // --- CHIẾN THẮNG: VÔ ĐỊCH (Thứ hạng 1) ---
        resultImg.src = "image_8.png"; // Ảnh Bruno ôm cúp hò reo
        congratsText.classList.remove("hidden");
        failText.classList.add("hidden");
        endScreen.classList.add("win"); // Thêm hào quang khi thắng
    } else {
        // --- THẤT BẠI (Thứ hạng 2-10) ---
        resultImg.src = "image_1.png"; // Ảnh Bruno khóc khi thua
        congratsText.classList.add("hidden");
        failText.classList.remove("hidden");
    }
}

// ==================== MODE 2: LOGIC 2 NGƯỜI CHƠI (MU vs MC DERBY) ====================
const m2QuizBank = [
    { q: "Triết học Mác - Lênin do ai sáng lập?", options: ["C.Mác & Ph.Ăngghen", "Lênin & C.Mác", "Hêghen & C.Mác", "Ph.Ăngghen & Lênin"], a: 0, diff: "Dễ" },
    { q: "Vật chất là một phạm trù triết học dùng để chỉ cái gì?", options: ["Ý thức", "Thực tại khách quan", "Cảm giác", "Bộ óc"], a: 1, diff: "Dễ" },
    { q: "Hình thức vận động cao nhất của vật chất là gì?", options: ["Cơ học", "Hóa học", "Sinh học", "Xã hội"], a: 3, diff: "Dễ" },
    { q: "Mối liên hệ giữa các sự vật mang tính chất gì?", options: ["Khách quan, phổ biến, đa dạng", "Chủ quan, ngẫu nhiên", "Tĩnh tại, bất biến", "Duy nhất, cố định"], a: 0, diff: "Dễ" },
    { q: "Nguồn gốc tự nhiên của ý thức gồm bộ óc con người và cái gì?", options: ["Lao động", "Thế giới khách quan", "Ngôn ngữ", "Xã hội"], a: 1, diff: "Dễ" },
    { q: "Quy luật nào vạch ra phương thức của sự phát triển?", options: ["Mâu thuẫn", "Lượng - Chất", "Phủ định của phủ định", "Nhân quả"], a: 1, diff: "Dễ" },
    { q: "Thực tiễn là toàn bộ hoạt động mang tính chất gì?", options: ["Lý luận", "Vật chất - Xã hội", "Tinh thần", "Tư tưởng"], a: 1, diff: "Dễ" },
    { q: "Mặt đối lập là những mặt có đặc điểm gì?", options: ["Giống hệt nhau", "Trái ngược nhau", "Không liên quan", "Song song"], a: 1, diff: "Dễ" },
    { q: "Phép biện chứng phản ánh thế giới như thế nào?", options: ["Cô lập, tĩnh tại", "Liên hệ, phát triển", "Bất biến", "Ngẫu nhiên"], a: 1, diff: "Dễ" },
    { q: "Theo Triết học Mác, nhận thức bắt đầu từ đâu?", options: ["Lý luận", "Thực tiễn", "Cảm giác duy tâm", "Giả thuyết"], a: 1, diff: "Dễ" },
    { q: "Định nghĩa vật chất của Lênin được đưa ra trong tác phẩm nào?", options: ["Tư bản", "Chủ nghĩa duy vật và chủ nghĩa kinh nghiệm phê phán", "Biện chứng của tự nhiên", "Bút ký triết học"], a: 1, diff: "Khó" },
    { q: "Trường phái triết học nào cho rằng ý thức có trước vật chất?", options: ["Chủ nghĩa duy vật", "Chủ nghĩa duy tâm", "Chủ nghĩa thực dụng", "Thuyết bất khả tri"], a: 1, diff: "Khó" },
    { q: "Đặc trưng nào là bước nhảy về chất?", options: ["Sự thay đổi liên tục", "Sự đứt quãng của tính liên tục", "Sự tích lũy về lượng", "Sự giữ nguyên trạng thái"], a: 1, diff: "Khó" },
    { q: "Bản chất của nhận thức là quá trình gì?", options: ["Phản ánh sáng tạo thực tại", "Chép lại thụ động", "Hồi tưởng lại ý niệm", "Tự sinh ra tri thức"], a: 0, diff: "Khó" },
    { q: "Hạt nhân hợp lý trong triết học Hêghen là gì?", options: ["Chủ nghĩa duy vật", "Phép biện chứng", "Thuyết bất khả tri", "Chủ nghĩa duy tâm"], a: 1, diff: "Khó" },
    { q: "Phủ định biện chứng có 2 đặc trưng cơ bản là gì?", options: ["Khách quan & Thừa kế", "Chủ quan & Hủy diệt", "Tự phát & Ngẫu nhiên", "Bất biến & Cô lập"], a: 0, diff: "Khó" },
    { q: "Yếu tố nào đóng vai trò là phương thức tồn tại của vật chất?", options: ["Không gian", "Vận động", "Thời gian", "Ý thức"], a: 1, diff: "Khó" },
    { q: "Con đường phiến diện xem xét sự vật chỉ thấy cây mà không thấy rừng thuộc về?", options: ["Phương pháp biện chứng", "Phương pháp siêu hình", "Thuyết tương đối", "Chủ nghĩa hoài nghi"], a: 1, diff: "Khó" },
    { q: "Chân lý có tính chất gì?", options: ["Khách quan, tuyệt đối, tương đối, cụ thể", "Chủ quan, mơ hồ", "Tự do, tùy ý", "Trừu tượng, vĩnh cửu"], a: 0, diff: "Khó" },
    { q: "Vai trò lớn nhất của lao động đối với sự hình thành ý thức là gì?", options: ["Tạo ra của cải", "Thay đổi cấu trúc cơ thể & bộ óc", "Mở rộng giao tiếp", "Giải trí"], a: 1, diff: "Khó" }
];

let m2State = { turn: "MU", round: 1, muHits: [], mcHits: [], usedQuestions: [], currentQ: null, isAnimating: false };

function startMode2() {
    m2State = { turn: "MU", round: 1, muHits: [], mcHits: [], usedQuestions: [], currentQ: null, isAnimating: false };
    document.getElementById("m2-end").classList.add("hidden");
    document.getElementById("m2-quiz-section").classList.remove("hidden");
    renderPenaltyDots();
    loadM2Question();
}

function renderPenaltyDots() {
    let muContainer = document.getElementById("mu-dots");
    let mcContainer = document.getElementById("mc-dots");
    muContainer.innerHTML = ""; mcContainer.innerHTML = "";

    let totalDots = Math.max(5, m2State.muHits.length, m2State.mcHits.length);
    for (let i = 0; i < totalDots; i++) {
        let dotMU = document.createElement("div");
        dotMU.className = "dot " + (m2State.muHits[i] === true ? "goal" : m2State.muHits[i] === false ? "miss" : "");
        muContainer.appendChild(dotMU);

        let dotMC = document.createElement("div");
        dotMC.className = "dot " + (m2State.mcHits[i] === true ? "goal" : m2State.mcHits[i] === false ? "miss" : "");
        mcContainer.appendChild(dotMC);
    }
}

function loadM2Question() {
    m2State.isAnimating = false;
    let player = document.getElementById("m2-player");
    let keeper = document.getElementById("m2-keeper");
    let ball = document.getElementById("m2-ball");
    let net = document.getElementById("m2-net");

    player.className = "player-mu-img";
    keeper.className = "goalkeeper-img";
    ball.className = "ball";
    net.className = "goal-net";
    document.getElementById("m2-feedback").innerText = "";

    let banner = document.getElementById("turn-banner");
    let derbyStatus = document.getElementById("derby-status-text");

    if (m2State.turn === "MU") {
        banner.className = "turn-banner";
        banner.innerText = "🔴 ĐẾN LƯỢT MAN UNITED SÚT!";
        player.src = "bruno.png";
        keeper.src = "donnarumma.png";
    } else {
        banner.className = "turn-banner turn-mc";
        banner.innerText = "🔵 ĐẾN LƯỢT MAN CITY SÚT!";
        player.src = "haaland.png";
        keeper.src = "lammens.png";
    }

    derbyStatus.innerText = m2State.round <= 5 ? `LƯỢT ${m2State.round}/5` : `SUB-SET (LƯỢT ${m2State.round})`;

    let available = m2QuizBank.filter((_, idx) => !m2State.usedQuestions.includes(idx));
    if (available.length === 0) {
        m2State.usedQuestions = [];
        available = m2QuizBank;
    }
    let randIdx = Math.floor(Math.random() * available.length);
    let originalIdx = m2QuizBank.indexOf(available[randIdx]);
    m2State.usedQuestions.push(originalIdx);
    m2State.currentQ = m2QuizBank[originalIdx];

    document.getElementById("m2-diff").innerText = `Độ khó: ${m2State.currentQ.diff}`;
    document.getElementById("m2-question").innerText = m2State.currentQ.q;

    let optionsGrid = document.getElementById("m2-options");
    optionsGrid.innerHTML = "";
    m2State.currentQ.options.forEach((opt, idx) => {
        let btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerHTML = `<strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}`;
        btn.onclick = () => m2Answer(idx, btn);
        optionsGrid.appendChild(btn);
    });
}

function m2Answer(selectedIndex, btnElement) {
    if (m2State.isAnimating) return;
    m2State.isAnimating = true;

    let isCorrect = (selectedIndex === m2State.currentQ.a);
    let allBtns = document.querySelectorAll(".option-btn");
    allBtns.forEach(b => b.onclick = null);

    if (isCorrect) btnElement.classList.add("selected-correct");
    else {
        btnElement.classList.add("selected-wrong");
        allBtns[m2State.currentQ.a].classList.add("selected-correct");
    }

    document.getElementById("m2-player").classList.add("player-run");

    setTimeout(() => {
        playAudienceSound(isCorrect);
        let fb = document.getElementById("m2-feedback");
        if (isCorrect) {
            document.getElementById("m2-ball").classList.add("ball-goal");
            document.getElementById("m2-net").classList.add("goal-shake");
            fb.className = "feedback correct";
            fb.innerText = `⚽ VÀOOO! ${m2State.turn} SÚT THÀNH CÔNG!`;
        } else {
            document.getElementById("m2-ball").classList.add("ball-saved");
            document.getElementById("m2-keeper").classList.add("keeper-catch");
            fb.className = "feedback wrong";
            fb.innerText = `❌ BỊ CẢN PHÁ! THỦ MÔN ĐÃ BẮT DÍNH BÓNG!`;
        }

        if (m2State.turn === "MU") m2State.muHits.push(isCorrect);
        else m2State.mcHits.push(isCorrect);

        renderPenaltyDots();
    }, 400);

    setTimeout(() => {
        checkDerbyLogic();
    }, 2200);
}

function checkDerbyLogic() {
    let muScore = m2State.muHits.filter(Boolean).length;
    let mcScore = m2State.mcHits.filter(Boolean).length;
    let muShots = m2State.muHits.length;
    let mcShots = m2State.mcHits.length;

    if (muShots <= 5 && mcShots <= 5) {
        let muRemaining = 5 - muShots;
        let mcRemaining = 5 - mcShots;

        if (muScore > mcScore + mcRemaining) return endM2("MANCHESTER UNITED", muScore, mcScore);
        if (mcScore > muScore + muRemaining) return endM2("MANCHESTER CITY", mcScore, muScore);
    }

    if (m2State.turn === "MU") {
        m2State.turn = "MC";
        loadM2Question();
    } else {
        if (m2State.round >= 5 && muScore !== mcScore) {
            let winner = muScore > mcScore ? "MANCHESTER UNITED" : "MANCHESTER CITY";
            return endM2(winner, Math.max(muScore, mcScore), Math.min(muScore, mcScore));
        }
        
        m2State.round++;
        m2State.turn = "MU";
        loadM2Question();
    }
}

function endM2(winner, score1, score2) {
    // 1. Ẩn phần trắc nghiệm và hiện màn hình kết thúc Mode 2
    document.getElementById("m2-quiz-section").classList.add("hidden");
    const m2EndScreen = document.getElementById("m2-end");
    m2EndScreen.classList.remove("hidden");

    let title = document.getElementById("m2-wintitle");
    let winScore = document.getElementById("m2-winscore");

    // 2. Tự động tạo hoặc lấy thẻ <img> hiển thị ảnh cúp
    let winnerImg = document.getElementById("m2-winner-img");
    if (!winnerImg) {
        winnerImg = document.createElement("img");
        winnerImg.id = "m2-winner-img";
        winnerImg.className = "result-img-end";
        // Chèn ảnh vào giữa tiêu đề thắng và tỷ số
        title.parentNode.insertBefore(winnerImg, winScore);
    }

    // 3. Kiểm tra đội thắng để thay đổi Tiêu đề & Ảnh ăn mừng
    if (winner === "MANCHESTER UNITED") {
        title.innerText = "🏆 MANCHESTER UNITED CHIẾN THẮNG!";
        title.style.color = "#da020e";
        winnerImg.src = "image_8.png"; // Ảnh Bruno ôm cúp
        winnerImg.alt = "Bruno Fernandes Trophy";
    } else {
        title.innerText = "🏆 MANCHESTER CITY CHIẾN THẮNG!";
        title.style.color = "#00aeef";
        winnerImg.src = "haaland_trophy.png"; // Ảnh Haaland ôm cúp
        winnerImg.alt = "Erling Haaland Trophy";
    }

    // 4. Hiển thị tỷ số chung cuộc
    winScore.innerText = `Tỷ số Penalty chung cuộc: ${score1} - ${score2}`;
}