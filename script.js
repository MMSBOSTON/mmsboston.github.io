document.addEventListener("DOMContentLoaded", () => {
    
    // 1. АВТО-ПАРСИНГ ТЕКСТА (только для блоков, где нет готовой разметки .rule-item)
    const ruleTexts = document.querySelectorAll(".rule-text");

    ruleTexts.forEach(container => {
        // Если внутри уже есть элементы .rule-item — значит разметка уже готова (например, для RULES)
        if (container.querySelector('.rule-item')) {
            return; // ничего не делаем
        }

        const rawText = container.innerText; 
        const lines = rawText.split('\n');
        
        let formattedHtml = '';
        let inArticle = false;

        if (rawText.includes("Статья")) {
            lines.forEach(line => {
                const tLine = line.trim();
                if (!tLine) return; 

                if (tLine.match(/^(Раздел|Общая часть|Особенная часть)/i)) {
                    if (inArticle) { formattedHtml += `</div></article>`; inArticle = false; }
                    formattedHtml += `<h2 class="law-section-title">[ ${tLine.toUpperCase()} ]</h2>`;
                } 
                else if (tLine.match(/^Глава/i)) {
                    if (inArticle) { formattedHtml += `</div></article>`; inArticle = false; }
                    formattedHtml += `<h3 class="law-chapter-title">/// ${tLine.toUpperCase()}</h3>`;
                } 
                else if (tLine.match(/^Статья/i)) {
                    if (inArticle) { formattedHtml += `</div></article>`; }
                    formattedHtml += `
                        <article class="law-article">
                            <div class="article-header"><i class="fas fa-microchip"></i> ${tLine}</div>
                            <div class="article-content">
                    `;
                    inArticle = true;
                } 
                else {
                    if (inArticle) {
                        formattedHtml += `<p>${tLine}</p>`;
                    } else {
                        formattedHtml += `<p class="intro-text">${tLine}</p>`;
                    }
                }
            });
            if (inArticle) formattedHtml += `</div></article>`;
        } 
        else {
            // Для текста без "Статья" (это не должно срабатывать для RULES, т.к. там есть .rule-item)
            lines.forEach(line => {
                const tLine = line.trim();
                if (tLine) formattedHtml += `<p class="standard-rule-item">${tLine}</p>`;
            });
        }
        
        container.innerHTML = formattedHtml;
    });

    // 2. АККОРДЕОН 
    const headers = document.querySelectorAll(".rule-header");
    headers.forEach(header => {
        header.addEventListener("click", () => {
            const card = header.parentElement;
            card.classList.toggle("active");
        });
    });

    // 3. УМНЫЙ МУЛЬТИСЛОВНЫЙ ПОИСК 
    const searchInput = document.getElementById("search");
    
    searchInput.addEventListener("input", (e) => {
        const rawQuery = e.target.value.toLowerCase();
        const keywords = rawQuery.split(' ').filter(k => k.length > 0);
        
        const ruleCards = document.querySelectorAll(".rule-card");

        ruleCards.forEach(card => {
            let cardHasMatches = false;
            
            const articles = card.querySelectorAll(".law-article");
            const standardItems = card.querySelectorAll(".standard-rule-item");
            const chapters = card.querySelectorAll(".law-chapter-title, .law-section-title");

            if (articles.length > 0) {
                articles.forEach(article => {
                    const articleText = article.innerText.toLowerCase();
                    const isMatch = keywords.every(kw => articleText.includes(kw));
                    
                    if (isMatch || keywords.length === 0) {
                        article.style.display = "block";
                        if (keywords.length > 0) cardHasMatches = true;
                    } else {
                        article.style.display = "none";
                    }
                });

                chapters.forEach(chap => {
                    chap.style.display = keywords.length > 0 ? "none" : "block";
                });
                
                if (keywords.length === 0) cardHasMatches = true;
            } 
            
            if (standardItems.length > 0) {
                standardItems.forEach(item => {
                    const itemText = item.innerText.toLowerCase();
                    const isMatch = keywords.every(kw => itemText.includes(kw));
                    
                    if (isMatch || keywords.length === 0) {
                        item.style.display = "block";
                        if (keywords.length > 0) cardHasMatches = true;
                    } else {
                        item.style.display = "none";
                    }
                });
                
                if (keywords.length === 0) cardHasMatches = true;
            }

            // Для карточек с готовой разметкой (RULES) поиск по .rule-item
            const ruleItems = card.querySelectorAll(".rule-item");
            if (ruleItems.length > 0) {
                ruleItems.forEach(item => {
                    const itemText = item.innerText.toLowerCase();
                    const isMatch = keywords.every(kw => itemText.includes(kw));
                    if (isMatch || keywords.length === 0) {
                        item.style.display = "block";
                        if (keywords.length > 0) cardHasMatches = true;
                    } else {
                        item.style.display = "none";
                    }
                });
                if (keywords.length === 0) cardHasMatches = true;
            }

            // Управление видимостью самой карточки
            if (cardHasMatches || keywords.length === 0) {
                card.style.display = "block";
                
                if (keywords.length > 0) {
                    card.classList.add("active");
                } else {
                    card.classList.remove("active");
                }
            } else {
                card.style.display = "none";
                card.classList.remove("active");
            }
        });
    });
});