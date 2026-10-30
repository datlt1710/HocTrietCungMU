// Danh sách 10 câu hỏi Triết học (Đã cập nhật đúng BIENCHUNG & SIEUHINH)
const questionsData = [
    { answer: "TRIETHOC", hint: "Hệ thống tri thức lý luận chung nhất về thế giới và vị trí con người trong thế giới đó." },
    { answer: "VATCHAT", hint: "Thực tại khách quan được đem lại cho con người trong cảm giác (Định nghĩa Lênin)." },
    { answer: "YTHUC", hint: "Hình ảnh phản ánh thế giới khách quan vào trong bộ óc con người một cách sáng tạo." },
    { answer: "BIENCHUNG", hint: "Phương pháp xem xét sự vật trong mối liên hệ phổ biến và sự vận động phát triển." },
    { answer: "SIEUHINH", hint: "Phương pháp xem xét sự vật trong trạng thái cô lập, tĩnh tại, không biến đổi." },
    { answer: "THUCTIEN", hint: "Toàn bộ hoạt động vật chất có mục đích, mang tính lịch sử - xã hội của con người." },
    { answer: "CHANLY", hint: "Tri thức phù hợp với thực tại khách quan và đã được thực tiễn kiểm nghiệm." },
    { answer: "MAUTHUAN", hint: "Sự liên hệ, tác động qua lại lẫn nhau giữa các mặt đối lập trong một sự vật." },
    { answer: "LUONG", hint: "Tính quy định vốn có của sự vật về mặt số lượng, quy mô, trình độ." },
    { answer: "CHAT", hint: "Tính quy định vốn có của sự vật, là sự thống nhất hữu cơ của các thuộc tính." }
];

// Đường dẫn Logo ổn định cho cả 10 đội bóng
const teamsData = {
    "MANCHESTER UNITED": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    "Arsenal": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    "Man City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    "Liverpool": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    "Aston Villa": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Aston_Villa_FC_crest_%282016%29.svg",
    "Tottenham": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
    "Chelsea": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    "Newcastle": "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
    "West Ham": "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg",
    "Brighton": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Brighton_%26_Hove_Albion_logo.svg"
};

// List 9 đội đối thủ
const otherTeams = [
    "Arsenal", "Man City", "Liverpool", "Aston Villa", 
    "Tottenham", "Chelsea", "Newcastle", "West Ham", "Brighton"
];

let currentQuestionIndex = 0;
let muRank = 10; // Ban đầu bét bảng (Hạng 10)

// Tự phát nhạc khi chạm nhẹ vào trang
window.addEventListener('click', () => {
    let music = document.getElementById("bg-music");
    if (music && music.paused) {
        music.play().catch(() => {});
    }
}, { once: true });

// Xáo trộn chữ cái chuẩn xác theo từ đáp án
function scrambleWord(word) {
    let arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join(' ');
}

// Chuyển sang màn chơi
function goToGame() {
    let music = document.getElementById("bg-music");
    if (music) music.play().catch(() => {});

    document.getElementById("intro-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    
    currentQuestionIndex = 0;
    muRank = 10;
    
    updateLeaderboard();
    loadQuestion();
}

// Tải câu hỏi
function loadQuestion() {
    let q = questionsData[currentQuestionIndex];
    document.getElementById("question-count").innerText = `Câu ${currentQuestionIndex + 1}/10`;
    document.getElementById("current-rank").innerText = `Hạng: ${muRank}/10`;
    document.getElementById("hint-text").innerText = q.hint;
    document.getElementById("scrambled-letters").innerText = scrambleWord(q.answer);
    document.getElementById("user-input").value = "";
    document.getElementById("feedback").innerText = "";
    document.getElementById("user-input").focus();
}

// Kiểm tra đáp án
function checkAnswer() {
    let input = document.getElementById("user-input").value.trim().toUpperCase();
    let correctAnswer = questionsData[currentQuestionIndex].answer;
    let feedback = document.getElementById("feedback");

    if (input === "") return;

    let animClass = "";

    if (input === correctAnswer) {
        feedback.className = "feedback correct";
        feedback.innerText = "🎉 CHÍNH XÁC! MU LEO THÊM 1 BẬC!";
        if (muRank > 1) {
            muRank--;
            animClass = "rank-up";
        }
    } else {
        feedback.className = "feedback wrong";
        feedback.innerText = `❌ SAI RỒI! Đáp án là: ${correctAnswer}. MU TỤT 1 BẬC!`;
        if (muRank < 10) {
            muRank++;
            animClass = "rank-down";
        }
    }

    updateLeaderboard(animClass);

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questionsData.length) {
            loadQuestion();
        } else {
            endGame();
        }
    }, 1600);
}

// Nhấn Enter để gửi
document.getElementById("user-input")?.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        checkAnswer();
    }
});

// Cập nhật Bảng xếp hạng có kèm Logo
function updateLeaderboard(animClass = "") {
    let list = document.getElementById("leaderboard-list");
    list.innerHTML = "";

    let rankings = [...otherTeams];
    rankings.splice(muRank - 1, 0, "MANCHESTER UNITED");

    rankings.forEach((team, index) => {
        let li = document.createElement("li");
        
        let logoUrl = teamsData[team] || "";
        
        li.innerHTML = `
            <div class="team-info">
                <span>${index + 1}.</span>
                <img src="${logoUrl}" alt="${team}" class="team-logo">
                <span>${team}</span>
            </div>
        `;

        if (team === "MANCHESTER UNITED") {
            li.classList.add("mu-team");
            if (animClass !== "") {
                li.classList.add(animClass);
            }
        }
        list.appendChild(li);
    });
}

// Màn hình kết thúc
function endGame() {
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("end-screen").classList.remove("hidden");

    let finalRankText = document.getElementById("final-rank-text");
    let trophyBox = document.getElementById("trophy-box");

    finalRankText.innerText = `Vị trí chung cuộc của MU: Hạng ${muRank}/10`;

    if (muRank === 1) {
        trophyBox.classList.remove("hidden");
    } else {
        trophyBox.classList.add("hidden");
    }
}

// Chơi lại
function restartGame() {
    document.getElementById("end-screen").classList.add("hidden");
    document.getElementById("intro-screen").classList.remove("hidden");
    muRank = 10;
    updateLeaderboard();
}

// Khởi tạo bảng xếp hạng ban đầu
updateLeaderboard();