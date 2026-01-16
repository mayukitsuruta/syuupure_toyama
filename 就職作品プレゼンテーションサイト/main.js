// ハンバーガーメニューの制御
document.addEventListener("DOMContentLoaded", function () {
  // メインビジュアルの動画切り替え
  const videos = [
    "movies/IMG_3303.mov",
    "movies/IMG_3349.MOV",
    "movies/IMG_3395.MOV",
  ];

  let currentVideoIndex = 0;
  let activeVideoIndex = 0; // 0: video1, 1: video2
  const video1 = document.getElementById("mainVideo1");
  const video2 = document.getElementById("mainVideo2");

  if (video1 && video2) {
    // 最初の動画を設定
    video1.src = videos[currentVideoIndex];
    video1.classList.add("active");

    // 動画の読み込み完了後に再生
    video1.addEventListener("loadeddata", function () {
      video1.play().catch(function (error) {
        console.log("動画の自動再生がブロックされました:", error);
      });
    });

    // 次の動画を事前に読み込む
    function preloadNextVideo() {
      const nextIndex = (currentVideoIndex + 1) % videos.length;
      const nextVideo = activeVideoIndex === 0 ? video2 : video1;
      nextVideo.src = videos[nextIndex];
      nextVideo.load(); // 事前に読み込み開始

      // 読み込み完了を待ってから再生準備
      nextVideo.addEventListener(
        "canplaythrough",
        function onCanPlay() {
          // 次の動画が再生可能になったら、すぐに再生開始（ただし非表示）
          nextVideo.currentTime = 0;
          nextVideo.play().catch(function (error) {
            console.log("動画の自動再生がブロックされました:", error);
          });
          nextVideo.removeEventListener("canplaythrough", onCanPlay);
        },
        { once: true }
      );
    }

    // 最初の次の動画を事前に読み込む
    preloadNextVideo();

    // 8秒ごとに動画を切り替え
    setInterval(function () {
      const currentVideo = activeVideoIndex === 0 ? video1 : video2;
      const nextVideo = activeVideoIndex === 0 ? video2 : video1;

      // 次の動画が完全に読み込まれているか確認（canplaythrough）
      if (nextVideo.readyState >= 4) {
        // HAVE_ENOUGH_DATA
        // 動画の再生位置をリセット
        nextVideo.currentTime = 0;
        
        // 次の動画を先に表示状態にする（z-indexを上げる）
        nextVideo.style.zIndex = "2";
        currentVideo.style.zIndex = "1";

        // クロスフェード：両方の動画を同時にフェードイン/アウト
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            // 次の動画をフェードイン（opacity: 0 → 1）
            nextVideo.classList.add("active");
            
            // 現在の動画を同時にフェードアウト（opacity: 1 → 0）
            currentVideo.classList.remove("active");
          });
        });

        // アクティブな動画を切り替え
        activeVideoIndex = activeVideoIndex === 0 ? 1 : 0;

        // 次の動画インデックスを更新
        currentVideoIndex = (currentVideoIndex + 1) % videos.length;

        // さらに次の動画を事前に読み込む
        preloadNextVideo();
      } else {
        // 読み込みが完了していない場合は、読み込み完了を待つ
        nextVideo.addEventListener(
          "canplaythrough",
          function onCanPlay() {
            nextVideo.currentTime = 0;
            nextVideo.play().catch(function (error) {
              console.log("動画の自動再生がブロックされました:", error);
            });
            
            // z-indexを設定
            nextVideo.style.zIndex = "2";
            currentVideo.style.zIndex = "1";
            
            // クロスフェード：両方の動画を同時にフェードイン/アウト
            requestAnimationFrame(function() {
              requestAnimationFrame(function() {
                nextVideo.classList.add("active");
                currentVideo.classList.remove("active");
              });
            });
            
            activeVideoIndex = activeVideoIndex === 0 ? 1 : 0;
            currentVideoIndex = (currentVideoIndex + 1) % videos.length;
            preloadNextVideo();
            nextVideo.removeEventListener("canplaythrough", onCanPlay);
          },
          { once: true }
        );
      }
    }, 8000); // 8秒ごとに切り替え
  }

  const hamburgerIcon = document.getElementById("hamburgerIcon");
  const menuOverlay = document.getElementById("menuOverlay");

  if (hamburgerIcon && menuOverlay) {
    hamburgerIcon.addEventListener("click", function () {
      hamburgerIcon.classList.toggle("active");
      menuOverlay.classList.toggle("active");
    });

    // メニューリンクをクリックしたらメニューを閉じる
    const menuLinks = menuOverlay.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburgerIcon.classList.remove("active");
        menuOverlay.classList.remove("active");
      });
    });

    // オーバーレイをクリックしたらメニューを閉じる
    menuOverlay.addEventListener("click", function (e) {
      if (e.target === menuOverlay) {
        hamburgerIcon.classList.remove("active");
        menuOverlay.classList.remove("active");
      }
    });
  }


  // コンタクトフォームの送信処理
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert(
        "お問い合わせありがとうございます。内容を確認次第、ご連絡いたします。"
      );
      this.reset();
    });
  }
});
