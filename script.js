// Global değişkenler
let allMovies = []; // Tüm filmleri burada tutacağız
let showOnlyFavorites = false; // Favori filtresi açık mı?

// HTML'den gerekli elemanları seçiyoruz
const container = document.getElementById('movieContainer');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const showFavoritesBtn = document.getElementById('showFavoritesBtn');
const modal = document.getElementById('movieModal');
const closeBtn = document.querySelector('.close-btn');

// --- 1. VERİ ÇEKME (FETCH API) ---
// Hocanın istediği 'async/await' yapısı [cite: 66]
async function fetchMovies() {
    try {
        const response = await fetch('./data.json'); // Yerel JSON dosyasını oku 
        allMovies = await response.json(); // Veriyi JSON formatına çevir
        displayMovies(allMovies); // Ekrana bas
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        container.innerHTML = "<p>Veriler yüklenirken bir hata oluştu.</p>";
    }
}

// --- 2. EKRANA BASMA (DOM MANIPULATION) ---
function displayMovies(movies) {
    container.innerHTML = ''; // Önce ekranı temizle

    if (movies.length === 0) {
        container.innerHTML = "<p>Aradığınız kriterlere uygun film bulunamadı.</p>";
        return;
    }

    movies.forEach(movie => {
        // Favori durumunu kontrol et (LocalStorage'dan)
        const isFavorite = checkFavorite(movie.id);
        const favBtnText = isFavorite ? "Favorilerden Çıkar ❌" : "Favorilere Ekle ⭐";
        const favBtnClass = isFavorite ? "fav-btn active" : "fav-btn";

        // HTML kartı oluşturuyoruz
        const movieCard = document.createElement('div');
        movieCard.classList.add('card');

        movieCard.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" onclick="openModal(${movie.id})">
            <div class="card-info">
                <h3>${movie.title}</h3>
                <p>${movie.year} | ${movie.category}</p>
                <button class="${favBtnClass}" onclick="toggleFavorite(${movie.id})">${favBtnText}</button>
            </div>
        `;

        container.appendChild(movieCard);
    });
}

// --- 3. FİLTRELEME VE ARAMA FONKSİYONLARI ---
function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    // Filter metodu ile modern JS kullanımı
    let filtered = allMovies.filter(movie => {
        // 1. İsim eşleşiyor mu? [cite: 24]
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        // 2. Kategori eşleşiyor mu?
        const matchesCategory = selectedCategory === 'all' || movie.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Eğer sadece favorileri göster butonu açıksa, listeyi daha da daralt
    if (showOnlyFavorites) {
        filtered = filtered.filter(movie => checkFavorite(movie.id));
    }

    displayMovies(filtered);
}

// --- 4. FAVORİ İŞLEMLERİ (LOCALSTORAGE) ---
// LocalStorage'dan favorileri dizi olarak al 
function getFavorites() {
    const favs = localStorage.getItem('myFavorites');
    return favs ? JSON.parse(favs) : [];
}

// Bir film favori mi kontrol et
function checkFavorite(id) {
    const favorites = getFavorites();
    return favorites.includes(id);
}

// Favoriye ekle veya çıkar
function toggleFavorite(id) {
    let favorites = getFavorites();

    if (favorites.includes(id)) {
        // Zaten favorideyse çıkar
        favorites = favorites.filter(favId => favId !== id);
    } else {
        // Değilse ekle
        favorites.push(id);
    }

    // Yeni listeyi kaydet
    localStorage.setItem('myFavorites', JSON.stringify(favorites));

    // Ekranı güncelle (buton yazısı değişsin diye)
    filterMovies();
}

// Favorileri Göster/Gizle Butonu
showFavoritesBtn.addEventListener('click', () => {
    showOnlyFavorites = !showOnlyFavorites; // Durumu tersine çevir

    if (showOnlyFavorites) {
        showFavoritesBtn.classList.add('active');
        showFavoritesBtn.innerText = "Tümünü Göster 🎬";
    } else {
        showFavoritesBtn.classList.remove('active');
        showFavoritesBtn.innerText = "Favorilerim ⭐";
    }

    filterMovies();
});

// --- 5. DETAY PENCERESİ (MODAL) ---
// [cite: 25] Detay gösterme
function openModal(id) {
    const movie = allMovies.find(m => m.id === id);

    // Modal içini doldur
    document.getElementById('modalTitle').innerText = movie.title;
    document.getElementById('modalPoster').src = movie.poster;
    document.getElementById('modalYear').innerText = movie.year;
    document.getElementById('modalCategory').innerText = movie.category;
    document.getElementById('modalImdb').innerText = movie.imdb;
    document.getElementById('modalDesc').innerText = movie.desc;

    // Modalı görünür yap
    modal.style.display = 'flex';
}

// Modalı kapatma işlemleri
closeBtn.onclick = function () {
    modal.style.display = "none";
}

// Modal dışına tıklayınca da kapansın
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// --- 6. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---
// Arama kutusuna her harf girildiğinde çalış [cite: 24]
searchInput.addEventListener('input', filterMovies);
// Kategori değiştiğinde çalış
categorySelect.addEventListener('change', filterMovies);

// Sayfa ilk açıldığında verileri çek
fetchMovies();